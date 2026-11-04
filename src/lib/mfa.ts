export function needsSecondFactor(current: string | null, next: string | null): boolean {
  return current === "aal1" && next === "aal2";
}

export function isTotpCode(code: string): boolean {
  return /^\d{6}$/.test(code.trim());
}

export function authenticatorQrSrc(qrCode: string): string {
  const value = qrCode.trim();
  if (!value || /[\u0000-\u001F]/.test(value)) return "";
  if (value.startsWith("data:image/")) return value;
  return `data:image/svg+xml;utf-8,${encodeURIComponent(value)}`;
}

export function authenticatorQrMarkup(qrCode: string): string {
  const value = qrCode.trim();
  let svg = value;
  if (value.startsWith("data:image/svg+xml")) {
    const comma = value.indexOf(",");
    if (comma < 0) return "";
    const meta = value.slice(0, comma);
    const payload = value.slice(comma + 1);
    try {
      if (meta.includes(";base64")) {
        if (typeof atob !== "function") return "";
        svg = atob(payload);
      } else {
        svg = decodeURIComponent(payload);
      }
    } catch {
      svg = payload;
    }
  }
  const trimmed = svg.trim();
  if (!/^<svg[\s>]/i.test(trimmed) || !/<\/svg>\s*$/i.test(trimmed)) return "";
  if (/<script|foreignobject|javascript:|on[a-z]+\s*=/i.test(trimmed)) return "";
  return trimmed;
}

export function validateAccountCredentials(email: string, password: string): string | null {
  const normalized = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 320) {
    return "Enter a valid email address.";
  }
  if (password.length < 8) return "Use at least 8 characters for the password.";
  if (password.length > 72) return "Use 72 characters or fewer for the password.";
  return null;
}

export function publicAuthMessage(message: string | undefined, fallback: string): string {
  const text = message?.replace(/\s+/g, " ").trim() ?? "";
  if (!text || /bearer|service_role|anon|secret|jwt|token|password/i.test(text)) return fallback;
  return text.slice(0, 180);
}
