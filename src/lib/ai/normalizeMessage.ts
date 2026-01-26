import { callGroq } from "./groqClient";
import { NORMALIZE_PROMPT } from "./prompts/normalizePrompt";
import { getCachedPatternsSet } from "./utils/predefinedQuestions";

const NORMALIZE_MODELS = [
  process.env.GROQ_MODEL_NORMALIZE,
  process.env.GROQ_MODEL_NORMALIZE_FALLBACK,
].filter((m): m is string => typeof m === "string" && m.length > 0);

export async function normalizeMessage(
  userMessage: string
): Promise<{ normalized: string; language: string }> {
  if (!userMessage?.trim()) {
    return { normalized: "", language: "unknown" };
  }

  const text = userMessage.trim();
  const lowered = text.toLowerCase();

  // ✅ EXACT MATCH CHECK - using centralized caching
  const exactPatterns = getCachedPatternsSet();
  if (exactPatterns.has(lowered)) {
    console.log(`[Normalize] Exact match → SKIP GROQ`);
    return { normalized: lowered, language: "english" };
  }

  console.log(`[Normalize] No exact match → CALL GROQ`);

  for (const model of NORMALIZE_MODELS) {
    try {
      console.log(`[Normalize] Trying model: ${model}`);

      const response = await callGroq(
        [
          { role: "system", content: NORMALIZE_PROMPT },
          { role: "user", content: text },
        ],
        { temperature: 0, max_tokens: 200 },
        {
          apiKey: process.env.GROQ_API_KEY_NORMALIZE!,
          model,
        }
      );

      if (!response || !response.trim()) {
        throw new Error("Empty response");
      }

      const parsed = JSON.parse(response);

      if (
        typeof parsed?.normalized === "string" &&
        typeof parsed?.language === "string"
      ) {
        return {
          normalized: parsed.normalized,
          language: parsed.language,
        };
      }

      throw new Error("Invalid JSON shape");
    } catch (err) {
      console.warn(`[Normalize] Model failed (${model}), trying next`, err);
    }
  }

  // 🟢 FINAL SAFE FALLBACK (NEVER FAIL)
  console.error("[Normalize] All models failed → SAFE FALLBACK");

  return {
    normalized: text,
    language: "english",
  };
}