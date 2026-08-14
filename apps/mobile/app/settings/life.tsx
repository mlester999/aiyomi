import {
  commitmentTitleSchema,
  customLifeAreaNameSchema,
  localTimeSchema,
} from "@aiyomi/schemas";
import type { LifeRoleKey, PreAuthIntent } from "@aiyomi/types";
import * as Crypto from "expo-crypto";
import { getCalendars, getLocales } from "expo-localization";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AppHeader,
  KeyboardScreen,
  LoadingButton,
  MultiSelectChip,
  OfflineBanner,
  SecondaryButton,
  TextField,
} from "../../src/components";
import { TimeControl } from "../../src/features/onboarding/TimeControl";
import { playSuccessHaptic } from "../../src/feedback/haptics";
import {
  loadOnboardingSnapshot,
  onboardingService,
} from "../../src/onboarding/service";
import type {
  EditableCommitment,
  OnboardingSnapshot,
} from "../../src/onboarding/types";
import { useApp } from "../../src/providers/AppProvider";
import {
  colors,
  radii,
  shadows,
  spacing,
  typography,
} from "../../src/theme";

const roleOptions: readonly { key: LifeRoleKey; label: string }[] = [
  { key: "student", label: "Student" },
  { key: "employed", label: "Employed" },
  { key: "self_employed", label: "Self-employed" },
  { key: "business_owner", label: "Business owner" },
  { key: "parent_caregiver", label: "Parent / caregiver" },
  { key: "flexible_schedule", label: "Flexible schedule" },
  { key: "other", label: "Other" },
];

const days = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
] as const;

const MAX_CUSTOM_LIFE_AREAS = 5;
const MAX_COMMITMENTS = 5;

const toggle = <Value extends string | number>(values: Value[], value: Value) =>
  values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];

const firstIssue = (issues: Array<{ message: string }>) =>
  issues[0]?.message ?? "Check this value and try again.";

const detectedTimezone = () =>
  getCalendars()[0]?.timeZone ??
  Intl.DateTimeFormat().resolvedOptions().timeZone ??
  "UTC";

const detectedLocale = () => getLocales()[0]?.languageTag ?? null;

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );
}

function CommitmentEditor({
  commitment,
  disabled,
  index,
  onChange,
  onRemove,
  timezone,
}: {
  commitment: EditableCommitment;
  disabled: boolean;
  index: number;
  onChange: (value: EditableCommitment) => void;
  onRemove: () => void;
  timezone: string;
}) {
  return (
    <View style={styles.commitmentCard}>
      <View style={styles.commitmentHeader}>
        <Text accessibilityRole="header" style={styles.commitmentTitle}>
          Commitment {index + 1}
        </Text>
        <Pressable
          accessibilityLabel={`Remove commitment ${index + 1}`}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={onRemove}
          style={({ pressed }) => [
            styles.removeButton,
            pressed && !disabled && styles.removeButtonPressed,
          ]}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      </View>
      <TextField
        editable={!disabled}
        label="Title"
        maxLength={80}
        onChangeText={(title) => onChange({ ...commitment, title })}
        placeholder="Work, school, care, or something else"
        value={commitment.title}
      />
      <Text style={styles.fieldLabel}>Usual days</Text>
      <View style={styles.chips}>
        {days.map((day) => (
          <MultiSelectChip
            key={day.value}
            disabled={disabled}
            label={day.label}
            onPress={() =>
              onChange({
                ...commitment,
                daysOfWeek: toggle(commitment.daysOfWeek, day.value),
              })
            }
            selected={commitment.daysOfWeek.includes(day.value)}
          />
        ))}
      </View>
      <View style={styles.timeGrid}>
        <TimeControl
          disabled={disabled}
          label="Starts"
          onChange={(startTime) => onChange({ ...commitment, startTime })}
          timezone={timezone}
          value={commitment.startTime}
        />
        <TimeControl
          disabled={disabled}
          label="Ends"
          onChange={(endTime) => onChange({ ...commitment, endTime })}
          timezone={timezone}
          value={commitment.endTime}
        />
      </View>
    </View>
  );
}

