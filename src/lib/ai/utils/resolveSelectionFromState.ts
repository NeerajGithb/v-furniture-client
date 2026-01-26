// lib/ai/utils/resolveSelectionFromState.ts

import { UnderstandingResult } from "@/types/ai";
import { getConversationState } from "../state/getConversationState";

const LOG_PREFIX = "[ResolveSelection]";

export async function resolveSelectionFromState(
  conversationId: string,
  message: string,
  decision: any,
  understanding?: UnderstandingResult
) {
  const state = await getConversationState(conversationId);

  // ✅ Initialize index as null (no selection)
  decision.index = null;

  if (
    understanding?.entities?.productIndex !== null &&
    understanding?.entities?.productIndex !== undefined
  ) {
    console.log(
      `${LOG_PREFIX} Using productIndex: ${understanding.entities.productIndex}`
    );

    if (!state?.lastProducts?.length) {
      console.log(
        `${LOG_PREFIX} No products in state, checking for category fallback`
      );

      if (state?.activeCategory && state?.lastAction === "CHECK_AVAILABILITY") {
        return handleCategoryFallback(decision, understanding, state);
      }

      return decision;
    }

    const products = state.lastProducts;
    const index = understanding.entities.productIndex;

    let selectedProduct = null;
    let resolvedIndex = null;

    if (index === -1) {
      selectedProduct = products[products.length - 1];
      resolvedIndex = products.length - 1;
    } else if (index === -2) {
      const result = await resolveByMultipleCriteria(message, products);
      selectedProduct = result.product;
      resolvedIndex = result.index;
    } else if (index >= 0 && index < products.length) {
      selectedProduct = products[index];
      resolvedIndex = index;
    }

    if (selectedProduct) {
      console.log(
        `${LOG_PREFIX} Selected: ${
          selectedProduct.name || selectedProduct.title
        } (index: ${resolvedIndex})`
      );
      decision.productId = selectedProduct._id;
      decision.productSlug = selectedProduct.slug;
      decision.index = resolvedIndex; // ✅ SET INDEX

      if (decision.action === "greeting" || !decision.action) {
        decision.action = "view_product";
        decision.shouldNavigate = true;
      }

      return decision;
    }
  }

  const msg = message.toLowerCase().trim();

  const looksLikeSelection =
    msg.includes("open") ||
    msg.includes("select") ||
    msg.includes("choose") ||
    msg.includes("show me") ||
    msg.includes("first") ||
    msg.includes("second") ||
    msg.includes("third") ||
    msg.includes("last") ||
    /\b\d{1,2}\b/.test(msg) ||
    /\b\d{4,6}\b/.test(msg) ||
    /\b\d+\s*k\b/.test(msg);

  if (
    !looksLikeSelection &&
    decision.action !== "view_product" &&
    decision.action !== "add_to_cart"
  ) {
    return decision;
  }

  if (!state?.lastProducts?.length) {
    console.log(
      `${LOG_PREFIX} No products in state, checking for category fallback`
    );

    if (state?.activeCategory && state?.lastAction === "CHECK_AVAILABILITY") {
      return handleCategoryFallback(decision, understanding, state);
    }

    return decision;
  }

  const products = state.lastProducts;
  const result = await resolveByMultipleCriteria(msg, products);
  const selectedProduct = result.product;

  if (selectedProduct) {
    console.log(
      `${LOG_PREFIX} Selected: ${
        selectedProduct.name || selectedProduct.title
      } (index: ${result.index})`
    );
    decision.productId = selectedProduct._id;
    decision.productSlug = selectedProduct.slug;
    decision.index = result.index; // ✅ SET INDEX

    if (decision.action === "greeting" || !decision.action) {
      decision.action = "view_product";
      decision.shouldNavigate = true;
    }
  } else {
    console.log(`${LOG_PREFIX} No product match found`);
  }

  return decision;
}

