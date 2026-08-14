import { describe, expect, it } from "vitest";

import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validatePassword,
  validateSignUp,
} from "./validation";

describe("mobile auth validation", () => {
  it("validates email without normalizing a value into analytics", () => {
    expect(validateEmail("not-an-email")).toBe("Enter a valid email address.");
    expect(validateEmail("person@example.com")).toBeUndefined();
  });

  it("uses the current 12-character account policy", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(12);
    expect(validatePassword("short")).toContain("12");
    expect(validatePassword("a-safe-passphrase")).toBeUndefined();
  });

  it("requires matching signup confirmation", () => {
    expect(validateSignUp("person@example.com", "a-safe-passphrase", "different"))
      .toMatchObject({ confirmation: "Passwords need to match." });
  });
});
