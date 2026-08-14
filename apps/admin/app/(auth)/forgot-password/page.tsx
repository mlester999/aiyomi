import type { Metadata } from "next";
import Link from "next/link";

import { PasswordResetForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Reset password" };

interface ForgotPasswordPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <>
      <div className="auth-heading">
        <span className="eyebrow">Account recovery</span>
        <h1>Reset your password</h1>
        <p>We will email recovery instructions if the account is eligible.</p>
      </div>

      {params.sent === "1" ? (
        <p className="notice notice-success" role="status">
          If that account can be recovered, a reset email is on its way.
        </p>
      ) : (
        <PasswordResetForm />
      )}

      <Link className="text-link auth-link" href="/login">
        Return to sign in
      </Link>
    </>
  );
}
