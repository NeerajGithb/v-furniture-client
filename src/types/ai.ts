// types/ai.ts

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: ProductResponse[];
  isNew?: boolean;
};

export interface ChatIntent {
  action: string;
  language: string;
  category: string | null;
  subcategory: string | null;
  query: string;
  filters: {
    price_min?: number | null;
    price_max?: number | null;
    material?: string | null;
    color?: string | null;
    brand?: string | null;
    inStock?: boolean | null;
    onSale?: boolean | null;
  };
}

export interface ProductResponse {
  _id: string;
  name: string;
  slug: string;
  finalPrice: number;
  originalPrice: number;
  price?: number;
  mainImage?: {
    url: string;
    alt?: string;
  };
  categoryId?: {
    name: string;
    slug: string;
  };
  inStockQuantity?: number;
}

export interface ChatRequest {
  message: string;
  history?: Message[];
}

export interface ChatResponse {
  intent: ChatIntent;
  response: string;
  products: ProductResponse[] | null;
  stats?: {
    totalProducts: number;
    totalCategories: number;
    totalSubcategories: number;
  } | null;
  timestamp: number;
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  stream?: boolean;
  response_format?: { type: string };
  temperature?: number;
  max_tokens?: number;
}

export interface GroqResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
export interface ProductEntity {
  _id: string;
  slug: string;
  name?: string;
}

export interface UnderstandingResult {
  fine_intent: string;
  confidence: string;
  coarse_intent:
    | "SOCIAL"
    | "INFORMATION"
    | "BROWSING"
    | "ACTION"
    | "CONFIRMATION"
    | "UNKNOWN"
    | "CLARIFY"
    | "HELP"
    | "OFF_TOPIC";
  whatUserWants: string;
  info_type: string | null;
  info_entity: string | null;
  detail_level: string | null;
  language: string;
  action_type: string | null;
  entities: {
    category: string | null;
    subcategory: string | null;
    brand: string | null;
    product: ProductEntity | null;
    productIndex: number | null;
  };
  constraints: {
    price_min: number | null;
    price_max: number | null;
    material: string | null;
    color: string | null;
    size: string | null;
    sort: string | null;
  };
  confirmation: {
    is_yes: boolean;
    is_no: boolean;
  };
  question_type: {
    is_question: boolean;
    expects_yes_no: boolean;
  };
}

export type AwaitingConfirmation = {
  sourceAction: string;
  payload?: Record<string, any>;
};

export interface CurrentProduct {
  // identity
  _id: string;
  name: string;
  slug?: string;

  // pricing
  finalPrice: number;
  originalPrice: number;
  discountPercent?: number;

  // images
  mainImage?: {
    url: string;
    alt?: string;
    publicId?: string;
  };

  // availability
  inStockQuantity?: number;

  // physical details
  material?: string;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };

  // social proof
  reviews?: {
    average: number;
    count: number;
  };

  // flags / badges
  isNewArrival?: boolean;
  isBestSeller?: boolean;

  // Optional fields for backward compatibility (not stored in state)
  brand?: string;
  emiPrice?: number;
  colorOptions?: string[];
  size?: string[];
  weight?: number;
  description?: string;
  warranty?: string;
  returnPolicy?: string;
}
