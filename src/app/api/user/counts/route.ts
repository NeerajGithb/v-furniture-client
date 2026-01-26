import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedUser } from "@/lib/middleware/auth";
import { CartService } from "@/services/cart.service";
import { WishlistService } from "@/services/wishlist.service";
import { OrderService } from "@/services/order.service";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

interface UserCounts {
  cartCount: number;
  wishlistCount: number;
  orderCount: number;
}

export const GET = withAuth(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const cacheKey = `user:counts:${user.userId}`;

      // Check cache first
      const cached = await getCached<UserCounts>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      // Fetch all counts in parallel for better performance
      const [cartCount, wishlistCount, orderCount] = await Promise.all([
        CartService.getCartCount(user.userId),
        WishlistService.getWishlistCount(user.userId),
        OrderService.getOrdersCount(user.userId)
      ]);

      const counts: UserCounts = {
        cartCount,
        wishlistCount,
        orderCount
      };

      // Cache the result
      await setCache(cacheKey, counts, CACHE_TTL.USER_COUNTS);

      return NextResponse.json(counts);
    } catch (error) {
      console.error("User counts error:", error);
      return NextResponse.json(
        { error: "Failed to get user counts" },
        { status: 500 },
      );
    }
  },
);