// lib/ai/businessLogic.ts

import { saveConversationState } from "./state/saveConversationState";
import { getConversationState } from "./state/getConversationState";
import { ConversationState } from "./state/conversationState";

// Import all services
import { CartService } from "@/services/cart.service";
import { WishlistService } from "@/services/wishlist.service";
import { OrderService } from "@/services/order.service";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import { SubcategoryService } from "@/services/subcategory.service";

const LOG_PREFIX = "[BusinessLogic]";

interface BusinessLogicParams {
  action: string;
  actionType?: string;
  category: string | null;
  subcategory: string | null;
  filters: any;
  infoEntity?: string | null;
  productId?: string | null;
  productSlug?: string | null;
  userId?: string | null;
}

export async function executeBusinessLogic(
  conversationId: string,
  params: BusinessLogicParams
) {
  console.log(
    `${LOG_PREFIX} Executing: ${params.action}, user ID: ${params.userId}`
  );

  switch (params.action) {
    case "provide_inventory":
      return provideInventory(conversationId, params.userId);

    case "check_availability":
      return checkAvailability(
        conversationId,
        params.category,
        params.subcategory
      );

    case "provide_count":
      return provideCount(
        conversationId,
        params.actionType,
        params.infoEntity,
        params.category,
        params.subcategory,
        params.userId
      );

    case "browse_all_categories":
      return fetchCategories(conversationId);

    case "browse_category":
    case "browse_subcategory":
    case "browse_all_products":
      return fetchProducts(conversationId, params);

    case "view_product":
      return handleViewProduct(conversationId, params);

    case "view_cart":
      return fetchCartItems(conversationId, params.userId);

    case "view_wishlist":
      return fetchWishlistItems(conversationId, params.userId);

    case "view_orders":
      return fetchOrders(conversationId, params.userId);

    default:
      return null;
  }
}

/* ================= HELPER: Check if count is cached ================= */

async function getCachedCount(
  conversationId: string,
  entity: string
): Promise<number | null> {
  const state = await getConversationState(conversationId);

  if (!state?.counts) {
    return null;
  }

  const entityMap: Record<
    string,
    keyof NonNullable<ConversationState["counts"]>
  > = {
    PRODUCT: "products",
    PRODUCTS: "products",
    CATEGORY: "categories",
    CATEGORIES: "categories",
    SUBCATEGORY: "subcategories",
    SUBCATEGORIES: "subcategories",
    CART: "cart",
    CART_ITEM: "cart",
    CART_ITEMS: "cart",
    WISHLIST: "wishlist",
    WISHLIST_ITEM: "wishlist",
    WISHLIST_ITEMS: "wishlist",
    ORDER: "orders",
    ORDERS: "orders",
  };

  const key = entityMap[entity];
  if (!key) {
    return null;
  }

  const cachedValue = state.counts[key];
  if (typeof cachedValue === "number") {
    // If cached value is 0, we should verify with a fresh API call
    // because 0 could mean "empty" or "not yet fetched"
    if (cachedValue === 0) {
      console.log(
        `${LOG_PREFIX} [Cache] Cached ${entity} count is 0 - verifying with fresh API call`
      );
      return null;
    }

    console.log(
      `${LOG_PREFIX} [Cache] Using cached ${entity} count: ${cachedValue}`
    );
    return cachedValue;
  }

  return null;
}

/* ================= INVENTORY ================= */