function handleCategoryFallback(
  decision: any,
  understanding: UnderstandingResult | undefined,
  state: any
) {
  console.log(`${LOG_PREFIX} Falling back to category/subcategory browsing`);

  let targetCategory = null;
  let targetSubcategory = null;

  if (understanding?.entities?.subcategory) {
    targetCategory = understanding.entities.category;
    targetSubcategory = understanding.entities.subcategory;
    console.log(
      `${LOG_PREFIX} Using subcategory from understanding: ${targetSubcategory}`
    );
  } else if (understanding?.entities?.category) {
    targetCategory = understanding.entities.category;
    console.log(
      `${LOG_PREFIX} Using category from understanding: ${targetCategory}`
    );
  } else if (state.activeSubcategory) {
    targetCategory = state.activeCategory;
    targetSubcategory = state.activeSubcategory;
    console.log(
      `${LOG_PREFIX} Using subcategory from state: ${targetSubcategory}`
    );
  } else if (state.activeCategory) {
    targetCategory = state.activeCategory;
    console.log(`${LOG_PREFIX} Using category from state: ${targetCategory}`);
  }

  if (targetSubcategory) {
    decision.action = "browse_subcategory";
    decision.actionType = "SUBCATEGORY";
    decision.category = targetCategory;
    decision.subcategory = targetSubcategory;
    decision.shouldNavigate = true;
    decision.shouldFetchProducts = true;
    console.log(
      `${LOG_PREFIX} Action set: browse_subcategory (${targetCategory}/${targetSubcategory})`
    );
  } else if (targetCategory) {
    decision.action = "browse_category";
    decision.actionType = "CATEGORY";
    decision.category = targetCategory;
    decision.shouldNavigate = true;
    decision.shouldFetchProducts = true;
    console.log(
      `${LOG_PREFIX} Action set: browse_category (${targetCategory})`
    );
  }

  return decision;
}

