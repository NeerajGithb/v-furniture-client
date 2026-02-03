import { CreatePaymentRequest, VerifyPaymentRequest } from "./PaymentSchemas";

export interface OrderValidationResult {
  success: boolean;
  error?: string;
  order?: any;
}

export interface ExistingPaymentResult {
  exists: boolean;
  payment?: any;
}

export interface CODPaymentResult {
  success: boolean;
  payment: any;
}

export interface RazorpayOrderResult {
  success: boolean;
  error?: string;
  razorpayOrder?: any;
  payment?: any;
}

export interface PaymentVerificationResult {
  success: boolean;
  error?: string;
  payment?: any;
  order?: any;
}

export interface IPaymentRepository {
  // Payment CRUD operations
  findById(paymentId: string, userId: string): Promise<any>;
  findByOrderId(orderId: string, userId: string): Promise<any>;
  create(paymentData: any): Promise<any>;
  update(paymentId: string, updates: any): Promise<any>;

  // Order validation
  validateOrderForPayment(
    orderId: string,
    userId: string,
  ): Promise<OrderValidationResult>;

  // Payment processing
  checkExistingPayment(orderId: string): Promise<ExistingPaymentResult>;
  processCODPayment(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<CODPaymentResult>;
  createRazorpayOrder(
    order: any,
    userId: string,
    existingPayment?: any,
  ): Promise<RazorpayOrderResult>;

  // Payment verification
  verifyRazorpaySignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean;
  processSuccessfulPayment(
    payment: any,
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
  ): Promise<PaymentVerificationResult>;
  processFailedPayment(payment: any, reason: string): Promise<void>;

  // Cache operations
  invalidatePaymentCaches(
    userId: string,
    orderId?: string,
    paymentId?: string,
  ): Promise<void>;
}
