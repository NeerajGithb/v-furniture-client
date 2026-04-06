import { UnderstandingResult } from "@/types/ai";
import { callGroq } from "./groqClient";
import { buildRespondPrompt } from "./prompts/respondPrompt";
import {
  getQuickResponse,
  getBrowsingResponse,
  getGreetingResponse,
  getHelpResponse,
  getClarificationResponse,
  getNoResultsResponse,
  getCountResponse,
} from "./prompts/predefinedResponses";

const KEY = process.env.GROQ_API_KEY_RESPOND;
const MODEL = process.env.GROQ_MODEL_RESPOND;
type Confidence = "high" | "medium" | "low";
type Sentiment = "positive" | "neutral" | "negative";

interface ContextResult {
  context: string;
  source: string;
  confidence: Confidence;
  count?: number;
  structuredData?: any;
}

export async function respondMessage(
  message: string,
  understanding: UnderstandingResult,
  data: any,
  history: any[] = [],
  currentProduct: any = null,
  action?: string,
): Promise<{ finalResponse: string; structuredData?: any }> {
  const contextBuilt = buildContext(
    data,
    currentProduct,
    understanding,
    action,
  );

  // Check for quick responses first (no Groq needed)
  const quickResp = getQuickResponse(
    action || "",
    action === "browse_inspiration"
      ? { inspirationTitle: data?.inspirationTitle, title: data?.inspirationTitle }
      : currentProduct,
    contextBuilt.source,
  );

  if (quickResp) {
    return {
      finalResponse: quickResp,
      structuredData:
        action === "view_product_details"
          ? contextBuilt.structuredData
          : undefined,
    };
  }

  // Handle CLARIFY without Groq
  if (action === "clarify") {
    return { finalResponse: getClarificationResponse() };
  }

  // Handle greetings without Groq
  if (understanding.coarse_intent === "SOCIAL" && !currentProduct) {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.match(/^(hi|hey|hello|sup|yo|greetings)($|\s|!|\?)/i)) {
      return { finalResponse: getGreetingResponse() };
    }
  }

  // Handle help without Groq
  if (
    understanding.coarse_intent === "HELP" &&
    !currentProduct &&
    contextBuilt.count === 0
  ) {
    return { finalResponse: getHelpResponse() };
  }

  // Handle browsing with simple count (no Groq)
  if (
    (action === "browse_category" || action === "browse_subcategory") &&
    contextBuilt.count !== undefined &&
    contextBuilt.source === "PRODS"
  ) {
    const categoryName =
      data.category?.toLowerCase() ||
      data.subcategory?.toLowerCase() ||
      "items";
    return {
      finalResponse: getBrowsingResponse(contextBuilt.count, categoryName, understanding.constraints),
    };
  }

  // Handle no results without Groq
  if (contextBuilt.count === 0 && contextBuilt.source !== "NONE") {
    return { finalResponse: getNoResultsResponse() };
  }

  // Handle provide_count directly — no Groq needed, give a clear specific message
  if (action === "provide_count" && contextBuilt.source === "COUNT") {
    const count = data?.count ?? contextBuilt.count ?? 0;
    const entity = (data?.entityType || "PRODUCT").toUpperCase();
    return { finalResponse: getCountResponse(count, entity) };
  }

  // Needs Groq for complex responses
  const dynamicConfig = getDynamicConfig(understanding, contextBuilt, action);
  const intentForPrompt = understanding.coarse_intent;
  const systemPrompt = buildRespondPrompt(
    intentForPrompt,
    contextBuilt.context,
    action,
    {
      confidence: contextBuilt.confidence,
      count: contextBuilt.count,
      sentiment: getSentiment(message),
      info_type: understanding.info_type,
      detail_level: understanding.detail_level,
      info_entity: understanding.info_entity,
      whatUserWants: understanding.whatUserWants,
    },
  );

  const messages = buildMessages(
    systemPrompt,
    message,
    history,
    understanding.coarse_intent,
  );

  try {
    const response = await callGroq(
      messages,
      {
        temperature: dynamicConfig.temperature,
        max_tokens: dynamicConfig.maxTokens,
      },
      { apiKey: KEY!, model: MODEL! },
    );

    const finalResponse = postProcess(
      response,
      contextBuilt,
      understanding.info_type,
      action,
      currentProduct,
    );

    return {
      finalResponse,
      structuredData:
        action === "view_product_details"
          ? contextBuilt.structuredData
          : undefined,
    };
  } catch (error: any) {
    return {
      finalResponse: getFallback(understanding, contextBuilt, currentProduct),
    };
  }
}