// ✅ NOW RETURNS { product, index }
async function resolveByMultipleCriteria(
  msg: string,
  products: any[]
): Promise<{ product: any | null; index: number | null }> {
  const ordinalMap: Record<string, number> = {
    first: 0,
    "1st": 0,
    one: 0,
    second: 1,
    "2nd": 1,
    two: 1,
    third: 2,
    "3rd": 2,
    three: 2,
    fourth: 3,
    "4th": 3,
    four: 3,
    fifth: 4,
    "5th": 4,
    five: 4,
    sixth: 5,
    "6th": 5,
    six: 5,
    seventh: 6,
    "7th": 6,
    seven: 6,
    eighth: 7,
    "8th": 7,
    eight: 7,
    ninth: 8,
    "9th": 8,
    nine: 8,
    tenth: 9,
    "10th": 9,
    ten: 9,
  };

  for (const [word, index] of Object.entries(ordinalMap)) {
    if (new RegExp(`\\b${word}\\b`).test(msg) && products[index]) {
      console.log(`${LOG_PREFIX} Match: ${word} (index ${index})`);
      return { product: products[index], index };
    }
  }

  if (/\blast\b/.test(msg)) {
    const index = products.length - 1;
    console.log(`${LOG_PREFIX} Match: last product (index ${index})`);
    return { product: products[index], index };
  }

  const numMatch = msg.match(/\b([1-9])\b/);
  if (numMatch) {
    const index = parseInt(numMatch[1]) - 1;
    if (products[index]) {
      console.log(`${LOG_PREFIX} Match: index ${index + 1}`);
      return { product: products[index], index };
    }
  }

  const priceMatch = msg.match(/\b(\d{4,6})\b/);
  if (priceMatch) {
    const target = Number(priceMatch[1]);

    let match = products.find(
      (p) =>
        p.finalPrice === target ||
        p.originalPrice === target ||
        p.price === target
    );
    if (match) {
      const index = products.indexOf(match);
      console.log(
        `${LOG_PREFIX} Match: exact price ₹${target} (index ${index})`
      );
      return { product: match, index };
    }

    match = products.find((p) => {
      const prices = [p.finalPrice, p.originalPrice, p.price].filter(Boolean);
      return prices.some(
        (price) => Math.abs(price - target) <= Math.max(100, target * 0.01)
      );
    });
    if (match) {
      const index = products.indexOf(match);
      console.log(
        `${LOG_PREFIX} Match: close price ₹${target} (index ${index})`
      );
      return { product: match, index };
    }

    const closest = products.reduce((prev, curr) => {
      const getPrices = (p: any) =>
        [p.finalPrice, p.originalPrice, p.price].filter(Boolean);
      const prevClosest = Math.min(
        ...getPrices(prev).map((price) => Math.abs(price - target))
      );
      const currClosest = Math.min(
        ...getPrices(curr).map((price) => Math.abs(price - target))
      );
      return currClosest < prevClosest ? curr : prev;
    });

    const index = products.indexOf(closest);
    console.log(`${LOG_PREFIX} Match: closest to ₹${target} (index ${index})`);
    return { product: closest, index };
  }

  const kMatch = msg.match(/(\d+)\s*k/);
  if (kMatch) {
    const target = Number(kMatch[1]) * 1000;

    const closest = products.reduce((prev, curr) => {
      const getPrices = (p: any) =>
        [p.finalPrice, p.originalPrice, p.price].filter(Boolean);
      const prevClosest = Math.min(
        ...getPrices(prev).map((price) => Math.abs(price - target))
      );
      const currClosest = Math.min(
        ...getPrices(curr).map((price) => Math.abs(price - target))
      );
      return currClosest < prevClosest ? curr : prev;
    });

    const index = products.indexOf(closest);
    console.log(
      `${LOG_PREFIX} Match: price ₹${target} (k format, index ${index})`
    );
    return { product: closest, index };
  }

  const skuMatch = products.find(
    (p) => p.sku && msg.includes(p.sku.toLowerCase())
  );
  if (skuMatch) {
    const index = products.indexOf(skuMatch);
    console.log(`${LOG_PREFIX} Match: SKU ${skuMatch.sku} (index ${index})`);
    return { product: skuMatch, index };
  }

  const itemIdMatch = products.find(
    (p) => p.itemId && msg.includes(p.itemId.toLowerCase())
  );
  if (itemIdMatch) {
    const index = products.indexOf(itemIdMatch);
    console.log(
      `${LOG_PREFIX} Match: itemId ${itemIdMatch.itemId} (index ${index})`
    );
    return { product: itemIdMatch, index };
  }

  const words = msg.split(/\s+/).filter((w) => w.length >= 3);
  for (const word of words) {
    const match = products.find((p) => {
      const name = (p.name || p.title || "").toLowerCase();
      return name.includes(word);
    });
    if (match) {
      const index = products.indexOf(match);
      console.log(
        `${LOG_PREFIX} Match: name contains "${word}" (index ${index})`
      );
      return { product: match, index };
    }
  }

  const materials = [
    "wood",
    "wooden",
    "engineered",
    "sheesham",
    "teak",
    "metal",
    "fabric",
    "leather",
    "glass",
    "marble",
  ];
  for (const material of materials) {
    if (msg.includes(material)) {
      const match = products.find(
        (p) => p.material && p.material.toLowerCase().includes(material)
      );
      if (match) {
        const index = products.indexOf(match);
        console.log(
          `${LOG_PREFIX} Match: material "${material}" (index ${index})`
        );
        return { product: match, index };
      }
    }
  }

  const sizes = ["single", "double", "queen", "king", "twin", "full"];
  for (const size of sizes) {
    if (msg.includes(size)) {
      const match = products.find((p) => {
        const name = (p.name || p.title || "").toLowerCase();
        const sizeStr = p.size ? JSON.stringify(p.size).toLowerCase() : "";
        return name.includes(size) || sizeStr.includes(size);
      });
      if (match) {
        const index = products.indexOf(match);
        console.log(`${LOG_PREFIX} Match: size "${size}" (index ${index})`);
        return { product: match, index };
      }
    }
  }

  return { product: null, index: null };
}