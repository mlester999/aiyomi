import {
  Constants,
  type Database,
  type Enums,
  type Json,
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "@aiyomi/database";
import { describe, expect, expectTypeOf, it } from "vitest";

type Phase3TableName =
  | "profiles"
  | "companion_definitions"
  | "user_companions"
  | "life_area_definitions"
  | "user_life_areas"
  | "life_role_definitions"
  | "user_life_roles"
  | "user_schedule_preferences"
  | "fixed_commitments"
  | "onboarding_intentions"
  | "obstacle_definitions"
  | "user_obstacles"
  | "notification_preferences"
  | "device_push_tokens";

describe("Phase 3 generated database contract", () => {
  it("exposes every normalized table", () => {
    type MissingPhase3Table = Exclude<
      Phase3TableName,
      keyof Database["public"]["Tables"]
    >;

    expectTypeOf<MissingPhase3Table>().toEqualTypeOf<never>();
  });

  it("keeps profile onboarding state strongly typed", () => {
    expectTypeOf<Tables<"profiles">["onboarding_status"]>().toEqualTypeOf<
      Enums<"mobile_onboarding_status">
    >();
    expectTypeOf<Tables<"profiles">["onboarding_step"]>().toEqualTypeOf<
      Enums<"mobile_onboarding_step"> | null
    >();
    expectTypeOf<
      Tables<"profiles">["onboarding_completed_at"]
    >().toEqualTypeOf<string | null>();
    expectTypeOf<
      TablesInsert<"profiles">["onboarding_status"]
    >().toEqualTypeOf<Enums<"mobile_onboarding_status"> | undefined>();
  });

  it("keeps generated enum constants aligned with migration vocabulary", () => {
    expect(Constants.public.Enums.mobile_onboarding_status).toEqual([
      "not_started",
      "in_progress",
      "completed",
    ]);
    expect(Constants.public.Enums.mobile_onboarding_step).toEqual([
      "preferred_name",
      "companion_selection",
      "companion_name",
      "companion_personality",
      "life_areas",
      "normal_day",
      "life_roles",
      "fixed_commitments",
      "improvement_focus",
      "obstacles",
      "energy_baseline",
      "notification_setup",
    ]);
    expect(Constants.public.Enums.companion_personality).toEqual([
      "gentle",
      "balanced",
      "coach",
    ]);
    expect(Constants.public.Enums.pre_auth_intent).toHaveLength(6);
    expect(Constants.public.Enums.energy_baseline).toHaveLength(5);
    expect(Constants.public.Enums.mobile_device_platform).toEqual([
      "ios",
      "android",
    ]);
    expect(Constants.public.Enums.notification_permission_status).toEqual([
      "undetermined",
      "granted",
      "denied",
      "unavailable",
    ]);
  });

  it("models progressive notification permission before a token exists", () => {
    expectTypeOf<
      Tables<"device_push_tokens">["expo_push_token"]
    >().toEqualTypeOf<string | null>();
    expectTypeOf<
      TablesInsert<"device_push_tokens">["expo_push_token"]
    >().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<
      Tables<"device_push_tokens">["permission_status"]
    >().toEqualTypeOf<Enums<"notification_permission_status">>();
  });

  it("exposes editable custom obstacles and explicit notification choices", () => {
    expectTypeOf<
      TablesUpdate<"user_obstacles">["custom_label"]
    >().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<
      Tables<"notification_preferences">["morning_plan"]
    >().toEqualTypeOf<boolean>();
    expectTypeOf<
      Tables<"notification_preferences">["quiet_start"]
    >().toEqualTypeOf<string>();
    expectTypeOf<
      Tables<"notification_preferences">["timezone"]
    >().toEqualTypeOf<string | null>();
  });

  it("exposes caller-scoped onboarding RPCs", () => {
    type EnsureProfile =
      Database["public"]["Functions"]["ensure_mobile_profile"];
    type CompleteOnboarding =
      Database["public"]["Functions"]["complete_mobile_onboarding"];

    expectTypeOf<EnsureProfile["Args"]>().toEqualTypeOf<never>();
    expectTypeOf<EnsureProfile["Returns"]>().toEqualTypeOf<Json>();
    expectTypeOf<CompleteOnboarding["Args"]>().toEqualTypeOf<never>();
    expectTypeOf<CompleteOnboarding["Returns"]>().toEqualTypeOf<Json>();
  });
});
