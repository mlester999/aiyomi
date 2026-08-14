"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  className = "button button-primary",
  confirmation,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
  confirmation?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (confirmation && !window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
      type="submit"
      >
      {pending && <span aria-hidden="true" className="button-spinner" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
