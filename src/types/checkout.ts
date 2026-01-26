export interface CheckoutItem {
  productId: string;
  quantity: number;
  itemTotal: number;
  product: {
    _id: string;
    name: string;
    finalPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    mainImage?: {
      url: string;
      alt?: string;
    };
    isInStock: boolean;
  };
}