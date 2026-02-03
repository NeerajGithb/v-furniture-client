import {
  IProductsRepository,
  ProductsFilters,
  ProductsByCategory,
  PaginationOptions,
} from "./IProductsRepository";
import { ProductsRepository } from "./ProductsRepository";
import { ProductsQueryRequest, ProductsFilterRequest } from "./ProductsSchemas";
import {
  ProductNotFoundError,
  CategoryNotFoundError,
  SubcategoryNotFoundError,
  InvalidPriceRangeError,
} from "./ProductsErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import { Product } from "@/types/Product";
import {
  getCached,
  setCache,
  invalidateCacheByPrefix,
  CACHE_TTL,
} from "@/lib/cache";

export class ProductsService {
  constructor(
    private repository: IProductsRepository = new ProductsRepository(),
  ) {}

  // Get products with various query modes
  async getProducts(query: ProductsQueryRequest): Promise<any> {
    try {
      // Validate price range
      if (
        query.minPrice !== undefined &&
        query.maxPrice !== undefined &&
        query.minPrice > query.maxPrice
      ) {
        throw new InvalidPriceRangeError();
      }

      // Handle different query modes
      if (query.count) {
        return this.getProductsCount(query);
      }

      if (query.showcase) {
        return this.getShowcaseProducts(query);
      }

      if (query.groupBy === "category") {
        return this.getProductsByCategory(query);
      }

      // Default: paginated products list
      return this.getProductsList(query);
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (
        error instanceof InvalidPriceRangeError ||
        error instanceof CategoryNotFoundError ||
        error instanceof SubcategoryNotFoundError
      ) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve products");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get single product by ID
  async getProductById(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    
    // Try to get from cache, but don't let cache errors break the request
    let cached: Product | null = null;
    try {
      cached = await getCached<Product>(cacheKey);
    } catch (cacheError) {
      // Log cache error but continue with database lookup
      if (process.env.NODE_ENV === "development") {
        console.warn("Cache read error:", cacheError);
      }
    }

    if (cached) {
      // Increment view count asynchronously
      this.repository.incrementViewCount(id);
      return cached;
    }

    try {
      const product = await this.repository.findById(id);

      // Try to cache the product, but don't let cache errors break the response
      try {
        await setCache(cacheKey, product, CACHE_TTL.PRODUCT);
      } catch (cacheError) {
        // Log cache error but continue with response
        if (process.env.NODE_ENV === "development") {
          console.warn("Cache write error:", cacheError);
        }
      }

      // Increment view count asynchronously
      this.repository.incrementViewCount(id);

      return product;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof ProductNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve product");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get single product by slug
  async getProductBySlug(slug: string): Promise<Product> {
    const cacheKey = `product:slug:${slug}`;
    
    // Try to get from cache, but don't let cache errors break the request
    let cached: Product | null = null;
    try {
      cached = await getCached<Product>(cacheKey);
    } catch (cacheError) {
      // Log cache error but continue with database lookup
      if (process.env.NODE_ENV === "development") {
        console.warn("Cache read error:", cacheError);
      }
    }

    if (cached) {
      // Increment view count asynchronously
      this.repository.incrementViewCount(cached._id);
      return cached;
    }

    try {
      const product = await this.repository.findBySlug(slug);

      // Try to cache the product, but don't let cache errors break the response
      try {
        await setCache(cacheKey, product, CACHE_TTL.PRODUCT);
      } catch (cacheError) {
        // Log cache error but continue with response
        if (process.env.NODE_ENV === "development") {
          console.warn("Cache write error:", cacheError);
        }
      }

      // Increment view count asynchronously
      this.repository.incrementViewCount(product._id);

      return product;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof ProductNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve product");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Private methods for different query modes
  private async getProductsCount(
    query: ProductsQueryRequest,
  ): Promise<{ count: number; entity: string; type: string }> {
    const cacheKey = `products:count:${JSON.stringify(query)}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const filters = this.extractFilters(query);
    const count =
      filters.category ||
      filters.subcategory ||
      filters.material ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.inStock ||
      filters.onSale ||
      filters.discount
        ? await this.repository.countWithFilters(filters)
        : await this.repository.countAll();

    const result = {
      count,
      entity: "PRODUCT",
      type: "COUNT",
    };

    await setCache(cacheKey, result, CACHE_TTL.STATS);
    return result;
  }

  private async getShowcaseProducts(
    query: ProductsQueryRequest,
  ): Promise<{ products: Product[]; total: number; slug?: string }> {
    const cacheKey = `showcase:${JSON.stringify(query)}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return cached;
    }

    let products: Product[];
    let slug: string | undefined;

    if (query.category) {
      // Validate category exists
      const categoryId = await this.repository.validateCategoryExists(
        query.category,
      );
      if (!categoryId) {
        throw new CategoryNotFoundError(query.category);
      }

      products = await this.repository.findShowcaseByCategory(
        categoryId,
        query.limit,
      );
      const inspirationSlug =
        await this.repository.getInspirationSlugByCategory(categoryId);
      slug = inspirationSlug || undefined;
    } else {
      products = await this.repository.findShowcaseProducts(query.limit);
    }

    const result = {
      products,
      total: products.length,
      ...(slug ? { slug } : {}),
    };

    await setCache(cacheKey, result, CACHE_TTL.SHOWCASE_PRODUCTS);
    return result;
  }

  private async getProductsByCategory(query: ProductsQueryRequest): Promise<{
    productsByCategory: ProductsByCategory[];
    totalProducts: number;
    totalCategories: number;
    filters: ProductsFilters;
  }> {
    const cacheKey = `productsByCategory:${JSON.stringify(query)}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const filters = this.extractFilters(query);
    const [productsByCategory, filtersMetadata] = await Promise.all([
      this.repository.findGroupedByCategory(filters, query.productsPerCategory),
      this.repository.getFiltersMetadata(),
    ]);

    const totalProducts = productsByCategory.reduce(
      (sum, item) => sum + item.products.length,
      0,
    );

    const result = {
      productsByCategory,
      totalProducts,
      totalCategories: productsByCategory.length,
      filters: filtersMetadata,
    };

    await setCache(cacheKey, result, CACHE_TTL.PRODUCTS);
    return result;
  }

  private async getProductsList(query: ProductsQueryRequest): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    filters?: ProductsFilters & { appliedFilters: any };
    fallback?: { used: boolean; type?: string; message?: string };
  }> {
    const cacheKey = `products:${JSON.stringify(query)}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return cached;
    }

    const filters = this.extractFilters(query);
    const pagination = { page: query.page, limit: query.limit };

    const [result, filtersMetadata] = await Promise.all([
      this.repository.findWithFilters(filters, pagination),
      // Only fetch filters metadata on first page, and use the new dynamic method
      query.page === 1
        ? this.repository.getFiltersMetadataForQuery(filters)
        : Promise.resolve(null),
    ]);

    // Handle fallback logic in Service layer
    let finalResult = result;
    let fallbackInfo: { used: boolean; type?: string; message?: string } = { used: false };

    // If no products found on first page, try fallback strategies
    if (result.items.length === 0 && pagination.page === 1) {
      const fallbackResult = await this.handleFallbackStrategies(filters, pagination);
      if (fallbackResult) {
        finalResult = {
          items: fallbackResult.products,
          pagination: fallbackResult.pagination
        };
        fallbackInfo = fallbackResult.fallback;
      }
    }

    const response = {
      products: finalResult.items,
      pagination: finalResult.pagination,
      ...(filtersMetadata && { filters: filtersMetadata }),
      fallback: fallbackInfo,
    };

    await setCache(cacheKey, response, CACHE_TTL.PRODUCTS);
    return response;
  }

  // Handle fallback strategies (business logic in Service layer)
  private async handleFallbackStrategies(
    filters: ProductsFilterRequest,
    pagination: PaginationOptions
  ): Promise<{ products: Product[]; pagination: any; fallback: { used: boolean; type: string; message: string } } | null> {
    try {
      // Build a more specific message based on applied filters
      let searchContext = '';
      let hasNonCategoryFilters = false;
      
      // Check what filters are applied
      if (filters.minPrice || filters.maxPrice) {
        const minPrice = filters.minPrice || 0;
        const maxPrice = filters.maxPrice || 100000;
        searchContext += ` in ₹${minPrice.toLocaleString()}–₹${maxPrice.toLocaleString()} price range`;
        hasNonCategoryFilters = true;
      }
      
      if (filters.material) {
        // Find the actual material name from available materials
        const availableMaterials = await this.repository.getFiltersMetadata();
        const matchingMaterial = availableMaterials.materials.find((material: string) => {
          if (!material) return false;
          const materialSlug = material.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
          return materialSlug === filters.material;
        });
        
        if (matchingMaterial) {
          searchContext += ` with ${matchingMaterial} material`;
          hasNonCategoryFilters = true;
        }
      }
      
      if (filters.inStock) {
        searchContext += ` in stock`;
        hasNonCategoryFilters = true;
      }
      
      if (filters.onSale) {
        searchContext += ` on sale`;
        hasNonCategoryFilters = true;
      }
      
      if (filters.discount) {
        searchContext += ` with ${filters.discount}% or more discount`;
        hasNonCategoryFilters = true;
      }

      // Strategy 1: If we have non-category filters, try removing them first
      if (hasNonCategoryFilters) {
        // Try subcategory without other filters
        if (filters.subcategory) {
          const subcategoryProducts = await this.repository.findWithFilters(
            { subcategory: filters.subcategory, sort: "newest" }, 
            pagination
          );
          
          if (subcategoryProducts.items.length > 0) {
            const subcategoryName = filters.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return {
              products: subcategoryProducts.items,
              pagination: subcategoryProducts.pagination,
              fallback: {
                used: true,
                type: 'subcategory_no_filters',
                message: `We couldn't find any ${subcategoryName}${searchContext}. Here are other ${subcategoryName.toLowerCase()} you might like.`
              }
            };
          }
        }
        
        // Try parent category without other filters
        if (filters.subcategory) {
          const subcategoryInfo = await this.repository.findSubcategoryWithCategory(filters.subcategory);
          
          if (subcategoryInfo) {
            const { category } = subcategoryInfo;
            const categoryProducts = await this.repository.findByCategoryId(category._id, pagination.limit);
            
            if (categoryProducts.length > 0) {
              const subcategoryName = filters.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              
              return {
                products: categoryProducts,
                pagination: {
                  page: 1,
                  limit: pagination.limit,
                  total: categoryProducts.length,
                  totalPages: 1,
                },
                fallback: {
                  used: true,
                  type: 'category_no_filters',
                  message: `We couldn't find any ${subcategoryName}${searchContext}. Here are other ${category.name.toLowerCase()} you might like.`
                }
              };
            }
          }
        }
        
        // Try category without other filters
        if (filters.category) {
          const categoryProducts = await this.repository.findWithFilters(
            { category: filters.category, sort: "newest" }, 
            pagination
          );
          
          if (categoryProducts.items.length > 0) {
            const categoryName = filters.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return {
              products: categoryProducts.items,
              pagination: categoryProducts.pagination,
              fallback: {
                used: true,
                type: 'category_no_filters',
                message: `We couldn't find any ${categoryName}${searchContext}. Here are other ${categoryName.toLowerCase()} you might like.`
              }
            };
          }
        }
      }

      // Strategy 2: If subcategory filter, fallback to parent category (original logic for no additional filters)
      if (filters.subcategory && !hasNonCategoryFilters) {
        const subcategoryInfo = await this.repository.findSubcategoryWithCategory(filters.subcategory);
        
        if (subcategoryInfo) {
          const { category } = subcategoryInfo;
          const categoryProducts = await this.repository.findByCategoryId(category._id, pagination.limit);
          
          if (categoryProducts.length > 0) {
            const subcategoryName = filters.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return {
              products: categoryProducts,
              pagination: {
                page: 1,
                limit: pagination.limit,
                total: categoryProducts.length,
                totalPages: 1,
              },
              fallback: {
                used: true,
                type: 'category',
                message: `We couldn't find any ${subcategoryName} right now. Here are some popular ${category.name.toLowerCase()} you might like.`
              }
            };
          }
        }
      }

      // Strategy 3: Final fallback to popular products
      const popularProducts = await this.repository.findPopularProducts(pagination.limit);

      if (popularProducts.length > 0) {
        let message;
        
        if (hasNonCategoryFilters) {
          if (filters.subcategory) {
            const subcategoryName = filters.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            message = `We couldn't find any ${subcategoryName}${searchContext}. Here are some popular alternatives.`;
          } else if (filters.category) {
            const categoryName = filters.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            message = `We couldn't find any ${categoryName}${searchContext}. Here are some popular alternatives.`;
          } else {
            message = `We couldn't find any products${searchContext}. Here are some popular alternatives.`;
          }
        } else {
          if (filters.subcategory) {
            const subcategoryName = filters.subcategory.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            message = `We couldn't find any ${subcategoryName} right now. Here are some popular products you might like.`;
          } else if (filters.category) {
            const categoryName = filters.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            message = `We couldn't find any ${categoryName} right now. Here are some popular products you might like.`;
          } else {
            message = 'We couldn\'t find what you\'re looking for. Here are some popular products you might like.';
          }
        }
          
        return {
          products: popularProducts,
          pagination: {
            page: 1,
            limit: pagination.limit,
            total: popularProducts.length,
            totalPages: 1,
          },
          fallback: {
            used: true,
            type: 'popular',
            message
          }
        };
      }

      return null;
    } catch (error) {
      // If fallback fails, return null to show original empty result
      return null;
    }
  }

  private extractFilters(query: ProductsQueryRequest): ProductsFilterRequest {
    return {
      category: query.category,
      subcategory: query.subcategory,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      material: query.material,
      inStock: query.inStock,
      onSale: query.onSale,
      discount: query.discount,
      sort: query.sort,
    };
  }
}

// Create default instance
export const productsService = new ProductsService();
