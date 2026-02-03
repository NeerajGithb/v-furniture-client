// Category domain type
export interface Category {
  _id: string;
  name: string;
  slug: string;
  mainImage: {
    url: string;
    alt: string;
  };
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Subcategory domain type
export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  mainImage?: {
    url?: string;
    alt?: string;
  };
  description?: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Category with products for detailed view
export interface CategoryWithProducts extends Category {
  products: Array<{
    _id: string;
    name: string;
    slug: string;
    finalPrice: number;
    mainImage: string;
    inStockQuantity: number;
  }>;
  productCount: number;
}

// Repository interface for dependency injection
export interface ICategoriesRepository {
  // Find all categories
  findAllCategories(): Promise<Category[]>;

  // Find all subcategories with populated category data
  findAllSubcategories(): Promise<Subcategory[]>;

  // Find category by slug with products
  findCategoryBySlugWithProducts(
    slug: string,
    productLimit?: number,
  ): Promise<CategoryWithProducts>;

  // Find paginated categories
  findPaginatedCategories(
    page: number,
    limit: number,
  ): Promise<{
    categories: Category[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;

  // Find paginated subcategories
  findPaginatedSubcategories(
    page: number,
    limit: number,
  ): Promise<{
    subcategories: Subcategory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>;
}
