import mongoose, { Schema, Document, CallbackError } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description?: string;
  categoryId: Schema.Types.ObjectId;
  subCategoryId: Schema.Types.ObjectId;
  itemId: string;
  sku?: string;

  originalPrice: number;
  finalPrice: number;
  emiPrice?: number;
  discountPercent?: number;
  inStockQuantity?: number;

  colorOptions?: string[];
  size?: string[];
  material?: string;
  tags?: string[];

  galleryImages: { url: string; alt?: string; publicId: string }[];
  mainImage?: { url: string; alt?: string; publicId: string };

  badge?: string;
  dimensions?: { length?: number; width?: number; height?: number };
  weight?: number;

  isPublished?: boolean;
  isActive?: boolean;
  ratings?: number;

  reviews?: {
    average: number;
    count: number;
    breakdown?: { 5: number; 4: number; 3: number; 2: number; 1: number };
  };

  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;

  shippingInfo?: {
    freeShipping?: boolean;
    estimatedDays?: number;
    shippingCost?: number;
  };

  variants?: {
    color?: string;
    size?: string;
    sku?: string;
    price?: number;
    inStock?: number;
  }[];

  slug?: string;
  metaTitle?: string;
  metaDescription?: string;

  keywords?: string[];
  bulletPoints?: string[];
  highlights?: string[];
  faq?: { question: string; answer: string }[];

  totalSold?: number;
  viewCount?: number;
  wishlistCount?: number;

  brand?: string;
  warranty?: string;
  returnPolicy?: string;

  categorySlug?: string;
  subcategorySlug?: string;
  searchKeywords?: string[];

  attributes?: {
    seater?: number;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
  };

  createdAt: Date;
  updatedAt: Date;

  updateSearchScore(): number;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    itemId: { type: String, required: true, unique: true },
    sku: { type: String, unique: true, sparse: true },

    originalPrice: { type: Number, required: true },
    finalPrice: { type: Number, required: true },

    description: String,
    emiPrice: Number,
    discountPercent: { type: Number, default: 0 },
    inStockQuantity: { type: Number, default: 0 },

    colorOptions: [String],
    size: [String],
    material: String,
    tags: [String],

    galleryImages: [{ url: String, alt: String, publicId: String }],

    mainImage: { url: String, alt: String, publicId: String },

    badge: String,
    dimensions: { length: Number, width: Number, height: Number },
    weight: Number,

    isPublished: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratings: { type: Number, min: 0, max: 5, default: 0 },

    reviews: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
    },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    shippingInfo: {
      freeShipping: { type: Boolean, default: true },
      estimatedDays: { type: Number, default: 3 },
      shippingCost: { type: Number, default: 0 },
    },

    variants: [
      {
        color: String,
        size: String,
        sku: String,
        price: Number,
        inStock: Number,
      },
    ],

    slug: { type: String, unique: true, sparse: true },
    metaTitle: String,
    metaDescription: String,

    keywords: [String],
    bulletPoints: [String],
    highlights: [String],
    faq: [{ question: String, answer: String }],

    totalSold: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },

    brand: String,
    warranty: String,
    returnPolicy: { type: String, default: "30 days return" },

    categorySlug: String,
    subcategorySlug: String,
    searchKeywords: [String],

    attributes: {
      seater: Number,
      color: String,
      material: String,
      style: String,
      room: String,
    },
  },
  { timestamps: true },
);

ProductSchema.index(
  {
    name: "text",
    description: "text",
    tags: "text",
    brand: "text",
    searchKeywords: "text",
  },
  { name: "product_text_search" },
);

// Listing / filters
ProductSchema.index({ isPublished: 1, categorySlug: 1, finalPrice: 1 });
ProductSchema.index({ isPublished: 1, subcategorySlug: 1, finalPrice: 1 });
ProductSchema.index({ isPublished: 1, brand: 1, finalPrice: 1 });

ProductSchema.index({ isPublished: 1, isFeatured: -1, createdAt: -1 });
ProductSchema.index({ isPublished: 1, totalSold: -1 });
ProductSchema.index({ isPublished: 1, "reviews.average": -1 });
ProductSchema.index({ isPublished: 1, viewCount: -1 });

// Relations
ProductSchema.index({ categoryId: 1, isPublished: 1 });
ProductSchema.index({ subCategoryId: 1, isPublished: 1 });

// Price sorting
ProductSchema.index({ isPublished: 1, finalPrice: 1 });
ProductSchema.index({ isPublished: 1, finalPrice: -1 });

// Stock-only
ProductSchema.index(
  { isPublished: 1, inStockQuantity: 1 },
  {
    partialFilterExpression: { inStockQuantity: { $gt: 0 } },
    name: "stock_available_products",
  },
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);