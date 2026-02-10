import Cart from "@/models/Cart";
import Product from "@/models/product";
import { Cart as CartType } from "@/types/cart";
import { ICartRepository } from "./ICartRepository";
import { AddToCartRequest } from "./CartSchemas";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import {
  CartNotFoundError,
  CartItemNotFoundError,
  ProductNotFoundError,
  InsufficientStockError,
} from "./CartErrors";
import { withTransaction } from "@/lib/utils/transaction";

export class CartRepository implements ICartRepository {
  async findByUserId(userId: string): Promise<CartType | null> {
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "_id name finalPrice originalPrice discountPercent mainImage inStockQuantity",
    });

    if (!cart) return null;

    let subtotal = 0;
    const validItems = safeMapList(
      cart.items,
      (item: any) => {
        if (!item.productId) {
          throw new Error(`Cart item missing productId: ${item._id}`);
        }

        validateRequiredFields(item, ["_id", "quantity"], "cart item");

        const product = item.productId as any;
        validateRequiredFields(product, ["_id", "name", "finalPrice"], "product");

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

    if (validItems.length !== cart.items.length) {
      await withTransaction(async (session) => {
        cart.items = cart.items.filter((item: any) => item.productId);
        await cart.save({ session });
      });
    }

    return this.mapToCartType(cart, validItems, subtotal);
  }

  async createEmptyCart(userId: string): Promise<CartType> {
    const cart = await Cart.create({ userId, items: [] });
    return this.mapToCartType(cart, [], 0);
  }

  private mapToCartType(cart: any, items: any[], subtotal: number): CartType {
    validateRequiredFields(cart, ["_id"], "cart");

    return {
      _id: cart._id,
      items,
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      estimatedTotal: subtotal,
      updatedAt: cart.updatedAt,
    };
  }

  async addItem(userId: string, data: AddToCartRequest): Promise<void> {
    await withTransaction(async (session) => {
      const product = await Product.findById(data.productId).session(session);
      if (!product) throw new ProductNotFoundError(data.productId);

      if (
        product.inStockQuantity !== undefined &&
        product.inStockQuantity < data.quantity
      ) {
        throw new InsufficientStockError(
          "Insufficient stock available",
          product.inStockQuantity,
        );
      }

      let cart = await Cart.findOne({ userId }).session(session);
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }

      const existingItemIndex = cart.items.findIndex(
        (item: any) => item.productId.toString() === data.productId,
      );

      if (existingItemIndex >= 0) {
        const newQuantity = cart.items[existingItemIndex].quantity + data.quantity;

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
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number,
  ): Promise<void> {
    await withTransaction(async (session) => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart) throw new CartNotFoundError(userId);

      if (quantity === 0) {
        const initialLength = cart.items.length;
        cart.items = cart.items.filter(
          (item: any) => item.productId.toString() !== productId,
        );

        if (cart.items.length === initialLength) {
          throw new CartItemNotFoundError(productId);
        }
      } else {
        const product = await Product.findById(productId).session(session);
        if (!product) throw new ProductNotFoundError(productId);

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
  }

  async removeItem(userId: string, productId: string): Promise<void> {
    await withTransaction(async (session) => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart) throw new CartNotFoundError(userId);

      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item: any) => item.productId.toString() !== productId,
      );

      if (cart.items.length === initialLength) {
        throw new CartItemNotFoundError(productId);
      }

      await cart.save({ session });
    });
  }

  async clearCart(userId: string): Promise<void> {
    await withTransaction(async (session) => {
      const cart = await Cart.findOne({ userId }).session(session);
      if (!cart) throw new CartNotFoundError(userId);

      cart.items = [];
      await cart.save({ session });
    });
  }

  async checkProductsInCart(userId: string, productIds: string[]): Promise<string[]> {
    const cart = await Cart.findOne({ userId });
    const cartProducts: string[] = [];

    if (cart) {
      for (const productId of productIds) {
        const isInCart = cart.items.some(
          (item: any) => item.productId.toString() === productId,
        );
        if (isInCart) cartProducts.push(productId);
      }
    }

    return cartProducts;
  }

  async incrementProductCartCount(productId: string): Promise<void> {
    try {
      await Product.findByIdAndUpdate(productId, { $inc: { totalCart: 1 } });
    } catch (error) {
      // Silent fail for analytics
    }
  }
}