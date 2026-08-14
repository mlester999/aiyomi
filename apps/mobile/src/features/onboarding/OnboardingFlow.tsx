import type {
  CompanionPersonality,
  EnergyBaseline,
  LifeRoleKey,
  NotificationPreferenceKey,
  ObstacleKey,
} from "@aiyomi/types";
import * as Crypto from "expo-crypto";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AppHeader,
  ChoiceCard,
  KeyboardScreen,
  LoadingButton,
  MultiSelectChip,
  NotificationPreferenceRow,
  PrimaryButton,
  ProgressIndicator,
  SecondaryButton,
  TextField,
} from "../../components";
import {
  COMPANION_CATALOG,
  CompanionIllustration,
} from "../../companions";
import { colors, radii, shadows, spacing, typography } from "../../theme";
import type { EditableCommitment, OnboardingValues } from "../../onboarding/types";
import { useOnboardingFlow } from "../../onboarding/useOnboardingFlow";
import { TimeControl } from "./TimeControl";

const roleOptions: readonly { key: LifeRoleKey; label: string }[] = [
  { key: "student", label: "Student" },
  { key: "employed", label: "Employed" },
  { key: "self_employed", label: "Self-employed" },
  { key: "business_owner", label: "Business owner" },
  { key: "parent_caregiver", label: "Parent / caregiver" },
  { key: "flexible_schedule", label: "Flexible schedule" },
  { key: "other", label: "Other" },
];

const obstacleOptions: readonly { key: ObstacleKey; label: string }[] = [
  { key: "procrastination", label: "Procrastination" },
  { key: "social_media", label: "Social media" },
  { key: "poor_planning", label: "Poor planning" },
  { key: "low_energy", label: "Low energy" },
  { key: "too_many_responsibilities", label: "Too many responsibilities" },
  { key: "distractions", label: "Distractions" },
  { key: "motivation", label: "Motivation" },
  { key: "overcommitting", label: "Overcommitting" },
  { key: "inconsistent_routine", label: "Inconsistent routine" },
  { key: "not_sure_where_to_start", label: "Not sure where to start" },
  { key: "something_else", label: "Something else" },
];

const energyOptions: readonly { key: EnergyBaseline; label: string }[] = [
  { key: "morning", label: "Morning" },
  { key: "afternoon", label: "Afternoon" },
  { key: "evening", label: "Evening" },
  { key: "varies", label: "It varies" },
  { key: "not_sure", label: "Not sure" },
];

