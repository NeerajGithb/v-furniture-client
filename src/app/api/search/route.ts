export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { withDB } from "@/lib/middleware/dbConnection";
import { withRouteErrorHandling } from "@/lib/middleware/errorHandler";
import { searchService } from "@/lib/domain/search/SearchService";
import { ProductsRepository } from "@/lib/domain/products/ProductsRepository";
import {
  SearchQuerySchema,
  SearchAnalyticsSchema,
  SearchContextSchema,
} from "@/lib/domain/search/SearchSchemas";
import { ApiResponseBuilder } from "@/lib/utils/apiResponse";

export const GET = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);

    // Parse search parameters to match products API structure
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Parse filters to match products API structure
    const material = searchParams.get("material") || undefined;
    const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : undefined;
    const inStock = searchParams.get("inStock") === "true";
    const onSale = searchParams.get("onSale") === "true";
    const discount = searchParams.get("discount") ? parseInt(searchParams.get("discount")!) : undefined;
    const sort = searchParams.get("sort") || "newest";
    const category = searchParams.get("category") || undefined;
    const subcategory = searchParams.get("subcategory") || undefined;

    // Initialize products repository
    const productsRepo = new ProductsRepository();

    // Handle empty query case
    if (!query.trim()) {
      const filtersMetadata = await productsRepo.getFiltersMetadata();
      
      const emptyResult = {
        products: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
        filters: {
          materials: filtersMetadata.materials,
          priceRange: filtersMetadata.priceRange,
          appliedFilters: {
            category: null,
            subcategory: null,
            material: null,
            minPrice: null,
            maxPrice: null,
            inStock: null,
            onSale: null,
            discount: null,
            sort: "newest",
          }
        },
        fallback: { used: false },
      };
      return ApiResponseBuilder.success(emptyResult);
    }

    // Get context from headers for search service
    const userAgent = request.headers.get("user-agent") || "";
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";

    const sessionId =
      request.cookies.get("searchSessionId")?.value ||
      request.headers.get("x-session-id") ||
      `session_${Date.now()}`;

    const userId =
      request.cookies.get("userId")?.value ||
      request.headers.get("x-user-id") ||
      undefined;

    const context = SearchContextSchema.parse({
      region: "IN",
      device: device as any,
      userId,
      sessionId,
    });

    // Build search query with filters
    const searchQuery = SearchQuerySchema.parse({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    // Build filters for search engine (convert to search engine format)
    const searchFilters: any = {};
    
    if (material) {
      // Decode material slug back to original material name for search
      const availableMaterials = await productsRepo.getFiltersMetadata();
      const matchingMaterial = availableMaterials.materials.find((mat: string) => {
        if (!mat) return false;
        const materialSlug = mat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
        return materialSlug === material;
      });
      
      if (matchingMaterial) {
        searchFilters.materials = [matchingMaterial];
      }
    }
    
    if (minPrice || maxPrice) {
      searchFilters.priceRange = {
        min: minPrice,
        max: maxPrice,
      };
    }
    
    if (inStock) {
      searchFilters.inStock = true;
    }
    
    if (onSale) {
      searchFilters.onSale = true;
    }
    
    if (sort && sort !== "newest") {
      searchFilters.sortBy = sort === "price-low" ? "price_asc" : 
                            sort === "price-high" ? "price_desc" :
                            sort === "rating" ? "rating" :
                            sort === "discount" ? "discount" : sort;
    }

    // Get search results from search service with filters
    const searchQueryWithFilters = {
      ...searchQuery,
      filters: searchFilters,
    };
    
    const searchResult = await searchService.search(searchQueryWithFilters, context);

    // Get filters metadata based on the search results, not all products
    let filtersMetadata;
    if (searchResult.products && searchResult.products.length > 0) {
      // Extract unique materials from search results
      const searchResultMaterials = [...new Set(
        searchResult.products
          .map((product: any) => product.material)
          .filter((material: string) => material && material.trim())
      )].sort();
      
      filtersMetadata = {
        materials: searchResultMaterials,
        priceRange: { minPrice: 0, maxPrice: 100000 }, // Always full range for slider
        appliedFilters: {
          category: category || null,
          subcategory: subcategory || null,
          material: material || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          inStock: inStock || null,
          onSale: onSale || null,
          discount: discount || null,
          sort: sort || "newest",
        }
      };
    } else {
      // No search results, get general filters metadata
      filtersMetadata = await productsRepo.getFiltersMetadataForQuery({
        category,
        subcategory,
        material,
        minPrice,
        maxPrice,
        inStock,
        onSale,
        discount,
        sort: sort as any,
      });
    }

    // Transform search result to match products API structure
    const transformedResult = {
      products: searchResult.products || [],
      pagination: {
        page: searchResult.pagination.page,
        limit: searchResult.pagination.limit,
        total: searchResult.pagination.total,
        totalPages: Math.ceil(searchResult.pagination.total / searchResult.pagination.limit),
      },
      filters: filtersMetadata,
      fallback: {
        used: Boolean(searchResult.metadata?.fallback),
        type: searchResult.metadata?.fallback ? "search_fallback" : undefined,
        message: searchResult.metadata?.message || undefined,
      },
    };

    return ApiResponseBuilder.success(transformedResult);
  }),
);

export const POST = withDB(
  withRouteErrorHandling(async (request: NextRequest) => {
    const body = await request.json();

    // Validate request body at route boundary
    const validatedData = SearchAnalyticsSchema.parse(body);

    const result = await searchService.trackAnalytics(validatedData);
    return ApiResponseBuilder.success(result);
  }),
);
