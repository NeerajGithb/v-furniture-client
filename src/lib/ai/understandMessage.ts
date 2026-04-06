// lib/ai/understandMessage.ts

import { extractJSON } from "@/utils/extractJSON";
import { callGroq } from "./groqClient";
import { generateDynamicUnderstandPrompt } from "./prompts/dynamicUnderstandPrompt";
import { UnderstandingResult } from "@/types/ai";
import { findExactMatch } from "./utils/predefinedQuestions";

const GROQ_API_KEY = process.env.GROQ_API_KEY_UNDERSTAND;
const GROQ_MODEL = process.env.GROQ_MODEL_UNDERSTAND;
// File is pre-generated, don't write in runtime
// function writePatternToFile(pattern: string) {
//   const filePath = path.join(process.cwd(), "all_patterns.txt");
//   fs.appendFileSync(filePath, pattern + "\n", "utf-8");
// }

function sanitizeValue(value: any): any {
  if (value === "null" || value === "undefined" || value === "") {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed === "null" || trimmed === "undefined" || trimmed === "") {
      return null;
    }
    return trimmed;
  }
  return value;
}

export async function understandMessage(
  userMessage: string,
  history: any[] = [],
  currentProduct: any = null,
): Promise<UnderstandingResult> {
  const msg = userMessage.toLowerCase().trim();

  // Use centralized exact match function
  const predefinedResult = findExactMatch(msg);
  if (predefinedResult) {
    return predefinedResult;
  }

  const lastUnderstanding =
    history.length > 0 ? history[history.length - 1]?.understanding : undefined;

  const dynamicPrompt = generateDynamicUnderstandPrompt({
    userMessage,
    history,
    lastUnderstanding,
    currentProduct,
  });

  const messages: any[] = [{ role: "system" as const, content: dynamicPrompt }];

  if (history && history.length > 0) {
    const recentHistory = history.slice(-4);

    recentHistory.forEach((msg: any) => {
      if (msg.role === "user" || msg.role === "assistant") {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });
  }

  messages.push({ role: "user" as const, content: userMessage });

  try {
    const response = await callGroq(
      messages,
      {
        json: true,
        max_tokens: 500,
        temperature: 0.1,
      },
      {
        apiKey: GROQ_API_KEY!,
        model: GROQ_MODEL!,
      },
    );

    const parsed = extractJSON(response);

    if (!parsed) {
      return createFallbackUnderstanding();
    }

    const result: UnderstandingResult = {
      coarse_intent: parsed.coarse_intent,
      whatUserWants: sanitizeValue(parsed.whatUserWants) || "",
      info_type: sanitizeValue(parsed.info_type),
      info_entity: sanitizeValue(parsed.info_entity),
      detail_level: sanitizeValue(parsed.detail_level),
      language: sanitizeValue(parsed.language) || "en",
      action_type: sanitizeValue(parsed.action_type),
      entities: {
        category: sanitizeValue(parsed.entities?.category),
        subcategory: sanitizeValue(parsed.entities?.subcategory),
        brand: sanitizeValue(parsed.entities?.brand),
        product: sanitizeValue(parsed.entities?.product),
        productIndex: parsed.entities?.productIndex ?? null,
      },
      constraints: {
        price_min: sanitizeValue(parsed.constraints?.price_min),
        price_max: sanitizeValue(parsed.constraints?.price_max),
        material: sanitizeValue(parsed.constraints?.material),
        color: sanitizeValue(parsed.constraints?.color),
        size: sanitizeValue(parsed.constraints?.size),
        sort: sanitizeValue(parsed.constraints?.sort),
      },
      confirmation: {
        is_yes: parsed.confirmation?.is_yes || false,
        is_no: parsed.confirmation?.is_no || false,
      },
      question_type: {
        is_question: parsed.question_type?.is_question || false,
        expects_yes_no: parsed.question_type?.expects_yes_no || false,
      },
      fine_intent: sanitizeValue(parsed.fine_intent) || "",
      confidence: sanitizeValue(parsed.confidence) || "",
    };

    return result;
  } catch (error: any) {
    return createFallbackUnderstanding();
  }
}

function createFallbackUnderstanding(): UnderstandingResult {
  return {
    coarse_intent: "BROWSING",
    whatUserWants: "browse products",
    info_type: null,
    info_entity: null,
    detail_level: null,
    language: "en",
    action_type: "viewProducts",
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
      sort: null,
    },
    confirmation: { is_yes: false, is_no: false },
    question_type: { is_question: false, expects_yes_no: false },
    fine_intent: "browse_products",
    confidence: "low",
  };
}
