import { connectDB } from "@/lib/dbConnect";
import Cart, { ICart } from "@/models/Cart";
import { Types } from "mongoose";
import mongoose from "mongoose";

export class CartService {
  static async getCart(userId: string): Promise<ICart | null> {
    await connectDB();
    return Cart.findOne({ userId: new Types.ObjectId(userId) });
  }

  static async getCartCount(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    if (!cart) return 0;
    return cart.items.length;
  }

  static async getCartItems(userId: string) {
    const cart = await this.getCart(userId);
    if (!cart) return [];
    return cart.items;
  }

  static async checkProductsInCart(
    userId: string,
    productIds: string[]
  ): Promise<string[]> {
    const cart = await this.getCart(userId);
    if (!cart) return [];

    return productIds.filter((productId) =>
      cart.items.some((item) => item.productId.toString() === productId)
    );
  }

  // Business logic methods
  static async addItemToCart(
    cart: any,
    productId: string,
    quantity: number = 1,
    variant?: any
  ): Promise<any> {
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity,
        selectedVariant: variant,
        addedAt: new Date(),
      });
    }
    return cart.save();
  }

  static async removeItemFromCart(cart: any, productId: string): Promise<any> {
    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );
    return cart.save();
  }

  static async updateCartItemQuantity(
    cart: any,
    productId: string,
    quantity: number
  ): Promise<any> {
    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }
    return cart.save();
  }

  static async clearCart(cart: any): Promise<any> {
    cart.items = [];
    return cart.save();
  }

  static async getOrCreateCart(userId: string): Promise<any> {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  }
}