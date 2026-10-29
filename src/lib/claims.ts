const PROHIBITED_CLAIM =
  /date of death|you will die|life expectancy|lifespan|years of life|add(?:ing)?\s+\d*\s*years|\byears?\s+added\b|\b\d+\s*%|\bpercent\b/i;

export function containsProhibitedClaim(text: string): boolean {
  return PROHIBITED_CLAIM.test(text);
}

export function assertEducationalCopy(parts: string[]): string | null {
  const combined = parts.filter(Boolean).join("\n");
  if (!containsProhibitedClaim(combined)) return null;
  return "The detailed illustration was withheld because it did not pass an internal wording check. No personal prediction is available.";
}
