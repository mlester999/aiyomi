import { describe, expect, it } from "vitest";

import {
  ONBOARDING_PAGES,
  nextOnboardingPage,
  onboardingPageNumber,
  pageForPersistedStep,
  previousOnboardingPage,
} from "./model";

describe("onboarding progression", () => {
  it("presents eight short pages", () => {
    expect(ONBOARDING_PAGES).toHaveLength(8);
    expect(onboardingPageNumber("normal_day")).toBe(5);
  });

  it("maps combined persisted steps to the correct resumable page", () => {
    expect(pageForPersistedStep("companion_personality")).toBe("companion_name");
    expect(pageForPersistedStep("life_roles")).toBe("normal_day");
    expect(pageForPersistedStep("obstacles")).toBe("improvement_focus");
    expect(pageForPersistedStep(null)).toBe("preferred_name");
  });

  it("moves forward and backward without crossing the flow boundary", () => {
    expect(nextOnboardingPage("preferred_name")).toBe("companion_selection");
    expect(nextOnboardingPage("notification_setup")).toBeNull();
    expect(previousOnboardingPage("preferred_name")).toBeNull();
    expect(previousOnboardingPage("life_areas")).toBe("companion_name");
  });
});
