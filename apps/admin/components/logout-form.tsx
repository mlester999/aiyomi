"use client";

import { useFormStatus } from "react-dom";

import { logoutAction } from "@/lib/auth/actions";

export function LogoutForm({ className = "button button-secondary button-full" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <LogoutButton className={className} />
    </form>
  );
}

function LogoutButton({ className }: { className: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={className}
      disabled={pending}
      type="submit"
    >
      {pending && <span aria-hidden="true" className="button-spinner" />}
      {pending ? "Signing out..." : "Sign out"}
    </button>
  );
}
