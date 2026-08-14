export type AiyomiEnvironment = "development" | "staging" | "production";

const DEVELOPMENT_PROJECT_REF = "kznbmwffwcfhcjtaqmyi";
const PRODUCTION_PROJECT_REF = "kdzkhhujkyrgyuqcmdqu";
const SUPPORTED_ENVIRONMENTS: readonly AiyomiEnvironment[] = [
  "development",
  "staging",
  "production",
];

const optionalValue = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const configuredEnvironment = optionalValue(
  process.env.EXPO_PUBLIC_AIYOMI_ENVIRONMENT,
);

const environment: AiyomiEnvironment = SUPPORTED_ENVIRONMENTS.includes(
  configuredEnvironment as AiyomiEnvironment,
)
  ? (configuredEnvironment as AiyomiEnvironment)
  : "development";

const supabaseUrl = optionalValue(process.env.EXPO_PUBLIC_SUPABASE_URL);
const supabasePublishableKey = optionalValue(
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
const configuredProjectRef = optionalValue(
  process.env.EXPO_PUBLIC_SUPABASE_PROJECT_REF,
);

const projectRefFromUrl = (() => {
  if (!supabaseUrl) return undefined;

  try {
    const hostname = new URL(supabaseUrl).hostname;
    return hostname.endsWith(".supabase.co") ? hostname.split(".")[0] : undefined;
  } catch {
    return undefined;
  }
})();

const configurationError = (() => {
  if (!supabaseUrl || !supabasePublishableKey || !configuredProjectRef) {
    return "Aiyomi needs its public Development configuration before account features can connect.";
  }

  if (!projectRefFromUrl || projectRefFromUrl !== configuredProjectRef) {
    return "The configured Supabase URL and project reference do not match.";
  }

  if (
    environment === "development" &&
    configuredProjectRef !== DEVELOPMENT_PROJECT_REF
  ) {
    return "Development builds may connect only to the confirmed aiyomi-dev project.";
  }

  if (
    environment === "production" &&
    configuredProjectRef !== PRODUCTION_PROJECT_REF
  ) {
    return "Production builds may connect only to the confirmed Aiyomi Production project.";
  }

  if (
    environment === "staging" &&
    [DEVELOPMENT_PROJECT_REF, PRODUCTION_PROJECT_REF].includes(
      configuredProjectRef,
    )
  ) {
    return "Staging builds require a separate Staging Supabase project.";
  }

  return null;
})();

export const appConfig = Object.freeze({
  name: "Aiyomi",
  tagline: "Your AI companion for better days.",
  scheme: "aiyomi",
  environment,
  isDevelopment: environment === "development",
  urls: Object.freeze({
    site: optionalValue(process.env.EXPO_PUBLIC_SITE_URL) ?? "http://localhost:3000",
    privacy: optionalValue(process.env.EXPO_PUBLIC_PRIVACY_URL),
    terms: optionalValue(process.env.EXPO_PUBLIC_TERMS_URL),
    support: optionalValue(process.env.EXPO_PUBLIC_SUPPORT_URL),
    appStore: optionalValue(process.env.EXPO_PUBLIC_APP_STORE_URL),
    playStore: optionalValue(process.env.EXPO_PUBLIC_PLAY_STORE_URL),
  }),
  supabase: Object.freeze({
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    projectRef: configuredProjectRef,
    developmentProjectRef: DEVELOPMENT_PROJECT_REF,
    productionProjectRef: PRODUCTION_PROJECT_REF,
    isConfigured: configurationError === null,
    configurationError,
  }),
});

export type AppConfig = typeof appConfig;
