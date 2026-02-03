import { Order } from "@/types/order";
import { CreateOrderRequest, UpdateOrderRequest } from "./OrderSchemas";
import { Types } from "mongoose";

export interface PaginationOptions {
  page: number;
  limit: number;
  status?: string;
  orderNumber?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  sku?: string;
  itemId?: string;
  selectedVariant?: any;
  productImage?: string;
  discount?: number;
  discountPercent?: number;
  insuranceCost?: number;
}

export interface OrderData {
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  shippingAddress: any;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderNumber: string;
  trackingNumber?: string;
  expectedDeliveryDate?: Date;
  priceBreakdown?: any;
  insuranceEnabled?: string[];
  couponCode?: string;
}

export interface ValidatedOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  productImage?: string;
  sku?: string;
  itemId?: string;
  discount: number;
  discountPercent: number;
  selectedVariant?: any;
  insuranceCost?: number;
}

export interface ProductValidationResult {
  success: boolean;
  error?: string;
  items?: ValidatedOrderItem[];
  stockUpdates?: any[];
}

export interface AddressValidationResult {
  success: boolean;
  error?: string;
  address?: any;
}

export interface CouponValidationResult {
  success: boolean;
  error?: string;
  discount?: number;
  coupon?: any;
}

export interface IOrderRepository {
  // Order CRUD operations
  findById(id: string, userId: string): Promise<Order>;
  findByOrderNumber(orderNumber: string, userId: string): Promise<Order>;
  findByUserId(
    userId: string,
    options: PaginationOptions,
  ): Promise<PaginatedResult<Order>>;
  create(orderData: OrderData): Promise<Order>;
  update(id: string, userId: string, updates: Partial<Order>): Promise<Order>;
  delete(id: string, userId: string): Promise<boolean>;

  // Order business operations
  cancelOrder(id: string, userId: string, reason?: string): Promise<Order>;
  updateOrderStatus(id: string, userId: string, status: string): Promise<Order>;
  createOrderWithBusinessLogic(
    userId: string,
    items: any[],
    pricing: any,
    address: any,
    paymentMethod: string,
    insuranceEnabled: string[],
    couponCode?: string,
    validatedCoupon?: any,
  ): Promise<Order>;

  // Validation operations
  validateAddress(
    addressId: string,
    userId: string,
  ): Promise<AddressValidationResult>;
  validateOrderProducts(
    selectedItems: string[],
    cartData: any[],
  ): Promise<ProductValidationResult>;
  validateAndApplyCoupon(
    couponCode: string,
    userId: string,
    totalAmount: number,
    subtotal: number,
  ): Promise<CouponValidationResult>;

  // Stock and payment operations
  updateProductStock(stockUpdates: any[]): Promise<void>;
  createCouponUsage(
    userId: string,
    couponId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<void>;
  findPaymentByOrderId(orderId: string): Promise<any>;
  updatePayment(orderId: string, updates: any): Promise<void>;

  // Notification operations
  notifyNewOrder(
    sellerId: string,
    orderNumber: string,
    orderId: string,
    totalAmount: number,
  ): Promise<void>;
}
