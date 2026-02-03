export interface Product {
  id: string;
  name: string;
  finalPrice?: number;
  mainImage?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AutocompleteItem {
  text: string;
  type: "exact" | "product" | "category" | "variant";
  count?: number;
  image?: string;
  category?: string;
}

export interface AutocompleteData {
  autocomplete?: AutocompleteItem[];
  recent?: string[];
  trending?: string[];
  didYouMean?: string[];
}

export type AutocompleteType =
  | "autocomplete"
  | "product"
  | "recent"
  | "didYouMean";

export interface AutocompleteListItem {
  item: string | Product | AutocompleteItem;
  type: AutocompleteType;
  index: number;
}

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  initialQuery?: string;
}
