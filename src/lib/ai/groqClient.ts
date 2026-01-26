import { classifyGroqHttpError, GroqError } from "./errors/groqErrorHandler";

// lib/ai/groqClient.ts
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const LOG_PREFIX = "[Groq]";

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqOptions {
  temperature?: number;
  max_tokens?: number;
  json?: boolean;
}

interface GroqConfig {
  apiKey: string;
  model: string;
}

export async function callGroq(
  messages: GroqMessage[],
  options?: GroqOptions,
  config?: GroqConfig
): Promise<string> {
  const apiKey = config?.apiKey || process.env.GROQ_API_KEY;
  const model =
    config?.model ||
    process.env.GROQ_MODEL ||
    "meta-llama/llama-4-maverick-17b-128e-instruct";

  if (!apiKey) {
    throw new GroqError("AUTH", "Groq API key not configured");
  }

  console.log(
    `${LOG_PREFIX} Calling model: ${model} (${messages.length} msgs, json: ${
      options?.json || false
    })`
  );

  let lastError: GroqError | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      if (attempt > 1) {
        console.log(`${LOG_PREFIX} Retry ${attempt}/${MAX_RETRIES}`);
      }

      const body: any = {
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.max_tokens ?? 512,
      };

      if (options?.json) {
        body.response_format = { type: "json_object" };
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw classifyGroqHttpError(response.status, errorText);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new GroqError("EMPTY_RESPONSE", "Groq returned empty response");
      }

      console.log(`${LOG_PREFIX} ✓ Success`);
      return content;
    } catch (err: any) {
      clearTimeout(timeout);

      if (err?.name === "AbortError") {
        lastError = new GroqError(
          "TIMEOUT",
          `Groq request timed out after ${TIMEOUT_MS}ms`
        );
      } else if (err instanceof GroqError) {
        lastError = err;
      } else {
        lastError = new GroqError(
          "NETWORK",
          err?.message || "Groq network error"
        );
      }

      console.error(`${LOG_PREFIX} ${lastError.code}: ${lastError.message}`);

      if (attempt === MAX_RETRIES) break;
      await sleep(500 * attempt);
    }
  }

  throw lastError || new GroqError("UNKNOWN", "Groq request failed");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}