// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/actions", () => ({
  loginAction: vi.fn(),
  requestPasswordResetAction: vi.fn(),
  updatePasswordAction: vi.fn(),
}));

import {
  LoginForm,
  PasswordResetForm,
  PasswordUpdateForm,
} from "@/components/auth-forms";

describe("admin authentication forms", () => {
  afterEach(cleanup);

  it("keeps sign-in controls labeled and scoped to the requested destination", () => {
    render(<LoginForm next="/dashboard" />);

    expect(screen.getByRole("form", { name: "Sign in" })).toBeTruthy();
    expect(screen.getByLabelText("Email").getAttribute("autocomplete")).toBe("email");
    expect(screen.getByLabelText("Password").getAttribute("autocomplete")).toBe("current-password");
    expect(screen.getByDisplayValue("/dashboard").getAttribute("name")).toBe("next");
    expect(screen.getByRole("button", { name: "Sign in" }).getAttribute("aria-busy")).toBe("false");
  });

  it("exposes recovery and password update forms with appropriate autocomplete", () => {
    render(
      <>
        <PasswordResetForm />
        <PasswordUpdateForm />
      </>,
    );

    expect(screen.getByRole("form", { name: "Password recovery" })).toBeTruthy();
    expect(screen.getByRole("form", { name: "Update password" })).toBeTruthy();
    expect(screen.getAllByLabelText("Email")[0].getAttribute("autocomplete")).toBe("email");
    expect(screen.getAllByLabelText("New password")[0].getAttribute("autocomplete")).toBe("new-password");
    expect(screen.getByLabelText("Confirm new password").getAttribute("autocomplete")).toBe("new-password");
  });
});
