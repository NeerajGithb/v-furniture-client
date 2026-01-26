// lib/ai/predefinedQuestions.ts
import { UnderstandingResult } from "@/types/ai";

interface QuestionPattern {
  patterns: string[];
  understanding: UnderstandingResult;
}

type DetailLevel = "basic" | "detailed" | "comprehensive" | null;

// Centralized caching for predefined questions and patterns
let CACHED_QUESTIONS: QuestionPattern[] | null = null;
let CACHED_PATTERNS_SET: Set<string> | null = null;
let CACHED_PATTERN_MAP: Map<string, UnderstandingResult> | null = null;

const CATEGORIES = [
  { name: "Sofa", slug: "sofa" },
  { name: "Bed", slug: "bed" },
  { name: "Dining Table", slug: "dining-table" },
  { name: "Chair", slug: "chair" },
  { name: "Coffee Table", slug: "coffee-table" },
  { name: "Wardrobe", slug: "wardrobe" },
  { name: "Bookshelf", slug: "bookshelf" },
  { name: "Desk", slug: "desk" },
  { name: "Dresser", slug: "dresser" },
  { name: "TV Stand", slug: "tv-stand" },
  { name: "Cabinet", slug: "cabinet" },
  { name: "Armchair", slug: "armchair" },
  { name: "Bench", slug: "bench" },
];

const SUBCATEGORIES = [
  // Dining Tables
  { name: "4 Seater Dining Table", slug: "4-seater-dining-table", category: "dining-table" },
  { name: "6 Seater Dining Table", slug: "6-seater-dining-table", category: "dining-table" },
  { name: "Round Dining Table", slug: "round-dining-table", category: "dining-table" },
  { name: "Extendable Dining Table", slug: "extendable-dining-table", category: "dining-table" },
  
  // Beds
  { name: "King Size Bed", slug: "king-size-bed", category: "bed" },
  { name: "Queen Size Bed", slug: "queen-size-bed", category: "bed" },
  { name: "Double Bed", slug: "double-bed", category: "bed" },
  { name: "Single Bed", slug: "single-bed", category: "bed" },
  { name: "Storage Bed", slug: "storage-bed", category: "bed" },
  
  // Sofas
  { name: "3 Seater Sofa", slug: "3-seater-sofa", category: "sofa" },
  { name: "2 Seater Sofa", slug: "2-seater-sofa", category: "sofa" },
  { name: "L Shape Sofa", slug: "l-shape-sofa", category: "sofa" },
  { name: "Recliner Sofa", slug: "recliner-sofa", category: "sofa" },
  { name: "Sectional Sofa", slug: "sectional-sofa", category: "sofa" },
  
  // Chairs
  { name: "Dining Chair", slug: "dining-chair", category: "chair" },
  { name: "Office Chair", slug: "office-chair", category: "chair" },
  { name: "Accent Chair", slug: "accent-chair", category: "chair" },
  { name: "Bar Stool", slug: "bar-stool", category: "chair" },
  
  // Coffee Tables
  { name: "Wooden Coffee Table", slug: "wooden-coffee-table", category: "coffee-table" },
  { name: "Glass Coffee Table", slug: "glass-coffee-table", category: "coffee-table" },
  { name: "Round Coffee Table", slug: "round-coffee-table", category: "coffee-table" },
  { name: "Storage Coffee Table", slug: "storage-coffee-table", category: "coffee-table" },
  
  // Wardrobes
  { name: "2 Door Wardrobe", slug: "2-door-wardrobe", category: "wardrobe" },
  { name: "3 Door Wardrobe", slug: "3-door-wardrobe", category: "wardrobe" },
  { name: "Sliding Door Wardrobe", slug: "sliding-door-wardrobe", category: "wardrobe" },
  { name: "Walk-in Wardrobe", slug: "walk-in-wardrobe", category: "wardrobe" },
];