function buildContext(
  data: any,
  currentProduct: any,
  understanding: UnderstandingResult,
  action?: string,
): ContextResult {
  const productActions = [
    "product_question",
    "view_product",
    "view_product_details",
  ];
  const isProductAction = productActions.includes(action || "");

  // Product selection from list
  if (
    currentProduct &&
    data?.products?.length === 1 &&
    data.count === 0 &&
    action === "view_product"
  ) {
    return {
      context: buildProductContextFull(currentProduct),
      source: "PRODUCT_SELECTED",
      confidence: "high",
      count: 1,
      structuredData: currentProduct,
    };
  }

  // Product question
  if (currentProduct && action === "product_question") {
    return {
      context: buildProductContextFull(currentProduct),
      source: "PRODUCT_QUESTION",
      confidence: "high",
      count: 1,
      structuredData: currentProduct,
    };
  }

  // Product details
  if (currentProduct && action === "view_product_details") {
    return {
      context: buildProductContextFull(currentProduct),
      source: "PRODUCT_DETAILS",
      confidence: "high",
      count: 1,
      structuredData: currentProduct,
    };
  }

  // View product
  if (currentProduct && action === "view_product") {
    return {
      context: buildProductContextFull(currentProduct),
      source: "PRODUCT",
      confidence: "high",
      count: 1,
      structuredData: currentProduct,
    };
  }

  // Generic product actions
  if (currentProduct && isProductAction) {
    const detailLevel = understanding.detail_level || "STANDARD";
    const context =
      detailLevel === "FULL" || detailLevel === "DETAIL"
        ? buildProductContextFull(currentProduct)
        : buildProductContextMinimal(currentProduct);

    return {
      context,
      source: "PRODUCT",
      confidence: "high",
      count: 1,
      structuredData: currentProduct,
    };
  }

  // Multiple products
  if (data?.products?.length > 0) {
    const totalProductCount = data.count || data.products.length;
    const previewProducts = data.products.slice(0, 5);

    let categoryName = "items";
    if (data.category) categoryName = data.category.toLowerCase();
    else if (data.subcategory) categoryName = data.subcategory.toLowerCase();
    else if (previewProducts[0]?.category)
      categoryName = previewProducts[0].category.toLowerCase();

    const productList = previewProducts
      .map((p: any) => `• ${p.name} (₹${p.finalPrice || p.price})`)
      .join("\n");

    return {
      context: `TOTAL PRODUCTS FOUND: ${totalProductCount}
CATEGORY: ${categoryName}

SAMPLE LIST:
${productList}`,
      source: "PRODS",
      confidence: "high",
      count: totalProductCount,
    };
  }

  // Count/Entity
  if (data?.entityType) {
    return {
      context: formatCount(data),
      source: "COUNT",
      confidence: "high",
      count: data.count || 0,
    };
  }

  // Stats
  if (data?.stats) {
    const { totalProducts, totalCategories, totalSubcategories } = data.stats;
    return {
      context: `Store Stats:
- Products: ${totalProducts}
- Categories: ${totalCategories}
- Subcategories: ${totalSubcategories}`,
      source: "STATS",
      confidence: "high",
    };
  }

  // Categories
  if (data?.categories?.length > 0) {
    return {
      context: `Available Categories (${data.categories.length}): 
${data.categories.map((c: any) => c.name).join(", ")}`,
      source: "CATS",
      confidence: "high",
      count: data.categories.length,
    };
  }

  // Subcategories
  if (data?.subcategories?.length > 0) {
    return {
      context: `Subcategories (${data.subcategories.length}):
${data.subcategories.map((s: any) => s.name).join(", ")}`,
      source: "SUBS",
      confidence: "high",
      count: data.subcategories.length,
    };
  }

  return {
    context: "No data available.",
    source: "NONE",
    confidence: "low",
  };
}

function buildProductContextMinimal(product: any): string {
  const discount = product.discountPercent || product.discount;
  const hasDiscount = discount && discount > 0;
  const finalPrice = product.finalPrice || product.price || 0;
  const originalPrice = product.originalPrice || product.price || 0;

  let context = `Product: ${product.name}\n`;

  if (hasDiscount) {
    context += `Price: ₹${finalPrice} (${discount}% OFF from ₹${originalPrice})\n`;
  } else {
    context += `Price: ₹${finalPrice}\n`;
  }

  if (product.description) {
    const shortDescription =
      product.description.length > 150
        ? product.description.substring(0, 150) + "..."
        : product.description;
    context += `\n${shortDescription}`;
  }

  return context;
}

