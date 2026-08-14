const OFFLINE_PATTERNS = ["network", "fetch", "offline", "timeout"];

export const safeAuthError = (error: unknown): string => {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (OFFLINE_PATTERNS.some((pattern) => message.includes(pattern))) {
    return "We couldn't reach Aiyomi. Check your connection and try again.";
  }

  if (message.includes("email not confirmed")) {
    return "Please verify your email before signing in.";
  }

  if (message.includes("invalid login credentials")) {
    return "We couldn't sign you in. Check your details and try again.";
  }

  if (message.includes("already registered") || message.includes("already exists")) {
    return "We couldn't create that account. Try signing in or use another sign-in method.";
  }

  if (message.includes("rate") || message.includes("too many")) {
    return "Aiyomi needs a short pause. Please try again in a few minutes.";
  }

  return "Something didn't work yet. Please try again.";
};
