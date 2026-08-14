import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import {
  commitmentTitleSchema,
  companionNameSchema,
  customLifeAreaNameSchema,
  customObstacleSchema,
  improvementFocusSchema,
  preferredNameSchema,
} from "@aiyomi/schemas";
import type { PreAuthIntent } from "@aiyomi/types";
import { getCalendars, getLocales } from "expo-localization";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { trackMobileEvent } from "../analytics/mobile";
import {
  playSelectionHaptic,
  playSuccessHaptic,
} from "../feedback/haptics";
import { useApp } from "../providers/AppProvider";
import {
  getNotificationPermissionStatus,
  requestHelpfulNotifications,
} from "../notifications/service";
import {
  nextOnboardingPage,
  onboardingPageNumber,
  pageForPersistedStep,
  previousOnboardingPage,
  type OnboardingPage,
} from "./model";
import {
  loadOnboardingSnapshot,
  onboardingService,
} from "./service";
import type {
  EditableCommitment,
  OnboardingSnapshot,
  OnboardingValues,
} from "./types";

const detectedTimezone = () =>
  getCalendars()[0]?.timeZone ??
  Intl.DateTimeFormat().resolvedOptions().timeZone ??
  "UTC";

const detectedLocale = () => getLocales()[0]?.languageTag ?? null;

const validationMessage = (error: { issues: Array<{ message: string }> }) =>
  error.issues[0]?.message ?? "Check this answer and try again.";

