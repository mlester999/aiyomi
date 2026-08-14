import type {
  EnergyBaseline,
  LifeRoleKey,
  NotificationPreferenceValues,
  ObstacleKey,
  PreAuthIntent,
} from "@aiyomi/types";

import type {
  CompanionDefinition,
  FixedCommitment,
  LifeAreaDefinition,
  MobileProfile,
  NotificationPreferences,
  UserCompanion,
} from "../data/types";
import { requireSupabase } from "../lib/supabase";
import type { EditableCommitment, OnboardingSnapshot } from "./types";

const defaultNotificationPreferences: NotificationPreferenceValues = {
  morning_plan: true,
  upcoming_activity: true,
  schedule_adjustments: true,
  focus_reminder: true,
  break_finished: true,
  daily_reflection: true,
  weekly_recap: true,
  streak_reminder: false,
  achievements: true,
};

const ensureNoError = (error: { message: string } | null) => {
  if (error) throw error;
};

export const onlyActiveDefinitions = <Definition extends { active: boolean }>(
  definitions: Definition[],
) => definitions.filter((definition) => definition.active);

export const loadOnboardingSnapshot = async (
  userId: string,
  preAuthIntent: PreAuthIntent | null,
  _timezone: string,
  _locale: string | null,
): Promise<OnboardingSnapshot> => {
  const client = requireSupabase();
  const [
    profileResult,
    companionsResult,
    userCompanionResult,
    lifeDefinitionsResult,
    lifeAreasResult,
    scheduleResult,
    roleDefinitionsResult,
    rolesResult,
    commitmentsResult,
    intentionResult,
    obstaclesResult,
    notificationResult,
  ] = await Promise.all([
    client.from("profiles").select("*").eq("id", userId).single(),
    client
      .from("companion_definitions")
      .select("*")
      .eq("active", true)
      .order("sort_order"),
    client.from("user_companions").select("*").eq("user_id", userId).maybeSingle(),
    client
      .from("life_area_definitions")
      .select("*")
      .eq("active", true)
      .order("sort_order"),
    client.from("user_life_areas").select("*").eq("user_id", userId),
    client.from("user_schedule_preferences").select("*").eq("user_id", userId).maybeSingle(),
    client
      .from("life_role_definitions")
      .select("id,key,active")
      .eq("active", true)
      .order("sort_order"),
    client.from("user_life_roles").select("life_role_definition_id").eq("user_id", userId),
    client.from("fixed_commitments").select("*").eq("user_id", userId).order("created_at"),
    client.from("onboarding_intentions").select("*").eq("user_id", userId).maybeSingle(),
    client.from("user_obstacles").select("obstacle_key,custom_label").eq("user_id", userId),
    client.from("notification_preferences").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  [
    profileResult,
    companionsResult,
    userCompanionResult,
    lifeDefinitionsResult,
    lifeAreasResult,
    scheduleResult,
    roleDefinitionsResult,
    rolesResult,
    commitmentsResult,
    intentionResult,
    obstaclesResult,
    notificationResult,
  ].forEach((result) => ensureNoError(result.error));

  const profile = profileResult.data as MobileProfile;
  const companionDefinitions = onlyActiveDefinitions(
    (companionsResult.data ?? []) as CompanionDefinition[],
  );
  const userCompanion = userCompanionResult.data as UserCompanion | null;
  const lifeAreaDefinitions = onlyActiveDefinitions(
    (lifeDefinitionsResult.data ?? []) as LifeAreaDefinition[],
  );
  const selectedLifeRows = (lifeAreasResult.data ?? []) as Array<{
    life_area_definition_id: string | null;
    custom_name: string | null;
  }>;
  const activeRoleDefinitions = onlyActiveDefinitions(
    (roleDefinitionsResult.data ?? []) as Array<{
      id: string;
      key: LifeRoleKey;
      active: boolean;
    }>,
  );
  const roleById = new Map(
    activeRoleDefinitions.map((role) => [role.id, role.key]),
  );
  const lifeRoles = ((rolesResult.data ?? []) as Array<{
    life_role_definition_id: string;
  }>)
    .map((role) => roleById.get(role.life_role_definition_id))
    .filter((role): role is LifeRoleKey => Boolean(role));
  const intention = intentionResult.data as {
    pre_auth_intent: PreAuthIntent | null;
    improvement_focus: string;
    energy_baseline: EnergyBaseline | null;
  } | null;
  const obstacleRows = (obstaclesResult.data ?? []) as Array<{
    obstacle_key: ObstacleKey;
    custom_label: string | null;
  }>;
  const notification = notificationResult.data as NotificationPreferences | null;
  const rawCommitments = (commitmentsResult.data ?? []) as FixedCommitment[];

  return {
    profile,
    companionDefinitions,
    userCompanion,
    lifeAreaDefinitions,
    activeLifeRoleKeys: activeRoleDefinitions.map((role) => role.key),
    rawCommitments,
    notificationPreferences: notification,
    values: {
      preferredName: profile.first_name ?? "",
      companionKey:
        companionDefinitions.find(
          (definition) => definition.id === userCompanion?.companion_definition_id,
        )?.key ?? null,
      companionDefinitionId: userCompanion?.companion_definition_id ?? null,
      companionName: userCompanion?.custom_name ?? "",
      personality: userCompanion?.personality ?? "balanced",
      lifeAreaKeys: selectedLifeRows
        .map((selection) =>
          lifeAreaDefinitions.find(
            (definition) => definition.id === selection.life_area_definition_id,
          )?.key,
        )
        .filter((key): key is string => Boolean(key)),
      customLifeAreas: selectedLifeRows
        .map((selection) => selection.custom_name)
        .filter((name): name is string => Boolean(name)),
      wakeTime: (scheduleResult.data as { wake_time?: string } | null)?.wake_time?.slice(0, 5) ?? "07:00",
      sleepTime: (scheduleResult.data as { sleep_time?: string } | null)?.sleep_time?.slice(0, 5) ?? "22:00",
      lifeRoles,
      commitments: rawCommitments.map((commitment) => ({
        id: commitment.id,
        title: commitment.title,
        daysOfWeek: commitment.days_of_week,
        startTime: commitment.start_time.slice(0, 5),
        endTime: commitment.end_time.slice(0, 5),
      })),
      improvementFocus: intention?.improvement_focus ?? "",
      obstacles: obstacleRows.map((row) => row.obstacle_key),
      customObstacle:
        obstacleRows.find((row) => row.obstacle_key === "something_else")
          ?.custom_label ?? "",
      energyBaseline: intention?.energy_baseline ?? null,
      preAuthIntent: intention?.pre_auth_intent ?? preAuthIntent,
      permissionStatus: "undetermined",
      notificationPreferences: {
        ...defaultNotificationPreferences,
        ...(notification
          ? Object.fromEntries(
              Object.keys(defaultNotificationPreferences).map((key) => [
                key,
                Boolean(notification[key as keyof NotificationPreferences]),
              ]),
            )
          : {}),
      } as NotificationPreferenceValues,
      quietHoursEnabled: notification?.quiet_hours_enabled ?? true,
      quietStart: notification?.quiet_start?.slice(0, 5) ?? "22:00",
      quietEnd: notification?.quiet_end?.slice(0, 5) ?? "07:00",
    },
  };
};

const advanceProfile = async (
  userId: string,
  nextStep: MobileProfile["onboarding_step"],
  extras: Record<string, unknown> = {},
) => {
  const { data, error } = await requireSupabase()
    .from("profiles")
    .update({
      ...extras,
      onboarding_status: "in_progress",
      onboarding_step: nextStep,
    })
    .eq("id", userId)
    .neq("onboarding_status", "completed")
    .select("id")
    .maybeSingle();
  ensureNoError(error);
  if (!data) {
    throw new Error("Completed onboarding cannot return to an editable step.");
  }
};

export const onboardingService = {
  async setCurrentStep(userId: string, step: MobileProfile["onboarding_step"]) {
    await advanceProfile(userId, step);
  },

  async savePreferredName(
    userId: string,
    firstName: string,
    timezone: string,
    locale: string | null,
  ) {
    await advanceProfile(userId, "companion_selection", {
      first_name: firstName.trim(),
      timezone,
      locale,
    });
  },

  async saveCompanionSelection(
    userId: string,
    definition: CompanionDefinition,
  ) {
    const { error } = await requireSupabase().from("user_companions").upsert(
      {
        user_id: userId,
        companion_definition_id: definition.id,
        custom_name: definition.name,
        personality: "balanced",
      },
      { onConflict: "user_id" },
    );
    ensureNoError(error);
    await advanceProfile(userId, "companion_name");
  },

  async saveCompanionDetails(
    userId: string,
    customName: string,
    personality: "gentle" | "balanced" | "coach",
    options: { advance?: boolean } = {},
  ) {
    const { error } = await requireSupabase()
      .from("user_companions")
      .update({ custom_name: customName.trim(), personality })
      .eq("user_id", userId);
    ensureNoError(error);
    if (options.advance !== false) await advanceProfile(userId, "life_areas");
  },

  async saveLifeAreas(
    userId: string,
    definitions: LifeAreaDefinition[],
    selectedKeys: string[],
    customNames: string[],
    options: { advance?: boolean } = {},
  ) {
    const client = requireSupabase();
    const { data: existing, error: existingError } = await client
      .from("user_life_areas")
      .select("id,life_area_definition_id,custom_name")
      .eq("user_id", userId);
    ensureNoError(existingError);
    const existingRows = (existing ?? []) as Array<{
      id: string;
      life_area_definition_id: string | null;
      custom_name: string | null;
    }>;
    const desiredDefinitionIds = definitions
      .filter((definition) => selectedKeys.includes(definition.key))
      .map((definition) => definition.id);
    const desiredCustomNames = customNames.map((name) => name.trim()).filter(Boolean);

    const missingDefinitions = desiredDefinitionIds.filter(
      (id) => !existingRows.some((row) => row.life_area_definition_id === id),
    );
    const missingCustom = desiredCustomNames.filter(
      (name) =>
        !existingRows.some(
          (row) => row.custom_name?.toLocaleLowerCase() === name.toLocaleLowerCase(),
        ),
    );
    if (missingDefinitions.length || missingCustom.length) {
      const { error } = await client.from("user_life_areas").insert([
        ...missingDefinitions.map((id) => ({
          user_id: userId,
          life_area_definition_id: id,
          custom_name: null,
        })),
        ...missingCustom.map((name) => ({
          user_id: userId,
          life_area_definition_id: null,
          custom_name: name,
        })),
      ]);
      ensureNoError(error);
    }
    const staleIds = existingRows
      .filter(
        (row) =>
          (row.life_area_definition_id &&
            !desiredDefinitionIds.includes(row.life_area_definition_id)) ||
          (row.custom_name &&
            !desiredCustomNames.some(
              (name) => name.toLocaleLowerCase() === row.custom_name?.toLocaleLowerCase(),
            )),
      )
      .map((row) => row.id);
    if (staleIds.length) {
      const { error } = await client
        .from("user_life_areas")
        .delete()
        .in("id", staleIds);
      ensureNoError(error);
    }
    if (options.advance !== false) await advanceProfile(userId, "normal_day");
  },

  async saveNormalDay(
    userId: string,
    wakeTime: string,
    sleepTime: string,
    timezone: string,
    roleKeys: LifeRoleKey[],
    options: { advance?: boolean } = {},
  ) {
    const client = requireSupabase();
    const { error: scheduleError } = await client
      .from("user_schedule_preferences")
      .upsert({
        user_id: userId,
        wake_time: wakeTime,
        sleep_time: sleepTime,
        timezone,
      });
    ensureNoError(scheduleError);
    const { data: definitions, error: definitionsError } = await client
      .from("life_role_definitions")
      .select("id,key,active")
      .eq("active", true);
    ensureNoError(definitionsError);
    const desiredIds = onlyActiveDefinitions(
      (definitions ?? []) as Array<{
        id: string;
        key: LifeRoleKey;
        active: boolean;
      }>,
    )
      .filter((role) => roleKeys.includes(role.key))
      .map((role) => role.id);
    const { data: existing, error: existingError } = await client
      .from("user_life_roles")
      .select("life_role_definition_id")
      .eq("user_id", userId);
    ensureNoError(existingError);
    const existingIds = ((existing ?? []) as Array<{ life_role_definition_id: string }>).map(
      (row) => row.life_role_definition_id,
    );
    const missingIds = desiredIds.filter((id) => !existingIds.includes(id));
    if (missingIds.length) {
      const { error } = await client.from("user_life_roles").insert(
        missingIds.map((id) => ({ user_id: userId, life_role_definition_id: id })),
      );
      ensureNoError(error);
    }
    const staleIds = existingIds.filter((id) => !desiredIds.includes(id));
    if (staleIds.length) {
      const { error } = await client
        .from("user_life_roles")
        .delete()
        .eq("user_id", userId)
        .in("life_role_definition_id", staleIds);
      ensureNoError(error);
    }
    if (options.advance !== false) {
      await advanceProfile(userId, "fixed_commitments");
    }
  },

  async saveCommitments(
    userId: string,
    commitments: EditableCommitment[],
    existingIds: string[],
    timezone: string,
    options: { advance?: boolean } = {},
  ) {
    const client = requireSupabase();
    const retainedIds: string[] = [];
    for (const commitment of commitments) {
      const payload = {
        id: commitment.id,
        user_id: userId,
        title: commitment.title.trim(),
        days_of_week: commitment.daysOfWeek,
        start_time: commitment.startTime,
        end_time: commitment.endTime,
        timezone,
        active: true,
      };
      const { error } = await client
        .from("fixed_commitments")
        .upsert(payload, { onConflict: "id" });
      ensureNoError(error);
      retainedIds.push(commitment.id);
    }
    const removedIds = existingIds.filter((id) => !retainedIds.includes(id));
    if (removedIds.length) {
      const { error } = await client
        .from("fixed_commitments")
        .delete()
        .eq("user_id", userId)
        .in("id", removedIds);
      ensureNoError(error);
    }
    if (options.advance !== false) {
      await advanceProfile(userId, "improvement_focus");
    }
  },

  async savePersonalization(
    userId: string,
    improvementFocus: string,
    preAuthIntent: PreAuthIntent | null,
    energyBaseline: EnergyBaseline | null,
    obstacles: ObstacleKey[],
    customObstacle: string,
  ) {
    const client = requireSupabase();
    const { error: intentionError } = await client
      .from("onboarding_intentions")
      .upsert({
        user_id: userId,
        improvement_focus: improvementFocus.trim(),
        pre_auth_intent: preAuthIntent,
        energy_baseline: energyBaseline,
      });
    ensureNoError(intentionError);
    const { data: existing, error: existingError } = await client
      .from("user_obstacles")
      .select("obstacle_key")
      .eq("user_id", userId);
    ensureNoError(existingError);
    const existingKeys = ((existing ?? []) as Array<{ obstacle_key: ObstacleKey }>).map(
      (row) => row.obstacle_key,
    );
    const missingKeys = obstacles.filter((key) => !existingKeys.includes(key));
    if (missingKeys.length) {
      const { error } = await client.from("user_obstacles").insert(
        missingKeys.map((key) => ({
          user_id: userId,
          obstacle_key: key,
          custom_label:
            key === "something_else" && customObstacle.trim()
              ? customObstacle.trim()
              : null,
        })),
      );
      ensureNoError(error);
    }
    if (obstacles.includes("something_else") && existingKeys.includes("something_else")) {
      const { error } = await client
        .from("user_obstacles")
        .update({ custom_label: customObstacle.trim() || null })
        .eq("user_id", userId)
        .eq("obstacle_key", "something_else");
      ensureNoError(error);
    }
    const staleKeys = existingKeys.filter((key) => !obstacles.includes(key));
    if (staleKeys.length) {
      const { error } = await client
        .from("user_obstacles")
        .delete()
        .eq("user_id", userId)
        .in("obstacle_key", staleKeys);
      ensureNoError(error);
    }
    await advanceProfile(userId, "notification_setup");
  },

  async saveNotificationPreferences(
    userId: string,
    values: NotificationPreferenceValues,
    quietHoursEnabled: boolean,
    quietStart: string,
    quietEnd: string,
    timezone: string,
  ) {
    const { error } = await requireSupabase()
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        ...values,
        quiet_hours_enabled: quietHoursEnabled,
        quiet_start: quietStart,
        quiet_end: quietEnd,
        timezone,
      });
    ensureNoError(error);
  },

  async complete() {
    const { error } = await requireSupabase().rpc("complete_mobile_onboarding");
    ensureNoError(error);
  },
};
