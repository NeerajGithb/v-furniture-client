import { BasePrivateService } from "./baseService";
import {
  TrackingData,
  ProductClickData,
  ProductViewData,
  AddToCartData,
  AddToWishlistData,
  FilterAppliedData,
  SortChangedData,
  PageChangedData,
  ZeroClickData,
  AnalyticsEvent,
} from "@/types/searchAnalytics";

class SearchAnalyticsService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Generates session ID for tracking
  getSessionId(): string {
    if (typeof window === "undefined") return `server_${Date.now()}`;

    let sessionId = sessionStorage.getItem("searchSessionId");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      sessionStorage.setItem("searchSessionId", sessionId);
    }
    return sessionId;
  }

  // Tracks analytics event using the migrated API
  async trackEvent(action: string, data: TrackingData): Promise<void> {
    const sessionId = this.getSessionId();

    // Transform data to match API schema
    const eventData = {
      action,
      data: {
        query: data.query,
        userId: data.userId,
        sessionId: data.sessionId || sessionId,
        productId: data.productId,
        position: data.position,
        resultsCount: data.resultsCount,
        searchTime: data.searchTime,
        filters: data.filters,
        context: {
          region: "IN",
          device: this.getDeviceType(),
          userId: data.userId,
          sessionId: data.sessionId || sessionId,
        },
      },
    };

    try {
      await this.post("/search", eventData);
    } catch (error) {
      // Silently fail analytics tracking to not disrupt user experience
      if (process.env.NODE_ENV === "development") {
      }
    }
  }

  // Helper to detect device type
  private getDeviceType(): "mobile" | "desktop" | "tablet" {
    if (typeof window === "undefined") return "desktop";

    const userAgent = navigator.userAgent;
    if (/tablet|ipad/i.test(userAgent)) return "tablet";
    if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
    return "desktop";
  }

  // Tracks product click from search results
  async trackProductClick(data: ProductClickData): Promise<void> {
    await this.trackEvent("track_click", data);
  }

  // Tracks product view from search
  async trackProductView(data: ProductViewData): Promise<void> {
    await this.trackEvent("track_view", data);
  }

  // Tracks add to cart from search
  async trackAddToCart(data: AddToCartData): Promise<void> {
    await this.trackEvent("track_add_to_cart", data);
  }

  // Tracks add to wishlist from search
  async trackAddToWishlist(data: AddToWishlistData): Promise<void> {
    await this.trackEvent("track_add_to_wishlist", data);
  }

  // Tracks filter application
  async trackFilterApplied(data: FilterAppliedData): Promise<void> {
    await this.trackEvent("track_filter", data);
  }

  // Tracks sort change
  async trackSortChanged(data: SortChangedData): Promise<void> {
    await this.trackEvent("track_sort", data);
  }

  // Tracks page change
  async trackPageChanged(data: PageChangedData): Promise<void> {
    await this.trackEvent("track_page", data);
  }

  // Tracks zero click (user leaves without clicking)
  async trackZeroClick(data: ZeroClickData): Promise<void> {
    await this.trackEvent("track_zero_click", data);
  }
}

// Export singleton instance
export const searchAnalyticsService = new SearchAnalyticsService();
