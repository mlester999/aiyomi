import { Stack, type Href, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useReducedMotion } from "../src/accessibility/useReducedMotion";
import { AppProvider, useApp } from "../src/providers/AppProvider";
import { redirectForSessionBoundary } from "../src/routing/launch-resolver";

void SplashScreen.preventAutoHideAsync();

function SessionBoundary() {
  const {
    bootstrapComplete,
    session,
    profile,
  } = useApp();
  const segments = useSegments();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const onboardingHandoffRef = useRef(false);

  useEffect(() => {
    if (!bootstrapComplete) return;
    void SplashScreen.hideAsync();

    const root = String(segments[0] ?? "");
    const leaf = String(segments[1] ?? "");
    if (
      root === "onboarding" &&
      profile &&
      profile.onboarding_status !== "completed"
    ) {
      onboardingHandoffRef.current = true;
    }

    const redirect = redirectForSessionBoundary({
      allowCompletionHandoff: onboardingHandoffRef.current,
      hasSession: Boolean(session),
      leaf,
      onboardingStatus: profile?.onboarding_status,
      root,
    });
    if (root !== "onboarding") onboardingHandoffRef.current = false;
    if (redirect) router.replace(redirect as Href);
  }, [bootstrapComplete, profile?.onboarding_status, router, segments, session]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: reducedMotion ? "none" : "fade_from_bottom",
          contentStyle: { backgroundColor: "#FBF7EE" },
          headerShown: false,
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <SessionBoundary />
      </AppProvider>
    </SafeAreaProvider>
  );
}
