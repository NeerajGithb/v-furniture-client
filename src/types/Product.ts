export interface Product {
  _id: string;
  name: string;
  itemId: string;
  sku?: string;
  originalPrice: number;
  finalPrice: number;
  createdAt: Date;
  updatedAt: Date;

  description?: string;
  brand?: string;
  warranty?: string;
  returnPolicy?: string;

  sellerId?: {
    _id: string;
    businessName: string;
    contactPerson: string;
    address?: string;
    rating?: number;
    totalSales?: number;
    totalProducts?: number;
    verified?: boolean;
    status?: string;
    createdAt?: Date;
  };

  categoryId?: {
    _id: string;
    name: string;
    slug: string;
  };
  subCategoryId?: {
    _id: string;
    name: string;
    slug: string;
  };

  emiPrice?: number;
  discountPercent?: number;
  inStockQuantity?: number;

  colorOptions?: string[];
  size?: string[];
  material?: string;
  tags?: string[];

  galleryImages?: Array<{
    url: string;
    alt?: string;
    publicId: string;
  }>;
  mainImage?: {
    url: string;
    alt?: string;
    publicId: string;
  };
  badge?: string;

  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  weight?: number;

  isPublished?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;

  ratings?: number;
  reviews?: {
    average: number;
    count: number;
    breakdown?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    list?: Array<{
      user: string;
      rating: number;
      comment: string;
      date: Date;
    }>;
  };

  shippingInfo?: {
    freeShipping?: boolean;
    estimatedDays?: number;
    shippingCost?: number;
  };

  variants?: Array<{
    color?: string;
    size?: string;
    sku?: string;
    price?: number;
    inStock?: number;
  }>;

  slug?: string;
  metaTitle?: string;
  metaDescription?: string;

  keywords?: string[];
  bulletPoints?: string[];
  highlights?: string[];
  faq?: Array<{ question: string; answer: string }>;

  totalSold?: number;
  viewCount?: number;
  wishlistCount?: number;
  totalCart?: number;

  categorySlug?: string;
  subcategorySlug?: string;
  searchKeywords?: string[];
  attributes?: {
    seater?: number;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
    [key: string]: any;
  };

  images?: string;
  onSale?: string;
  price?: number;
  stock?: number;
}

// Minimal product data for cards/grids - only fields actually used in frontend
export interface ProductCardData {
  _id: string;
  name: string;
  finalPrice: number;
  originalPrice: number;
  discountPercent?: number;
  mainImage?: {
    url: string;
    alt?: string;
    publicId: string;
  };
  reviews?: {
    average: number;
    count: number;
  };
  inStockQuantity?: number;
  material?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}

export interface ProductRequestFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  material?: string;
  brand?: string;
  color?: string;
  seater?: number;
  style?: string;
  room?: string;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductFilters {
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  subcategories: Array<{
    _id: string;
    name: string;
    slug: string;
    categoryId: string;
  }>;
  materialTypes: string[];
  maxMinPrice: {
    minPrice: number;
    maxPrice: number;
  };
  maxPrice: number;
  minPrice: number;
  inStock: boolean;
  onSale: boolean;
  sortOptions: string[];
  sort: string;
  page: number;
  limit: number;
  material: string | null;
  brand: string | null;
  color: string | null;
  seater: number | null;
  style: string | null;
  room: string | null;
  materials: string[];
  brands: string[];
  colors: string[];
  attributes: {
    seater?: number[];
    style?: string[];
    room?: string[];
  };
  priceRange: {
    minPrice: number;
    maxPrice: number;
  };
}

export interface ProductsApiResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: ProductFilters;
  appliedFilters: {
    category: string | null;
    subcategory: string | null;
    material: string | null;
    brand: string | null;
    color: string | null;
    seater: number | null;
    style: string | null;
    room: string | null;
    priceRange: { min: number | null; max: number | null } | null;
    inStock: boolean | null;
    onSale: boolean | null;
    sort: string;
  };
  fallback?: { used: boolean; type?: string; message?: string };
  meta: {
    fetchTime: number;
    cached: boolean;
    hasMore?: boolean;
  };
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description: string;
  mainImage?: {
    url: string;
    alt?: string;
    publicId?: string;
  };
  products?: Product[];
}

export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  mainImage?: {
    url?: string;
    alt?: string;
  };
  categoryId: {
    _id: string;
    name: string;
    slug: string;
  };
}

export interface IInspiration {
  _id: string;
  title: string;
  slug: string;
  description: string;
  heroImage: { url: string; alt: string; publicId: string };
  categories:
    | string[]
    | Array<{
        _id: string;
        name: string;
        slug: string;
        mainImage?: { url: string; alt: string; publicId: string };
      }>;
  tags?: string[];
}
