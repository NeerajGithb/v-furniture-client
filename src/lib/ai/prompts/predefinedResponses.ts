// lib/ai/responses/predefinedResponses.ts

export function getQuickResponse(
  action: string,
  activeProduct?: any,
  contextSource?: string,
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
  if (action === "browse_all_products") return "Showing all products";  if (action === "browse_inspiration") {
    const title = activeProduct?.inspirationTitle || activeProduct?.title || "this room";
    return `Here are products for your ${title} 🏠`;
  }
  if (action === "search") return "Search opened";

  // Filter/Sort actions
  if (action === "apply_filter") return "Filter applied ✓";
  if (action === "clear_filters") return "Filters cleared ✓";
  if (action === "sort_products") return "Products sorted";

  // Product selection from list
  // This message is shown AFTER the product is already rendered inline,
  // so it must use past tense "Opened" — the "Opening..." loading state
  // is handled separately via onLoadingMessage in chatActionExecutor.
  if (action === "view_product") {
    return activeProduct?.name
      ? `Opened ${activeProduct.name} ✓`
      : "Product opened ✓";
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

  // Off-topic — not a furniture query
  if (action === "off_topic")
    return "I'm a furniture shopping assistant 🛋️ I can only help with sofas, beds, chairs, tables, and home decor. What furniture are you looking for?";

  return null;
}

export function getBrowsingResponse(
  count: number,
  categoryName: string,
  filters?: { price_max?: number | null; price_min?: number | null; material?: string | null; sort?: string | null },
): string {
  if (count === 0) {
    return "Hmm, nothing matched that search 🔍 Try different keywords or browse our full collection!";
  }

  // Smart pluralization — handles common furniture words correctly
  const raw = categoryName.replace(/-/g, " ").trim();
  function pluralize(word: string): string {
    if (word.endsWith("s")) return word;            // already plural (e.g. "sofas")
    if (word.endsWith("shelf")) return word.replace(/shelf$/, "shelves");
    if (word.endsWith("fe")) return word.replace(/fe$/, "ves");
    if (word.endsWith("f")) return word.replace(/f$/, "ves");
    if (word.endsWith("ch") || word.endsWith("sh") || word.endsWith("x") || word.endsWith("z"))
      return word + "es";
    return word + "s";
  }

  const singular = raw;
  const plural = pluralize(raw);

  // Build filter context
  let filterPhrase = "";
  if (filters?.sort === "price-low") {
    filterPhrase = ", sorted from lowest to highest price 📈";
  } else if (filters?.sort === "price-high") {
    filterPhrase = ", sorted from highest to lowest price 📉";
  } else if (filters?.price_max && filters?.price_min) {
    filterPhrase = ` between ₹${filters.price_min.toLocaleString()} and ₹${filters.price_max.toLocaleString()}`;
  } else if (filters?.price_max) {
    filterPhrase = ` under ₹${filters.price_max.toLocaleString()}`;
  } else if (filters?.price_min) {
    filterPhrase = ` above ₹${filters.price_min.toLocaleString()}`;
  }
  if (filters?.material) {
    filterPhrase += ` in ${filters.material}`;
  }

  // Pick emoji based on count
  const emoji = count >= 20 ? "🎉" : count >= 10 ? "✨" : "🛋️";

  if (count === 1) {
    return `Found 1 ${singular}${filterPhrase} — take a look! ${emoji}`;
  }

  return `Here are ${count} ${plural}${filterPhrase} for you! ${emoji}`;
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
  return "Hmm, nothing matched that search 🔍 Try different keywords or browse our full collection!";
}

export function getCountResponse(count: number, entity: string): string {
  const emoji = count >= 50 ? "🎉" : count >= 20 ? "✨" : "🛋️";

  switch (entity) {
    case "PRODUCT":
    case "PRODUCTS":
      return `We have **${count} furniture products** in our store right now! ${emoji} Want to browse them?`;
    case "CATEGORY":
    case "CATEGORIES":
      return `We have **${count} furniture categories** to explore! ${emoji} Want to browse them?`;
    case "SUBCATEGORY":
    case "SUBCATEGORIES":
      return `There are **${count} subcategories** available! ${emoji}`;
    case "CART":
    case "CART_ITEM":
      return count === 0
        ? "Your cart is empty 🛒 Start adding some furniture!"
        : `You have **${count} item${count === 1 ? "" : "s"}** in your cart 🛒`;
    case "WISHLIST":
    case "WISHLIST_ITEM":
      return count === 0
        ? "Your wishlist is empty ❤️ Save items you love!"
        : `You have **${count} item${count === 1 ? "" : "s"}** in your wishlist ❤️`;
    case "ORDER":
    case "ORDERS":
      return count === 0
        ? "You haven't placed any orders yet 📦"
        : `You have **${count} order${count === 1 ? "" : "s"}** 📦`;
    default:
      return `Found **${count}** results ${emoji}`;
  }
}
