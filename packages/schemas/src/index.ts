import {
  COMPANION_KEYS,
  COMPANION_NUDGE_LEVELS,
  COMPANION_PERSONALITIES,
  COMPANION_PERSONALITY_NUDGE_LEVEL,
  ADMIN_MEMBER_ROLES,
  ADMIN_MEMBER_STATUSES,
  ADMIN_PERMISSIONS,
  APPLICATION_SETTING_KEYS,
  DEPLOYMENT_ENVIRONMENTS,
  ENERGY_BASELINES,
  FEATURE_FLAG_KEYS,
  LIFE_AREA_KEYS,
  LIFE_ROLE_KEYS,
  MOBILE_PLATFORMS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PERMISSION_STATUSES,
  NOTIFICATION_PREFERENCE_KEYS,
  OBSTACLE_KEYS,
  ONBOARDING_STATUSES,
  ONBOARDING_STEPS,
  PERSISTED_WEEKDAYS,
  PRE_AUTH_INTENTS,
  WAITLIST_PLATFORM_INTERESTS,
  WAITLIST_SOURCES,
  WEEKDAYS,
  type WaitlistAttribution,
} from "@aiyomi/types";
import { z } from "zod";

const UTM_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._~:/+%=-]*$/;
const REFERRAL_PATTERN = /^[A-Z0-9][A-Z0-9_-]{2,31}$/;
const LOCALE_PATTERN = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

const emptyStringToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

export const normalizeEmail = (email: string): string =>
  email.trim().toLocaleLowerCase("en-US");

export const normalizedEmailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email("Enter a valid email address.")
  .transform(normalizeEmail);

export const waitlistPlatformSchema = z.enum(WAITLIST_PLATFORM_INTERESTS, {
  error: "Choose iOS, Android, or Both.",
});

export const waitlistSourceSchema = z.enum(WAITLIST_SOURCES);

const WAITLIST_CTA_SOURCES = [
  "hero",
  "navigation",
  "final_cta",
  "mobile_navigation",
] as const;

const waitlistSourceInputSchema = z.preprocess(
  (value) =>
    typeof value === "string" &&
    (WAITLIST_CTA_SOURCES as readonly string[]).includes(value)
      ? "landing_page"
      : value,
  waitlistSourceSchema,
);

export const utmValueSchema = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(UTM_PATTERN, "Attribution contains unsupported characters.");

export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(REFERRAL_PATTERN, "Referral code is invalid.");

export const localeSchema = z
  .string()
  .trim()
  .min(2)
  .max(35)
  .regex(LOCALE_PATTERN, "Locale is invalid.");

const safelyConstrainedOptionalValue = <Output>(schema: z.ZodType<Output>) =>
  z.unknown().optional().transform((value): Output | undefined => {
    const normalized = emptyStringToUndefined(value);

    if (normalized === undefined || normalized === null) {
      return undefined;
    }

    const result = schema.safeParse(normalized);
    return result.success ? result.data : undefined;
  });

const optionalUtmValue = safelyConstrainedOptionalValue(utmValueSchema);
const optionalReferralCode =
  safelyConstrainedOptionalValue(referralCodeSchema);

const optionalLocale = z.preprocess(
  emptyStringToUndefined,
  localeSchema.optional(),
);

export const preferredNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u,
    "Name contains unsupported characters.",
  );

const optionalFirstName = z.preprocess(
  emptyStringToUndefined,
  preferredNameSchema.optional(),
);

export const waitlistAttributionSchema = z.object({
  source: waitlistSourceInputSchema.default("landing_page"),
  utmSource: optionalUtmValue,
  utmMedium: optionalUtmValue,
  utmCampaign: optionalUtmValue,
  utmContent: optionalUtmValue,
  utmTerm: optionalUtmValue,
  referralCode: optionalReferralCode,
});

export const waitlistSignupSchema = waitlistAttributionSchema.extend({
  email: normalizedEmailSchema,
  firstName: optionalFirstName,
  platformInterest: waitlistPlatformSchema,
  marketingConsent: z.boolean().default(false),
  website: z.string().max(200).default(""),
  formStartedAt: z.number().int().positive().optional(),
  locale: optionalLocale,
}).strict();

export type WaitlistSignup = z.output<typeof waitlistSignupSchema>;
export type WaitlistSignupRequest = z.input<typeof waitlistSignupSchema>;

export const adminMemberRoleSchema = z.enum(ADMIN_MEMBER_ROLES);

export const adminMemberStatusSchema = z.enum(ADMIN_MEMBER_STATUSES);

export const adminPermissionSchema = z.enum(ADMIN_PERMISSIONS);

export const deploymentEnvironmentSchema = z.enum(DEPLOYMENT_ENVIRONMENTS);