// Ordinal numbers configuration
const ORDINALS = [
  { word: "first", numeric: "1st", number: "1", text: "one", index: 0 },
  { word: "second", numeric: "2nd", number: "2", text: "two", index: 1 },
  { word: "third", numeric: "3rd", number: "3", text: "three", index: 2 },
  { word: "fourth", numeric: "4th", number: "4", text: "four", index: 3 },
  { word: "fifth", numeric: "5th", number: "5", text: "five", index: 4 },
  { word: "sixth", numeric: "6th", number: "6", text: "six", index: 5 },
  { word: "seventh", numeric: "7th", number: "7", text: "seven", index: 6 },
  { word: "eighth", numeric: "8th", number: "8", text: "eight", index: 7 },
  { word: "ninth", numeric: "9th", number: "9", text: "nine", index: 8 },
  { word: "tenth", numeric: "10th", number: "10", text: "ten", index: 9 },
];

// Action templates
const ACTION_TEMPLATES = ["open", "show", "view", "display", "see"];

// Pattern templates for furniture shopping
const CATEGORY_PATTERNS = [
  "show me {item}", "{item}", "show {item}", "find {item}", "search {item}",
  "i want {item}", "need {item}", "looking for {item}", "{item} available",
  "browse {item}", "see {item}", "display {item}", "open {item}",
  "{item} collection", "best {item}", "modern {item}", "all {item}",
  "view {item}", "shop {item}", "buy {item}", "{item} for sale",
  "cheap {item}", "affordable {item}", "luxury {item}", "premium {item}"
];

const SUBCATEGORY_PATTERNS = [
  "show me {item}", "{item}", "show {item}", "find {item}",
  "i want {item}", "need {item}", "looking for {item}", "browse {item}",
  "see {item}", "{item} available", "view {item}", "shop {item}",
  "buy {item}", "best {item}", "{item} designs"
];

// Materials for furniture
const MATERIALS = [
  { name: "wooden", value: "wood" },
  { name: "wood", value: "wood" },
  { name: "teak", value: "teak" },
  { name: "oak", value: "oak" },
  { name: "metal", value: "metal" },
  { name: "steel", value: "steel" },
  { name: "glass", value: "glass" },
  { name: "leather", value: "leather" },
  { name: "fabric", value: "fabric" },
  { name: "velvet", value: "velvet" },
  { name: "marble", value: "marble" },
];

// Colors popular in furniture
const COLORS = [
  "black", "white", "brown", "gray", "grey", "beige", "cream",
  "blue", "navy", "green", "red", "yellow", "orange", "pink"
];

// Furniture styles
const STYLES = [
  "modern", "contemporary", "classic", "vintage", "rustic", 
  "industrial", "minimalist", "luxury", "traditional", "scandinavian"
];

// Room types for furniture context
const ROOMS = [
  "living room", "bedroom", "dining room", "office", "study",
  "kitchen", "bathroom", "balcony", "outdoor", "kids room"
];

// Generate patterns dynamically
function generatePatterns(template: string[], item: string): string[] {
  return template.map((t) => t.replace("{item}", item.toLowerCase()));
}

