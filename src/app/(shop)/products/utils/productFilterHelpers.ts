export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "rating", label: "Customer Rating" },
  { value: "discount", label: "Highest Discount" },
] as const;

export const findSortLabel = (value: string) => {
  return SORT_OPTIONS.find((opt) => opt.value === value)?.label || value;
};

export const getDiscountLabel = (value: string) => {
  const discountOptions = [
    { value: "", label: "All Products" },
    { value: "10", label: "10% or more" },
    { value: "25", label: "25% or more" },
    { value: "50", label: "50% or more" },
    { value: "70", label: "70% or more" },
  ];
  return (
    discountOptions.find((opt) => opt.value === value)?.label ||
    `${value}% or more`
  );
};

export const findCategoryName = (slug: any, categories: any[]) => {
  if (!categories) return slug;
  return categories.find((c: { slug: any }) => c.slug === slug)?.name || slug;
};

export const findSubcategoryName = (
  subcategorySlug: any,
  subcategories: any[],
) => {
  if (!subcategories) return subcategorySlug;
  return (
    subcategories.find((s: { slug: any }) => s.slug === subcategorySlug)
      ?.name || subcategorySlug
  );
};

export const countActiveFilters = (filterParams: {
  category?: string;
  subcategory?: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  discount: string;
  sort: string;
}) => {
  const {
    category,
    subcategory,
    material,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    discount,
    sort,
  } = filterParams;

  const filters = [
    category,
    subcategory,
    material,
    minPrice || maxPrice,
    inStock,
    onSale,
    discount,
    sort !== "newest",
  ];

  return filters.filter(Boolean).length;
};

export const hasActiveFilters = (filterParams: {
  category?: string;
  subcategory?: string;
  material: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  onSale: boolean;
  discount: string;
  sort: string;
}) => {
  const {
    category,
    subcategory,
    material,
    minPrice,
    maxPrice,
    inStock,
    onSale,
    discount,
    sort,
  } = filterParams;
  return !!(
    category ||
    subcategory ||
    material ||
    minPrice ||
    maxPrice ||
    inStock ||
    onSale ||
    discount ||
    (sort && sort !== "newest")
  );
};