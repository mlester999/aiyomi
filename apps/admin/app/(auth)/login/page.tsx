import type { Metadata } from "next";
import Link from "next/link";

import { loginAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Sign in" };

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const rawError = typeof params.error === "string" ? params.error : undefined;
  const next = typeof params.next === "string" ? params.next : "/";
  const error = rawError
    ? rawError === "reset-link"
      ? "That reset link is no longer valid. Request a new one."
      : rawError
    : null;

  return (
    <>
      <div className="auth-heading">
        <span className="eyebrow">Secure operations</span>
        <h1>Aiyomi Admin</h1>
        <p>Sign in with your authorized team account.</p>
      </div>

      {params.signedOut === "1" && (
        <p className="notice notice-success" role="status">
          You have been signed out.
        </p>
      )}
      {params.reason === "config" && (
        <p className="notice notice-error" role="alert">
          This admin environment is not configured yet.
        </p>
      )}
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}

      <form action={loginAction} className="form-stack">
        <input name="next" type="hidden" value={next} />
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            required
            type="email"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </label>
        <button className="button button-primary" type="submit">
          Sign in
        </button>
      </form>

      <Link className="text-link auth-link" href="/forgot-password">
        Forgot your password?
      </Link>
    </>
  );
}
