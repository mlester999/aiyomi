import type { Metadata } from "next";
import Link from "next/link";

import { LogoutForm } from "@/components/logout-form";

export const metadata: Metadata = { title: "Access unavailable" };

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const permissionDenied = params.reason === "permission";

  return (
    <>
      <div className="auth-heading">
        <span className="eyebrow">Access unavailable</span>
        <h1>
          {permissionDenied
            ? "This area is not included in your role"
            : "This account cannot open Aiyomi Admin"}
        </h1>
        {permissionDenied ? (
          <p>Return home to open the first workspace available to your role.</p>
        ) : (
          <p>
            An active admin membership is required. Ask an Aiyomi owner if you
            believe this is unexpected.
          </p>
        )}
      </div>
      {permissionDenied && (
        <Link className="button button-primary button-full" href="/">
          Open my workspace
        </Link>
      )}
      <LogoutForm />
      <Link className="text-link auth-link" href="/login">
        Return to sign in
      </Link>
    </>
  );
}
