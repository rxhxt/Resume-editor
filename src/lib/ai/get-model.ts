import {
  google,
  createGoogleGenerativeAI,
} from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { AiProvider } from "@/stores/settings-store";

export function getModel(provider: AiProvider, apiKey?: string) {
  switch (provider) {
    case "openai": {
      const client = createOpenAI({ apiKey });
      return client("gpt-4o");
    }
    case "anthropic": {
      const client = createAnthropic({ apiKey });
      return client("claude-sonnet-4-20250514");
    }
    case "google": {
      const client = createGoogleGenerativeAI({ apiKey });
      return client("gemini-2.5-flash");
    }
    default:
      return google("gemini-2.5-flash");
  }
}
