import { Category } from "./Product";

// Categories page component props
export interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
  error: Error | null;
}

// Categories page data
export interface CategoriesPageData {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
}
