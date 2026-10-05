import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const GROQ_MODELS = [
  import.meta.env.VITE_GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
].filter(
  (model): model is string =>
    Boolean(model && String(model).trim())
);

function isMissingModelError(error: any) {
  const message = String(
    error?.message || error || ""
  ).toLowerCase();

  return (
    error?.status === 404 ||
    message.includes("does not exist") ||
    message.includes("model_not_found") ||
    message.includes("invalid_request_error")
  );
}

function isRateLimitError(error: any) {
  const message = String(
    error?.message || error || ""
  ).toLowerCase();

  return (
    error?.status === 429 ||
    message.includes("rate limit") ||
    message.includes("rate_limit_exceeded") ||
    message.includes("tokens per day") ||
    message.includes("tokens per minute") ||
    message.includes("tpm") ||
    message.includes("tpd")
  );
}

export async function groqChatCompletion(options: {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  temperature?: number;
  max_tokens?: number;
}) {
  let lastError: unknown;

  for (const model of GROQ_MODELS) {
    try {
      console.log(
        `[Groq] Requesting model: ${model}`
      );

      return await groq.chat.completions.create({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0,
        max_tokens: options.max_tokens ?? 1600,
      });
    } catch (error) {
      lastError = error;

      if (isMissingModelError(error)) {
        console.warn(
          `[Groq] Model unavailable: ${model}. Trying next model.`
        );
        continue;
      }

      if (isRateLimitError(error)) {
        console.warn(
          `[Groq] Rate limit reached for model ${model}.`
        );
        throw error;
      }

      throw error;
    }
  }

  throw lastError;
}