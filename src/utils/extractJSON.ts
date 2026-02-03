// lib/ai/utils/extractJSON.ts

export function extractJSON(text: unknown): Record<string, any> | null {
  try {
    if (typeof text !== "string") {
      return null;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return null;
    }

    // Fast path: pure JSON
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      const parsed = safeParse(trimmed);
      if (parsed) {
        return parsed;
      }
    }

    // Remove markdown code fences
    const cleaned = trimmed.replace(/```json|```/gi, "").trim();

    // Extract first JSON object
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (!match) {
      return null;
    }

    const parsed = safeParse(match[0]);
    if (!parsed) {
      return null;
    }

    // Ensure it's a plain object
    if (typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }

    return parsed;
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
    }
    return null;
  }
}

function safeParse(value: string): Record<string, any> | null {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}
