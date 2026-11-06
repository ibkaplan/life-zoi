import { MODEL_CONFIGURED_NOTE, MODEL_NOT_CONFIGURED } from "@/lib/wellness-assistant/copy";

/**
 * The prepared library is the fallback. The free model is called only from
 * the server route when GEMINI_API_KEY is set. This module does not read a key.
 */
export const PREPARED_LIBRARY_ADAPTER = {
  enabled: true,
  provider: "gemini" as const,
  name: "prepared-library-fallback",
  description:
    "Prepared answers remain available. The free Gemini model is used only by the server when GEMINI_API_KEY is set.",
};

export function adapterStatusLabel(configured = false): string {
  return configured ? MODEL_CONFIGURED_NOTE : MODEL_NOT_CONFIGURED;
}
