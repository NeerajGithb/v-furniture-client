import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchAnalytics extends Document {
  query: string;
  userId?: string;
  sessionId: string;
  timestamp: number;
  action: 'search' | 'click' | 'add_to_cart' | 'purchase' | 'add_to_wishlist' | 'view_product' | 'filter_applied' | 'sort_changed' | 'page_changed' | 'no_results' | 'zero_click';
  productId?: string;
  position?: number;
  metadata?: {
    resultsCount?: number;
    searchTime?: number;
    filters?: any;
    context?: any;
    orderValue?: number;
  };
  createdAt: Date;
}

const SearchAnalyticsSchema = new Schema<ISearchAnalytics>({
  query: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  sessionId: { type: String, required: true, index: true },
  timestamp: { type: Number, required: true },
  action: { 
    type: String, 
    required: true, 
    enum: [
      'search',           // User performed a search
      'click',            // User clicked a product
      'view_product',     // User viewed product details
      'add_to_cart',      // User added to cart
      'add_to_wishlist',  // User added to wishlist
      'purchase',         // User completed purchase
      'filter_applied',   // User applied filters
      'sort_changed',     // User changed sorting
      'page_changed',     // User navigated to next page
      'no_results',       // Search returned no results
      'zero_click'        // User left without clicking
    ],
    index: true 
  },
  productId: { type: String, index: true },
  position: { type: Number },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for common queries
SearchAnalyticsSchema.index({ query: 1, action: 1, createdAt: -1 });
SearchAnalyticsSchema.index({ productId: 1, action: 1 });
SearchAnalyticsSchema.index({ userId: 1, createdAt: -1 });

const SearchAnalytics = mongoose.models.SearchAnalytics || mongoose.model<ISearchAnalytics>('SearchAnalytics', SearchAnalyticsSchema);

export default SearchAnalytics;