export function useOnboardingFlow() {
  const { session, profile, preAuthIntent } = useApp();
  const timezone = useMemo(detectedTimezone, []);
  const locale = useMemo(detectedLocale, []);
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [values, setValues] = useState<OnboardingValues | null>(null);
  const [page, setPage] = useState<OnboardingPage>(
    pageForPersistedStep(profile?.onboarding_step),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operationInFlightRef = useRef(false);
  const notificationEducationTrackedRef = useRef(false);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const loaded = await loadOnboardingSnapshot(
        session.user.id,
        preAuthIntent as PreAuthIntent | null,
        timezone,
        locale,
      );
      const permissionStatus = await getNotificationPermissionStatus();
      loaded.values.permissionStatus = permissionStatus;
      setSnapshot(loaded);
      setValues(loaded.values);
      setPage(pageForPersistedStep(loaded.profile.onboarding_step));
      trackMobileEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, {
        state:
          loaded.profile.onboarding_status === "not_started" ? "new" : "resumed",
      });
    } catch {
      setError(
        "Aiyomi couldn't load your setup yet. Your saved answers are still safe. Try again when you're connected.",
      );
    } finally {
      setLoading(false);
    }
  }, [locale, preAuthIntent, session, timezone]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      loading ||
      !values ||
      page !== "notification_setup" ||
      notificationEducationTrackedRef.current
    ) {
      return;
    }
    notificationEducationTrackedRef.current = true;
    trackMobileEvent(ANALYTICS_EVENTS.NOTIFICATION_EDUCATION_VIEWED);
  }, [loading, page, values]);

  const updateValues = useCallback((patch: Partial<OnboardingValues>) => {
    setValues((current) => (current ? { ...current, ...patch } : current));
  }, []);

  const validatePage = useCallback(
    (currentPage: OnboardingPage): string | null => {
      if (!values) return "Aiyomi is still getting this step ready.";
      if (currentPage === "preferred_name") {
        const result = preferredNameSchema.safeParse(values.preferredName);
        return result.success ? null : validationMessage(result.error);
      }
      if (currentPage === "companion_selection") {
        return values.companionDefinitionId ? null : "Choose the companion that feels right for you.";
      }
      if (currentPage === "companion_name") {
        const result = companionNameSchema.safeParse(values.companionName);
        return result.success ? null : validationMessage(result.error);
      }
      if (currentPage === "life_areas") {
        if (values.lifeAreaKeys.length + values.customLifeAreas.filter(Boolean).length === 0) {
          return "Choose at least one Life Area.";
        }
        for (const name of values.customLifeAreas) {
          const result = customLifeAreaNameSchema.safeParse(name);
          if (!result.success) return validationMessage(result.error);
        }
      }
      if (currentPage === "normal_day" && values.lifeRoles.length === 0) {
        return "Choose at least one description of your typical week.";
      }
      if (currentPage === "fixed_commitments") {
        for (const commitment of values.commitments) {
          const titleResult = commitmentTitleSchema.safeParse(commitment.title);
          if (!titleResult.success) return validationMessage(titleResult.error);
          if (commitment.daysOfWeek.length === 0) return "Choose at least one day for each commitment.";
          if (commitment.startTime === commitment.endTime) return "Commitment start and end times need to be different.";
        }
      }
      if (currentPage === "improvement_focus") {
        const focusResult = improvementFocusSchema.safeParse(values.improvementFocus);
        if (!focusResult.success) return "Share one thing you would most like Aiyomi to improve with you.";
        if (values.obstacles.includes("something_else") && values.customObstacle.trim()) {
          const customResult = customObstacleSchema.safeParse(values.customObstacle);
          if (!customResult.success) return validationMessage(customResult.error);
        }
      }
      return null;
    },
    [values],
  );

  const continueFromPage = useCallback(async () => {
    if (!session || !values || !snapshot || operationInFlightRef.current) {
      return false;
    }
    const validationError = validatePage(page);
    if (validationError) {
      setError(validationError);
      return false;
    }

    operationInFlightRef.current = true;
    setSaving(true);
    setError(null);
    try {
      if (page === "preferred_name") {
        await onboardingService.savePreferredName(
          session.user.id,
          values.preferredName,
          timezone,
          locale,
        );
      } else if (page === "companion_selection") {
        const definition = snapshot.companionDefinitions.find(
          (item) => item.id === values.companionDefinitionId,
        );
        if (!definition) throw new Error("Companion selection is unavailable.");
        await onboardingService.saveCompanionSelection(session.user.id, definition);
        trackMobileEvent(ANALYTICS_EVENTS.COMPANION_SELECTED, {
          companion: definition.key,
        });
      } else if (page === "companion_name") {
        await onboardingService.saveCompanionDetails(
          session.user.id,
          values.companionName,
          values.personality,
        );
        const suggestedName = snapshot.companionDefinitions.find(
          (definition) => definition.id === values.companionDefinitionId,
        )?.name;
        trackMobileEvent(ANALYTICS_EVENTS.COMPANION_NAMED, {
          usedSuggestedName:
            Boolean(suggestedName) &&
            suggestedName?.trim().toLocaleLowerCase() ===
              values.companionName.trim().toLocaleLowerCase(),
        });
        trackMobileEvent(ANALYTICS_EVENTS.COMPANION_PERSONALITY_SELECTED, {
          personality: values.personality,
        });
      } else if (page === "life_areas") {
        await onboardingService.saveLifeAreas(
          session.user.id,
          snapshot.lifeAreaDefinitions,
          values.lifeAreaKeys,
          values.customLifeAreas,
        );
        const customCount = values.customLifeAreas.filter((name) =>
          Boolean(name.trim()),
        ).length;
        trackMobileEvent(ANALYTICS_EVENTS.LIFE_AREAS_SELECTED, {
          count: values.lifeAreaKeys.length + customCount,
          includesCustom: customCount > 0,
        });
      } else if (page === "normal_day") {
        await onboardingService.saveNormalDay(
          session.user.id,
          values.wakeTime,
          values.sleepTime,
          timezone,
          values.lifeRoles,
        );
      } else if (page === "fixed_commitments") {
        await onboardingService.saveCommitments(
          session.user.id,
          values.commitments,
          snapshot.rawCommitments.map((item) => item.id),
          timezone,
        );
      } else if (page === "improvement_focus") {
        await onboardingService.savePersonalization(
          session.user.id,
          values.improvementFocus,
          values.preAuthIntent,
          values.energyBaseline,
          values.obstacles,
          values.customObstacle,
        );
      } else if (page === "notification_setup") {
        await onboardingService.saveNotificationPreferences(
          session.user.id,
          values.notificationPreferences,
          values.quietHoursEnabled,
          values.quietStart,
          values.quietEnd,
          timezone,
        );
        await onboardingService.complete();
        void playSuccessHaptic();
        trackMobileEvent(ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          notificationPermission: values.permissionStatus,
        });
        return true;
      }

      trackMobileEvent(ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED, {
        step: page,
        outcome:
          page === "fixed_commitments" && values.commitments.length === 0
            ? "skipped"
            : "completed",
      });
      const next = nextOnboardingPage(page);
      if (next) setPage(next);
      return false;
    } catch {
      setError("Couldn't save that yet. Your answer is still here, so you can try again.");
      return false;
    } finally {
      operationInFlightRef.current = false;
      setSaving(false);
    }
  }, [locale, page, session, snapshot, timezone, validatePage, values]);

  const goBack = useCallback(async () => {
    if (!session || operationInFlightRef.current) return;
    const previous = previousOnboardingPage(page);
    if (!previous) return;
    operationInFlightRef.current = true;
    setSaving(true);
    setPage(previous);
    setError(null);
    try {
      await onboardingService.setCurrentStep(session.user.id, previous);
    } catch {
      setError("You're back on this step. Aiyomi will retry saving your place next time.");
    } finally {
      operationInFlightRef.current = false;
      setSaving(false);
    }
  }, [page, session]);

  const selectCompanion = useCallback(
    async (key: OnboardingValues["companionKey"], definitionId: string, suggestedName: string) => {
      if (operationInFlightRef.current) return;
      updateValues({
        companionKey: key,
        companionDefinitionId: definitionId,
        companionName: suggestedName,
      });
      void playSelectionHaptic();
    },
    [updateValues],
  );

  const requestNotifications = useCallback(async () => {
    if (!session || operationInFlightRef.current) return null;
    operationInFlightRef.current = true;
    setSaving(true);
    setError(null);
    try {
      const result = await requestHelpfulNotifications(session.user.id);
      updateValues({ permissionStatus: result.status });
      trackMobileEvent(ANALYTICS_EVENTS.NOTIFICATION_PERMISSION_RESULT, {
        status: result.status,
        source: "onboarding",
      });
      if (result.reason && result.status === "granted") setError(result.reason);
      return result;
    } catch {
      setError("Notifications couldn't be enabled yet. You can continue and try again later.");
      return null;
    } finally {
      operationInFlightRef.current = false;
      setSaving(false);
    }
  }, [session, updateValues]);

  const setCommitments = useCallback(
    (commitments: EditableCommitment[]) => updateValues({ commitments }),
    [updateValues],
  );

  return {
    page,
    pageNumber: onboardingPageNumber(page),
    totalPages: 8,
    timezone,
    snapshot,
    values,
    loading,
    saving,
    error,
    setError,
    updateValues,
    setCommitments,
    selectCompanion,
    continueFromPage,
    goBack,
    retry: load,
    requestNotifications,
  };
}
