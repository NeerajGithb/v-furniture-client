// Common base interfaces for all components
export interface BaseComponentProps {
  loading: boolean;
  error: string | null;
}

export interface BasePageProps extends BaseComponentProps {
  data: any[];
}

export interface BaseHeaderProps extends BaseComponentProps {
  title: string;
  description?: string;
}

// Common action handlers
export interface BaseActions {
  onRetry?: () => void;
  onRefresh?: () => void;
}

// Common loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

// Common pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

// Common filter props
export interface BaseFilterProps {
  selectedValue: string;
  options: Array<{ value: string; label: string }>;
  onFilterChange: (value: string) => void;
}