// Generate ordinal patterns for product selection
function generateOrdinalPatterns(): QuestionPattern[] {
  const patterns: QuestionPattern[] = [];

  ORDINALS.forEach((ord) => {
    const ordPatterns: string[] = [];

    ACTION_TEMPLATES.forEach((action) => {
      ordPatterns.push(`${action} ${ord.word}`);
      ordPatterns.push(`${action} the ${ord.word}`);
    });

    ordPatterns.push(
      ord.word,
      `${ord.word} one`,
      ord.numeric,
      `number ${ord.number}`,
      `number ${ord.text}`,
      `show me the ${ord.word}`,
      `the ${ord.word}`
    );

    patterns.push({
      patterns: ordPatterns,
      understanding: {
        coarse_intent: "ACTION",
        whatUserWants: `view product at index ${ord.index}`,
        info_type: "DETAIL",
        info_entity: "product",
        detail_level: "basic",
        language: "en",
        action_type: "viewProduct",
        entities: {
          category: null,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: ord.index,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "view_product_by_index",
        confidence: "high",
      },
    });
  });

  return patterns;
}

// Generate material-based search patterns
function generateMaterialPatterns(): QuestionPattern[] {
  const patterns: QuestionPattern[] = [];

  MATERIALS.forEach((mat) => {
    patterns.push({
      patterns: [
        `${mat.name} furniture`,
        `furniture made of ${mat.name}`,
        `${mat.name} items`,
        `show me ${mat.name} furniture`,
        `find ${mat.name} furniture`,
        `looking for ${mat.name} furniture`,
        `${mat.name} collection`,
        `best ${mat.name} furniture`,
      ],
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `find ${mat.name} furniture`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "filterByMaterial",
        entities: {
          category: null,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: mat.value,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "filter_by_material",
        confidence: "high",
      },
    });
  });

  return patterns;
}

// Generate color-based search patterns
function generateColorPatterns(): QuestionPattern[] {
  const patterns: QuestionPattern[] = [];

  COLORS.forEach((color) => {
    patterns.push({
      patterns: [
        `${color} furniture`,
        `${color} color furniture`,
        `furniture in ${color}`,
        `show me ${color} furniture`,
        `find ${color} items`,
        `${color} collection`,
        `best ${color} furniture`,
      ],
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `find ${color} furniture`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "filterByColor",
        entities: {
          category: null,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: color,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "filter_by_color",
        confidence: "high",
      },
    });
  });

  return patterns;
}

// Generate style-based search patterns
function generateStylePatterns(): QuestionPattern[] {
  const patterns: QuestionPattern[] = [];

  STYLES.forEach((style) => {
    patterns.push({
      patterns: [
        `${style} furniture`,
        `${style} style furniture`,
        `${style} design furniture`,
        `show me ${style} furniture`,
        `find ${style} items`,
        `${style} collection`,
        `best ${style} furniture`,
      ],
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `find ${style} furniture`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "filterByStyle",
        entities: {
          category: null,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "filter_by_style",
        confidence: "high",
      },
    });
  });

  return patterns;
}

// Generate room-based search patterns
function generateRoomPatterns(): QuestionPattern[] {
  const patterns: QuestionPattern[] = [];

  ROOMS.forEach((room) => {
    patterns.push({
      patterns: [
        `${room} furniture`,
        `furniture for ${room}`,
        `${room} items`,
        `show me ${room} furniture`,
        `find ${room} furniture`,
        `${room} collection`,
        `best ${room} furniture`,
      ],
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `find ${room} furniture`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "filterByRoom",
        entities: {
          category: null,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "filter_by_room",
        confidence: "high",
      },
    });
  });

  return patterns;
}

// Build all predefined questions
export function buildPredefinedQuestions(): QuestionPattern[] {
  const questions: QuestionPattern[] = [];

  // Static patterns
  questions.push(...STATIC_PATTERNS);

  // Dynamic patterns
  questions.push(...generateOrdinalPatterns());
  questions.push(...generateMaterialPatterns());
  questions.push(...generateColorPatterns());
  questions.push(...generateStylePatterns());
  questions.push(...generateRoomPatterns());

  // Category patterns
  CATEGORIES.forEach((cat) => {
    questions.push({
      patterns: generatePatterns(CATEGORY_PATTERNS, cat.name),
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `browse ${cat.name.toLowerCase()}`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "goToCategory",
        entities: {
          category: cat.slug,
          subcategory: null,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "browse_category",
        confidence: "high",
      },
    });
  });

  // Subcategory patterns
  SUBCATEGORIES.forEach((sub) => {
    questions.push({
      patterns: generatePatterns(SUBCATEGORY_PATTERNS, sub.name),
      understanding: {
        coarse_intent: "BROWSING",
        whatUserWants: `browse ${sub.name.toLowerCase()}`,
        info_type: null,
        info_entity: null,
        detail_level: null,
        language: "en",
        action_type: "goToSubcategory",
        entities: {
          category: sub.category,
          subcategory: sub.slug,
          brand: null,
          product: null,
          productIndex: null,
        },
        constraints: {
          price_min: null,
          price_max: null,
          material: null,
          color: null,
          size: null,
        },
        confirmation: { is_yes: false, is_no: false },
        question_type: { is_question: false, expects_yes_no: false },
        fine_intent: "browse_subcategory",
        confidence: "high",
      },
    });
  });

  return questions;
}

// Static patterns for common furniture shopping interactions
const STATIC_PATTERNS: QuestionPattern[] = [
  {
    patterns: [
      "hi", "hello", "hey", "good morning", "good afternoon", 
      "good evening", "greetings", "howdy"
    ],
    understanding: {
      coarse_intent: "SOCIAL",
      whatUserWants: "greeting",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: null,
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "greeting",
      confidence: "high",
    },
  },
  {
    patterns: [
      "yes", "yeah", "yep", "sure", "ok", "okay", "confirm", 
      "absolutely", "correct", "right"
    ],
    understanding: {
      coarse_intent: "CONFIRMATION",
      whatUserWants: "confirmation yes",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: null,
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: true, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "confirmation",
      confidence: "high",
    },
  },
  {
    patterns: [
      "no", "nope", "not really", "no thanks", "cancel", 
      "back", "never mind", "nah"
    ],
    understanding: {
      coarse_intent: "CONFIRMATION",
      whatUserWants: "confirmation no",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: null,
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: true },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "rejection",
      confidence: "high",
    },
  },
  {
    patterns: [
      "show another", "show another one", "view another", "see another",
      "different one", "next one", "next option", "another option",
      "show different", "something else"
    ],
    understanding: {
      coarse_intent: "ACTION",
      whatUserWants: "view product at index 1",
      info_type: "DETAIL",
      info_entity: "product",
      detail_level: "basic",
      language: "en",
      action_type: "viewProduct",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: 1,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "view_product_by_index",
      confidence: "high",
    },
  },
  {
    patterns: [
      "open", "open it", "open this", "view it", "show it", 
      "display this", "see this"
    ],
    understanding: {
      coarse_intent: "ACTION",
      fine_intent: "open_context",
      whatUserWants: "open previously referenced context",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: null,
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      confidence: "high",
    },
  },
  {
    patterns: [
      "add to cart", "add this to cart", "put in cart", "cart this", 
      "buy this", "purchase this", "i want this"
    ],
    understanding: {
      coarse_intent: "ACTION",
      whatUserWants: "add current item to cart",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "addToCart",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "add_to_cart",
      confidence: "high",
    },
  },
  {
    patterns: [
      "view cart", "show cart", "my cart", "shopping cart", "cart", 
      "check cart", "cart items"
    ],
    understanding: {
      coarse_intent: "ACTION",
      whatUserWants: "view shopping cart",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "viewCart",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "view_cart",
      confidence: "high",
    },
  },
  {
    patterns: [
      "checkout", "proceed to checkout", "buy now", "place order", 
      "complete purchase", "pay now"
    ],
    understanding: {
      coarse_intent: "ACTION",
      whatUserWants: "proceed to checkout",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "checkout",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "checkout",
      confidence: "high",
    },
  },
  {
    patterns: [
      "help", "help me", "i need help", "assist me", "support", 
      "what can you do", "how does this work"
    ],
    understanding: {
      coarse_intent: "HELP",
      whatUserWants: "get help",
      info_type: "GENERAL",
      info_entity: null,
      detail_level: "basic",
      language: "en",
      action_type: null,
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: true, expects_yes_no: false },
      fine_intent: "request_help",
      confidence: "high",
    },
  },
  {
    patterns: [
      "cheap furniture", "affordable furniture", "budget furniture", 
      "low price furniture", "inexpensive furniture", "discount furniture"
    ],
    understanding: {
      coarse_intent: "BROWSING",
      whatUserWants: "find affordable furniture",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "filterByPrice",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: 15000,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "filter_by_price",
      confidence: "high",
    },
  },
  {
    patterns: [
      "premium furniture", "luxury furniture", "expensive furniture", 
      "high end furniture", "designer furniture", "luxury collection"
    ],
    understanding: {
      coarse_intent: "BROWSING",
      whatUserWants: "find premium furniture",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "filterByPrice",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: 50000,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "filter_by_price",
      confidence: "high",
    },
  },
  {
    patterns: [
      "what's new", "new arrivals", "latest furniture", "new collection", 
      "recently added", "fresh arrivals", "new products"
    ],
    understanding: {
      coarse_intent: "BROWSING",
      whatUserWants: "find new arrivals",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "filterByNewArrivals",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "filter_by_new_arrivals",
      confidence: "high",
    },
  },
  {
    patterns: [
      "best sellers", "popular furniture", "trending furniture", 
      "most popular", "top rated", "customer favorites"
    ],
    understanding: {
      coarse_intent: "BROWSING",
      whatUserWants: "find best sellers",
      info_type: null,
      info_entity: null,
      detail_level: null,
      language: "en",
      action_type: "filterByBestSellers",
      entities: {
        category: null,
        subcategory: null,
        brand: null,
        product: null,
        productIndex: null,
      },
      constraints: {
        price_min: null,
        price_max: null,
        material: null,
        color: null,
        size: null,
      },
      confirmation: { is_yes: false, is_no: false },
      question_type: { is_question: false, expects_yes_no: false },
      fine_intent: "filter_by_best_sellers",
      confidence: "high",
    },
  },
];