function buildProductContextFull(product: any): string {
  const discount = product.discountPercent || product.discount;
  const hasDiscount = discount && discount > 0;
  const finalPrice = product.finalPrice || product.price || 0;
  const originalPrice = product.originalPrice || product.price || 0;

  let context = `=== PRODUCT DETAILS ===\n\n`;
  context += `Name: ${product.name}\n`;

  if (hasDiscount) {
    context += `Price: ₹${finalPrice} (${discount}% OFF from ₹${originalPrice})\n`;
  } else {
    context += `Price: ₹${finalPrice}\n`;
  }

  if (product.categoryId?.name || product.category) {
    context += `Category: ${product.categoryId?.name || product.category}\n`;
  }

  if (product.subCategoryId?.name || product.subcategory) {
    context += `Subcategory: ${
      product.subCategoryId?.name || product.subcategory
    }\n`;
  }

  if (product.brand) context += `Brand: ${product.brand}\n`;
  if (product.material)
    context += `Material: ${formatValue(product.material)}\n`;

  if (product.colorOptions?.length > 0) {
    context += `Colors Available: ${product.colorOptions.join(", ")}\n`;
  }

  if (product.size?.length > 0) {
    context += `Sizes Available: ${product.size.join(", ")}\n`;
  }

  if (product.dimensions) {
    context += `Dimensions: ${formatDimensions(product.dimensions)}\n`;
  }

  if (product.weight) {
    context += `Weight: ${formatWeight(product.weight)}\n`;
  }

  if (product.warranty)
    context += `Warranty: ${formatValue(product.warranty)}\n`;
  if (product.returnPolicy)
    context += `Return Policy: ${formatValue(product.returnPolicy)}\n`;

  if (product.inStockQuantity !== undefined) {
    context += `Stock Quantity: ${product.inStockQuantity} units\n`;
    context += `In Stock: ${product.inStockQuantity > 0 ? "Yes" : "No"}\n`;
  } else if (product.isActive !== undefined) {
    context += `In Stock: ${product.isActive ? "Yes" : "No"}\n`;
  }

  if (product.ratings || product.reviews?.average) {
    const rating = product.ratings || product.reviews?.average || 0;
    context += `Rating: ${rating}/5\n`;
  }

  if (product.reviews?.count) {
    context += `Total Reviews: ${product.reviews.count}\n`;
  }

  if (product.badge) context += `Badge: ${product.badge}\n`;
  if (product.isBestSeller) context += `Best Seller: Yes\n`;
  if (product.isNewArrival) context += `New Arrival: Yes\n`;

  if (product.highlights?.length > 0) {
    context += `\nHighlights:\n`;
    product.highlights.forEach((h: string) => (context += `• ${h}\n`));
  }

  if (product.bulletPoints?.length > 0) {
    context += `\nKey Features:\n`;
    product.bulletPoints.forEach((p: string) => (context += `• ${p}\n`));
  }

  if (product.description) {
    context += `\nDescription:\n${product.description}\n`;
  }

  return context;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  return String(value);
}

function formatDimensions(dims: any): string {
  if (!dims) return "";
  if (typeof dims === "string") return dims;
  if (typeof dims === "object") {
    const parts = [];
    if (dims.length) parts.push(`${dims.length}cm`);
    if (dims.width) parts.push(`${dims.width}cm`);
    if (dims.height) parts.push(`${dims.height}cm`);
    if (parts.length > 0) return parts.join(" x ");
    return Object.entries(dims)
      .map(([k, v]) => `${k}: ${v}cm`)
      .join(", ");
  }
  return String(dims);
}

function formatWeight(weight: any): string {
  if (!weight) return "";
  if (typeof weight === "string") return weight;
  if (typeof weight === "number") return `${weight}kg`;
  return String(weight);
}

function formatCount(data: any): string {
  const {
    entityType: type,
    count,
    category,
    subcategory,
    categories,
    subcategories,
  } = data;

  if (type === "CATEGORY" && categories) {
    const categoryNames = categories
      .slice(0, 6)
      .map((item: any) => item.name)
      .join(", ");
    return `Categories Available (${count}):\n${categoryNames}`;
  }

  if (type === "SUBCATEGORY" && subcategories) {
    const categoryNote = category ? ` in ${category}` : "";
    const subcategoryNames = subcategories
      .slice(0, 6)
      .map((item: any) => item.name)
      .join(", ");
    return `Subcategories${categoryNote} (${count}):\n${subcategoryNames}`;
  }

  if (type === "PRODUCT") {
    const categoryNote = category ? ` in ${category}` : "";
    return `Products${categoryNote}: ${count} available`;
  }

  return `${type}: ${count} available`;
}

