import { Types } from "mongoose";
import Product from "@/models/product";
import Address from "@/models/Address";
import Coupon from "@/models/Coupon";
import CouponUsage from "@/models/CouponUsage";
import { generateOrderNumber } from "./generateOrderNumber";
import { generateTrackingNumber } from "./generateTrackingNumber";

/**
 * Centralized Order Business Logic
 * All order-related business rules and validations
 */

export interface OrderItem {
  productId: string;
  quantity: number;
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
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
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  insuranceCost?: number;
}

export interface OrderPricing {
  subtotal: number;
  shippingCost: number;
  insuranceCost: number;
  couponDiscount: number;
  totalAmount: number;
  itemDiscount: number;
}

export interface ValidatedCoupon {
  _id: Types.ObjectId;
  code: string;
  type: "flat" | "percentage";
  value: number;
  maxDiscount?: number;
}

/**
 * Validate and fetch products with stock check
 */
export async function validateOrderProducts(
  selectedItems: string[],
  cartData: any[],
): Promise<{
  success: boolean;
  error?: string;
  items?: ValidatedOrderItem[];
  stockUpdates?: any[];
}> {
  // Fetch all products at once
  const products = await Product.find({
    _id: { $in: selectedItems },
  }).lean();

  if (products.length !== selectedItems.length) {
    return { success: false, error: "Some products not found" };
  }

  const productMap = new Map(products.map((p: any) => [p._id.toString(), p]));
  const orderItems: ValidatedOrderItem[] = [];
  const stockUpdates = [];

  // Process each cart item with database prices
  for (const productId of selectedItems) {
    const cartItem = cartData.find((item: any) => item.productId === productId);
    if (!cartItem) {
      return { success: false, error: `Item missing in cart: ${productId}` };
    }

    const product: any = productMap.get(productId);
    if (!product) {
      return { success: false, error: `Product not found: ${productId}` };
    }

    // Stock check
    if (
      product.inStockQuantity !== undefined &&
      product.inStockQuantity < cartItem.quantity
    ) {
      return {
        success: false,
        error: `Insufficient stock for ${product.name}. Available: ${product.inStockQuantity}`,
      };
    }

    const orderItem: ValidatedOrderItem = {
      productId: product._id,
      name: product.name,
      price: product.finalPrice,
      originalPrice: product.originalPrice,
      quantity: cartItem.quantity,
      productImage: product.mainImage?.url,
      sku: product.sku,
      itemId: product.itemId,
      discount:
        (product.originalPrice || product.finalPrice) - product.finalPrice,
      discountPercent: product.discountPercent || 0,
    };

    if (
      cartItem.selectedVariant?.color ||
      cartItem.selectedVariant?.size ||
      cartItem.selectedVariant?.sku
    ) {
      orderItem.selectedVariant = cartItem.selectedVariant;
    }

    orderItems.push(orderItem);
    stockUpdates.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $inc: {
            inStockQuantity: -cartItem.quantity,
            totalSold: cartItem.quantity,
          },
        },
      },
    });
  }

  return { success: true, items: orderItems, stockUpdates };
}

/**
 * Calculate order pricing
 */
export function calculateOrderPricing(
  orderItems: ValidatedOrderItem[],
  insuranceEnabled: string[] = [],
): OrderPricing {
  // Calculate subtotal
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate shipping cost (free for orders >= ₹10,000)
  const shippingCost = subtotal >= 10000 ? 0 : 40;

  // Calculate insurance cost (2% of item total)
  let insuranceCost = 0;
  if (insuranceEnabled?.length) {
    for (const item of orderItems) {
      if (insuranceEnabled.includes(item.productId.toString())) {
        const itemInsurance = Math.round(item.price * item.quantity * 0.02);
        insuranceCost += itemInsurance;
        item.insuranceCost = itemInsurance;
      }
    }
  }

  // Calculate item discount
  const itemDiscount = orderItems.reduce(
    (sum, item) => sum + (item.discount || 0) * item.quantity,
    0,
  );

  return {
    subtotal,
    shippingCost,
    insuranceCost,
    couponDiscount: 0,
    totalAmount: subtotal + shippingCost + insuranceCost,
    itemDiscount,
  };
}

/**
 * Validate and apply coupon
 */
export async function validateAndApplyCoupon(
  couponCode: string,
  userId: string,
  currentTotal: number,
  subtotal: number,
): Promise<{
  success: boolean;
  error?: string;
  discount?: number;
  coupon?: ValidatedCoupon;
}> {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    active: true,
  });

  if (!coupon) {
    return { success: false, error: "Invalid coupon code" };
  }

  if (new Date() > new Date(coupon.expiry)) {
    return { success: false, error: "Coupon expired" };
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return { success: false, error: "Coupon usage limit reached" };
  }

  const userUsageCount = await CouponUsage.countDocuments({
    userId,
    couponId: coupon._id,
  });

  if (userUsageCount >= coupon.perUserLimit) {
    return { success: false, error: "Coupon already used" };
  }

  if (currentTotal < coupon.minOrderAmount) {
    return {
      success: false,
      error: `Minimum order amount ₹${coupon.minOrderAmount} required`,
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "flat") {
    discount = coupon.value;
  } else {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  }

  discount = Math.min(discount, currentTotal);

  return {
    success: true,
    discount,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
    },
  };
}

/**
 * Validate address ownership
 */
export async function validateAddress(
  addressId: string,
  userId: string,
): Promise<{ success: boolean; error?: string; address?: any }> {
  const address = await Address.findOne({
    _id: addressId,
    userId,
  });

  if (!address) {
    return { success: false, error: "Address not found" };
  }

  return { success: true, address };
}

/**
 * Build order data object
 */
export async function buildOrderData(
  userId: string,
  orderItems: ValidatedOrderItem[],
  pricing: OrderPricing,
  address: any,
  paymentMethod: string,
  insuranceEnabled: string[],
  couponCode?: string,
) {
  const orderNumber = await generateOrderNumber();
  const trackingNumber = generateTrackingNumber();

  return {
    userId,
    orderNumber,
    items: orderItems,
    subtotal: pricing.subtotal,
    shippingCost: pricing.shippingCost,
    totalAmount: pricing.totalAmount,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    },
    paymentMethod,
    paymentStatus: "pending",
    orderStatus: "pending", // All orders start as pending
    trackingNumber,
    insuranceEnabled,
    ...(couponCode && { couponCode }),
    priceBreakdown: {
      originalSubtotal: pricing.subtotal,
      itemDiscount: pricing.itemDiscount,
      couponDiscount: pricing.couponDiscount,
      totalInsurance: pricing.insuranceCost,
      finalSubtotal: pricing.subtotal,
      shippingCost: pricing.shippingCost,
      tax: 0,
      grandTotal: pricing.totalAmount,
      totalSavings: pricing.itemDiscount + pricing.couponDiscount,
    },
  };
}

/**
 * Calculate expected delivery date (7 days from now)
 */
export function calculateExpectedDeliveryDate(): Date {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
