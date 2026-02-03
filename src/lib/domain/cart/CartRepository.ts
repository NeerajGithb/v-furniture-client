import Cart from "@/models/Cart";
import Product from "@/models/product";
import { Cart as CartType } from "@/types/cart";
import { ICartRepository } from "./ICartRepository";
import { AddToCartRequest } from "./CartSchemas";
import { RepositoryError } from "../shared/InfrastructureError";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import {
  CartNotFoundError,
  CartItemNotFoundError,
  ProductNotFoundError,
  InsufficientStockError,
} from "./CartErrors";
import { withTransaction } from "@/lib/utils/transaction";
import mongoose from "mongoose";

export class CartRepository implements ICartRepository {
  // Find cart by user ID with populated product data
  async findByUserId(userId: string): Promise<CartType | null> {
    try {
      const cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select:
          "_id name finalPrice originalPrice discountPercent mainImage inStockQuantity",
      });

      if (!cart) {
        return null; // This is OK - cart might not exist yet, we create it in service layer
      }

      let subtotal = 0;
      const validItems = safeMapList(
        cart.items,
        (item: any) => {
          if (!item.productId) {
            throw new Error(`Cart item missing productId: ${item._id}`);
          }

          validateRequiredFields(item, ["_id", "quantity"], "cart item");

          const product = item.productId as any;
          validateRequiredFields(
            product,
            ["_id", "name", "finalPrice"],
            "product",
          );

          const itemTotal = product.finalPrice * item.quantity;
          subtotal += itemTotal;

          return {
            _id: item._id,
            productId: item.productId._id,
            quantity: item.quantity,
            selectedVariant: item.selectedVariant,
            addedAt: item.addedAt,
            itemTotal,
            product: {
              _id: product._id,
              name: product.name,
              finalPrice: product.finalPrice,
              originalPrice: product.originalPrice || 0,
              discountPercent: product.discountPercent || 0,
              mainImage: product.mainImage || "",
              inStockQuantity: product.inStockQuantity || 0,
              isInStock: (product.inStockQuantity || 0) > 0,
            },
          };
        },
        "cart item",
      );

      // Clean up invalid items if any (with transaction)
      if (validItems.length !== cart.items.length) {
        await withTransaction(async (session) => {
          cart.items = cart.items.filter((item: any) => item.productId);
          await cart.save({ session });
        });
      }

