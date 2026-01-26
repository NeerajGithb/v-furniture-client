export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "rating", label: "Customer Rating" },
  { value: "discount", label: "Highest Discount" },
];

const DISCOUNT_OPTIONS = [
  { value: "", label: "All Products" },
  { value: "10", label: "10% or more" },
  { value: "25", label: "25% or more" },
  { value: "50", label: "50% or more" },
  { value: "70", label: "70% or more" },
];

export const findSortLabel = (value: string): string => {
  return SORT_OPTIONS.find((opt) => opt.value === value)?.label || value;
};

export const getDiscountLabel = (value: string): string => {
  return (
    DISCOUNT_OPTIONS.find((opt) => opt.value === value)?.label ||
    `${value}% or more`
  );
};

export const findCategoryName = (categories: any[], slug: string): string => {
  return categories?.find((c: any) => c.slug === slug)?.name || slug;
};

export const findSubcategoryName = (
  subcategories: any[],
  slug: string,
): string => {
  return subcategories?.find((s: any) => s.slug === slug)?.name || slug;
};