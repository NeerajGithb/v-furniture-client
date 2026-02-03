import { BasePrivateService } from "./baseService";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: number;
  isTyping?: boolean;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  conversationId?: string;
}

interface ChatResponse {
  message: string;
  decision?: {
    action: string;
    actionType?: string;
    filters?: any;
  };
  shouldNavigate?: boolean;
  shouldRenderProducts?: boolean;
  conversationId?: string;
  products?: any[];
  categories?: any[];
  category?: any;
  subcategory?: any;
  productSlug?: string;
  productId?: string;
  navigationUrl?: string;
  response?: string;
  navigation?: any;
  structuredData?: any;
  isAuthenticated?: boolean;
}

class ChatService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  // Send chat message and get AI response
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.post<{ data: ChatResponse }>("/chat", request);

    if (response.data?.data) {
      return response.data.data;
    }

    if (response.data && "message" in response.data) {
      return response.data as ChatResponse;
    }

    return { message: "No response" };
  }
}

// Export singleton instance
export const chatService = new ChatService();