export default function LifeSettingsScreen() {
  const router = useRouter();
  const {
    isOffline,
    preAuthIntent,
    profile,
    session,
  } = useApp();
  const deviceTimezone = useMemo(detectedTimezone, []);
  const locale = useMemo(
    () => profile?.locale ?? detectedLocale(),
    [profile?.locale],
  );
  const timezone = profile?.timezone || deviceTimezone;
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot | null>(null);
  const [lifeAreaKeys, setLifeAreaKeys] = useState<string[]>([]);
  const [customLifeAreas, setCustomLifeAreas] = useState<string[]>([]);
  const [wakeTime, setWakeTime] = useState("07:00");
  const [sleepTime, setSleepTime] = useState("22:00");
  const [lifeRoles, setLifeRoles] = useState<LifeRoleKey[]>([]);
  const [commitments, setCommitments] = useState<EditableCommitment[]>([]);
  const [existingCommitmentIds, setExistingCommitmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const saveInFlightRef = useRef(false);

  const applySnapshot = useCallback((loaded: OnboardingSnapshot) => {
    setSnapshot(loaded);
    setLifeAreaKeys(loaded.values.lifeAreaKeys);
    setCustomLifeAreas(loaded.values.customLifeAreas);
    setWakeTime(loaded.values.wakeTime);
    setSleepTime(loaded.values.sleepTime);
    setLifeRoles(loaded.values.lifeRoles);
    setCommitments(loaded.values.commitments);
    setExistingCommitmentIds(loaded.rawCommitments.map((item) => item.id));
  }, []);

  const load = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const loaded = await loadOnboardingSnapshot(
        session.user.id,
        preAuthIntent as PreAuthIntent | null,
        timezone,
        locale,
      );
      applySnapshot(loaded);
    } catch {
      setError(
        "Couldn't load your Life setup yet. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [applySnapshot, locale, preAuthIntent, session, timezone]);

  useEffect(() => {
    void load();
  }, [load]);

  const validate = () => {
    if (lifeAreaKeys.length === 0 && customLifeAreas.length === 0) {
      return "Choose at least one Life Area.";
    }
    for (const name of customLifeAreas) {
      const result = customLifeAreaNameSchema.safeParse(name);
      if (!result.success) return firstIssue(result.error.issues);
    }
    const normalizedCustomAreas = customLifeAreas.map((name) =>
      name.trim().toLocaleLowerCase(),
    );
    if (new Set(normalizedCustomAreas).size !== normalizedCustomAreas.length) {
      return "Give each custom Life Area a different name.";
    }
    if (!localTimeSchema.safeParse(wakeTime).success) {
      return "Choose a valid wake time.";
    }
    if (!localTimeSchema.safeParse(sleepTime).success) {
      return "Choose a valid sleep time.";
    }
    if (wakeTime === sleepTime) {
      return "Wake and sleep times need to be different.";
    }
    if (lifeRoles.length === 0) {
      return "Choose at least one description of your typical week.";
    }
    for (const commitment of commitments) {
      const titleResult = commitmentTitleSchema.safeParse(commitment.title);
      if (!titleResult.success) return firstIssue(titleResult.error.issues);
      if (commitment.daysOfWeek.length === 0) {
        return "Choose at least one day for each commitment.";
      }
      if (
        !localTimeSchema.safeParse(commitment.startTime).success ||
        !localTimeSchema.safeParse(commitment.endTime).success
      ) {
        return "Choose valid start and end times for each commitment.";
      }
      if (commitment.startTime === commitment.endTime) {
        return "Commitment start and end times need to be different.";
      }
    }
    return null;
  };

  const save = async () => {
    if (!session || !snapshot || saveInFlightRef.current) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }

    saveInFlightRef.current = true;
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      await onboardingService.saveLifeAreas(
        session.user.id,
        snapshot.lifeAreaDefinitions,
        lifeAreaKeys,
        customLifeAreas,
        { advance: false },
      );
      await onboardingService.saveNormalDay(
        session.user.id,
        wakeTime,
        sleepTime,
        timezone,
        lifeRoles,
        { advance: false },
      );
      await onboardingService.saveCommitments(
        session.user.id,
        commitments,
        existingCommitmentIds,
        timezone,
        { advance: false },
      );

      const refreshed = await loadOnboardingSnapshot(
        session.user.id,
        preAuthIntent as PreAuthIntent | null,
        timezone,
        locale,
      );
      applySnapshot(refreshed);
      setSaved(true);
      void playSuccessHaptic();
    } catch {
      setError(
        "Couldn't save your Life setup yet. Your changes are still here so you can retry.",
      );
    } finally {
      saveInFlightRef.current = false;
      setPending(false);
    }
  };

  const changeCommitment = (index: number, value: EditableCommitment) => {
    setCommitments((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
    setSaved(false);
  };

  return (
    <KeyboardScreen maxContentWidth={680}>
      <AppHeader
        onBack={pending ? undefined : () => router.back()}
        title="Life setup"
      />
      <Text style={styles.introduction}>
        Keep these planning hints current as life changes. Overnight schedules are
        welcome, and nothing here defines who you are.
      </Text>
      <OfflineBanner visible={isOffline} />

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator
            accessibilityLabel="Loading your Life setup"
            color={colors.primary}
            size="large"
          />
          <Text accessibilityLiveRegion="polite" style={styles.loadingText}>
            Loading your Life setup...
          </Text>
        </View>
      ) : snapshot ? (
        <>
          <View style={styles.section}>
            <SectionHeading
              description="Choose what matters in your life right now. You can select more than one."
              title="Life Areas"
            />
            <View style={styles.chips}>
              {snapshot.lifeAreaDefinitions
                .filter((definition) => definition.active)
                .map((definition) => (
                  <MultiSelectChip
                    key={definition.key}
                    disabled={pending}
                    label={definition.name}
                    onPress={() => {
                      setLifeAreaKeys((current) =>
                        toggle(current, definition.key),
                      );
                      setSaved(false);
                    }}
                    selected={lifeAreaKeys.includes(definition.key)}
                  />
                ))}
            </View>
            {customLifeAreas.map((name, index) => (
              <View key={`custom-${index}`} style={styles.customAreaRow}>
                <TextField
                  containerStyle={styles.customAreaInput}
                  editable={!pending}
                  label={`Custom Life Area ${index + 1}`}
                  maxLength={40}
                  onChangeText={(value) => {
                    setCustomLifeAreas((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? value : item,
                      ),
                    );
                    setSaved(false);
                  }}
                  placeholder="What would you call it?"
                  value={name}
                />
                <Pressable
                  accessibilityLabel={`Remove custom Life Area ${index + 1}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: pending }}
                  disabled={pending}
                  onPress={() => {
                    setCustomLifeAreas((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    );
                    setSaved(false);
                  }}
                  style={({ pressed }) => [
                    styles.compactRemove,
                    pressed && !pending && styles.removeButtonPressed,
                  ]}
                >
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            ))}
            {customLifeAreas.length < MAX_CUSTOM_LIFE_AREAS ? (
              <SecondaryButton
                disabled={pending}
                label="Add custom Life Area"
                onPress={() => {
                  setCustomLifeAreas((current) => [...current, ""]);
                  setSaved(false);
                }}
              />
            ) : null}
          </View>

          <View style={styles.section}>
            <SectionHeading
              description="These times help future plans fit your real schedule. Sleep may fall on the next calendar day."
              title="Normal day"
            />
            <View style={styles.timeGrid}>
              <TimeControl
                disabled={pending}
                label="When do you usually wake up?"
                onChange={(value) => {
                  setWakeTime(value);
                  setSaved(false);
                }}
                timezone={timezone}
                value={wakeTime}
              />
              <TimeControl
                disabled={pending}
                helperText="Overnight and night-shift schedules are supported."
                label="When do you usually go to sleep?"
                onChange={(value) => {
                  setSleepTime(value);
                  setSaved(false);
                }}
                timezone={timezone}
                value={sleepTime}
              />
            </View>
            <Text style={styles.timezoneNote}>Timezone: {timezone}</Text>
          </View>

          <View style={styles.section}>
            <SectionHeading
              description="Select every description that fits. These are planning hints, not your identity."
              title="Typical week"
            />
            <View style={styles.chips}>
              {roleOptions
                .filter((role) => snapshot.activeLifeRoleKeys.includes(role.key))
                .map((role) => (
                <MultiSelectChip
                  key={role.key}
                  disabled={pending}
                  label={role.label}
                  onPress={() => {
                    setLifeRoles((current) => toggle(current, role.key));
                    setSaved(false);
                  }}
                  selected={lifeRoles.includes(role.key)}
                />
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeading
              description="Add times that are usually unavailable. Leave this empty if your schedule changes often."
              title="Fixed commitments"
            />
            {commitments.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No fixed commitments</Text>
                <Text style={styles.emptyBody}>
                  A flexible week is completely valid. Add a commitment only when it
                  helps Aiyomi plan around your time.
                </Text>
              </View>
            ) : null}
            {commitments.map((commitment, index) => (
              <CommitmentEditor
                key={commitment.id}
                commitment={commitment}
                disabled={pending}
                index={index}
                onChange={(value) => changeCommitment(index, value)}
                onRemove={() => {
                  setCommitments((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  );
                  setSaved(false);
                }}
                timezone={timezone}
              />
            ))}
            {commitments.length < MAX_COMMITMENTS ? (
              <SecondaryButton
                disabled={pending}
                label="Add commitment"
                onPress={() => {
                  setCommitments((current) => [
                    ...current,
                    {
                      id: Crypto.randomUUID(),
                      title: "",
                      daysOfWeek: [],
                      startTime: "09:00",
                      endTime: "17:00",
                    },
                  ]);
                  setSaved(false);
                }}
              />
            ) : null}
          </View>

          {error ? (
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}
          {saved ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>
              Your Life setup is updated.
            </Text>
          ) : null}
          <LoadingButton
            disabled={isOffline}
            label={isOffline ? "Save when online" : "Save Life setup"}
            loading={pending}
            loadingLabel="Saving Life setup..."
            onPress={() => void save()}
            style={styles.saveButton}
          />
        </>
      ) : (
        <View style={styles.loadErrorCard}>
          <Text
            accessibilityLiveRegion="assertive"
            accessibilityRole="alert"
            style={styles.error}
          >
            {error ?? "Your Life setup isn't available yet."}
          </Text>
          <SecondaryButton
            disabled={isOffline}
            label="Try again"
            onPress={() => void load()}
          />
        </View>
      )}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  introduction: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 260,
  },
  loadingText: {
    ...typography.bodySmall,
    marginTop: spacing.md,
  },
  section: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    width: "100%",
    ...shadows.card,
  },
  sectionHeading: {
    gap: spacing.xxs,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    fontSize: 20,
  },
  sectionDescription: {
    ...typography.bodySmall,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    width: "100%",
  },
  customAreaRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
  },
  customAreaInput: {
    flex: 1,
  },
  compactRemove: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  timeGrid: {
    gap: spacing.md,
    width: "100%",
  },
  timezoneNote: {
    ...typography.caption,
    color: colors.primary,
  },
  fieldLabel: {
    ...typography.label,
  },
  commitmentCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
  commitmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commitmentTitle: {
    ...typography.cardTitle,
  },
  removeButton: {
    alignItems: "center",
    borderRadius: radii.sm,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  removeButtonPressed: {
    backgroundColor: colors.errorSoft,
  },
  removeText: {
    ...typography.label,
    color: colors.error,
  },
  emptyCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.cardTitle,
  },
  emptyBody: {
    ...typography.bodySmall,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    backgroundColor: colors.errorSoft,
    borderRadius: radii.md,
    color: colors.error,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  success: {
    ...typography.bodySmall,
    backgroundColor: colors.successSoft,
    borderRadius: radii.md,
    color: colors.success,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  loadErrorCard: {
    gap: spacing.md,
  },
});
