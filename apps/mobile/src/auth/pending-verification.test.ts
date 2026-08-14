import { beforeEach, describe, expect, it } from "vitest";

import {
  clearPendingVerificationEmail,
  readPendingVerificationEmail,
  rememberPendingVerificationEmail,
} from "./pending-verification";

describe("pending verification email", () => {
  beforeEach(clearPendingVerificationEmail);

  it("keeps a normalized email outside route parameters", () => {
    rememberPendingVerificationEmail("  Person@Example.COM  ");

    expect(readPendingVerificationEmail()).toBe("person@example.com");
  });

  it("clears the email after the verification flow", () => {
    rememberPendingVerificationEmail("person@example.com");
    clearPendingVerificationEmail();

    expect(readPendingVerificationEmail()).toBeNull();
  });
});