      return this.mapToCartType(cart, validItems, subtotal);
    } catch (error) {
      throw new RepositoryError(
        "Failed to find cart by user ID",
        error as Error,
      );
    }
  }

  // Create empty cart for user
  async createEmptyCart(userId: string): Promise<CartType> {
    try {
      const cart = await Cart.create({ userId, items: [] });

      return this.mapToCartType(cart, [], 0);
    } catch (error) {
      throw new RepositoryError("Failed to create empty cart", error as Error);
    }
  }

  // Map database cart to domain type
  private mapToCartType(cart: any, items: any[], subtotal: number): CartType {
    validateRequiredFields(cart, ["_id"], "cart");

    return {
      _id: cart._id,
      items: items,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      estimatedTotal: subtotal,
      updatedAt: cart.updatedAt,
    };
  }

  // Add item to cart with stock validation and transaction support
  async addItem(userId: string, data: AddToCartRequest): Promise<void> {
    try {
      await withTransaction(async (session) => {
        // Verify product exists and has sufficient stock
        const product = await Product.findById(data.productId).session(session);
        if (!product) {
          throw new ProductNotFoundError(data.productId);
        }

        if (
          product.inStockQuantity !== undefined &&
          product.inStockQuantity < data.quantity
        ) {
          throw new InsufficientStockError(
            "Insufficient stock available",
            product.inStockQuantity,
          );
        }

        // Find or create cart
        let cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
          cart = new Cart({ userId, items: [] });
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(
          (item: any) => item.productId.toString() === data.productId,
        );

        if (existingItemIndex >= 0) {
          const newQuantity =
            cart.items[existingItemIndex].quantity + data.quantity;

          if (
            product.inStockQuantity !== undefined &&
            product.inStockQuantity < newQuantity
          ) {
            throw new InsufficientStockError(
              "Cannot add more items. Insufficient stock available",
              product.inStockQuantity,
            );
          }

          cart.items[existingItemIndex].quantity = newQuantity;
        } else {
          cart.items.push({
            productId: data.productId,
            quantity: data.quantity,
            selectedVariant: data.selectedVariant,
            addedAt: new Date(),
          });
        }

        await cart.save({ session });
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (
        error instanceof ProductNotFoundError ||
        error instanceof InsufficientStockError
      ) {
        throw error;
      }
      throw new RepositoryError("Failed to add item to cart", error as Error);
    }
  }

  // Update item quantity in cart with transaction support
  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    try {
      await withTransaction(async (session) => {
        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
          throw new CartNotFoundError(userId);
        }

        if (quantity === 0) {
          const initialLength = cart.items.length;
          cart.items = cart.items.filter(
            (item: any) => item.productId.toString() !== productId,
          );

          if (cart.items.length === initialLength) {
            throw new CartItemNotFoundError(productId);
          }
        } else {
          // Verify stock availability
          const product = await Product.findById(productId).session(session);
          if (!product) {
            throw new ProductNotFoundError(productId);
          }

          if (
            product.inStockQuantity !== undefined &&
            product.inStockQuantity < quantity
          ) {
            throw new InsufficientStockError(
              "Insufficient stock available",
              product.inStockQuantity,
            );
          }

          const itemIndex = cart.items.findIndex(
            (item: any) => item.productId.toString() === productId,
          );

          if (itemIndex >= 0) {
            cart.items[itemIndex].quantity = quantity;
          } else {
            throw new CartItemNotFoundError(productId);
          }
        }

        await cart.save({ session });
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (
        error instanceof CartNotFoundError ||
        error instanceof CartItemNotFoundError ||
        error instanceof ProductNotFoundError ||
        error instanceof InsufficientStockError
      ) {
        throw error;
      }
      throw new RepositoryError("Failed to update cart item", error as Error);
    }
  }

  // Remove specific item from cart with transaction support
  async removeItem(userId: string, productId: string): Promise<void> {
    try {
      await withTransaction(async (session) => {
        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
          throw new CartNotFoundError(userId);
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
          (item: any) => item.productId.toString() !== productId,
        );

        if (cart.items.length === initialLength) {
          throw new CartItemNotFoundError(productId);
        }

        await cart.save({ session });
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (
        error instanceof CartNotFoundError ||
        error instanceof CartItemNotFoundError
      ) {
        throw error;
      }
      throw new RepositoryError(
        "Failed to remove item from cart",
        error as Error,
      );
    }
  }

  // Clear entire cart with transaction support
  async clearCart(userId: string): Promise<void> {
    try {
      await withTransaction(async (session) => {
        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart) {
          throw new CartNotFoundError(userId);
        }

        cart.items = [];
        await cart.save({ session });
      });
    } catch (error) {
      // Re-throw domain errors as-is
      if (error instanceof CartNotFoundError) {
        throw error;
      }
      throw new RepositoryError("Failed to clear cart", error as Error);
    }
  }

  // Check which products are in cart
  async checkProductsInCart(
    userId: string,
    productIds: string[],
  ): Promise<string[]> {
    try {
      const cart = await Cart.findOne({ userId });
      const cartProducts: string[] = [];

      if (cart) {
        for (const productId of productIds) {
          const isInCart = cart.items.some(
            (item: any) => item.productId.toString() === productId,
          );
          if (isInCart) {
            cartProducts.push(productId);
          }
        }
      }

      return cartProducts;
    } catch (error) {
      throw new RepositoryError(
        "Failed to check products in cart",
        error as Error,
      );
    }
  }

  // Increment product cart count (for analytics)
  async incrementProductCartCount(productId: string): Promise<void> {
    try {
      await Product.findByIdAndUpdate(productId, { $inc: { totalCart: 1 } });
    } catch (error) {
      // Don't throw error for analytics failure, just log
    }
  }
}
