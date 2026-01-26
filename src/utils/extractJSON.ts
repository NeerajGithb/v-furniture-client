// lib/ai/utils/extractJSON.ts

const LOG_PREFIX = '[ExtractJSON]';

export function extractJSON(text: unknown): Record<string, any> | null {
  try {
    if (typeof text !== 'string') {
      console.error(`${LOG_PREFIX} Input is not a string`);
      return null;
    }

    const trimmed = text.trim();
    if (!trimmed) {
      console.error(`${LOG_PREFIX} Input is empty`);
      return null;
    }

    // Fast path: pure JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = safeParse(trimmed);
      if (parsed) {
        console.log(`${LOG_PREFIX} Parsed pure JSON successfully`);
        return parsed;
      }
    }

    // Remove markdown code fences
    let cleaned = trimmed.replace(/```json|```/gi, '').trim();

    // Extract first JSON object
    const match = cleaned.match(/\{[\s\S]*?\}/);
    if (!match) {
      console.error(`${LOG_PREFIX} No JSON object found in text`);
      return null;
    }

    const parsed = safeParse(match[0]);
    if (!parsed) {
      console.error(`${LOG_PREFIX} Failed to parse extracted JSON`);
      return null;
    }

    // Ensure it's a plain object
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.error(`${LOG_PREFIX} Parsed value is not a plain object`);
      return null;
    }

    console.log(`${LOG_PREFIX} Successfully extracted and parsed JSON`);
    return parsed;

  } catch (error: any) {
    console.error(`${LOG_PREFIX} Unexpected error:`, error.message);
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