export const PREDEFINED_QUESTIONS = buildPredefinedQuestions();

// Centralized caching functions for better performance
export function getCachedPredefinedQuestions(): QuestionPattern[] {
  if (CACHED_QUESTIONS === null) {
    CACHED_QUESTIONS = buildPredefinedQuestions();
  }
  return CACHED_QUESTIONS;
}

export function getCachedPatternsSet(): Set<string> {
  if (CACHED_PATTERNS_SET === null) {
    const patterns = new Set<string>();
    const questions = getCachedPredefinedQuestions();
    
    for (const question of questions) {
      for (const pattern of question.patterns) {
        patterns.add(pattern.toLowerCase().trim());
      }
    }
    
    CACHED_PATTERNS_SET = patterns;
  }
  return CACHED_PATTERNS_SET;
}

export function getCachedPatternMap(): Map<string, UnderstandingResult> {
  if (CACHED_PATTERN_MAP === null) {
    const patternMap = new Map<string, UnderstandingResult>();
    const questions = getCachedPredefinedQuestions();
    
    for (const question of questions) {
      for (const pattern of question.patterns) {
        const normalizedPattern = pattern.toLowerCase().trim();
        patternMap.set(normalizedPattern, { ...question.understanding });
      }
    }
    
    CACHED_PATTERN_MAP = patternMap;
  }
  return CACHED_PATTERN_MAP;
}

// Fast lookup function for exact pattern matching
export function findExactMatch(message: string): UnderstandingResult | null {
  const normalized = message.toLowerCase().trim().replace(/[?,!.;]+$/, "");
  const patternMap = getCachedPatternMap();
  const result = patternMap.get(normalized);
  
  if (result) {
    console.log(`[PredefinedQuestions] 🎯 Exact match: "${normalized}"`);
  }
  
  return result || null;
}

// Clear cache function (useful for testing or if patterns change)
export function clearCache(): void {
  CACHED_QUESTIONS = null;
  CACHED_PATTERNS_SET = null;
  CACHED_PATTERN_MAP = null;
}