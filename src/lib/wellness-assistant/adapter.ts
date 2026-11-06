/**
 * Seam for a later language model.
 * The prepared library is what runs now. This adapter stays disabled and
 * does not call a network, a paid model, or a speech service.
 */
export const PREPARED_LIBRARY_ADAPTER = {
  enabled: false as const,
  provider: "none" as const,
  name: "prepared-library",
  description:
    "Answers come from the local prepared library. A later model adapter is disabled and is not called.",
};

export function adapterStatusLabel(): string {
  return PREPARED_LIBRARY_ADAPTER.enabled
    ? "The language-model adapter is not implemented. Prepared answers are still used."
    : "Prepared answers from the LifeZoi library. No language model is connected.";
}

export async function completeWithModel(prompt: string): Promise<{ ok: false; error: string }> {
  if (PREPARED_LIBRARY_ADAPTER.enabled) {
    return {
      ok: false,
      error: "The language-model adapter is not implemented. Prepared answers are still used.",
    };
  }
  const rejected = prompt.trim()
    ? "The language-model adapter is disabled. LifeZoi is showing prepared answers only."
    : "The language-model adapter is disabled. LifeZoi is showing prepared answers only.";
  return { ok: false, error: rejected };
}
