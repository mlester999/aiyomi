import type { Metadata } from "next";

import { PasswordUpdateForm } from "@/components/auth-forms";

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
      <PasswordUpdateForm />
    </>
  );
}
