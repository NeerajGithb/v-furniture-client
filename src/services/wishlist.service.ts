import { connectDB } from "@/lib/dbConnect";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/product";
import mongoose from "mongoose";

export class WishlistService {
  static async getOrCreateWishlist(userId: string) {
    await connectDB();

    let wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select: "name finalPrice originalPrice discountPercent mainImage",
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    return wishlist;
  }

  static async getWishlistCount(userId: string): Promise<number> {
    const wishlist = await Wishlist.findOne({ userId }).select("items");
    return wishlist?.items?.length || 0;
  }

  static async getWishlistItems(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    return wishlist.items
      .filter((item: any) => item.productId)
      .map((item: any) => {
        const product: any = item.productId;
        return {
          _id: item._id,
          productId: product._id,
          addedAt: item.addedAt,
          product: {
            _id: product._id,
            name: product.name,
            finalPrice: product.finalPrice,
            originalPrice: product.originalPrice,
            discountPercent: product.discountPercent,
            mainImage: product.mainImage,
          },
        };
      });
  }

  static async addItem(userId: string, productId: string) {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) wishlist = new Wishlist({ userId, items: [] });

    const exists = wishlist.items.some(
      (item: any) => item.productId.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        addedAt: new Date(),
      });
      await wishlist.save();
    }
  }

  static async removeItem(userId: string, productId: string) {
    await connectDB();

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) throw new Error("WISHLIST_NOT_FOUND");

    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await wishlist.save();
  }

  static async checkProducts(
    userId: string,
    productIds: string[]
  ): Promise<string[]> {
    await connectDB();

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return [];

    return productIds.filter((productId) =>
      wishlist.items.some(
        (item: any) => item.productId.toString() === productId
      )
    );
  }

  // Business logic methods
  static async addItemToWishlist(
    wishlist: any,
    productId: string
  ): Promise<any> {
    const existingItem = wishlist.items.find(
      (item: any) => item.productId.toString() === productId
    );

    if (!existingItem) {
      wishlist.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        addedAt: new Date(),
      });
    }
    return wishlist.save();
  }

  static async removeItemFromWishlist(
    wishlist: any,
    productId: string
  ): Promise<any> {
    wishlist.items = wishlist.items.filter(
      (item: any) => item.productId.toString() !== productId
    );
    return wishlist.save();
  }

  static isItemInWishlist(wishlist: any, productId: string): boolean {
    return wishlist.items.some(
      (item: any) => item.productId.toString() === productId
    );
  }

  static async clearWishlist(wishlist: any): Promise<any> {
    wishlist.items = [];
    return wishlist.save();
  }
}