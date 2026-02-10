import Wishlist from "@/models/Wishlist";
import Product from "@/models/product";
import {
  IWishlistRepository,
  PaginationOptions,
  PaginatedResult,
} from "./IWishlistRepository";
import { AddToWishlistRequest } from "./WishlistSchemas";
import { safeMapList, validateRequiredFields } from "../shared/mapperUtils";
import {
  WishlistNotFoundError,
  WishlistItemNotFoundError,
  ProductNotFoundError,
  ProductAlreadyInWishlistError,
} from "./WishlistErrors";
import { withTransaction } from "@/lib/utils/transaction";

export class WishlistRepository implements IWishlistRepository {
  // Find wishlist by user ID with populated product data and pagination
  async findByUserId(
    userId: string,
    options: PaginationOptions = { page: 1, limit: 12 },
  ): Promise<PaginatedResult<any>> {
    const { page, limit, sortBy = "addedAt", sortOrder = "desc" } = options;
    const skip = (page - 1) * limit;

    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: "items.productId",
      select:
        "_id name finalPrice originalPrice discountPercent mainImage inStockQuantity ratings reviews isNewArrival isBestSeller material dimensions",
    });

    if (!wishlist) {
      return {
        items: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          hasMore: false,
        },
      };
    }

    // Filter out invalid items (products that no longer exist)
    const allValidItems = wishlist.items.filter(
      (item: any) => item.productId,
    );

    // Clean up invalid items if any (with transaction)
    if (allValidItems.length !== wishlist.items.length) {
      await withTransaction(async (session) => {
        wishlist.items = allValidItems;
        await wishlist.save({ session });
      });
    }

    // Sort items
    const allowedSortFields = ["addedAt", "name", "finalPrice"];
    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "addedAt";
    const sortMultiplier = sortOrder === "asc" ? 1 : -1;

    allValidItems.sort((a: any, b: any) => {
      if (safeSortBy === "addedAt") {
        return (
          (new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()) *
          sortMultiplier
        );
      } else if (safeSortBy === "name") {
        return (
          a.productId.name.localeCompare(b.productId.name) * sortMultiplier
        );
      } else if (safeSortBy === "finalPrice") {
        return (
          (a.productId.finalPrice - b.productId.finalPrice) * sortMultiplier
        );
      }
      return 0;
    });

    // Apply pagination
    const paginatedItems = safeMapList(
      allValidItems.slice(skip, skip + limit),
      this.mapWishlistItem.bind(this),
      "wishlist item",
    );

    const total = allValidItems.length;
    const totalPages = Math.ceil(total / limit);

    return {
      items: paginatedItems,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        hasMore: page < totalPages,
      },
    };
  }

  // Create empty wishlist for user
  async createEmptyWishlist(userId: string): Promise<void> {
    await Wishlist.create({ userId, items: [] });
  }

  // Add item to wishlist with transaction support
  async addItem(userId: string, data: AddToWishlistRequest): Promise<number> {
    return await withTransaction(async (session) => {
      // Verify product exists
      const product = await Product.findById(data.productId).session(session);
      if (!product) {
        throw new ProductNotFoundError(data.productId);
      }

      // Find or create wishlist
      let wishlist = await Wishlist.findOne({ userId }).session(session);
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [] });
      }

      // Check if item already exists
      const existingItem = wishlist.items.find(
        (item: any) => item.productId.toString() === data.productId,
      );

      if (existingItem) {
        throw new ProductAlreadyInWishlistError(data.productId);
      }

      // Add item to beginning of list (most recent first)
      wishlist.items.unshift({
        productId: data.productId,
        addedAt: new Date(),
      });

      await wishlist.save({ session });
      return wishlist.items.length;
    });
  }

  // Remove specific item from wishlist with transaction support
  async removeItem(userId: string, productId: string): Promise<number> {
    return await withTransaction(async (session) => {
      const wishlist = await Wishlist.findOne({ userId }).session(session);
      if (!wishlist) {
        throw new WishlistNotFoundError(userId);
      }

      const itemCountBefore = wishlist.items.length;
      wishlist.items = wishlist.items.filter(
        (item: any) => item.productId.toString() !== productId,
      );

      if (wishlist.items.length === itemCountBefore) {
        throw new WishlistItemNotFoundError(productId);
      }

      await wishlist.save({ session });
      return wishlist.items.length;
    });
  }

  // Clear entire wishlist with transaction support
  async clearWishlist(userId: string): Promise<void> {
    await withTransaction(async (session) => {
      const wishlist = await Wishlist.findOne({ userId }).session(session);
      if (!wishlist) {
        throw new WishlistNotFoundError(userId);
      }

      wishlist.items = [];
      await wishlist.save({ session });
    });
  }

  // Batch remove multiple items from wishlist with transaction support
  async batchRemoveItems(
    userId: string,
    productIds: string[],
  ): Promise<number> {
    return await withTransaction(async (session) => {
      const wishlist = await Wishlist.findOne({ userId }).session(session);
      if (!wishlist) {
        throw new WishlistNotFoundError(userId);
      }

      wishlist.items = wishlist.items.filter(
        (item: any) => !productIds.includes(item.productId.toString()),
      );

      await wishlist.save({ session });
      return wishlist.items.length;
    });
  }

  // Check which products are in wishlist
  async checkProductsInWishlist(
    userId: string,
    productIds: string[],
  ): Promise<string[]> {
    const wishlist = await Wishlist.findOne({ userId });
    const wishlistedProducts: string[] = [];

    if (wishlist) {
      for (const productId of productIds) {
        const isInWishlist = wishlist.items.some(
          (item: any) => item.productId.toString() === productId,
        );
        if (isInWishlist) {
          wishlistedProducts.push(productId);
        }
      }
    }

    return wishlistedProducts;
  }

  // Increment product wishlist count (for analytics)
  async incrementProductWishlistCount(productId: string): Promise<void> {
    // Analytics operation - failures should not break the flow
    await Product.findByIdAndUpdate(productId, {
      $inc: { wishlistCount: 1 },
    }).catch(() => {
      // Silently ignore analytics errors
    });
  }

  // Private helper method
  private mapWishlistItem(item: any): any {
    validateRequiredFields(item, ["_id", "productId"], "wishlist item");
    validateRequiredFields(item.productId, ["_id", "name"], "product");

    return {
      _id: item._id,
      productId: item.productId._id,
      product: {
        _id: item.productId._id,
        name: item.productId.name,
        finalPrice: item.productId.finalPrice || 0,
        originalPrice: item.productId.originalPrice || 0,
        discountPercent: item.productId.discountPercent || 0,
        mainImage: item.productId.mainImage || "",
        inStockQuantity: item.productId.inStockQuantity || 0,
        isInStock: (item.productId.inStockQuantity || 0) > 0,
        ratings: item.productId.ratings || 0,
        reviews: item.productId.reviews || {},
        isNewArrival: item.productId.isNewArrival || false,
        isBestSeller: item.productId.isBestSeller || false,
        material: item.productId.material || "",
        dimensions: item.productId.dimensions || {},
      },
      addedAt: item.addedAt,
    };
  }
}