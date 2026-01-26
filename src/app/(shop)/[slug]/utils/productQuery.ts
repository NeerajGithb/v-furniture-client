interface FilterParams {
  category: string;
  subcategory: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  discount: string;
  sort: string;
}

export const buildQueryParams = (filters: FilterParams): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.subcategory) params.set("subcategory", filters.subcategory);
  if (filters.material) params.set("material", filters.material);
  if (filters.minPrice) params.set("minPrice", filters.minPrice);
  if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
  if (filters.inStock) params.set("inStock", "true");
  if (filters.onSale) params.set("onSale", "true");
  if (filters.discount) params.set("discount", filters.discount);
  if (filters.sort !== "newest") params.set("sort", filters.sort);

  return params;
};

export const hasActiveFilters = (filters: FilterParams): boolean => {
  return !!(
    filters.material ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.inStock ||
    filters.onSale ||
    filters.discount ||
    (filters.sort && filters.sort !== "newest")
  );
};

export const countActiveFilters = (filters: FilterParams): number => {
  const activeFilters = [
    filters.material,
    filters.minPrice || filters.maxPrice,
    filters.inStock,
    filters.onSale,
    filters.discount,
    filters.sort !== "newest",
  ];
  return activeFilters.filter(Boolean).length;
};