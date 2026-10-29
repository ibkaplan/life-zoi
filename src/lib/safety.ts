const BANNED: RegExp[] = [
  /\d+(?:\.\d+)?\s*%/,
  /\bpercent\b/i,
  /risk reduction/i,
  /\b\d+\s+years\b/i,
  /date of death/i,
  /life expectancy/i,
  /\byou will live\b/i,
  /guaranteed/i,
  /\bdiagnos/i,
  /prescription/i,
  /lower(?:s|ing)? your risk by/i,
];

export function findUnsafeClaims(text: string): string[] {
  return BANNED.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}