async function provideInventory(
  conversationId: string,
  userId?: string | null
) {
  try {
    const state = await getConversationState(conversationId);

    // Check if we have recent cached data (within last 5 minutes)
    const now = Date.now();
    const cacheValid = state?.updatedAt && now - state.updatedAt < 300000;

    if (cacheValid && state?.counts) {
      const hasAllCounts =
        state.counts.products !== undefined &&
        state.counts.categories !== undefined &&
        state.counts.subcategories !== undefined;

      if (hasAllCounts) {
        console.log(`${LOG_PREFIX} [Inventory] Using cached inventory data`);

        return {
          stats: {
            totalProducts: state.counts.products || 0,
            totalCategories: state.counts.categories || 0,
            totalSubcategories: state.counts.subcategories || 0,
            totalCart: state.counts.cart || 0,
            totalWishlist: state.counts.wishlist || 0,
            totalOrders: state.counts.orders || 0,
          },
          categories: state.lastCategories || [],
          subcategories: state.lastSubcategories || [],
        };
      }
    }

    console.log(`${LOG_PREFIX} [Inventory] Fetching fresh inventory data`);

    // Fetch core data
    const [productCount, categories, subcategories] = await Promise.all([
      ProductService.getProductsCount(),
      CategoryService.getCategories(),
      SubcategoryService.getSubcategories(),
    ]);

    let cartCount = 0;
    let wishlistCount = 0;
    let ordersCount = 0;

    // Fetch user-specific data if authenticated
    if (userId) {
      [cartCount, wishlistCount, ordersCount] = await Promise.all([
        CartService.getCartCount(userId),
        WishlistService.getWishlistCount(userId),
        OrderService.getOrdersCount(userId),
      ]);
    }

    console.log(
      `${LOG_PREFIX} [Inventory] Products: ${productCount}, Categories: ${categories.length}, Subcategories: ${subcategories.length}` +
        (userId
          ? `, Cart: ${cartCount}, Wishlist: ${wishlistCount}, Orders: ${ordersCount}`
          : "")
    );

    // Save to state
    await saveConversationState(conversationId, {
      lastCategories: categories.map((c: any) => ({
        _id: c._id,
        slug: c.slug,
        name: c.name,
      })),
      lastSubcategories: subcategories.map((s: any) => ({
        _id: s._id,
        slug: s.slug,
        name: s.name,
      })),
      lastAction: "INVENTORY_OVERVIEW",
      counts: {
        products: productCount,
        categories: categories.length,
        subcategories: subcategories.length,
        cart: cartCount,
        wishlist: wishlistCount,
        orders: ordersCount,
      },
    });

    return {
      stats: {
        totalProducts: productCount,
        totalCategories: categories.length,
        totalSubcategories: subcategories.length,
        totalCart: cartCount,
        totalWishlist: wishlistCount,
        totalOrders: ordersCount,
      },
      categories: categories.slice(0, 10),
      subcategories: subcategories.slice(0, 10),
    };
  } catch (error: any) {
    console.error(`${LOG_PREFIX} [Inventory] Error:`, error.message);
    return {
      stats: {
        totalProducts: 0,
        totalCategories: 0,
        totalSubcategories: 0,
        totalCart: 0,
        totalWishlist: 0,
        totalOrders: 0,
      },
    };
  }
}

/* ================= AVAILABILITY ================= */

async function checkAvailability(
  conversationId: string,
  category: string | null,
  subcategory: string | null
) {
  if (!category) {
    console.log(`${LOG_PREFIX} [Availability] No category provided`);
    return {
      entityType: "PRODUCT",
      count: 0,
      category: null,
      subcategory: null,
    };
  }

  console.log(
    `${LOG_PREFIX} [Availability] Checking: ${category}${
      subcategory ? `/${subcategory}` : ""
    }`
  );

  const products = await ProductService.searchProducts(
    category,
    subcategory,
    {}
  );

  console.log(`${LOG_PREFIX} [Availability] Found ${products.length} products`);

  await saveConversationState(conversationId, {
    lastProducts: products.map((p: any) => ({
      _id: p._id,
      slug: p.slug,
      price: p.price,
      finalPrice: p.finalPrice,
      originalPrice: p.originalPrice,
      title: p.title,
      name: p.name,
      sku: p.sku,
      itemId: p.itemId,
    })),
    activeCategory: category || null,
    activeSubcategory: subcategory || null,
    lastAction: "CHECK_AVAILABILITY",
  });

  console.log(
    `${LOG_PREFIX} [Availability] ✅ Saved ${products.length} products to state`
  );

  return {
    entityType: subcategory ? "SUBCATEGORY" : "CATEGORY",
    count: products.length,
    category,
    subcategory,
    products,
  };
}

/* ================= COUNT ================= */

