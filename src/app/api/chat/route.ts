// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { understandMessage } from "@/lib/ai/understandMessage";
import { respondMessage } from "@/lib/ai/respondMessage";
import { normalizeMessage } from "@/lib/ai/normalizeMessage";
import { executeBusinessLogic } from "@/lib/ai/businessLogic";
import { makeDecision } from "@/lib/ai/decisionLayer";
import { randomUUID } from "crypto";
import { resolveSelectionFromState } from "@/lib/ai/utils/resolveSelectionFromState";
import { saveConversationState } from "@/lib/ai/state/saveConversationState";
import { getConversationState } from "@/lib/ai/state/getConversationState";
import { getNavigationMeaning } from "@/lib/ai/navigation/actionMeaning";
import { authenticateUser } from "@/lib/middleware/auth";

const LOG_PREFIX = "[API:Chat]";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    console.log(`\n${LOG_PREFIX} ========== NEW REQUEST ==========`);

    const {
      message,
      history = [],
      conversationId: incomingConversationId,
    } = body;
    const conversationId =
      typeof incomingConversationId === "string" &&
      incomingConversationId.length > 0
        ? incomingConversationId
        : randomUUID();

    console.log(`${LOG_PREFIX} ConversationId: ${conversationId}`);
    console.log(`${LOG_PREFIX} Message: "${message}"`);

    if (!message || typeof message !== "string" || !message.trim()) {
      console.warn(`${LOG_PREFIX} ❌ Invalid message`);
      return NextResponse.json(
        { error: "Valid message is required" },
        { status: 400 }
      );
    }

    const state = await getConversationState(conversationId);
    const trimmedMessage = message.trim();

    /* ================= STEP 1: NORMALIZE ================= */
    const result = await normalizeMessage(trimmedMessage);

    const normalizedMessage: string = result.normalized;
    const detectedLanguage: string = result.language;
    console.log(`${LOG_PREFIX} Detected Language: ${detectedLanguage}`);
    console.log(`${LOG_PREFIX} Normalized: "${normalizedMessage}"`);

    /* ================= STEP 2: UNDERSTAND ================= */
    const understanding = await understandMessage(
      normalizedMessage,
      history,
      state?.currentProduct
    );

    console.log(`${LOG_PREFIX} ========== UNDERSTANDING ==========`);
    console.log(
      JSON.stringify(
        {
          coarse_intent: understanding.coarse_intent,
          whatUserWants: understanding.whatUserWants,
          fine_intent: understanding.fine_intent,
          confidence: understanding.confidence,
          action_type: understanding.action_type,
          entities: understanding.entities,
          constraints: understanding.constraints,
          info_type: understanding.info_type,
          info_entity: understanding.info_entity,
          confirmation: understanding.confirmation,
          question_type: understanding.question_type,
        },
        null,
        2
      )
    );

    /* ================= STEP 3: DECISION ================= */
    let decision = await makeDecision(
      state,
      understanding,
      state?.currentProduct,
      conversationId
    );

    console.log(`${LOG_PREFIX} ========== DECISION ==========`);
    console.log(
      JSON.stringify(
        {
          action: decision.action,
          actionType: decision.actionType,
          shouldFetchProducts: decision.shouldFetchProducts,
          shouldNavigate: decision.shouldNavigate,
          shouldFetchStats: decision.shouldFetchStats,
          category: decision.category,
          subcategory: decision.subcategory,
          productSlug: decision.productSlug,
          productId: decision.productId,
          filters: decision.filters,
          pendingBrowse: decision.pendingBrowse,
        },
        null,
        2
      )
    );

    /* ================= AUTH CHECK (LAZY) ================= */

    let authUser: any = null;
    let isAuthenticated = false;

    if (requiresAuthentication(decision.action, decision)) {
      const authResult = await authenticateUser(req);
      authUser = authResult.user;
      isAuthenticated = !!authUser;

      if (!isAuthenticated) {
        console.log(`${LOG_PREFIX} 🔐 Auth required for: ${decision.action}`);

        const authResponse = getAuthMessageForAction(
          decision.action,
          detectedLanguage
        );

        const responsePayload: any = {
          conversationId,
          normalizedMessage,
          understanding,
          decision,
          response: authResponse,
          timestamp: Date.now(),
          requiresAuth: true,
          authAction: decision.action,
          shouldNavigate: false,
          shouldRenderProducts: false,
          navigateTo: null,
        };

        const duration = Date.now() - startTime;
        console.log(
          `${LOG_PREFIX} ✓ Completed (Auth Required) in ${duration}ms`
        );
        console.log(`${LOG_PREFIX} ========== END REQUEST ==========\n`);

        return NextResponse.json(responsePayload);
      }
    }

    if (decision.action === "view_product") {
      decision = await resolveSelectionFromState(
        conversationId,
        normalizedMessage,
        decision,
        understanding
      );

      console.log(`${LOG_PREFIX} ========== RESOLVED DECISION ==========`);
      console.log(
        JSON.stringify(
          {
            productId: decision.productId,
            productSlug: decision.productSlug,
            index: decision.index,
          },
          null,
          3
        )
      );
    }

    await saveConversationState(conversationId, {
      lastUnderstanding: understanding,
      lastDecision: decision,
      isAuthenticated,
    });

    /* ================= STEP 4: BUSINESS LOGIC ================= */
    let businessData: any = null;

    if (shouldExecuteBusinessLogic(decision)) {
      console.log(`${LOG_PREFIX} Executing: ${decision.action}`);

      businessData = await executeBusinessLogic(conversationId, {
        action: decision.action,
        actionType: decision.actionType,
        category: decision.category || null,
        subcategory: decision.subcategory || null,
        filters: decision.filters,
        infoEntity: understanding.info_entity,
        productId: decision.productId,
        productSlug: decision.productSlug,
        userId: authUser?.userId,
      });

      if (businessData) {
        console.log(`${LOG_PREFIX} BusinessData: {`);
        console.log(`  entityType: ${businessData.entityType || "N/A"}`);
        console.log(`  count: ${businessData.count || 0}`);
        console.log(`  products: ${businessData.products?.length || 0} items`);
        console.log(
          `  categories: ${businessData.categories?.length || 0} items`
        );
        console.log(
          `  subcategories: ${businessData.subcategories?.length || 0} items`
        );
        console.log(`}`);
      }
    }
    const activeProduct =
      decision.action === "view_product" && businessData?.product
        ? businessData.product
        : state?.currentProduct;
    /* ================= STEP 5: AI RESPONSE ================= */
    const { finalResponse, structuredData } = await respondMessage(
      normalizedMessage, // user input
      understanding, // intent
      businessData, // fetched data
      history, // conversation memory
      activeProduct, // current product context
      decision.action // what to do
    );

    const response: string = finalResponse;
    console.log(`${LOG_PREFIX} AI Response: "${finalResponse}" `);
    console.log(`${LOG_PREFIX} Has Structured Data: ${!!structuredData}`);
    console.log(
      `${LOG_PREFIX} ================= RESPONSE END =================`
    );

    /* ================= AUTO AWAIT CONFIRMATION ================= */
    if (
      understanding.question_type?.expects_yes_no &&
      decision.action &&
      !decision.shouldNavigate
    ) {
      await saveConversationState(conversationId, {
        awaitingConfirmation: {
          sourceAction: decision.action,
          payload: {
            category: decision.category,
            subcategory: decision.subcategory,
            productId: decision.productId,
            productSlug: decision.productSlug,
          },
        },
      });

      console.log(
        `${LOG_PREFIX} 🕒 Auto-armed confirmation for:`,
        decision.action
      );
    }

    /* ================= STEP 6: RESPONSE PAYLOAD ================= */
    const isBrowsing = understanding.coarse_intent === "BROWSING";
    const responsePayload: any = {
      conversationId,
      normalizedMessage,
      understanding,
      decision,
      response,
      timestamp: Date.now(),
      shouldNavigate: decision.shouldNavigate,
      shouldRenderProducts: isBrowsing || decision.shouldFetchProducts,
      navigateTo: null,
      category: decision.category,
      subcategory: decision.subcategory,
      productSlug: decision.productSlug,
      productId: decision.productId,
      structuredData: structuredData || null,
      isAuthenticated: isAuthenticated,
    };

    /* ================= STEP 7: NAVIGATION ================= */
    if (decision.shouldNavigate) {
      responsePayload.navigateTo = buildNavigationUrl(decision);
      console.log(`${LOG_PREFIX} Navigate: ${responsePayload.navigateTo}`);
    }
    /* ================= STEP 7.1: NAVIGATION MEANING ================= */
    const navigationMeaning = getNavigationMeaning(decision, state || {});

    if (navigationMeaning) {
      responsePayload.navigation = {
        type: navigationMeaning.type,
        message: navigationMeaning.message,
      };
    }

    /* ================= STEP 8: ENRICH PAYLOAD ================= */
    enrichPayloadWithBusinessData(responsePayload, businessData, decision);

    const duration = Date.now() - startTime;
    console.log(`${LOG_PREFIX} ✓ Completed in ${duration}ms`);
    console.log(`${LOG_PREFIX} ========== END REQUEST ==========\n`);

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`${LOG_PREFIX} ✗ ERROR: ${error.message} (${duration}ms)`);
    console.error(error.stack);

    return NextResponse.json(
      {
        error: "Failed to process your request. Please try again.",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

/* ================= HELPER FUNCTIONS ================= */

function requiresAuthentication(action: string, decision?: any): boolean {
  const authRequiredActions = [
    "add_to_cart",
    "remove_from_cart",
    "clear_cart",
    "view_cart",
    "add_to_wishlist",
    "remove_from_wishlist",
    "clear_wishlist",
    "view_wishlist",
    "checkout",
    "place_order",
    "view_orders",
    "clear_orders",
    "track_order",
    "cancel_order",
    "view_profile",
  ];

  // 🔑 FIX: cart / wishlist / order COUNT needs auth
  if (
    action === "provide_count" &&
    decision?.actionType &&
    [
      "CART",
      "CART_ITEM",
      "WISHLIST",
      "WISHLIST_ITEM",
      "ORDER",
      "ORDER_ITEM",
      "USER",
    ].includes(decision.actionType)
  ) {
    return true;
  }

  return authRequiredActions.includes(action);
}

function getAuthMessageForAction(
  action: string,
  detectedLanguage: string
): string {
  const lang = detectedLanguage.toLowerCase();

  const messages: Record<string, Record<string, string>> = {
    add_to_cart: {
      english: "Please login to add items to cart 🔐",
      hindi: "कार्ट में जोड़ने के लिए लॉगिन करें 🔐",
      hinglish: "Cart mein add karne ke liye login karo 🔐",
    },
    add_to_wishlist: {
      english: "Please login to add to wishlist ❤️",
      hindi: "विशलिस्ट में जोड़ने के लिए लॉगिन करें ❤️",
      hinglish: "Wishlist mein add karne ke liye login karo ❤️",
    },
    clear_cart: {
      english: "Please login to clear your cart 🛒",
      hindi: "अपनी कार्ट खाली करने के लिए लॉगिन करें 🛒",
      hinglish: "Apni cart clear karne ke liye login karo 🛒",
    },
    clear_wishlist: {
      english: "Please login to clear your wishlist ❤️",
      hindi: "अपनी विशलिस्ट खाली करने के लिए लॉगिन करें ❤️",
      hinglish: "Apni wishlist clear karne ke liye login karo ❤️",
    },
    checkout: {
      english: "Please login to checkout 🔐",
      hindi: "चेकआउट के लिए लॉगिन करें 🔐",
      hinglish: "Checkout ke liye login karo 🔐",
    },
    view_cart: {
      english: "Please login to view your cart 🛒",
      hindi: "अपनी कार्ट देखने के लिए लॉगिन करें 🛒",
      hinglish: "Apni cart dekhne ke liye login karo 🛒",
    },
    view_wishlist: {
      english: "Please login to view your wishlist ❤️",
      hindi: "अपनी विशलिस्ट देखने के लिए लॉगिन करें ❤️",
      hinglish: "Apni wishlist dekhne ke liye login karo ❤️",
    },
    view_orders: {
      english: "Please login to view your orders 📦",
      hindi: "अपने ऑर्डर देखने के लिए लॉगिन करें 📦",
      hinglish: "Apne orders dekhne ke liye login karo 📦",
    },
    view_profile: {
      english: "Please login to view your profile 👤",
      hindi: "अपनी प्रोफाइल देखने के लिए लॉगिन करें 👤",
      hinglish: "Apni profile dekhne ke liye login karo 👤",
    },
  };

  const actionMessages = messages[action] || messages.add_to_cart;

  if (lang === "english") return actionMessages.english;
  if (lang === "hindi") return actionMessages.hindi;
  return actionMessages.hinglish;
}

function shouldExecuteBusinessLogic(decision: any): boolean {
  const pureNavigationActions = [
    "navigate_home",
    "navigate_back",
    "view_cart",
    "view_wishlist",
    "view_orders",
    "view_profile",
    "checkout",
  ];

  if (pureNavigationActions.includes(decision.action)) return false;

  const pureInfoActions = ["greeting", "general_chat"];
  if (pureInfoActions.includes(decision.action)) return false;

  if (
    decision.action === "provide_count" ||
    decision.action === "check_availability" ||
    decision.action === "browse_all_categories" ||
    decision.action === "view_product"
  ) {
    return true;
  }

  return decision.shouldFetchProducts || decision.shouldFetchStats;
}

function buildNavigationUrl(decision: any): string | null {
  switch (decision.action) {
    case "browse_all_categories":
      return "/categories";

    case "browse_category":
      return decision.category
        ? `/search?q=${encodeURIComponent(decision.category)}`
        : "/products";

    case "browse_subcategory":
      return decision.subcategory
        ? `/search?q=${encodeURIComponent(decision.subcategory)}`
        : decision.category
        ? `/search?q=${encodeURIComponent(decision.category)}`
        : "/products";

    case "browse_all_products":
      return "/products";

    case "view_product":
      return decision.productSlug && decision.productId
        ? `/products/${decision.productSlug}-${decision.productId}`
        : null;

    case "view_cart":
      return "/cart";

    case "view_wishlist":
      return "/wishlist";

    case "view_orders":
      return "/profile/orders";

    case "view_profile":
      return "/profile";

    case "checkout":
      return "/checkout";

    case "navigate_home":
      return "/";

    case "navigate_back":
      return "back";

    default:
      return null;
  }
}

function enrichPayloadWithBusinessData(
  responsePayload: any,
  businessData: any,
  decision: any
): void {
  if (!businessData) return;

  if (decision.shouldNavigate) return;

  if (businessData.products?.length) {
    responsePayload.products = businessData.products;
  }

  if (businessData.categories?.length) {
    responsePayload.categories = businessData.categories;
    responsePayload.categoriesCount = businessData.count;
  }

  if (businessData.subcategories?.length) {
    responsePayload.subcategories = businessData.subcategories;
    responsePayload.subcategoriesCount = businessData.count;
    responsePayload.subcategoryCategory = businessData.category;
  }

  if (businessData.stats) {
    responsePayload.stats = businessData.stats;
  }

  if (businessData.product) {
    responsePayload.product = businessData.product;
  }

  if (businessData.entityType) {
    responsePayload.entityType = businessData.entityType;
    responsePayload.entityCount = businessData.count;
  }
}