function buildMessages(
  systemPrompt: string,
  message: string,
  history: any[],
  intent: string,
): any[] {
  const messages: any[] = [{ role: "system", content: systemPrompt }];

  if (history?.length > 0) {
    const historyLength = intent === "INFORMATION" ? 10 : 8;
    const recentHistory = history.slice(-historyLength);
    const filteredHistory = recentHistory.filter(
      (item: any) =>
        (item.role === "user" || item.role === "assistant") &&
        item.content &&
        item.content.trim(),
    );
    messages.push(
      ...filteredHistory.map((item: any) => ({
        role: item.role,
        content: item.content,
      })),
    );
  }

  messages.push({ role: "user", content: message });
  return messages;
}

function getDynamicConfig(
  understanding: UnderstandingResult,
  context: ContextResult,
  action?: string,
): { temperature: number; maxTokens: number } {
  const productDetailActions = [
    "view_product",
    "view_product_details",
    "product_question",
  ];

  if (productDetailActions.includes(action || "")) {
    const isDetailed =
      understanding.detail_level === "FULL" ||
      understanding.detail_level === "DETAIL" ||
      understanding.info_type === "DETAIL";
    return {
      temperature: 0.4,
      maxTokens: isDetailed ? 500 : context.source === "PRODUCT" ? 350 : 200,
    };
  }

  const configMap: Record<string, { temperature: number; maxTokens: number }> =
    {
      INFORMATION: { temperature: 0.5, maxTokens: 300 },
      SOCIAL: { temperature: 0.8, maxTokens: 150 },
      ACTION: { temperature: 0.3, maxTokens: 100 },
      BROWSING: { temperature: 0.4, maxTokens: 200 },
      HELP: { temperature: 0.6, maxTokens: 250 },
    };

  const config = configMap[understanding.coarse_intent] || {
    temperature: 0.7,
    maxTokens: 250,
  };

  if (understanding.info_type === "DETAIL" && context.source === "PRODUCT") {
    config.maxTokens = 500;
    config.temperature = 0.4;
  }

  if (context.confidence === "high" && context.count && context.count > 5) {
    config.maxTokens += 75;
  }

  return config;
}

function getSentiment(message: string): Sentiment {
  const lower = message.toLowerCase();
  const positiveWords = [
    "great",
    "awesome",
    "love",
    "perfect",
    "best",
    "good",
    "nice",
    "excellent",
    "amazing",
  ];
  const negativeWords = [
    "bad",
    "poor",
    "terrible",
    "hate",
    "worst",
    "awful",
    "horrible",
  ];

  const positiveCount = positiveWords.filter((word) =>
    lower.includes(word),
  ).length;
  const negativeCount = negativeWords.filter((word) =>
    lower.includes(word),
  ).length;

  if (positiveCount > negativeCount) return "positive";
  if (negativeCount > positiveCount) return "negative";
  return "neutral";
}

function postProcess(
  response: string,
  context: ContextResult,
  info_type?: string | null,
  action?: string,
  currentProduct?: any,
): string {
  let processed = response.trim();

  processed = processed
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1");

  if (!processed || processed.length < 5) {
    if (currentProduct && action === "product_question") {
      return `This is ${currentProduct.name}. What would you like to know about it?`;
    }

    if (context.source === "PRODUCT" && currentProduct) {
      return `Here's information about ${currentProduct.name}. ${
        currentProduct.description?.substring(0, 100) || ""
      }`;
    }

    return "I'm here to help! What would you like to know? 🛋️";
  }

  if (processed.length > 600) {
    const sentences = processed.split(/[.!?]\s+/);
    processed = sentences.slice(0, 4).join(". ") + ".";
  }

  return processed;
}

function getFallback(
  understanding: UnderstandingResult,
  context: ContextResult,
  currentProduct?: any,
): string {
  if (currentProduct) {
    return `I can help you with ${currentProduct.name}. What would you like to know? 🛋️`;
  }

  if (context.count === 0) {
    return getNoResultsResponse();
  }

  const fallbackMessages: Record<string, string> = {
    SOCIAL: getGreetingResponse(),
    INFORMATION: "What would you like to know about our products? 🛋️",
    BROWSING: "Let me show you our collection! 🛋️",
    ACTION: "I'll help you with that! ✨",
    HELP: getHelpResponse(),
  };

  return (
    fallbackMessages[understanding.coarse_intent] ||
    "How can I assist you today? 🛋️"
  );
}