async function provideCount(
  conversationId: string,
  actionType?: string | null,
  infoEntity?: string | null,
  category?: string | null,
  subcategory?: string | null,
  userId?: string | null
) {
  const entity = infoEntity || actionType;

  console.log(
    `${LOG_PREFIX} [Count] Entity: ${entity}, Category: ${category}, UserId: ${userId}`
  );

  // Check cache first
  const cachedCount = await getCachedCount(conversationId, entity || "UNKNOWN");
  if (cachedCount !== null) {
    return {
      entityType: entity,
      count: cachedCount,
      category,
    };
  }

  // CART COUNT
  if (entity === "CART" || entity === "CART_ITEM" || entity === "CART_ITEMS") {
    if (!userId) {
      console.log(`${LOG_PREFIX} [Count] Cart count requires authentication`);
      return {
        entityType: "CART",
        count: 0,
        requiresAuth: true,
      };
    }

    const count = await CartService.getCartCount(userId);
    console.log(`${LOG_PREFIX} [Count] Cart items: ${count}`);

    await saveConversationState(conversationId, {
      counts: { cart: count },
    });

    return {
      entityType: "CART",
      count,
    };
  }

  // WISHLIST COUNT
  if (
    entity === "WISHLIST" ||
    entity === "WISHLIST_ITEM" ||
    entity === "WISHLIST_ITEMS"
  ) {
    if (!userId) {
      console.log(
        `${LOG_PREFIX} [Count] Wishlist count requires authentication`
      );
      return {
        entityType: "WISHLIST",
        count: 0,
        requiresAuth: true,
      };
    }

    const count = await WishlistService.getWishlistCount(userId);
    console.log(`${LOG_PREFIX} [Count] Wishlist items: ${count}`);

    await saveConversationState(conversationId, {
      counts: { wishlist: count },
    });

    return {
      entityType: "WISHLIST",
      count,
    };
  }

  // ORDERS COUNT
  if (entity === "ORDER" || entity === "ORDERS") {
    if (!userId) {
      console.log(`${LOG_PREFIX} [Count] Orders count requires authentication`);
      return {
        entityType: "ORDER",
        count: 0,
        requiresAuth: true,
      };
    }

    const count = await OrderService.getOrdersCount(userId);
    console.log(`${LOG_PREFIX} [Count] Orders: ${count}`);

    await saveConversationState(conversationId, {
      counts: { orders: count },
    });

    return {
      entityType: "ORDER",
      count,
    };
  }

  // PRODUCT COUNT
  if (entity === "PRODUCT" || entity === "PRODUCTS") {
    const count = await ProductService.getProductsCount();
    console.log(`${LOG_PREFIX} [Count] Products: ${count}`);

    await saveConversationState(conversationId, {
      counts: { products: count },
    });

    return {
      entityType: "PRODUCT",
      count,
      category,
    };
  }

  // CATEGORY COUNT
  if (entity === "CATEGORY" || entity === "CATEGORIES") {
    const categories = await CategoryService.getCategories();
    console.log(`${LOG_PREFIX} [Count] Categories: ${categories.length}`);

    await saveConversationState(conversationId, {
      counts: { categories: categories.length },
    });

    return {
      entityType: "CATEGORY",
      count: categories.length,
      categories,
    };
  }

  // SUBCATEGORY COUNT
  if (entity === "SUBCATEGORY" || entity === "SUBCATEGORIES") {
    const subcategories = await SubcategoryService.getSubcategories(category);
    console.log(`${LOG_PREFIX} [Count] Subcategories: ${subcategories.length}`);

    await saveConversationState(conversationId, {
      counts: { subcategories: subcategories.length },
    });

    return {
      entityType: "SUBCATEGORY",
      count: subcategories.length,
      subcategories,
      category,
    };
  }

  return {
    entityType: "UNKNOWN",
    count: 0,
  };
}

/* ================= CATEGORIES ================= */

async function fetchCategories(conversationId: string) {
  const categories = await CategoryService.getCategories();

  console.log(
    `${LOG_PREFIX} [Categories] Fetched ${categories.length} categories`
  );

  await saveConversationState(conversationId, {
    lastCategories: categories.map((c: any) => ({
      _id: c._id,
      slug: c.slug,
      name: c.name,
    })),
    activeCategory: null,
    activeSubcategory: null,
    lastAction: "BROWSING_CATEGORIES",
    counts: { categories: categories.length },
  });

  return {
    categories,
    count: categories.length,
  };
}

/* ================= PRODUCTS ================= */

async function fetchProducts(
  conversationId: string,
  params: BusinessLogicParams
) {
  console.log(
    `${LOG_PREFIX} [Products] Fetching: ${params.category || "all"}${
      params.subcategory ? `/${params.subcategory}` : ""
    }`
  );

  const products = await ProductService.searchProducts(
    params.category,
    params.subcategory,
    params.filters || {}
  );

  console.log(`${LOG_PREFIX} [Products] Found ${products.length} products`);

  await saveConversationState(conversationId, {
    lastProducts: products.map((p: any) => ({
      _id: p._id,
      slug: p.slug,
      price: p.price,
      finalPrice: p.finalPrice,
      originalPrice: p.originalPrice,
      title: p.title,
      name: p.name,
      sku: p.sku,
      itemId: p.itemId,
      material: p.material,
      size: p.size,
    })),
    activeCategory: params.category || null,
    activeSubcategory: params.subcategory || null,
    lastAction: "BROWSING_PRODUCTS",
  });

  console.log(
    `${LOG_PREFIX} [Products] ✅ Saved ${products.length} products to state`
  );

  return {
    products: products.slice(0, 100),
    count: products.length,
    category: params.category,
    subcategory: params.subcategory,
  };
}