export const featureFlagKeySchema = z.enum(FEATURE_FLAG_KEYS);

export const applicationSettingKeySchema = z.enum(APPLICATION_SETTING_KEYS);

export const adminCurrentMemberSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    email: z.string().email(),
    displayName: z.string().min(1).max(100).nullable(),
    role: adminMemberRoleSchema,
    status: z.literal("active"),
    permissions: z.array(adminPermissionSchema),
  })
  .strict();

export type AdminCurrentMember = z.output<typeof adminCurrentMemberSchema>;

const hasUniqueValues = <Value extends string | number>(
  values: readonly Value[],
) =>
  new Set(values).size === values.length;

const hasUniqueNormalizedValues = (values: readonly string[]) =>
  new Set(values.map((value) => value.toLocaleLowerCase("en-US"))).size ===
  values.length;

export const mobilePlatformSchema = z.enum(MOBILE_PLATFORMS);

export const preAuthIntentSchema = z.enum(PRE_AUTH_INTENTS);

export const onboardingStatusSchema = z.enum(ONBOARDING_STATUSES);

export const onboardingStepSchema = z.enum(ONBOARDING_STEPS);

export const companionKeySchema = z.enum(COMPANION_KEYS);

export const companionPersonalitySchema = z.enum(COMPANION_PERSONALITIES);

export const companionNudgeLevelSchema = z.enum(COMPANION_NUDGE_LEVELS);

export const lifeAreaKeySchema = z.enum(LIFE_AREA_KEYS);

export const lifeRoleKeySchema = z.enum(LIFE_ROLE_KEYS);

export const obstacleKeySchema = z.enum(OBSTACLE_KEYS);

export const energyBaselineSchema = z.enum(ENERGY_BASELINES);

export const weekdaySchema = z.enum(WEEKDAYS);

export const persistedWeekdaySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const notificationPermissionStatusSchema = z.enum(
  NOTIFICATION_PERMISSION_STATUSES,
);

export const notificationCategorySchema = z.enum(NOTIFICATION_CATEGORIES);

export const notificationPreferenceKeySchema = z.enum(
  NOTIFICATION_PREFERENCE_KEYS,
);

export const uuidSchema = z.string().uuid();

export const isoTimestampSchema = z.string().datetime({ offset: true });

export const localTimeSchema = z
  .string()
  .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use a 24-hour time such as 07:30.");

export const ianaTimezoneSchema = z
  .string()
  .trim()
  .min(3)
  .max(100)
  .regex(
    /^[A-Za-z][A-Za-z0-9._+-]*(?:\/[A-Za-z0-9._+-]+)*$/,
    "Choose a valid IANA timezone.",
  );

export const companionNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u,
    "Companion name contains unsupported characters.",
  );

export const customLifeAreaNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(
    /^[\p{L}\p{M}\p{N}][\p{L}\p{M}\p{N} &'’/+.-]*$/u,
    "Life Area name contains unsupported characters.",
  );

export const improvementFocusSchema = z.string().trim().min(1).max(500);

export const customObstacleSchema = z.string().trim().min(1).max(120);

export const commitmentTitleSchema = z.string().trim().min(1).max(80);

export const userProfileSchema = z
  .object({
    id: uuidSchema,
    userId: uuidSchema,
    firstName: preferredNameSchema.nullable(),
    timezone: ianaTimezoneSchema.nullable(),
    locale: localeSchema.nullable(),
    onboardingStatus: onboardingStatusSchema,
    onboardingStep: onboardingStepSchema.nullable(),
    onboardingCompletedAt: isoTimestampSchema.nullable(),
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((profile, context) => {
    if (Date.parse(profile.updatedAt) < Date.parse(profile.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "Updated time cannot be earlier than created time.",
        path: ["updatedAt"],
      });
    }

    if (
      profile.onboardingStatus === "not_started" &&
      (profile.onboardingStep !== null ||
        profile.onboardingCompletedAt !== null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Onboarding has not started.",
        path: ["onboardingStatus"],
      });
    }

    if (
      profile.onboardingStatus === "in_progress" &&
      (profile.onboardingStep === null ||
        profile.onboardingCompletedAt !== null)
    ) {
      context.addIssue({
        code: "custom",
        message: "In-progress onboarding requires a current step only.",
        path: ["onboardingStatus"],
      });
    }

    if (
      profile.onboardingStatus === "completed" &&
      (profile.onboardingStep !== null ||
        profile.onboardingCompletedAt === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "Completed onboarding requires a completion time.",
        path: ["onboardingStatus"],
      });
    }
  });

export const companionDefinitionSchema = z
  .object({
    id: uuidSchema,
    key: companionKeySchema,
    name: z.string().trim().min(1).max(40),
    description: z.string().trim().min(1).max(160),
    assetKey: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9][a-z0-9/_-]*$/),
    active: z.boolean(),
    sortOrder: z.number().int().min(0).max(1_000),
  })
  .strict();

