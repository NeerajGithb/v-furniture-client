import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { useNavigate } from "@/components/NavigationLoader";
import { useCartHelpers } from "@/hooks/useCartData";

export const useCartCheckout = (
  cart: any,
  setError: (msg: string | null) => void,
) => {
  const navigate = useNavigate();
  const { checkout } = useCartStore();
  const { getSelectedCartItems, getCheckoutData } = useCartHelpers(cart);
  const checkoutStore = useCheckoutStore();

  const handleCheckout = () => {
    // Validation: Check if items are selected
    const selectedItems = getSelectedCartItems(checkout.selectedItems);
    if (selectedItems.length === 0) {
      setError("Please select at least one item to proceed to checkout.");
      return;
    }

    // Validation: Get checkout data
    const checkoutData = getCheckoutData(checkout);
    if (!checkoutData) {
      setError("Unable to prepare checkout data. Please try again.");
      return;
    }

    // Validation: Check if selected cart items exist
    if (!checkoutData.selectedCartItems || checkoutData.selectedCartItems.length === 0) {
      setError("No items found in checkout. Please refresh and try again.");
      return;
    }

    // Validation: Check totals
    if (!checkoutData.totals || checkoutData.totals.totalAmount <= 0) {
      setError("Invalid order total. Please refresh and try again.");
      return;
    }

    // Validation: Check if all selected items are in stock
    const outOfStockItems = checkoutData.selectedCartItems.filter(
      (item) => !item.product?.isInStock,
    );
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems
        .map((item) => item.product?.name)
        .join(", ");
      setError(`The following items are out of stock: ${itemNames}`);
      return;
    }

    try {
      // Format selected cart items with validation
      const validatedItems = checkoutData.selectedCartItems.map((item) => {
        // Validate each item
        if (!item.productId || !item.product?._id) {
          throw new Error("Invalid product data found");
        }

        if (!item.product.finalPrice || item.product.finalPrice <= 0) {
          throw new Error(`Invalid price for ${item.product.name}`);
        }

        if (item.quantity <= 0) {
          throw new Error(`Invalid quantity for ${item.product.name}`);
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          itemTotal: item.itemTotal,
          product: {
            _id: item.product._id,
            name: item.product.name || "",
            finalPrice: item.product.finalPrice,
            originalPrice: item.product.originalPrice,
            discountPercent: item.product.discountPercent,
            mainImage: item.product.mainImage,
            isInStock: item.product.isInStock || false,
          },
        };
      });
      // Set checkout data in store - snapshot of selected items only
      checkoutStore.setCheckoutData({
        selectedItems: checkoutData.selectedItems,
        insuranceEnabled: checkoutData.insuranceEnabled,
        selectedAddressId: "",
        selectedPaymentMethod: "",
        totals: checkoutData.totals,
        selectedCartItems: validatedItems,
        appliedCoupon: null,
      });

      // Navigate to checkout
      navigate.push("/checkout");
    } catch (error: any) {
      console.error("Checkout error:", error);
      setError(
        error?.message || "Failed to proceed to checkout. Please try again.",
      );
    }
  };

  return { handleCheckout };
};