import {
  IInspirationsRepository,
  Inspiration,
  RelatedProductsResult,
} from "./IInspirationsRepository";
import { InspirationsRepository } from "./InspirationsRepository";
import {
  InspirationsQueryRequest,
  InspirationsFilterRequest,
  RelatedProductsRequest,
} from "./InspirationsSchemas";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";

export class InspirationsService {
  constructor(
    private repository: IInspirationsRepository = new InspirationsRepository(),
  ) {}

  async getInspirations(query: InspirationsQueryRequest): Promise<any> {
    if (query.relatedProducts && query.slug) {
      return this.getRelatedProducts({
        slug: query.slug,
        limit: query.limit || 20,
        sort: query.sort,
      });
    }

    return this.getInspirationsList(query);
  }

  async getInspirationBySlug(slug: string): Promise<Inspiration> {
    const cacheKey = `inspiration:${slug}`;
    const cached = await getCached<Inspiration>(cacheKey);

    if (cached) return cached;

    const inspiration = await this.repository.findBySlug(slug);
    await setCache(cacheKey, inspiration, CACHE_TTL.INSPIRATION);

    return inspiration;
  }

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

    if (cached) return cached;

    const filters = this.extractFilters(query);
    const pagination = { page: query.page, limit: query.limit };

    const result = await this.repository.findWithFilters(filters, pagination);

    const response = {
      inspirations: result.items,
      pagination: result.pagination,
    };

    await setCache(cacheKey, response, CACHE_TTL.INSPIRATIONS);
    return response;
  }

  private async getRelatedProducts(
    request: RelatedProductsRequest,
  ): Promise<RelatedProductsResult> {
    const cacheKey = `products:related:${request.slug}:${request.limit}:${request.sort || "related"}`;
    const cached = await getCached<RelatedProductsResult>(cacheKey);

    if (cached) return cached;

    const result = await this.repository.findRelatedProducts(
      request.slug,
      request.limit,
      request.sort,
    );

    await setCache(cacheKey, result, CACHE_TTL.RELATED_PRODUCTS);
    return result;
  }

  private extractFilters(query: InspirationsQueryRequest): InspirationsFilterRequest {
    return {
      category: query.category,
      search: query.search,
      tag: query.tag,
      keyword: query.keyword,
    };
  }
}

export const inspirationsService = new InspirationsService();