import { z } from "zod";

import { adminRoleSchema } from "@/lib/admin/contracts";

const optionalString = (maximum: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.string().max(maximum).optional(),
  );

const optionalEnum = <Values extends readonly [string, ...string[]]>(
  values: Values,
) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() ? value.trim() : undefined),
    z.enum(values).optional(),
  );

const optionalBoolean = z.preprocess((value) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}, z.boolean().optional());

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value ? value : undefined),
  z.iso.date().optional(),
);

export const waitlistStatusValues = [
  "pending",
  "confirmed",
  "invited",
  "converted",
  "unsubscribed",
] as const;
export const mutableWaitlistStatusValues = [
  "pending",
  "confirmed",
  "invited",
  "unsubscribed",
] as const;
export const platformValues = ["ios", "android", "both"] as const;
export const sourceValues = [
  "landing_page",
  "direct",
  "referral",
  "organic",
  "social",
  "other",
] as const;
export const emailStatusValues = ["sent", "not_sent"] as const;
export const waitlistSortValues = [
  "newest",
  "oldest",
  "email",
  "status",
  "source",
] as const;

export const waitlistFiltersSchema = z
  .object({
    query: optionalString(120),
    status: optionalEnum(waitlistStatusValues),
    platform: optionalEnum(platformValues),
    source: optionalEnum(sourceValues),
    campaign: optionalString(100),
    emailStatus: optionalEnum(emailStatusValues),
    converted: optionalBoolean,
    dateFrom: optionalDate,
    dateTo: optionalDate,
    sort: optionalEnum(waitlistSortValues).default("newest"),
    page: z.coerce.number().int().min(1).max(100_000).catch(1),
    pageSize: z.coerce.number().int().refine((value) => [25, 50, 100].includes(value)).catch(25),
  })
  .refine(
    ({ dateFrom, dateTo }) => !dateFrom || !dateTo || dateFrom <= dateTo,
    { message: "The start date must be before the end date.", path: ["dateTo"] },
  );

export type WaitlistFilters = z.infer<typeof waitlistFiltersSchema>;

export const parseWaitlistFilters = (
  params: Record<string, string | string[] | undefined>,
) => {
  const result = waitlistFiltersSchema.safeParse({
    query: params.query,
    status: params.status,
    platform: params.platform,
    source: params.source,
    campaign: params.campaign,
    emailStatus: params.emailStatus,
    converted: params.converted,
    dateFrom: params.dateFrom,
    dateTo: params.dateTo,
    sort: params.sort,
    page: params.page,
    pageSize: params.pageSize,
  });

  return result.success ? result.data : waitlistFiltersSchema.parse({});
};

export const statusMutationSchema = z.object({
  signupId: z.string().uuid(),
  status: z.enum(mutableWaitlistStatusValues),
});

export const memberCreateSchema = z.object({
  userId: z.string().uuid(),
  role: adminRoleSchema,
  displayName: optionalString(100),
});

export const memberUpdateSchema = z.object({
  memberId: z.string().uuid(),
  role: adminRoleSchema,
  status: z.enum(["active", "suspended"]),
  displayName: optionalString(100),
});

export const featureFlagMutationSchema = z.object({
  key: z.literal("waitlist_enabled"),
  enabled: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((value) => value === true || value === "true"),
});

export const applicationSettingMutationSchema = z.object({
  key: z.enum(["support_url", "privacy_url", "terms_url"]),
  value: z
    .string()
    .trim()
    .min(8)
    .max(500)
    .regex(
      /^(?:https:\/\/[A-Za-z0-9.-]+(?::[0-9]{1,5})?|http:\/\/(?:localhost|127\.0\.0\.1)(?::[0-9]{1,5})?)(?:\/[A-Za-z0-9._~:/%+@=-]*)?$/,
      "Use an approved public URL without credentials, query values, or fragments.",
    ),
});

export const dashboardSchema = z.object({
  metrics: z.object({
    total_leads: z.number().nonnegative(),
    joined_today: z.number().nonnegative(),
    joined_7_days: z.number().nonnegative(),
    joined_30_days: z.number().nonnegative(),
    confirmation_sent: z.number().nonnegative(),
    referral_signups: z.number().nonnegative(),
    converted_users: z.number().nonnegative(),
  }),
  daily_signups: z.array(z.object({ date: z.string(), count: z.number().nonnegative() })),
  platform_distribution: z.array(
    z.object({ key: z.string(), count: z.number().nonnegative(), percentage: z.number().nonnegative() }),
  ),
  source_distribution: z.array(
    z.object({ key: z.string(), count: z.number().nonnegative(), percentage: z.number().nonnegative() }),
  ),
});

export const waitlistListSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export const waitlistRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  first_name: z.string().nullable(),
  platform_interest: z.enum(platformValues),
  status: z.enum(waitlistStatusValues),
  source: z.enum(sourceValues),
  utm_source: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  referral_code: z.string().nullable(),
  referred_by_code: z.string().nullable(),
  email_status: z.enum(["sent", "not_sent"]),
  converted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  total_count: z.number().int().nonnegative(),
});

export const waitlistRowsSchema = z.array(waitlistRowSchema);

