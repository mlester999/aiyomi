import type { Metadata } from "next";

import { updatePasswordAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Choose a new password" };

interface UpdatePasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <>
      <div className="auth-heading">
        <span className="eyebrow">Account recovery</span>
        <h1>Choose a new password</h1>
        <p>Use at least 12 characters and keep it unique to Aiyomi.</p>
      </div>
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      <form action={updatePasswordAction} className="form-stack">
        <label>
          <span>New password</span>
          <input
            autoComplete="new-password"
            minLength={12}
            name="password"
            required
            type="password"
          />
        </label>
        <label>
          <span>Confirm new password</span>
          <input
            autoComplete="new-password"
            minLength={12}
            name="passwordConfirmation"
            required
            type="password"
          />
        </label>
        <button className="button button-primary" type="submit">
          Save password
        </button>
      </form>
    </>
  );
}
