// Search analytics types
export interface TrackingData {
  query: string;
  productId?: string;
  position?: number;
  sessionId?: string;
  userId?: string;
  resultsCount?: number;
  searchTime?: number;
  filters?: Record<string, any>;
  [key: string]: any;
}

export interface ProductClickData {
  query: string;
  productId: string;
  position: number;
  userId?: string;
  resultsCount?: number;
}

export interface ProductViewData {
  query: string;
  productId: string;
  position?: number;
  userId?: string;
  resultsCount?: number;
}

export interface AddToCartData {
  query: string;
  productId: string;
  position?: number;
  userId?: string;
  quantity?: number;
  resultsCount?: number;
}

export interface AddToWishlistData {
  query: string;
  productId: string;
  position?: number;
  userId?: string;
  resultsCount?: number;
}

export interface FilterAppliedData {
  query: string;
  userId?: string;
  filters: Record<string, any>;
  resultsCount?: number;
}

export interface SortChangedData {
  query: string;
  userId?: string;
  sortBy: string;
  resultsCount?: number;
}

export interface PageChangedData {
  query: string;
  userId?: string;
  page: number;
  resultsCount?: number;
}

export interface ZeroClickData {
  query: string;
  userId?: string;
  resultsCount: number;
  timeSpent: number;
  searchTime?: number;
}

export interface AnalyticsEvent {
  action: string;
  data: TrackingData;
}
