import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { IntroStoryScreen } from "../../src/features/intro/IntroStoryScreen";
import { useApp } from "../../src/providers/AppProvider";

export default function MeetAiyomiScreen() {
  const router = useRouter();
  const { finishIntro, hasSeenIntro } = useApp();

  useEffect(() => {
    trackMobileEvent(ANALYTICS_EVENTS.INTRO_STARTED, {
      source: hasSeenIntro ? "revisit" : "first_launch",
    });
  }, [hasSeenIntro]);

  return (
    <IntroStoryScreen
      body="Plan your day, focus on what matters, and grow with a companion that learns what works for you."
      current={1}
      heading="Your AI companion for better days."
      onPrimary={() => router.push("/intro/plan")}
      onSecondary={() => {
        trackMobileEvent(ANALYTICS_EVENTS.INTRO_COMPLETED, {
          intentProvided: false,
          outcome: "skipped",
        });
        void finishIntro().then(() => router.replace("/auth/welcome"));
      }}
      preview="companion"
      primaryLabel="Continue"
      secondaryLabel="Skip"
    />
  );
}
