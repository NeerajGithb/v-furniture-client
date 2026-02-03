import { Category, Product, IInspiration } from "./Product";

// CategoryGrid component props
export interface CategoryGridProps {
  categories: Category[];
  loading: boolean;
  error: Error | null;
}

// ProductShowcase component props
export interface ProductShowcaseProps {
  products: Product[];
  loading: boolean;
  error: Error | null;
  title?: string;
  description?: string;
  singleRow?: boolean;
  className?: string;
}

// RoomInspiration component props
export interface RoomInspirationProps {
  inspirations: IInspiration[];
  loading: boolean;
  error: Error | null;
}
