export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { SearchEngine } from "@/lib/search/searchEngine";
import { SearchAnalyticsService } from "@/lib/search/analytics";
import { SearchQuery, SearchContext, SearchFilters } from "@/lib/search/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim()) {
      return NextResponse.json({
        query: { original: "", normalized: "", tokens: [], synonyms: [] },
        intent: { type: "generic", confidence: 0, entities: {}, filters: {} },
        products: [],
        facets: {
          categories: [],
          brands: [],
          priceRanges: [],
          materials: [],
          colors: [],
          ratings: [],
        },
        categories: [],
        subcategories: [],
        pagination: { page: 1, limit: 24, total: 0, hasMore: false },
        metadata: { searchTime: 0, totalCandidates: 0, cacheHit: false },
      });
    }

    // Get context from headers or generate
    const userAgent = request.headers.get("user-agent") || "";
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";

    // Get session/user from cookies or headers
    const sessionId =
      request.cookies.get("searchSessionId")?.value ||
      request.headers.get("x-session-id") ||
      `session_${Date.now()}`;

    const userId =
      request.cookies.get("userId")?.value ||
      request.headers.get("x-user-id") ||
      undefined;

    const context: SearchContext = {
      region: "IN",
      device: device as any,
      userId,
      sessionId,
    };

    const searchQuery: SearchQuery = {
      query,
      context,
      filters: {}, // Empty filters - SearchEngine will extract everything from query
      pagination: {
        page: parseInt(searchParams.get("page") || "1"),
        limit: parseInt(searchParams.get("limit") || "24"),
      },
    };

    const result = await SearchEngine.search(searchQuery);

    // Track search
    await SearchAnalyticsService.trackSearch({
      query,
      userId: context.userId,
      sessionId: context.sessionId || `session_${Date.now()}`,
      resultsCount: result.products.length,
      searchTime: result.metadata.searchTime,
      filters: result.intent.filters,
      context,
    });

    // Track no results if applicable
    if (result.products.length === 0) {
      await SearchAnalyticsService.trackNoResults({
        query,
        userId: context.userId,
        sessionId: context.sessionId || `session_${Date.now()}`,
        filters: result.intent.filters,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      {
        error: "Search failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "track_click":
        await SearchAnalyticsService.trackClick(data);
        break;
      case "track_view":
        await SearchAnalyticsService.trackProductView(data);
        break;
      case "track_add_to_cart":
        await SearchAnalyticsService.trackAddToCart(data);
        break;
      case "track_add_to_wishlist":
        await SearchAnalyticsService.trackAddToWishlist(data);
        break;
      case "track_purchase":
        await SearchAnalyticsService.trackPurchase(data);
        break;
      case "track_filter":
        await SearchAnalyticsService.trackFilterApplied(data);
        break;
      case "track_sort":
        await SearchAnalyticsService.trackSortChanged(data);
        break;
      case "track_page":
        await SearchAnalyticsService.trackPageChanged(data);
        break;
      case "track_zero_click":
        await SearchAnalyticsService.trackZeroClick(data);
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Search analytics error:", error);
    return NextResponse.json(
      { error: "Analytics tracking failed" },
      { status: 500 },
    );
  }
}