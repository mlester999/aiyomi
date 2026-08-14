import { useRouter } from "expo-router";

import { IntroStoryScreen } from "../../src/features/intro/IntroStoryScreen";

export default function FocusAndGrowScreen() {
  const router = useRouter();
  return (
    <IntroStoryScreen
      body="Aiyomi can help you make space for focused work and celebrate progress that happens in real life."
      current={3}
      heading="Focus together. Grow together."
      onPrimary={() => router.push("/intro/learn")}
      onSecondary={() => router.back()}
      preview="focus"
      primaryLabel="Continue"
      secondaryLabel="Back"
    />
  );
}
