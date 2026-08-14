import { Stack } from "expo-router";

import { useReducedMotion } from "../../src/accessibility/useReducedMotion";

export default function OnboardingLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        animation: reducedMotion ? "none" : "fade_from_bottom",
        headerShown: false,
      }}
    />
  );
}
