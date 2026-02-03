import { WebhookEventRequest } from "./WebhookSchemas";

export interface PaymentRecord {
  paymentId: string;
  orderId: any;
  status: string;
  gatewayTransactionId: string;
  gatewayPaymentId?: string;
  gatewayResponse?: any;
  paidAt?: Date;
  failureReason?: string;
}

export interface WebhookEventRecord {
  eventId: string;
  eventType: string;
  gateway: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt?: Date;
}

export interface IWebhookRepository {
  // Event deduplication
  findEventById(eventId: string): Promise<WebhookEventRecord | null>;
  createEvent(data: WebhookEventRequest): Promise<WebhookEventRecord>;
  markEventAsProcessed(eventId: string): Promise<void>;

  // Payment operations
  findPaymentByOrderId(orderId: string): Promise<PaymentRecord | null>;
  updatePaymentSuccess(
    paymentId: string,
    data: {
      gatewayPaymentId: string;
      gatewayResponse: any;
      paidAt: Date;
    },
  ): Promise<void>;
  updatePaymentFailure(
    paymentId: string,
    data: {
      gatewayPaymentId: string;
      failureReason: string;
      gatewayResponse: any;
    },
  ): Promise<void>;

  // Order operations
  updateOrderAfterPayment(
    orderId: string,
    data: {
      paymentStatus: string;
      orderStatus: string;
      expectedDeliveryDate?: Date;
    },
  ): Promise<void>;

  // Cache operations
  invalidateOrderCaches(userId: string, orderNumber: string): Promise<void>;
}
