import {
  ADMIN_MEMBER_ROLES,
  ADMIN_MEMBER_STATUSES,
  ADMIN_PERMISSIONS,
  APPLICATION_SETTING_KEYS,
  DEPLOYMENT_ENVIRONMENTS,
  FEATURE_FLAG_KEYS,
  WAITLIST_PLATFORM_INTERESTS,
  WAITLIST_SOURCES,
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

const optionalFirstName = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .min(1)
    .max(80)
    .regex(
      /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u,
      "First name contains unsupported characters.",
    )
    .optional(),
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
