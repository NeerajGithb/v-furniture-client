// lib/ai/responses/predefinedResponses.ts

export function getQuickResponse(
  action: string,
  activeProduct?: any,
  contextSource?: string
): string | null {
  // Navigation actions
  if (action === "navigate_home") return "Taking you home 🏠";
  if (action === "navigate_back") return "Going back ↩️";

  // Cart actions
  if (action === "add_to_cart") return "Added to cart ✓";
  if (action === "remove_from_cart") return "Removed from cart ✓";
  if (action === "clear_cart") return "Your cart is now empty ✨";
  if (action === "view_cart") return "Here's your cart 🛒";
  if (action === "checkout") return "Proceeding to checkout ✓";

  // Wishlist actions
  if (action === "add_to_wishlist") return "Added to wishlist ❤️";
  if (action === "remove_from_wishlist") return "Removed from wishlist ✓";
  if (action === "view_wishlist") return "Here's your wishlist ❤️";

  // View actions
  if (action === "browse_all_categories") return "Showing categories";
  if (action === "browse_all_products") return "Showing all products";
  if (action === "search") return "Search opened";

  // Filter/Sort actions
  if (action === "apply_filter") return "Filter applied ✓";
  if (action === "clear_filters") return "Filters cleared ✓";
  if (action === "sort_products") return "Products sorted";

  // Product selection from list
  if (action === "view_product" && contextSource === "PRODUCT_SELECTED") {
    return activeProduct?.name
      ? `Opening ${activeProduct.name} 🛋️`
      : "Opening product 🛋️";
  }

  // Product details view
  if (action === "view_product_details" && activeProduct) {
    return activeProduct.name
      ? `Here are the complete details for ${activeProduct.name} 🛋️`
      : "Here are the product details 🛋️";
  }

  // Order actions
  if (action === "place_order") return "Order placed successfully! 📦";
  if (action === "view_orders") return "Here are your orders 📦";
  if (action === "track_order") return "Tracking your order 📦";
  if (action === "cancel_order") return "Order cancelled ✓";

  // Profile actions
  if (action === "view_profile") return "Opening your profile 👤";
  if (action === "login") return "Please login to continue 🔐";
  if (action === "logout") return "Logged out successfully ✓";
  if (action === "signup") return "Let's create your account 🔐";

  // Help & Info actions
  if (action === "help")
    return "I can help you browse products, manage your cart, track orders, and answer questions about our furniture! 🛋️";
  if (action === "greeting")
    return "Hello! How can I help you find furniture today? 👋";
  if (action === "respond_social") return "How can I assist you today? 😊";

  // Clarification
  if (action === "clarify")
    return "Could you please clarify what you're looking for? 🤔";
  if (action === "ask_product_selection")
    return "Which product would you like to know more about?";

  // Confirmation
  if (action === "confirmation_yes") return "Great! ✓";
  if (action === "confirmation_no") return "No problem!";
  if (action === "cancel_confirmation") return "Action cancelled ✓";

  // No-op actions
  if (action === "noop") return "Got it!";

  return null;
}

export function getBrowsingResponse(
  count: number,
  categoryName: string
): string {
  if (count === 0) {
    return "No matches found. Try different keywords or browse our categories! 🔍";
  }
  if (count === 1) {
    return `Found 1 ${categoryName}`;
  }
  return `Found ${count} ${categoryName}`;
}

export function getGreetingResponse(): string {
  return "Hello! How can I help you find furniture today? 👋";
}

export function getHelpResponse(): string {
  return "I can help you browse products, manage your cart, track orders, and answer questions about our furniture! What would you like to do? 🛋️";
}

export function getClarificationResponse(): string {
  return "Could you please clarify what you're looking for? 🤔";
}

export function getNoResultsResponse(): string {
  return "No matches found. Try different keywords or browse our categories! 🔍";
}