const personalityOptions: readonly {
  key: CompanionPersonality;
  title: string;
  description: string;
}[] = [
  {
    key: "gentle",
    title: "Gentle",
    description: "Calm support with fewer nudges.",
  },
  {
    key: "balanced",
    title: "Balanced",
    description: "Encouragement with healthy accountability.",
  },
  {
    key: "coach",
    title: "Coach",
    description: "More proactive and direct, while staying respectful.",
  },
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

const notificationLabels: readonly {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  { key: "morning_plan", title: "Morning plan", description: "A calm invitation to shape your day." },
  { key: "upcoming_activity", title: "Upcoming activity", description: "A timely reminder for something you planned." },
  { key: "schedule_adjustments", title: "Schedule adjustments", description: "Helpful options when plans change." },
  { key: "focus_reminder", title: "Focus reminder", description: "A prompt for a focus session you chose." },
  { key: "break_finished", title: "Break finished", description: "A gentle note when a future focus break ends." },
  { key: "daily_reflection", title: "Daily reflection", description: "An optional invitation to close your day." },
  { key: "weekly_recap", title: "Weekly recap", description: "A private summary of patterns and progress." },
  { key: "streak_reminder", title: "Streak reminder", description: "Off by default. No guilt if you leave it off." },
  { key: "achievements", title: "Achievements", description: "Celebrate meaningful future milestones." },
];

const toggle = <Value extends string | number>(values: Value[], value: Value) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

function Heading({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.headingBlock}>
      <Text accessibilityRole="header" style={styles.heading}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

function PreferredNameStep({ disabled, values, update }: StepProps) {
  return (
    <>
      <CompanionIllustration decorative mood="happy" size="medium" variant="mori" />
      <Heading
        body="Use the name that feels right to you. It does not need to be your legal name."
        title="What should I call you?"
      />
      <TextField
        autoCapitalize="words"
        autoComplete="name-given"
        autoFocus
        editable={!disabled}
        label="Preferred name"
        maxLength={80}
        onChangeText={(preferredName) => update({ preferredName })}
        placeholder="Your name"
        returnKeyType="done"
        textContentType="givenName"
        value={values.preferredName}
      />
    </>
  );
}

interface StepProps {
  disabled: boolean;
  values: OnboardingValues;
  update: (patch: Partial<OnboardingValues>) => void;
}

function CompanionSelectionStep({
  disabled,
  values,
  definitions,
  onSelect,
}: StepProps & {
  definitions: NonNullable<ReturnType<typeof useOnboardingFlow>["snapshot"]>["companionDefinitions"];
  onSelect: (key: OnboardingValues["companionKey"], id: string, name: string) => void;
}) {
  return (
    <>
      <Heading
        body="Each companion has its own visual personality. You can switch later without losing progress."
        title="Choose your Aiyomi companion"
      />
      <View accessibilityRole="radiogroup" style={styles.cardList}>
        {COMPANION_CATALOG.map((companion) => {
          const definition = definitions.find((item) => item.key === companion.id);
          if (!definition) return null;
          return (
            <ChoiceCard
              key={companion.id}
              description={companion.flavor}
              disabled={disabled}
              leading={
                <CompanionIllustration decorative size="small" variant={companion.id} />
              }
              onPress={() => onSelect(companion.id, definition.id, definition.name)}
              selected={values.companionKey === companion.id}
              title={companion.name}
            />
          );
        })}
      </View>
    </>
  );
}

function CompanionDetailsStep({ disabled, values, update }: StepProps) {
  return (
    <>
      <CompanionIllustration
        accessibilityLabel={`${values.companionName || "Your companion"}, ready to be named`}
        mood={
          values.personality === "gentle"
            ? "calm"
            : values.personality === "coach"
              ? "focused"
              : "happy"
        }
        showAura
        size="large"
        variant={values.companionKey ?? "mori"}
      />
      <Heading
        body="Choose a name and the kind of support you want. Balanced is a comfortable place to start."
        title="Make your companion yours"
      />
      <TextField
        autoCapitalize="words"
        editable={!disabled}
        helperText="Up to 40 characters. International names are welcome."
        label="Companion name"
        maxLength={40}
        onChangeText={(companionName) => update({ companionName })}
        value={values.companionName}
      />
      <Text style={styles.sectionLabel}>How should your companion support you?</Text>
      <View accessibilityRole="radiogroup" style={styles.cardList}>
        {personalityOptions.map((option) => (
          <ChoiceCard
            key={option.key}
            description={option.description}
            disabled={disabled}
            onPress={() => update({ personality: option.key })}
            selected={values.personality === option.key}
            title={option.title}
          />
        ))}
      </View>
    </>
  );
}

function LifeAreasStep({ disabled, values, update, definitions }: StepProps & {
  definitions: NonNullable<ReturnType<typeof useOnboardingFlow>["snapshot"]>["lifeAreaDefinitions"];
}) {
  const customSelected = values.customLifeAreas.length > 0;
  return (
    <>
      <CompanionIllustration decorative mood="thoughtful" size="small" variant={values.companionKey ?? "mori"} />
      <Heading
        body="Choose what matters right now. Life can have more than one center."
        title="What matters in your life right now?"
      />
      <View style={styles.chips}>
        {definitions.map((definition) => (
          <MultiSelectChip
            key={definition.key}
            disabled={disabled}
            label={definition.name}
            onPress={() => update({ lifeAreaKeys: toggle(values.lifeAreaKeys, definition.key) })}
            selected={values.lifeAreaKeys.includes(definition.key)}
          />
        ))}
        <MultiSelectChip
          disabled={disabled}
          label="Custom"
          onPress={() => update({ customLifeAreas: customSelected ? [] : [""] })}
          selected={customSelected}
        />
      </View>
      {customSelected ? (
        <TextField
          editable={!disabled}
          label="Custom Life Area"
          maxLength={40}
          onChangeText={(name) => update({ customLifeAreas: [name] })}
          placeholder="What would you call it?"
          value={values.customLifeAreas[0] ?? ""}
        />
      ) : null}
    </>
  );
}

function NormalDayStep({
  activeRoleKeys,
  disabled,
  values,
  update,
  timezone,
}: StepProps & { activeRoleKeys: LifeRoleKey[]; timezone: string }) {
  return (
    <>
      <Heading
        body="These are planning hints, not rules. Overnight and changing schedules are welcome."
        title="Tell Aiyomi about a normal day"
      />
      <View style={styles.timeGrid}>
        <TimeControl
          disabled={disabled}
          label="When do you usually wake up?"
          onChange={(wakeTime) => update({ wakeTime })}
          timezone={timezone}
          value={values.wakeTime}
        />
        <TimeControl
          disabled={disabled}
          helperText="Sleep may fall on the next calendar day."
          label="When do you usually go to sleep?"
          onChange={(sleepTime) => update({ sleepTime })}
          timezone={timezone}
          value={values.sleepTime}
        />
      </View>
      <Text style={styles.timezoneNote}>Detected timezone: {timezone}</Text>
      <Text style={styles.sectionLabel}>What does your typical week look like?</Text>
      <View style={styles.chips}>
        {roleOptions.filter((role) => activeRoleKeys.includes(role.key)).map((role) => (
          <MultiSelectChip
            key={role.key}
            disabled={disabled}
            label={role.label}
            onPress={() => update({ lifeRoles: toggle(values.lifeRoles, role.key) })}
            selected={values.lifeRoles.includes(role.key)}
          />
        ))}
      </View>
    </>
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
        <Text style={styles.commitmentTitle}>Commitment {index + 1}</Text>
        <Pressable
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
      <Text style={styles.inlineLabel}>Usual days</Text>
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

function CommitmentsStep({
  disabled,
  values,
  update,
  timezone,
}: StepProps & { timezone: string }) {
  const changeAt = (index: number, next: EditableCommitment) =>
    update({
      commitments: values.commitments.map((item, itemIndex) =>
        itemIndex === index ? next : item,
      ),
    });
  return (
    <>
      <Heading
        body="Add times that are usually unavailable. Skip this if your week changes often."
        title="Do you have fixed commitments?"
      />
      {values.commitments.length === 0 ? (
        <View style={styles.optionalCard}>
          <Text style={styles.optionalTitle}>Nothing fixed yet</Text>
          <Text style={styles.optionalBody}>
            That is completely fine. You can add commitments later in Me.
          </Text>
        </View>
      ) : null}
      {values.commitments.map((commitment, index) => (
        <CommitmentEditor
          key={commitment.id}
          commitment={commitment}
          disabled={disabled}
          index={index}
          onChange={(next) => changeAt(index, next)}
          onRemove={() =>
            update({
              commitments: values.commitments.filter((_, itemIndex) => itemIndex !== index),
            })
          }
          timezone={timezone}
        />
      ))}
      {values.commitments.length < 3 ? (
        <SecondaryButton
          disabled={disabled}
          label="Add commitment"
          onPress={() =>
            update({
              commitments: [
                ...values.commitments,
                {
                  id: Crypto.randomUUID(),
                  title: "",
                  daysOfWeek: [],
                  startTime: "09:00",
                  endTime: "17:00",
                },
              ],
            })
          }
        />
      ) : null}
    </>
  );
}

function PersonalizationStep({ disabled, values, update }: StepProps) {
  return (
    <>
      <CompanionIllustration decorative mood="calm" size="small" variant={values.companionKey ?? "mori"} />
      <Heading
        body="This stays private. It is an intention for better support, not a formal goal or a diagnosis."
        title="What would you most like to improve?"
      />
      <TextField
        editable={!disabled}
        inputStyle={styles.multilineInput}
        label="If Aiyomi could improve one thing about your life right now, what would it be?"
        maxLength={500}
        multiline
        onChangeText={(improvementFocus) => update({ improvementFocus })}
        placeholder="I want to stop procrastinating and study more consistently."
        textAlignVertical="top"
        value={values.improvementFocus}
      />
      <Text style={styles.sectionLabel}>What usually gets in your way? Optional</Text>
      <View style={styles.chips}>
        {obstacleOptions.map((obstacle) => (
          <MultiSelectChip
            key={obstacle.key}
            disabled={disabled}
            label={obstacle.label}
            onPress={() => update({ obstacles: toggle(values.obstacles, obstacle.key) })}
            selected={values.obstacles.includes(obstacle.key)}
          />
        ))}
      </View>
      {values.obstacles.includes("something_else") ? (
        <TextField
          editable={!disabled}
          label="Something else"
          maxLength={120}
          onChangeText={(customObstacle) => update({ customObstacle })}
          value={values.customObstacle}
        />
      ) : null}
      <Text style={styles.sectionLabel}>When do you usually have the most energy? Optional</Text>
      <View style={styles.chips}>
        {energyOptions.map((energy) => (
          <MultiSelectChip
            key={energy.key}
            disabled={disabled}
            label={energy.label}
            onPress={() =>
              update({
                energyBaseline:
                  values.energyBaseline === energy.key ? null : energy.key,
              })
            }
            selected={values.energyBaseline === energy.key}
            selectionMode="single"
          />
        ))}
      </View>
    </>
  );
}

function NotificationStep({
  disabled,
  values,
  update,
  timezone,
  handled,
  onHandled,
  requestNotifications,
  saving,
}: StepProps & {
  timezone: string;
  handled: boolean;
  onHandled: () => void;
  requestNotifications: () => Promise<unknown>;
  saving: boolean;
}) {
  if (!handled) {
    return (
      <>
        <View style={styles.notificationHero}>
          <CompanionIllustration
            accessibilityLabel="Your companion with a helpful reminder bell"
            mood="happy"
            showAura
            size="large"
            variant={values.companionKey ?? "mori"}
          />
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.bellBadge}
          >
            <View style={styles.bellDome} />
            <View style={styles.bellRim} />
            <View style={styles.bellClapper} />
          </View>
        </View>
        <Heading
          body="Aiyomi can remind you about plans, future focus sessions, routines, reflection, and meaningful milestones. You choose what is helpful."
          title="Stay on track without being nagged"
        />
        <View style={styles.trustCard}>
          <Text style={styles.trustTitle}>Notifications are optional</Text>
          <Text style={styles.trustBody}>
            Aiyomi asks the system only after you choose the button below. Saying no will never block your setup.
          </Text>
        </View>
        <LoadingButton
          disabled={disabled}
          label="Turn on helpful reminders"
          loading={saving}
          loadingLabel="Checking permission..."
          onPress={() => void requestNotifications().then(onHandled)}
        />
        <SecondaryButton disabled={disabled} label="Maybe later" onPress={onHandled} />
      </>
    );
  }

  return (
    <>
      <Heading
        body="Start with what feels useful. Every option can be changed later."
        title="Choose your helpful reminders"
      />
      <View style={styles.permissionPill}>
        <Text style={styles.permissionText}>
          Device permission: {values.permissionStatus.replace("_", " ")}
        </Text>
      </View>
      <View style={styles.preferenceList}>
        {notificationLabels.map((item) => (
          <NotificationPreferenceRow
            key={item.key}
            description={item.description}
            disabled={disabled}
            onValueChange={(enabled) =>
              update({
                notificationPreferences: {
                  ...values.notificationPreferences,
                  [item.key]: enabled,
                },
              })
            }
            title={item.title}
            value={values.notificationPreferences[item.key]}
          />
        ))}
      </View>
      <NotificationPreferenceRow
        description="Non-critical future nudges will stay quiet in this window."
        disabled={disabled}
        onValueChange={(quietHoursEnabled) => update({ quietHoursEnabled })}
        title="Quiet hours"
        value={values.quietHoursEnabled}
      />
      {values.quietHoursEnabled ? (
        <View style={styles.timeGrid}>
          <TimeControl
            disabled={disabled}
            label="Quiet from"
            onChange={(quietStart) => update({ quietStart })}
            timezone={timezone}
            value={values.quietStart}
          />
          <TimeControl
            disabled={disabled}
            label="Quiet until"
            onChange={(quietEnd) => update({ quietEnd })}
            timezone={timezone}
            value={values.quietEnd}
          />
        </View>
      ) : null}
    </>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const flow = useOnboardingFlow();
  const [notificationHandled, setNotificationHandled] = useState(false);

  if (flow.loading) {
    return (
      <KeyboardScreen contentContainerStyle={styles.loadingScreen}>
        <ActivityIndicator
          accessibilityLabel="Loading your setup"
          color={colors.primary}
          size="large"
        />
        <Text accessibilityLiveRegion="polite" style={styles.loadingText}>
          Getting your setup ready...
        </Text>
      </KeyboardScreen>
    );
  }

  if (!flow.values || !flow.snapshot) {
    return (
      <KeyboardScreen contentContainerStyle={styles.loadingScreen} maxContentWidth={480}>
        <Text accessibilityRole="header" style={styles.heading}>
          Your setup is still safe.
        </Text>
        <Text accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.body}>
          {flow.error ?? "Aiyomi couldn't load this step yet."}
        </Text>
        <PrimaryButton label="Try again" onPress={() => void flow.retry()} />
      </KeyboardScreen>
    );
  }

  const { values, snapshot } = flow;
  const continueFlow = async () => {
    const complete = await flow.continueFromPage();
    if (complete) router.replace("/onboarding/preparing");
  };

  let content: ReactNode;
  if (flow.page === "preferred_name") {
    content = <PreferredNameStep disabled={flow.saving} update={flow.updateValues} values={values} />;
  } else if (flow.page === "companion_selection") {
    content = (
      <CompanionSelectionStep
        disabled={flow.saving}
        definitions={snapshot.companionDefinitions}
        onSelect={(key, id, name) => void flow.selectCompanion(key, id, name)}
        update={flow.updateValues}
        values={values}
      />
    );
  } else if (flow.page === "companion_name") {
    content = <CompanionDetailsStep disabled={flow.saving} update={flow.updateValues} values={values} />;
  } else if (flow.page === "life_areas") {
    content = (
      <LifeAreasStep
        disabled={flow.saving}
        definitions={snapshot.lifeAreaDefinitions}
        update={flow.updateValues}
        values={values}
      />
    );
  } else if (flow.page === "normal_day") {
    content = (
      <NormalDayStep
        activeRoleKeys={snapshot.activeLifeRoleKeys}
        disabled={flow.saving}
        timezone={flow.timezone}
        update={flow.updateValues}
        values={values}
      />
    );
  } else if (flow.page === "fixed_commitments") {
    content = (
      <CommitmentsStep
        disabled={flow.saving}
        timezone={flow.timezone}
        update={flow.updateValues}
        values={values}
      />
    );
  } else if (flow.page === "improvement_focus") {
    content = <PersonalizationStep disabled={flow.saving} update={flow.updateValues} values={values} />;
  } else {
    content = (
      <NotificationStep
        disabled={flow.saving}
        handled={notificationHandled}
        onHandled={() => setNotificationHandled(true)}
        requestNotifications={flow.requestNotifications}
        saving={flow.saving}
        timezone={flow.timezone}
        update={flow.updateValues}
        values={values}
      />
    );
  }

  const actionLabel =
    flow.page === "notification_setup"
      ? "Finish setup"
      : flow.page === "fixed_commitments" && values.commitments.length === 0
        ? "Skip for now"
        : "Continue";

  return (
    <KeyboardScreen contentContainerStyle={styles.screen} maxContentWidth={680}>
      <AppHeader
        centered
        onBack={
          flow.pageNumber > 1 && !flow.saving
            ? () => void flow.goBack()
            : undefined
        }
        title="Getting to know you"
      />
      <ProgressIndicator current={flow.pageNumber} total={flow.totalPages} />
      <View style={styles.content}>{content}</View>
      {flow.error ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert" style={styles.errorCard}>
          <Text style={styles.errorText}>{flow.error}</Text>
        </View>
      ) : null}
      {flow.page !== "notification_setup" || notificationHandled ? (
        <LoadingButton
          label={actionLabel}
          loading={flow.saving}
          loadingLabel={
            flow.page === "notification_setup" ? "Finishing setup..." : "Saving..."
          }
          onPress={() => void continueFlow()}
          style={styles.continueButton}
        />
      ) : null}
    </KeyboardScreen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingTop: 0 },
  loadingScreen: { alignItems: "center", justifyContent: "center" },
  loadingText: { ...typography.body, marginTop: spacing.md },
  content: {
    alignItems: "center",
    gap: spacing.lg,
    marginTop: spacing.xl,
    width: "100%",
  },
  headingBlock: { alignItems: "center", maxWidth: 560 },
  heading: { ...typography.screenTitle, textAlign: "center" },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  sectionLabel: {
    ...typography.sectionTitle,
    alignSelf: "stretch",
    fontSize: 18,
    marginTop: spacing.sm,
  },
  inlineLabel: { ...typography.label, alignSelf: "stretch" },
  cardList: { gap: spacing.sm, width: "100%" },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    width: "100%",
  },
  timeGrid: { gap: spacing.md, width: "100%" },
  timezoneNote: {
    ...typography.caption,
    alignSelf: "stretch",
    color: colors.primary,
  },
  commitmentCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
    width: "100%",
    ...shadows.card,
  },
  commitmentHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  commitmentTitle: { ...typography.cardTitle },
  removeButton: {
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  removeButtonPressed: { backgroundColor: colors.errorSoft },
  removeText: { ...typography.label, color: colors.error },
  optionalCard: {
    backgroundColor: "#EEE9FA",
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: "100%",
  },
  optionalTitle: { ...typography.cardTitle },
  optionalBody: { ...typography.bodySmall, marginTop: spacing.xs },
  multilineInput: { minHeight: 116, paddingTop: spacing.md },
  trustCard: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.lg,
    padding: spacing.lg,
    width: "100%",
  },
  trustTitle: { ...typography.cardTitle },
  trustBody: { ...typography.bodySmall, marginTop: spacing.xs },
  notificationHero: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bellBadge: {
    alignItems: "center",
    backgroundColor: colors.warningSoft,
    borderColor: "#E6CB77",
    borderRadius: radii.pill,
    borderWidth: 1,
    bottom: spacing.sm,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    right: spacing.xs,
    width: 58,
    ...shadows.card,
  },
  bellDome: {
    backgroundColor: "#D6A93D",
    borderTopLeftRadius: radii.pill,
    borderTopRightRadius: radii.pill,
    height: 25,
    width: 28,
  },
  bellRim: {
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
    height: 5,
    marginTop: -2,
    width: 34,
  },
  bellClapper: {
    backgroundColor: colors.warning,
    borderRadius: radii.pill,
    height: 7,
    marginTop: 1,
    width: 7,
  },
  permissionPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  permissionText: { ...typography.label, color: colors.primaryPressed },
  preferenceList: { gap: spacing.sm, width: "100%" },
  errorCard: {
    backgroundColor: colors.errorSoft,
    borderColor: "#E2B8B8",
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.lg,
    padding: spacing.md,
  },
  errorText: { ...typography.bodySmall, color: colors.error },
  continueButton: { marginTop: spacing.xl },
});