/* ================= VIEW PRODUCT ================= */

async function handleViewProduct(
  conversationId: string,
  params: BusinessLogicParams
) {
  const productId = params.productId || params.filters?.productId;

  if (!productId) {
    console.log(`${LOG_PREFIX} [View Product] No productId provided`);
    return null;
  }

  console.log(`${LOG_PREFIX} [View Product] Fetching product details`);

  const product = await ProductService.getProductById(productId);

  if (!product) {
    return null;
  }

  await saveConversationState(conversationId, {
    currentProduct: {
      _id: product._id,
      name: product.name,
      slug: product.slug,
      finalPrice: product.finalPrice,
      originalPrice: product.originalPrice,
      discountPercent: product.discountPercent,
      emiPrice: product.emiPrice,
      inStockQuantity: product.inStockQuantity,
      isActive: product.isActive,
      brand: product.brand,
      categoryId: product.categoryId,
      subCategoryId: product.subCategoryId,
      material: product.material,
      size: product.size,
      colorOptions: product.colorOptions,
      dimensions: product.dimensions,
      weight: product.weight,
      description: product.description,
      bulletPoints: product.bulletPoints,
      highlights: product.highlights,
      warranty: product.warranty,
      returnPolicy: product.returnPolicy,
      ratings: product.ratings,
      reviews: product.reviews
        ? { average: product.reviews.average, count: product.reviews.count }
        : undefined,
      badge: product.badge,
      isBestSeller: product.isBestSeller,
      isNewArrival: product.isNewArrival,
    },
  });

  console.log(`${LOG_PREFIX} [View Product] ✅ Saved current product to state`);

  return {
    count: 0,
    products: [product],
  };
}

/* ================= CART ITEMS ================= */

async function fetchCartItems(conversationId: string, userId?: string | null) {
  if (!userId) {
    console.log(`${LOG_PREFIX} [Cart] No userId - requires authentication`);
    return {
      entityType: "CART",
      count: 0,
      items: [],
      requiresAuth: true,
    };
  }

  console.log(`${LOG_PREFIX} [Cart] Fetching cart for user: ${userId}`);

  const items = await CartService.getCartItems(userId);

  console.log(`${LOG_PREFIX} [Cart] Found ${items.length} items`);

  await saveConversationState(conversationId, {
    lastAction: "VIEW_CART",
    counts: { cart: items.length },
  });

  return {
    entityType: "CART",
    count: items.length,
    items,
  };
}

/* ================= WISHLIST ITEMS ================= */

async function fetchWishlistItems(
  conversationId: string,
  userId?: string | null
) {
  if (!userId) {
    console.log(`${LOG_PREFIX} [Wishlist] No userId - requires authentication`);
    return {
      entityType: "WISHLIST",
      count: 0,
      items: [],
      requiresAuth: true,
    };
  }

  console.log(`${LOG_PREFIX} [Wishlist] Fetching wishlist for user: ${userId}`);

  const items = await WishlistService.getWishlistItems(userId);

  console.log(`${LOG_PREFIX} [Wishlist] Found ${items.length} items`);

  await saveConversationState(conversationId, {
    lastAction: "VIEW_WISHLIST",
    counts: { wishlist: items.length },
  });

  return {
    entityType: "WISHLIST",
    count: items.length,
    items,
  };
}

/* ================= ORDERS ================= */

async function fetchOrders(conversationId: string, userId?: string | null) {
  if (!userId) {
    console.log(`${LOG_PREFIX} [Orders] No userId - requires authentication`);
    return {
      entityType: "ORDER",
      count: 0,
      orders: [],
      requiresAuth: true,
    };
  }

  console.log(`${LOG_PREFIX} [Orders] Fetching orders for user: ${userId}`);

  const { orders, totalOrders } = await OrderService.getOrders(userId, 100);

  console.log(`${LOG_PREFIX} [Orders] Found ${totalOrders} orders`);

  await saveConversationState(conversationId, {
    lastAction: "VIEW_ORDERS",
    counts: { orders: totalOrders },
  });

  return {
    entityType: "ORDER",
    count: totalOrders,
    orders,
  };
}