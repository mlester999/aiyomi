import "server-only";

import { z } from "zod";

const deploymentEnvironmentSchema = z.enum([
  "development",
  "staging",
  "production",
]);

export type DeploymentEnvironment = z.infer<
  typeof deploymentEnvironmentSchema
>;

export class AdminConfigurationError extends Error {
  constructor(message = "The admin service is not configured.") {
    super(message);
    this.name = "AdminConfigurationError";
  }
}

const requiredValue = (value: string | undefined, label: string) => {
  const normalized = value?.trim();

  if (!normalized) {
    throw new AdminConfigurationError(`${label} is not configured.`);
  }

  return normalized;
};

export const getSupabasePublicConfig = () => ({
  url: requiredValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  ),
  publishableKey: requiredValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ),
});

export const getAdminUrl = () =>
  requiredValue(process.env.NEXT_PUBLIC_ADMIN_URL, "NEXT_PUBLIC_ADMIN_URL");

export const getDeploymentEnvironment = (): DeploymentEnvironment | null => {
  const result = deploymentEnvironmentSchema.safeParse(
    process.env.AIYOMI_ENVIRONMENT?.trim(),
  );

  return result.success ? result.data : null;
};

export const requireDeploymentEnvironment = (): DeploymentEnvironment => {
  const environment = getDeploymentEnvironment();

  if (!environment) {
    throw new AdminConfigurationError(
      "AIYOMI_ENVIRONMENT must be development, staging, or production.",
    );
  }

  return environment;
};
