"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";

import {
  loginAction,
  requestPasswordResetAction,
  updatePasswordAction,
  type LoginActionState,
} from "@/lib/auth/actions";

function PendingButton({
  children,
  pendingLabel,
}: {
  children: React.ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      aria-busy={pending}
      className="button button-primary"
      disabled={pending}
      type="submit"
    >
      {pending && <span aria-hidden="true" className="button-spinner" />}
      {pending ? pendingLabel : children}
    </button>
  );
}

function LoginFields({ next }: { next: string }) {
  const { pending } = useFormStatus();
  const [email, setEmail] = useState("");

  return (
    <fieldset aria-busy={pending} disabled={pending}>
      <input name="next" type="hidden" value={next} />
      <label>
        <span>Email</span>
        <input
          autoComplete="email"
          inputMode="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
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
      <PendingButton pendingLabel="Signing in...">Sign in</PendingButton>
      <span aria-live="polite" className="sr-only">
        {pending ? "Signing in..." : ""}
      </span>
    </fieldset>
  );
}

export function LoginForm({
  next,
  initialState,
}: {
  next: string;
  initialState?: LoginActionState;
}) {
  const [state, formAction] = useActionState(
    loginAction,
    initialState ?? { error: null },
  );

  return (
    <form action={formAction} className="form-stack" aria-label="Sign in">
      <LoginFields next={next} />
      {state.error && (
        <p className="notice notice-error" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}

function RecoveryFields({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <fieldset aria-busy={pending} disabled={pending}>
      {children}
    </fieldset>
  );
}

function PendingStatus({ message }: { message: string }) {
  const { pending } = useFormStatus();

  return (
    <span aria-live="polite" className="sr-only">
      {pending ? message : ""}
    </span>
  );
}

export function PasswordResetForm() {
  return (
    <form action={requestPasswordResetAction} className="form-stack" aria-label="Password recovery">
      <RecoveryFields>
        <label>
          <span>Email</span>
          <input autoComplete="email" name="email" required type="email" />
        </label>
        <PendingButton pendingLabel="Sending reset link...">
          Send reset instructions
        </PendingButton>
        <PendingStatus message="Sending reset link..." />
      </RecoveryFields>
    </form>
  );
}

export function PasswordUpdateForm() {
  return (
    <form action={updatePasswordAction} className="form-stack" aria-label="Update password">
      <RecoveryFields>
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
        <PendingButton pendingLabel="Saving password...">
          Save password
        </PendingButton>
        <PendingStatus message="Saving password..." />
      </RecoveryFields>
    </form>
  );
}
