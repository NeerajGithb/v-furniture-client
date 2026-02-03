import {
  IInspirationsRepository,
  PaginatedResult,
  Inspiration,
  RelatedProductsResult,
} from "./IInspirationsRepository";
import { InspirationsRepository } from "./InspirationsRepository";
import {
  InspirationsQueryRequest,
  InspirationsFilterRequest,
  RelatedProductsRequest,
} from "./InspirationsSchemas";
import { InspirationNotFoundError } from "./InspirationsErrors";
import { RepositoryError } from "../shared/InfrastructureError";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export class InspirationsService {
  constructor(
    private repository: IInspirationsRepository = new InspirationsRepository(),
  ) {}

  // Get inspirations with various query modes
  async getInspirations(query: InspirationsQueryRequest): Promise<any> {
    try {
      // Handle different query modes
      if (query.relatedProducts && query.slug) {
        return this.getRelatedProducts({
          slug: query.slug,
          limit: query.limit || 20,
          sort: query.sort,
        });
      }

      // Default: paginated inspirations list
      return this.getInspirationsList(query);
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof InspirationNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve inspirations");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Get single inspiration by slug
  async getInspirationBySlug(slug: string): Promise<Inspiration> {
    const cacheKey = `inspiration:${slug}`;
    const cached = await getCached<Inspiration>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const inspiration = await this.repository.findBySlug(slug);

      // Cache the inspiration
      await setCache(cacheKey, inspiration, CACHE_TTL.INSPIRATION);

      return inspiration;
    } catch (error) {
      // Handle domain errors - let them bubble up with proper context
      if (error instanceof InspirationNotFoundError) {
        throw error;
      }

      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve inspiration");
      }

      throw error; // Re-throw unknown errors
    }
  }

  // Private methods for different query modes
  private async getInspirationsList(query: InspirationsQueryRequest): Promise<{
    inspirations: Inspiration[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const cacheKey = `inspirations:${JSON.stringify(query)}`;
    const cached = await getCached<any>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const filters = this.extractFilters(query);
      const pagination = { page: query.page, limit: query.limit };

      const result = await this.repository.findWithFilters(filters, pagination);

      const response = {
        inspirations: result.items,
        pagination: result.pagination,
      };

      await setCache(cacheKey, response, CACHE_TTL.INSPIRATIONS);
      return response;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve inspirations list");
      }
      throw error; // Re-throw domain errors
    }
  }

  private async getRelatedProducts(
    request: RelatedProductsRequest,
  ): Promise<RelatedProductsResult> {
    const cacheKey = `products:related:${request.slug}:${request.limit}:${request.sort || "related"}`;
    const cached = await getCached<RelatedProductsResult>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const result = await this.repository.findRelatedProducts(
        request.slug,
        request.limit,
        request.sort,
      );

      await setCache(cacheKey, result, CACHE_TTL.RELATED_PRODUCTS);
      return result;
    } catch (error) {
      // Handle infrastructure errors
      if (error instanceof RepositoryError) {
        throw new Error("Failed to retrieve related products");
      }
      throw error; // Re-throw domain errors
    }
  }

  private extractFilters(
    query: InspirationsQueryRequest,
  ): InspirationsFilterRequest {
    return {
      category: query.category,
      search: query.search,
      tag: query.tag,
      keyword: query.keyword,
    };
  }
}

// Create default instance
export const inspirationsService = new InspirationsService();
