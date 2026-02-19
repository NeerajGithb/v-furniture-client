import { saveConversationState } from "./state/saveConversationState";
import { getConversationState } from "./state/getConversationState";
import { ConversationState } from "./state/conversationState";

import { cartService } from "@/lib/domain/cart/CartService";
import { wishlistService } from "@/lib/domain/wishlist/WishlistService";
import { orderService } from "@/lib/domain/orders/OrderService";
import { productsService } from "@/lib/domain/products/ProductsService";
import { categoriesService } from "@/lib/domain/categories/CategoriesService";

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
  params: BusinessLogicParams,
) {
  switch (params.action) {
    case "provide_inventory":
      return provideInventory(conversationId, params.userId);

    case "check_availability":
      return checkAvailability(
        conversationId,
        params.category,
        params.subcategory,
      );

    case "provide_count":
      return provideCount(
        conversationId,
        params.actionType,
        params.infoEntity,
        params.category,
        params.subcategory,
        params.userId,
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

// Check if count is cached in conversation state
async function getCachedCount(
  conversationId: string,
  entity: string,
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
    if (cachedValue === 0) {
      return null;
    }

    return cachedValue;
  }

  return null;
}

async function provideInventory(
  conversationId: string,
  userId?: string | null,
) {
  try {
    const state = await getConversationState(conversationId);

    const now = Date.now();
    const cacheValid = state?.updatedAt && now - state.updatedAt < 300000;

    if (cacheValid && state?.counts) {
      const hasAllCounts =
        state.counts.products !== undefined &&
        state.counts.categories !== undefined &&
        state.counts.subcategories !== undefined;

      if (hasAllCounts) {
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

    const [productCountResult, categories, subcategories] = await Promise.all([
      productsService.getProducts({
        count: true,
        page: 1,
        limit: 1,
        sort: "newest",
        productsPerCategory: 1,
      }),
      categoriesService.getAllCategories(),
      categoriesService.getAllSubcategories(),
    ]);

    const productCount = productCountResult.count;

    let cartCount = 0;
    let wishlistCount = 0;
    let ordersCount = 0;

    if (userId) {
      const [cartCountResult, wishlistCountResult, ordersResult] =
        await Promise.all([
          cartService.getCartCount(userId),
          wishlistService.getWishlistCount(userId),
          orderService.getOrders(userId, 1, 1),
        ]);

      cartCount = cartCountResult;
      wishlistCount = wishlistCountResult;
      ordersCount = ordersResult.pagination?.totalItems || 0;
    }

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

async function checkAvailability(
  conversationId: string,
  category: string | null,
  subcategory: string | null,
) {
  if (!category) {
    return {
      entityType: "PRODUCT",
      count: 0,
      category: null,
      subcategory: null,
    };
  }

  const productsResult = await productsService.getProducts({
    category: category || undefined,
    subcategory: subcategory || undefined,
    page: 1,
    limit: 20,
    sort: "newest",
    productsPerCategory: 10,
  });

  const products = productsResult.products || [];

  await saveConversationState(conversationId, {
    lastProducts: products.map((p: any) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      finalPrice: p.finalPrice,
      originalPrice: p.originalPrice,
      discountPercent: p.discountPercent,
      mainImage: p.mainImage,
      reviews: p.reviews,
      inStockQuantity: p.inStockQuantity,
      material: p.material,
      dimensions: p.dimensions,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
    })),
    activeCategory: category || null,
    activeSubcategory: subcategory || null,
    lastAction: "CHECK_AVAILABILITY",
  });

  return {
    entityType: subcategory ? "SUBCATEGORY" : "CATEGORY",
    count: products.length,
    category,
    subcategory,
    products,
  };
}

async function provideCount(
  conversationId: string,
  actionType?: string | null,
  infoEntity?: string | null,
  category?: string | null,
  subcategory?: string | null,
  userId?: string | null,
) {
  const entity = infoEntity || actionType;

  const cachedCount = await getCachedCount(conversationId, entity || "UNKNOWN");
  if (cachedCount !== null) {
    return {
      entityType: entity,
      count: cachedCount,
      category,
    };
  }

  if (entity === "CART" || entity === "CART_ITEM" || entity === "CART_ITEMS") {
    if (!userId) {
      return {
        entityType: "CART",
        count: 0,
        requiresAuth: true,
      };
    }

    const count = await cartService.getCartCount(userId);

    await saveConversationState(conversationId, {
      counts: { cart: count },
    });

    return {
      entityType: "CART",
      count,
    };
  }

  if (
    entity === "WISHLIST" ||
    entity === "WISHLIST_ITEM" ||
    entity === "WISHLIST_ITEMS"
  ) {
    if (!userId) {
      return {
        entityType: "WISHLIST",
        count: 0,
        requiresAuth: true,
      };
    }

    const count = await wishlistService.getWishlistCount(userId);

    await saveConversationState(conversationId, {
      counts: { wishlist: count },
    });

    return {
      entityType: "WISHLIST",
      count,
    };
  }

  if (entity === "ORDER" || entity === "ORDERS") {
    if (!userId) {
      return {
        entityType: "ORDER",
        count: 0,
        requiresAuth: true,
      };
    }

    const ordersResult = await orderService.getOrders(userId, 1, 1);
    const count = ordersResult.pagination?.totalItems || 0;

    await saveConversationState(conversationId, {
      counts: { orders: count },
    });

    return {
      entityType: "ORDER",
      count,
    };
  }

  if (entity === "PRODUCT" || entity === "PRODUCTS") {
    const result = await productsService.getProducts({
      count: true,
      page: 1,
      limit: 1,
      sort: "newest",
      productsPerCategory: 1,
    });
    const count = result.count;

    await saveConversationState(conversationId, {
      counts: { products: count },
    });

    return {
      entityType: "PRODUCT",
      count,
      category,
    };
  }

  if (entity === "CATEGORY" || entity === "CATEGORIES") {
    const categories = await categoriesService.getAllCategories();

    await saveConversationState(conversationId, {
      counts: { categories: categories.length },
    });

    return {
      entityType: "CATEGORY",
      count: categories.length,
      categories,
    };
  }

  if (entity === "SUBCATEGORY" || entity === "SUBCATEGORIES") {
    const subcategories = await categoriesService.getAllSubcategories();

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

async function fetchCategories(conversationId: string) {
  const categories = await categoriesService.getAllCategories();

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

async function fetchProducts(
  conversationId: string,
  params: BusinessLogicParams,
) {
  const productsResult = await productsService.getProducts({
    category: params.category || undefined,
    subcategory: params.subcategory || undefined,
    page: 1,
    limit: 20,
    sort: "newest",
    productsPerCategory: 10,
    ...params.filters,
  });

  const products = productsResult.products || [];

  await saveConversationState(conversationId, {
    lastProducts: products.map((p: any) => ({
      _id: p._id,
      name: p.name,
      slug: p.slug,
      finalPrice: p.finalPrice,
      originalPrice: p.originalPrice,
      discountPercent: p.discountPercent,
      mainImage: p.mainImage,
      reviews: p.reviews,
      inStockQuantity: p.inStockQuantity,
      material: p.material,
      dimensions: p.dimensions,
      isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller,
    })),
    activeCategory: params.category || null,
    activeSubcategory: params.subcategory || null,
    lastAction: "BROWSING_PRODUCTS",
  });

  return {
    products: products.slice(0, 100),
    count: products.length,
    category: params.category,
    subcategory: params.subcategory,
  };
}

async function handleViewProduct(
  conversationId: string,
  params: BusinessLogicParams,
) {
  const productId = params.productId || params.filters?.productId;

  if (!productId) {
    return null;
  }

  const product = await productsService.getProductById(productId);

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
      mainImage: product.mainImage,
      reviews: product.reviews
        ? { average: product.reviews.average, count: product.reviews.count }
        : undefined,
      inStockQuantity: product.inStockQuantity,
      material: product.material,
      dimensions: product.dimensions,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
    },
  });

  return {
    count: 0,
    products: [product],
  };
}

async function fetchCartItems(conversationId: string, userId?: string | null) {
  if (!userId) {
    return {
      entityType: "CART",
      count: 0,
      items: [],
      requiresAuth: true,
    };
  }

  const items = await cartService.getCartItems(userId);

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

async function fetchWishlistItems(
  conversationId: string,
  userId?: string | null,
) {
  if (!userId) {
    return {
      entityType: "WISHLIST",
      count: 0,
      items: [],
      requiresAuth: true,
    };
  }

  const items = await wishlistService.getWishlistItems(userId);

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

async function fetchOrders(conversationId: string, userId?: string | null) {
  if (!userId) {
    return {
      entityType: "ORDER",
      count: 0,
      orders: [],
      requiresAuth: true,
    };
  }

  const ordersResult = await orderService.getOrders(userId, 1, 100);
  const orders = ordersResult.orders || [];
  const totalOrders = ordersResult.pagination?.totalItems || 0;

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
