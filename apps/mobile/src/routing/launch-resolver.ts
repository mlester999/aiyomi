import type { MobileProfile } from "../data/types";

export type LaunchState =
  | "BOOTSTRAPPING"
  | "SIGNED_OUT_NEW"
  | "SIGNED_OUT_RETURNING"
  | "AUTHENTICATED_ONBOARDING_INCOMPLETE"
  | "AUTHENTICATED_ONBOARDING_COMPLETE";

export interface LaunchResolverInput {
  bootstrapComplete: boolean;
  hasSeenIntro: boolean;
  hasSession: boolean;
  profile: Pick<MobileProfile, "onboarding_status"> | null;
}

export interface SessionBoundaryInput {
  allowCompletionHandoff?: boolean;
  hasSession: boolean;
  leaf?: string;
  onboardingStatus?: MobileProfile["onboarding_status"];
  root: string;
}

export const resolveLaunchState = ({
  bootstrapComplete,
  hasSeenIntro,
  hasSession,
  profile,
}: LaunchResolverInput): LaunchState => {
  if (!bootstrapComplete) return "BOOTSTRAPPING";
  if (!hasSession) {
    return hasSeenIntro ? "SIGNED_OUT_RETURNING" : "SIGNED_OUT_NEW";
  }

  return profile?.onboarding_status === "completed"
    ? "AUTHENTICATED_ONBOARDING_COMPLETE"
    : "AUTHENTICATED_ONBOARDING_INCOMPLETE";
};

export const routeForLaunchState = (state: LaunchState): string => {
  switch (state) {
    case "SIGNED_OUT_NEW":
      return "/intro/meet";
    case "SIGNED_OUT_RETURNING":
      return "/auth/welcome";
    case "AUTHENTICATED_ONBOARDING_INCOMPLETE":
      return "/onboarding";
    case "AUTHENTICATED_ONBOARDING_COMPLETE":
      return "/today";
    case "BOOTSTRAPPING":
      return "/";
  }
};

export const redirectForSessionBoundary = ({
  allowCompletionHandoff = false,
  hasSession,
  leaf,
  onboardingStatus,
  root,
}: SessionBoundaryInput): string | null => {
  const isPrivateRoute =
    root === "(tabs)" || root === "settings" || root === "onboarding";

  if (!hasSession && isPrivateRoute) return "/";

  if (
    hasSession &&
    onboardingStatus !== "completed" &&
    (root === "(tabs)" || root === "settings")
  ) {
    return "/";
  }

  const isCompletionHandoff =
    allowCompletionHandoff && (leaf === "preparing" || leaf === "welcome");
  if (
    hasSession &&
    onboardingStatus === "completed" &&
    root === "onboarding" &&
    !isCompletionHandoff
  ) {
    return "/today";
  }

  return null;
};
