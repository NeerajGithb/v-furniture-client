import { BasePrivateService } from "./baseService";

interface VerifyPaymentData {
  paymentId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
}

interface CreatePaymentData {
  orderId: string;
  paymentMethod: string;
  idempotencyKey?: string;
}

interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  order?: {
    _id: string;
    orderNumber: string;
    orderStatus: string;
    paymentStatus: string;
  };
}

interface PaymentResponse {
  success: boolean;
  paymentMethod: string;
  paymentId: string;
  message?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  key?: string;
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount?: number;
    orderStatus: string;
  };
  customer?: {
    name: string;
    email?: string;
  };
}

class PaymentService extends BasePrivateService {
  constructor() {
    super("/api");
  }

  /**
   * Creates payment (COD or Razorpay)
   */
  async createPayment(data: CreatePaymentData): Promise<PaymentResponse> {
    const response = await this.post<PaymentResponse>(
      "/payment",
      data,
    );

    // Check if the API request failed
    if (!response.success) {
      const errorMsg = response.error?.message || "Payment creation failed";
      throw new Error(errorMsg);
    }

    // Check if response data exists
    if (!response.data) {
      throw new Error("Payment service returned empty response");
    }

    return response.data;
  }

  /**
   * Verifies Razorpay payment
   */
  async verifyPayment(
    data: VerifyPaymentData,
  ): Promise<PaymentVerificationResponse> {
    const response = await this.put<PaymentVerificationResponse>(
      "/payment",
      data,
    );
    return response.data || {
      success: false,
      message: "Failed to verify payment",
    };
  }

  /**
   * Gets payment status
   */
  async getPaymentStatus(paymentId?: string, orderId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (paymentId) params.append("paymentId", paymentId);
    if (orderId) params.append("orderId", orderId);

    const response = await this.get<any>(
      `/payment?${params.toString()}`,
    );
    return response.data;
  }

  /**
   * Initialize COD payment (legacy method for compatibility)
   */
  async initializeCODPayment(data: {
    orderId: string;
  }): Promise<PaymentResponse> {
    return this.createPayment({
      orderId: data.orderId,
      paymentMethod: "cod",
    });
  }

  /**
   * Create Razorpay order (legacy method for compatibility)
   */
  async createRazorpayOrder(data: {
    orderId: string;
  }): Promise<PaymentResponse & { razorpayOrderId?: string }> {
    const result = await this.createPayment({
      orderId: data.orderId,
      paymentMethod: "razorpay",
    });

    return {
      ...result,
      razorpayOrderId: result.orderId,
    };
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
