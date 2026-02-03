import { useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { searchService } from "@/services/searchService";
import { useCategories } from "@/hooks/useCategoryData";
import { useMemo } from "react";

interface ProductDataConfig {
  pageType: 'products' | 'search' | 'category';
  slug?: string;
  query?: string;
  filters: any;
}

export const useProductData = (config: ProductDataConfig) => {
  const { pageType, slug, query, filters } = config;
  
  // Get categories for slug detection
  const { data: categories = [] } = useCategories();
  
  // Create a Set of category slugs for O(1) lookup performance
  const categorySlugSet = useMemo(() => {
    return new Set(categories.map(c => c.slug));
  }, [categories]);
  
  // Function to detect if slug is a category
  const detectSlugType = (slug: string) => {
    const isCategory = categorySlugSet.has(slug);
    return {
      isCategory,
      filterType: isCategory ? 'category' : 'subcategory'
    };
  };

  return useInfiniteQuery({
    queryKey: ['products', pageType, slug, query, filters],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        ...filters,
        page: pageParam,
        limit: 20,
      };

      switch (pageType) {
        case 'products':
          return await productService.getProducts(params);
        
        case 'search':
          return await searchService.search({ 
            query: query || '', 
            page: pageParam,
            limit: params.limit,
            material: params.material,
            minPrice: params.minPrice,
            maxPrice: params.maxPrice,
            inStock: params.inStock,
            onSale: params.onSale,
            sort: params.sort,
            category: params.category,
            subcategory: params.subcategory,
            brand: params.brand,
            color: params.color,
          });
        
        case 'category':
          // Detect if slug is category or subcategory and use appropriate filter
          const slugInfo = detectSlugType(slug!);
          
          if (slugInfo.isCategory) {
            return await productService.getProducts({ ...params, category: slug });
          } else {
            return await productService.getProducts({ ...params, subcategory: slug });
          }
        
        default:
          throw new Error(`Unknown page type: ${pageType}`);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { page, pages } = lastPage.pagination || {};
      return page < pages ? page + 1 : undefined;
    },
    enabled: Boolean(pageType && (pageType !== 'search' || query) && (pageType !== 'category' || slug)),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};