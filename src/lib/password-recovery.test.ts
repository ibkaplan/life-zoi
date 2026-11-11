import { describe, expect, it } from "vitest";
import {
  emailRequestMessage,
  hasRecoveryParams,
  isEmailAddress,
  passwordChangeMessage,
  recoveryLinkProblem,
  resetRedirectUrl,
  validateNewPassword,
} from "@/lib/password-recovery";

describe("resetRedirectUrl", () => {
  it("points at the reset page on the same origin", () => {
    expect(resetRedirectUrl("https://www.lifezoi.com")).toBe("https://www.lifezoi.com/reset-password");
    expect(resetRedirectUrl("http://localhost:3000")).toBe("http://localhost:3000/reset-password");
  });

  it("drops any path or query from the origin", () => {
    expect(resetRedirectUrl("https://example.org/settings?x=1")).toBe("https://example.org/reset-password");
  });

  it("refuses other schemes and junk", () => {
    expect(resetRedirectUrl("javascript:alert(1)")).toBeNull();
    expect(resetRedirectUrl("not a url")).toBeNull();
  });
});

describe("validateNewPassword", () => {
  it("checks length and that both entries match", () => {
    expect(validateNewPassword("short", "short")).toMatch(/at least 8/);
    expect(validateNewPassword("x".repeat(73), "x".repeat(73))).toMatch(/72/);
    expect(validateNewPassword("long enough", "long enougj")).toMatch(/do not match/);
    expect(validateNewPassword("long enough", "long enough")).toBeNull();
  });
});

describe("isEmailAddress", () => {
  it("accepts a normal address and rejects obvious mistakes", () => {
    expect(isEmailAddress(" person@example.org ")).toBe(true);
    expect(isEmailAddress("person@example")).toBe(false);
    expect(isEmailAddress("")).toBe(false);
  });
});

describe("emailRequestMessage", () => {
  it("gives no hint about whether an account exists", () => {
    expect(emailRequestMessage(null)).toBeNull();
    expect(emailRequestMessage({ code: "user_not_found", message: "User not found", status: 400 })).toBeNull();
    expect(emailRequestMessage({ message: "Something else", status: 500 })).toBeNull();
  });

  it("explains rate limits and invalid addresses", () => {
    expect(emailRequestMessage({ code: "over_email_send_rate_limit", status: 429 })).toMatch(/Too many/);
    expect(emailRequestMessage({ status: 429 })).toMatch(/Too many/);
    expect(emailRequestMessage({ code: "email_address_invalid" })).toMatch(/valid email/);
  });
});

describe("passwordChangeMessage", () => {
  it("maps known Supabase codes to plain wording", () => {
    expect(passwordChangeMessage({ code: "same_password" })).toMatch(/different/);
    expect(passwordChangeMessage({ code: "weak_password" })).toMatch(/easy to guess/);
    expect(passwordChangeMessage({ code: "reauthentication_needed" })).toMatch(/sign in again/);
    expect(passwordChangeMessage({ code: "insufficient_aal" })).toMatch(/authenticator/);
    expect(passwordChangeMessage({ status: 401 })).toMatch(/new reset link/);
    expect(passwordChangeMessage({ status: 429 })).toMatch(/Too many/);
  });

  it("never echoes raw provider text", () => {
    const text = passwordChangeMessage({ message: "internal error near jwt eyJabc", status: 500 });
    expect(text).toBe("The password could not be changed. Try again.");
  });
});

describe("recovery link parsing", () => {
  it("spots an expired link in the hash or the query", () => {
    expect(recoveryLinkProblem("", "#error=access_denied&error_code=otp_expired")).toMatch(/expired/);
    expect(recoveryLinkProblem("?error=access_denied&error_code=otp_expired", "")).toMatch(/expired/);
    expect(recoveryLinkProblem("?error=server_error", "")).toMatch(/could not be used/);
    expect(recoveryLinkProblem("?code=abc", "")).toBeNull();
  });

  it("recognizes a PKCE code or an implicit recovery token", () => {
    expect(hasRecoveryParams("?code=abc", "")).toBe(true);
    expect(hasRecoveryParams("", "#access_token=x&type=recovery")).toBe(true);
    expect(hasRecoveryParams("", "")).toBe(false);
  });
});
