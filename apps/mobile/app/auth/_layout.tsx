import { Stack } from "expo-router";

import { useReducedMotion } from "../../src/accessibility/useReducedMotion";

export default function AuthLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        animation: reducedMotion ? "none" : "slide_from_right",
        headerShown: false,
      }}
    />
  );
}
