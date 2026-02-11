import { BasePrivateService } from "./baseService";
import { ChatRequest, ChatResponse } from "@/types/chat";

class ChatService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Send chat message and get AI response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.post<ChatResponse>("/chat", request);
    
    // BasePrivateService already unwraps the response.data
    if (!response.data) {
      throw new Error("No response from chat service");
    }
    
    return response.data;
  }
}

// Export singleton instance
export const chatService = new ChatService();