export const exportRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  first_name: z.string().nullable(),
  platform_interest: z.enum(platformValues),
  status: z.enum(waitlistStatusValues),
  source: z.enum(sourceValues),
  utm_source: z.string().nullable(),
  utm_medium: z.string().nullable(),
  utm_campaign: z.string().nullable(),
  utm_content: z.string().nullable(),
  utm_term: z.string().nullable(),
  referral_code: z.string().nullable(),
  referred_by_code: z.string().nullable(),
  locale: z.string().nullable(),
  marketing_consent: z.boolean(),
  consent_at: z.string().nullable(),
  confirmation_send_requested: z.boolean(),
  confirmation_sent_at: z.string().nullable(),
  converted: z.boolean(),
  converted_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const exportRowsSchema = z.array(exportRowSchema).max(5000);

export const leadDetailSchema = z.object({
  lead: z.object({
    id: z.string().uuid(),
    email: z.string(),
    first_name: z.string().nullable(),
    platform_interest: z.enum(platformValues),
    status: z.enum(waitlistStatusValues),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  lifecycle: z.object({
    status: z.enum(waitlistStatusValues),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  email: z.object({
    status: z.enum(["sent", "not_sent"]),
    confirmation_sent_at: z.string().nullable(),
  }),
  attribution: z.object({
    source: z.enum(sourceValues),
    utm_source: z.string().nullable(),
    utm_medium: z.string().nullable(),
    utm_campaign: z.string().nullable(),
    utm_content: z.string().nullable(),
    utm_term: z.string().nullable(),
    locale: z.string().nullable(),
  }).partial(),
  referral: z.object({
    referral_code: z.string().nullable(),
    referred_by: z.object({
      id: z.string().uuid(),
      email: z.string(),
      first_name: z.string().nullable(),
      referral_code: z.string().nullable(),
      status: z.enum(waitlistStatusValues),
    }).nullable(),
    referral_count: z.number().int().nonnegative(),
  }).partial(),
  consent: z.object({
    marketing_consent: z.boolean(),
    consent_at: z.string().nullable(),
  }).partial(),
  conversion: z.object({
    converted: z.boolean(),
    converted_user_id: z.string().uuid().nullable(),
    converted_at: z.string().nullable(),
  }).partial({ converted_user_id: true, converted_at: true }),
  access: z.object({
    role: adminRoleSchema,
    redacted: z.boolean(),
    redacted_sections: z.array(z.string()),
  }),
});

const breakdownItemSchema = z.object({
  key: z.string(),
  count: z.number().nonnegative(),
  converted: z.number().nonnegative().optional(),
  conversion_rate: z.number().nonnegative().optional(),
  percentage: z.number().nonnegative(),
});

export const analyticsSchema = z.object({
  summary: z.object({
    total_leads: z.number().nonnegative(),
    converted_users: z.number().nonnegative(),
    conversion_rate: z.number().nonnegative(),
    confirmation_sent: z.number().nonnegative(),
    referred_signups: z.number().nonnegative(),
  }),
  daily_signups: z.array(z.object({ date: z.string(), count: z.number().nonnegative() })),
  source_distribution: z.array(breakdownItemSchema),
  platform_distribution: z.array(breakdownItemSchema),
  campaigns: z.array(breakdownItemSchema),
  locales: z.array(breakdownItemSchema),
  email_status_distribution: z.array(breakdownItemSchema),
});

export const referralsSchema = z.object({
  metrics: z.object({
    total_referred: z.number().nonnegative(),
    referral_share: z.number().nonnegative(),
    active_referrers: z.number().nonnegative(),
    converted_referrals: z.number().nonnegative(),
  }),
  top_referrers: z.array(
    z.object({
      id: z.string().uuid(),
      label: z.string(),
      referral_code: z.string(),
      referrals: z.number().int().nonnegative(),
      converted_referrals: z.number().int().nonnegative(),
      created_at: z.string(),
      status: z.enum(waitlistStatusValues),
    }),
  ),
});

export const auditRowSchema = z.object({
  id: z.string().uuid(),
  actor_member_id: z.string().uuid().nullable(),
  actor_user_id: z.string().uuid().nullable(),
  actor_email: z.string().nullable(),
  actor_display_name: z.string().nullable(),
  actor_role: adminRoleSchema.nullable(),
  action: z.string(),
  target_type: z.string(),
  target_id: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  request_id: z.string().uuid().nullable(),
  created_at: z.string(),
  total_count: z.number().int().nonnegative(),
});

export const auditRowsSchema = z.array(auditRowSchema);

export const membersSchema = z.array(
  z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    email: z.string().email(),
    display_name: z.string().nullable(),
    role: adminRoleSchema,
    status: z.enum(["active", "suspended"]),
    created_at: z.string(),
    updated_at: z.string(),
    created_by: z.string().uuid().nullable(),
    last_modified_by: z.string().uuid().nullable(),
    total_count: z.number().int().nonnegative(),
  }),
);

export const flagsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    key: z.literal("waitlist_enabled"),
    description: z.string(),
    enabled: z.boolean(),
    environment: z.enum(["development", "staging", "production"]),
    metadata: z.record(z.string(), z.unknown()),
    updated_at: z.string(),
    updated_by: z.string().uuid().nullable(),
    updated_by_email: z.string().nullable(),
  }),
);

export const settingsSchema = z.array(
  z.object({
    id: z.string().uuid(),
    key: z.enum(["support_url", "privacy_url", "terms_url"]),
    value: z.string(),
    environment: z.enum(["development", "staging", "production"]),
    updated_at: z.string(),
    updated_by: z.string().uuid().nullable(),
    updated_by_email: z.string().nullable(),
  }),
);
