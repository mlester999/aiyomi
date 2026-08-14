import { useRouter } from "expo-router";

import { IntroStoryScreen } from "../../src/features/intro/IntroStoryScreen";

export default function PlanAroundLifeScreen() {
  const router = useRouter();
  return (
    <IntroStoryScreen
      body="Shape priorities around your time, commitments, and the days when plans need to change."
      current={2}
      heading="Plan a day that actually fits your life."
      onPrimary={() => router.push("/intro/focus")}
      onSecondary={() => router.back()}
      preview="plan"
      primaryLabel="Continue"
      secondaryLabel="Back"
    />
  );
}
