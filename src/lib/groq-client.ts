import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/** Groq retired llama-3.3-70b-versatile on 16 Aug 2026. */
const GROQ_MODELS = [
  import.meta.env.VITE_GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
].filter((model): model is string => Boolean(model && String(model).trim()));

function isMissingModelError(error: any) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    error?.status === 404 ||
    message.includes("does not exist") ||
    message.includes("model_not_found") ||
    message.includes("invalid_request_error")
  );
}

export async function groqChatCompletion(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature?: number;
  max_tokens?: number;
}) {
  let lastError: unknown;

  for (const model of GROQ_MODELS) {
    try {
      return await groq.chat.completions.create({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0,
        // Structured extraction JSON (skills/experience/education/projects/
        // certifications for both candidate and job) can run long for
        // detailed resumes. Without an explicit budget, some models default
        // to a low cap and cut the JSON off mid-string. 4096 gives enough
        // headroom for a large resume + JD extraction while still capping
        // runaway output.
        max_tokens: options.max_tokens ?? 4096,
      });
    } catch (error) {
      lastError = error;
      if (isMissingModelError(error)) continue;
      throw error;
    }
  }

  throw lastError;
}