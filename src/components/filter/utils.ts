import { Category, SubCategory } from "@/types/Product";

export const isValidCategory = (c: any): c is Category =>
  c &&
  typeof c === "object" &&
  typeof c._id === "string" &&
  typeof c.slug === "string";

export const isValidSubcategory = (s: any): s is SubCategory =>
  s &&
  typeof s === "object" &&
  typeof s._id === "string" &&
  typeof s.slug === "string" &&
  (typeof s.categoryId === "string" ||
    (typeof s.categoryId === "object" &&
      s.categoryId !== null &&
      typeof s.categoryId._id === "string"));

export const SORT_OPTIONS = [
  { value: "newest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export const DISCOUNT_OPTIONS = [
  { value: "", label: "All Products" },
  { value: "10", label: "10% or more" },
  { value: "25", label: "25% or more" },
  { value: "50", label: "50% or more" },
  { value: "70", label: "70% or more" },
];

export const getQuickPriceRanges = (minPrice: number, maxPrice: number) => [
  { value: "", label: "All Prices" },
  { value: `${minPrice}-9000`, label: "Under ₹9,000" },
  { value: "10000-19999", label: "₹10,000 - ₹19,999" },
  { value: "20000-39999", label: "₹20,000 - ₹39,999" },
  { value: "40000-59999", label: "₹40,000 - ₹59,999" },
  { value: `60000-${maxPrice}`, label: "Above ₹60,000" },
];