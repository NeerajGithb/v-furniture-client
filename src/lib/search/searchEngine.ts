import { connectDB } from "@/lib/dbConnect";
import Product from "@/models/product";
import { getCached, setCache, CACHE_TTL } from "@/lib/cache";
import { QueryProcessor } from "./queryProcessor";
import { SearchQuery, SearchResult, SearchFilters } from "./types";
import { Types } from "mongoose";

export class SearchEngine {
  static async search(
    searchQuery: SearchQuery,
    categories: Array<{ _id: string; name: string; slug: string }> = [],
    subcategories: Array<{
      _id: string;
      name: string;
      slug: string;
      categoryId: string;
    }> = [],
  ): Promise<SearchResult> {
    try {
      const cacheKey = this.generateCacheKey(searchQuery);
      const cached = await getCached<SearchResult>(cacheKey);

      if (cached) {
        cached.metadata.cacheHit = true;
        return cached;
      }

      const processed = QueryProcessor.process(searchQuery.query);

      const mergedFilters = this.mergeFilters(
        searchQuery.filters || {},
        processed.filters || {},
      );

      const matchStage: any = {
        $match: {
          status: "APPROVED",
          isPublished: true,
          isActive: true,
          inStockQuantity: { $gt: 0 },
        },
      };

      const hasCategory =
        processed.categories.length > 0 || processed.subcategories.length > 0;
      const meaningfulSearchText =
        processed.searchText && processed.searchText.length >= 3
          ? processed.searchText
          : "";

      if (
        processed.searchText &&
        processed.searchText.length >= 3 &&
        !hasCategory
      ) {
        matchStage.$match.$text = { $search: processed.searchText };
      }

      if (processed.categories.length > 0) {
        const matchedCategories = categories.filter((cat) =>
          processed.categories.some((procCat) =>
            cat.name.toLowerCase().includes(procCat.toLowerCase()),
          ),
        );
        const categoryIds = matchedCategories.map(
          (c) => new Types.ObjectId(c._id),
        );
        if (categoryIds.length > 0) {
          matchStage.$match.categoryId = { $in: categoryIds };
        }
      }

      if (processed.subcategories.length > 0) {
        const matchedSubcategories = subcategories.filter((subcat) =>
          processed.subcategories.some((procSubcat) =>
            subcat.slug.toLowerCase().includes(procSubcat.toLowerCase()),
          ),
        );
        const subcategoryIds = matchedSubcategories.map(
          (s) => new Types.ObjectId(s._id),
        );
        if (subcategoryIds.length > 0) {
          matchStage.$match.subCategoryId = { $in: subcategoryIds };
        } else {
          // Subcategory detected but doesn't exist in database
        }
      }

      if (mergedFilters.priceRange) {
        matchStage.$match.finalPrice = {};
        if (mergedFilters.priceRange.min !== undefined) {
          matchStage.$match.finalPrice.$gte = mergedFilters.priceRange.min;
        }
        if (mergedFilters.priceRange.max !== undefined) {
          matchStage.$match.finalPrice.$lte = mergedFilters.priceRange.max;
        }
      }

      if (mergedFilters.colors && mergedFilters.colors.length > 0) {
        matchStage.$match.colors = { $in: mergedFilters.colors };
      }

      if (mergedFilters.materials && mergedFilters.materials.length > 0) {
        matchStage.$match.material = { $in: mergedFilters.materials };
      }

      if (mergedFilters.brands && mergedFilters.brands.length > 0) {
        matchStage.$match.brand = { $in: mergedFilters.brands };
      }

      if (mergedFilters.inStock) {
        matchStage.$match.stock = { $gt: 0 };
      }

      if (mergedFilters.onSale) {
        matchStage.$match.discount = { $gt: 0 };
      }

      if (mergedFilters.rating) {
        matchStage.$match.rating = { $gte: mergedFilters.rating };
      }

      const pipeline: any[] = [matchStage];

      if (hasCategory && meaningfulSearchText) {
        pipeline.push({
          $addFields: {
            relevanceScore: {
              $cond: {
                if: {
                  $regexMatch: {
                    input: { $toLower: "$name" },
                    regex: meaningfulSearchText
                      .toLowerCase()
                      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                    options: "i",
                  },
                },
                then: {
                  $cond: {
                    if: {
                      $eq: [
                        { $toLower: "$name" },
                        meaningfulSearchText.toLowerCase(),
                      ],
                    },
                    then: 100,
                    else: {
                      $cond: {
                        if: {
                          $regexMatch: {
                            input: { $toLower: "$name" },
                            regex: `^${meaningfulSearchText.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
                            options: "i",
                          },
                        },
                        then: 50,
                        else: 10,
                      },
                    },
                  },
                },
                else: 0,
              },
            },
          },
        });
      }

      const page = searchQuery.pagination?.page || 1;
      const limit = searchQuery.pagination?.limit || 24;
      const skip = (page - 1) * limit;

      const isTextSearch =
        processed.searchText &&
        processed.categories.length === 0 &&
        processed.subcategories.length === 0;

      if (mergedFilters.sortBy) {
        const sortStage: any = { $sort: {} };
        switch (mergedFilters.sortBy) {
          case "price_asc":
            sortStage.$sort.finalPrice = 1;
            break;
          case "price_desc":
            sortStage.$sort.finalPrice = -1;
            break;
          case "rating":
            sortStage.$sort.rating = -1;
            break;
          case "newest":
            sortStage.$sort.createdAt = -1;
            break;
          case "popularity":
            sortStage.$sort.views = -1;
            break;
          default:
            if (isTextSearch) {
              sortStage.$sort = { score: { $meta: "textScore" } };
            } else if (hasCategory && meaningfulSearchText) {
              sortStage.$sort = { relevanceScore: -1, createdAt: -1 };
            } else {
              sortStage.$sort.createdAt = -1;
            }
        }
        pipeline.push(sortStage);
      } else if (isTextSearch) {
        pipeline.push({ $sort: { score: { $meta: "textScore" } } });
      } else if (hasCategory && meaningfulSearchText) {
        pipeline.push({ $sort: { relevanceScore: -1, createdAt: -1 } });
      } else {
        pipeline.push({ $sort: { createdAt: -1 } });
      }

      pipeline.push({
        $facet: {
          products: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                name: 1,
                finalPrice: 1,
                originalPrice: 1,
                discountPercent: 1,
                mainImage: 1,
                reviews: 1,
                inStockQuantity: 1,
                material: 1,
                dimensions: 1,
                isNewArrival: 1,
                isBestSeller: 1,
              },
            },
          ],
          totalCount: [{ $count: "total" }],
        },
      });

      

      // Check if subcategory was detected but doesn't exist in database
      let subcategoryNotFound = false;
      if (processed.subcategories.length > 0) {
        const foundSubcategories = subcategories.filter((subcat) =>
          processed.subcategories.some((procSubcat) =>
            subcat.slug.toLowerCase().includes(procSubcat.toLowerCase()),
          ),
        );
        subcategoryNotFound = foundSubcategories.length === 0;
      }

      const [searchResults] = await Product.aggregate(pipeline);

      const products = searchResults?.products || [];
      const totalCount = searchResults?.totalCount?.[0]?.total || 0;

      let fallbackUsed = false;
      let finalProducts = products;
      let finalTotalCount = totalCount;

      if (
        totalCount === 0 &&
        (processed.categories.length > 0 || processed.subcategories.length > 0)
      ) {
        const fallbackMatchStage: any = {
          $match: {
            status: "APPROVED",
            isPublished: true,
            isActive: true,
            inStockQuantity: { $gt: 0 },
          },
        };

        // Fall back to parent category only (don't include subcategory)
        if (processed.categories.length > 0) {
          const matchedCategories = categories.filter((cat) =>
            processed.categories.some((procCat) =>
              cat.name.toLowerCase().includes(procCat.toLowerCase()),
            ),
          );
          const categoryIds = matchedCategories.map(
            (c) => new Types.ObjectId(c._id),
          );
          if (categoryIds.length > 0) {
            fallbackMatchStage.$match.categoryId = { $in: categoryIds };
          }
        }

        const fallbackPipeline: any[] = [fallbackMatchStage];
        fallbackPipeline.push({ $sort: { createdAt: -1 } });
        fallbackPipeline.push({
          $facet: {
            products: [
              { $skip: skip },
              { $limit: limit },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  finalPrice: 1,
                  originalPrice: 1,
                  discountPercent: 1,
                  mainImage: 1,
                  reviews: 1,
                  inStockQuantity: 1,
                  material: 1,
                  dimensions: 1,
                  isNewArrival: 1,
                  isBestSeller: 1,
                },
              },
            ],
            totalCount: [{ $count: "total" }],
          },
        });

        const [fallbackResults] = await Product.aggregate(fallbackPipeline);
        finalProducts = fallbackResults?.products || [];
        finalTotalCount = fallbackResults?.totalCount?.[0]?.total || 0;
        fallbackUsed = finalTotalCount > 0;
      }

      const searchResult: SearchResult = {
        products: finalProducts,
        pagination: {
          page,
          limit,
          total: finalTotalCount,
          hasMore: skip + limit < finalTotalCount,
        },
        metadata: {
          totalCandidates: finalTotalCount,
          cacheHit: false,
          ...(fallbackUsed && { fallback: true }),
          ...(subcategoryNotFound && { subcategoryNotFound: true }),
          ...((fallbackUsed || subcategoryNotFound) && {
            message: this.generateFallbackMessage(
              processed,
              mergedFilters,
              subcategoryNotFound,
            ),
          }),
        },
      };

      await setCache(cacheKey, searchResult, CACHE_TTL.SEARCH_RESULTS);

      return searchResult;
    } catch (error) {
      return {
        products: [],
        pagination: {
          page: searchQuery.pagination?.page || 1,
          limit: searchQuery.pagination?.limit || 24,
          total: 0,
          hasMore: false,
        },
        metadata: {
          totalCandidates: 0,
          cacheHit: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }

  private static generateCacheKey(searchQuery: SearchQuery): string {
    const { query, context, filters, pagination } = searchQuery;

    const stableFilters = filters
      ? {
          categories: filters.categories?.sort(),
          subcategories: filters.subcategories?.sort(),
          brands: filters.brands?.sort(),
          materials: filters.materials?.sort(),
          colors: filters.colors?.sort(),
          priceRange: filters.priceRange,
          inStock: filters.inStock,
          onSale: filters.onSale,
          rating: filters.rating,
          sortBy: filters.sortBy,
        }
      : {};

    const keyParts = [
      "search",
      query.toLowerCase().trim(),
      context.region || "global",
      context.device || "desktop",
      context.userId || "anonymous",
      JSON.stringify(stableFilters),
      `page:${pagination?.page || 1}`,
      `limit:${pagination?.limit || 24}`,
    ];

    return keyParts.join(":");
  }

  private static mergeFilters(
    userFilters: SearchFilters,
    intentFilters: SearchFilters,
  ): SearchFilters {
    return {
      ...intentFilters,
      ...userFilters,

      categories: [
        ...(intentFilters.categories || []),
        ...(userFilters.categories || []),
      ].filter((v, i, a) => a.indexOf(v) === i),

      brands: [
        ...(intentFilters.brands || []),
        ...(userFilters.brands || []),
      ].filter((v, i, a) => a.indexOf(v) === i),

      materials: [
        ...(intentFilters.materials || []),
        ...(userFilters.materials || []),
      ].filter((v, i, a) => a.indexOf(v) === i),

      colors: [
        ...(intentFilters.colors || []),
        ...(userFilters.colors || []),
      ].filter((v, i, a) => a.indexOf(v) === i),
    };
  }

  private static generateFallbackMessage(
    processed: any,
    filters: SearchFilters,
    subcategoryNotFound: boolean = false,
  ): string {
    let subcategoryName = "";
    let categoryName = "";

    if (processed.subcategories && processed.subcategories.length > 0) {
      subcategoryName = processed.subcategories[0]
        .split("-")
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    if (processed.categories && processed.categories.length > 0) {
      categoryName = processed.categories[0];
    }

    // If subcategory was searched but not found
    if (subcategoryNotFound && subcategoryName) {
      return `No ${subcategoryName} available. Showing all available ${categoryName}.`;
    }

    const showingWhat = subcategoryName || categoryName || "products";

    if (filters.priceRange) {
      if (filters.priceRange.max && filters.priceRange.min) {
        return `No ${showingWhat} available in ₹${filters.priceRange.min.toLocaleString()} - ₹${filters.priceRange.max.toLocaleString()} price range. Showing all available ${categoryName || showingWhat}.`;
      } else if (filters.priceRange.max) {
        return `No ${showingWhat} available under ₹${filters.priceRange.max.toLocaleString()}. Showing all available ${categoryName || showingWhat}.`;
      } else if (filters.priceRange.min) {
        return `No ${showingWhat} available above ₹${filters.priceRange.min.toLocaleString()}. Showing all available ${categoryName || showingWhat}.`;
      }
    }

    const removedFilters: string[] = [];

    if (filters.colors && filters.colors.length > 0) {
      removedFilters.push(filters.colors.join(", "));
    }

    if (filters.materials && filters.materials.length > 0) {
      removedFilters.push(filters.materials.join(", "));
    }

    if (removedFilters.length > 0) {
      return `No ${showingWhat} available with ${removedFilters.join(" and ")}. Showing all available ${categoryName || showingWhat}.`;
    }

    return "Showing related products";
  }
}