export const userCompanionSchema = z
  .object({
    id: uuidSchema,
    userId: uuidSchema,
    companionId: uuidSchema,
    companionKey: companionKeySchema,
    name: companionNameSchema,
    personality: companionPersonalitySchema,
    nudgeLevel: companionNudgeLevelSchema,
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((companion, context) => {
    if (Date.parse(companion.updatedAt) < Date.parse(companion.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "Updated time cannot be earlier than created time.",
        path: ["updatedAt"],
      });
    }

    if (
      companion.nudgeLevel !==
      COMPANION_PERSONALITY_NUDGE_LEVEL[companion.personality]
    ) {
      context.addIssue({
        code: "custom",
        message: "Nudge level must match the selected personality.",
        path: ["nudgeLevel"],
      });
    }
  });

const userLifeAreaBaseSchema = {
  id: uuidSchema,
  userId: uuidSchema,
  createdAt: isoTimestampSchema,
} as const;

export const userLifeAreaSchema = z.discriminatedUnion("kind", [
  z
    .object({
      ...userLifeAreaBaseSchema,
      kind: z.literal("definition"),
      definitionKey: lifeAreaKeySchema,
      customName: z.null(),
    })
    .strict(),
  z
    .object({
      ...userLifeAreaBaseSchema,
      kind: z.literal("custom"),
      definitionKey: z.null(),
      customName: customLifeAreaNameSchema,
    })
    .strict(),
]);

export const lifeAreaSelectionSchema = z
  .object({
    definitionKeys: z
      .array(lifeAreaKeySchema)
      .max(LIFE_AREA_KEYS.length)
      .refine(hasUniqueValues, "Choose each Life Area only once."),
    customNames: z
      .array(customLifeAreaNameSchema)
      .max(3)
      .refine(
        hasUniqueNormalizedValues,
        "Custom Life Area names must be unique.",
      ),
  })
  .strict()
  .refine(
    ({ customNames, definitionKeys }) =>
      customNames.length + definitionKeys.length > 0,
    "Choose at least one Life Area.",
  );

export const lifeRoleSelectionSchema = z
  .array(lifeRoleKeySchema)
  .min(1)
  .max(LIFE_ROLE_KEYS.length)
  .refine(hasUniqueValues, "Choose each life role only once.");

export const obstacleSelectionSchema = z
  .array(obstacleKeySchema)
  .max(OBSTACLE_KEYS.length)
  .refine(hasUniqueValues, "Choose each obstacle only once.");

export const weekdaySelectionSchema = z
  .array(weekdaySchema)
  .min(1)
  .max(WEEKDAYS.length)
  .refine(hasUniqueValues, "Choose each day only once.");

export const persistedWeekdaySelectionSchema = z
  .array(persistedWeekdaySchema)
  .min(1)
  .max(PERSISTED_WEEKDAYS.length)
  .refine(hasUniqueValues, "Choose each day only once.");

const fixedCommitmentInputShape = {
  title: commitmentTitleSchema,
  daysOfWeek: persistedWeekdaySelectionSchema,
  startTime: localTimeSchema,
  endTime: localTimeSchema,
  timezone: ianaTimezoneSchema,
  active: z.boolean(),
} as const;

export const fixedCommitmentInputSchema = z
  .object(fixedCommitmentInputShape)
  .strict()
  .refine(({ endTime, startTime }) => endTime !== startTime, {
    message: "Start and end times must be different.",
    path: ["endTime"],
  });

export const fixedCommitmentSchema = z
  .object({
    id: uuidSchema,
    userId: uuidSchema,
    ...fixedCommitmentInputShape,
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((commitment, context) => {
    if (commitment.endTime === commitment.startTime) {
      context.addIssue({
        code: "custom",
        message: "Start and end times must be different.",
        path: ["endTime"],
      });
    }

    if (Date.parse(commitment.updatedAt) < Date.parse(commitment.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "Updated time cannot be earlier than created time.",
        path: ["updatedAt"],
      });
    }
  });

export const userOnboardingContextSchema = z
  .object({
    userId: uuidSchema,
    wakeTime: localTimeSchema,
    sleepTime: localTimeSchema,
    timezone: ianaTimezoneSchema,
    lifeRoles: lifeRoleSelectionSchema,
    improvementFocus: improvementFocusSchema,
    obstacles: obstacleSelectionSchema,
    customObstacle: customObstacleSchema.nullable(),
    energyBaseline: energyBaselineSchema.nullable(),
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((userContext, context) => {
    if (
      userContext.customObstacle !== null &&
      !userContext.obstacles.includes("something_else")
    ) {
      context.addIssue({
        code: "custom",
        message: "A custom obstacle requires Something else to be selected.",
        path: ["customObstacle"],
      });
    }
  });

export const notificationPreferenceValuesSchema = z.record(
  notificationPreferenceKeySchema,
  z.boolean(),
);

export const notificationSettingsSchema = z
  .object({
    userId: uuidSchema,
    permissionStatus: notificationPermissionStatusSchema,
    deviceEnabled: z.boolean(),
    preferences: notificationPreferenceValuesSchema,
    quietHoursEnabled: z.boolean(),
    quietHoursStart: localTimeSchema.nullable(),
    quietHoursEnd: localTimeSchema.nullable(),
    nudgeLevel: companionNudgeLevelSchema,
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((settings, context) => {
    const hasStart = settings.quietHoursStart !== null;
    const hasEnd = settings.quietHoursEnd !== null;

    if (hasStart !== hasEnd) {
      context.addIssue({
        code: "custom",
        message: "Quiet hours require both a start and end time.",
        path: ["quietHoursStart"],
      });
    }

    if (settings.quietHoursEnabled && (!hasStart || !hasEnd)) {
      context.addIssue({
        code: "custom",
        message: "Enabled quiet hours require a start and end time.",
        path: ["quietHoursEnabled"],
      });
    }

    if (
      hasStart &&
      hasEnd &&
      settings.quietHoursStart === settings.quietHoursEnd
    ) {
      context.addIssue({
        code: "custom",
        message: "Quiet hours start and end must be different.",
        path: ["quietHoursEnd"],
      });
    }
  });

export const devicePushTokenSchema = z
  .object({
    id: uuidSchema,
    userId: uuidSchema,
    installationId: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
    platform: mobilePlatformSchema,
    expoPushToken: z.string().trim().min(16).max(512).nullable(),
    enabled: z.boolean(),
    permissionStatus: notificationPermissionStatusSchema,
    lastSeenAt: isoTimestampSchema,
    createdAt: isoTimestampSchema,
    updatedAt: isoTimestampSchema,
  })
  .strict()
  .superRefine((token, context) => {
    if (
      token.enabled &&
      (token.permissionStatus !== "granted" || token.expoPushToken === null)
    ) {
      context.addIssue({
        code: "custom",
        message: "An enabled device requires granted permission and a push token.",
        path: ["enabled"],
      });
    }

    if (Date.parse(token.updatedAt) < Date.parse(token.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "Updated time cannot be earlier than created time.",
        path: ["updatedAt"],
      });
    }

    if (Date.parse(token.lastSeenAt) < Date.parse(token.createdAt)) {
      context.addIssue({
        code: "custom",
        message: "Last seen time cannot be earlier than created time.",
        path: ["lastSeenAt"],
      });
    }
  });

export type UserProfileData = z.output<typeof userProfileSchema>;
export type CompanionDefinitionData = z.output<
  typeof companionDefinitionSchema
>;
export type UserCompanionData = z.output<typeof userCompanionSchema>;
export type UserLifeAreaData = z.output<typeof userLifeAreaSchema>;
export type FixedCommitmentInput = z.output<
  typeof fixedCommitmentInputSchema
>;
export type FixedCommitmentData = z.output<typeof fixedCommitmentSchema>;
export type UserOnboardingContextData = z.output<
  typeof userOnboardingContextSchema
>;
export type NotificationSettingsData = z.output<
  typeof notificationSettingsSchema
>;
export type DevicePushTokenData = z.output<typeof devicePushTokenSchema>;

type SearchParamsReader = Pick<URLSearchParams, "get">;

const parseOptional = <Output>(
  value: string | null,
  schema: z.ZodType<Output>,
): Output | undefined => {
  if (!value) {
    return undefined;
  }

  const result = schema.safeParse(value);
  return result.success ? result.data : undefined;
};

export const parseReferralCode = (value: string | null | undefined) =>
  parseOptional(value ?? null, referralCodeSchema);

export const parseWaitlistAttribution = (
  searchParams: SearchParamsReader,
): WaitlistAttribution => {
  const referralCode = parseReferralCode(searchParams.get("ref"));
  const source = parseOptional(searchParams.get("source"), waitlistSourceSchema);

  return {
    source: source ?? (referralCode ? "referral" : "landing_page"),
    utmSource: parseOptional(searchParams.get("utm_source"), utmValueSchema),
    utmMedium: parseOptional(searchParams.get("utm_medium"), utmValueSchema),
    utmCampaign: parseOptional(searchParams.get("utm_campaign"), utmValueSchema),
    utmContent: parseOptional(searchParams.get("utm_content"), utmValueSchema),
    utmTerm: parseOptional(searchParams.get("utm_term"), utmValueSchema),
    referralCode,
  };
};
