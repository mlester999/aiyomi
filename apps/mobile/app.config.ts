import type { ConfigContext, ExpoConfig } from "expo/config";

type AiyomiEnvironment = "development" | "staging" | "production";

const DEFAULT_EAS_PROJECT_ID = "1d7195ba-d3cc-47ca-9f84-d877c77cd465";
const DEVELOPMENT_SUPABASE_PROJECT_REF = "kznbmwffwcfhcjtaqmyi";

const optionalPublicValue = (value: string | undefined) => {
  const normalized = value?.trim();
  return normalized || undefined;
};

const supportedEnvironments: readonly AiyomiEnvironment[] = [
  "development",
  "staging",
  "production",
];
const configuredEnvironment =
  optionalPublicValue(process.env.EXPO_PUBLIC_AIYOMI_ENVIRONMENT) ??
  optionalPublicValue(process.env.AIYOMI_ENVIRONMENT) ??
  "development";

if (
  !supportedEnvironments.includes(
    configuredEnvironment as AiyomiEnvironment,
  )
) {
  throw new Error(
    `Unsupported Aiyomi environment: ${configuredEnvironment}. Use development, staging, or production.`,
  );
}

const environment = configuredEnvironment as AiyomiEnvironment;
const defaultIdentifiers: Record<
  AiyomiEnvironment,
  { ios: string; android: string }
> = {
  development: {
    ios: "com.aiyomi.mobile.dev",
    android: "com.aiyomi.mobile.dev",
  },
  staging: {
    ios: "com.aiyomi.mobile.staging",
    android: "com.aiyomi.mobile.staging",
  },
  production: {
    ios: "com.aiyomi.mobile",
    android: "com.aiyomi.mobile",
  },
};

const iosBundleIdentifier =
  process.env.AIYOMI_IOS_BUNDLE_IDENTIFIER?.trim() ||
  defaultIdentifiers[environment].ios;
const androidPackage =
  process.env.AIYOMI_ANDROID_PACKAGE?.trim() ||
  defaultIdentifiers[environment].android;
const easProjectId =
  optionalPublicValue(process.env.EXPO_PUBLIC_EAS_PROJECT_ID) ||
  DEFAULT_EAS_PROJECT_ID;
const updatesUrl = `https://u.expo.dev/${easProjectId}`;
const supabaseProjectRef =
  optionalPublicValue(process.env.EXPO_PUBLIC_SUPABASE_PROJECT_REF) ||
  (environment === "development"
    ? DEVELOPMENT_SUPABASE_PROJECT_REF
    : undefined);
const publicSiteUrl =
  optionalPublicValue(process.env.EXPO_PUBLIC_SITE_URL) ||
  "http://localhost:3000";
const privacyUrl = optionalPublicValue(process.env.EXPO_PUBLIC_PRIVACY_URL);
const termsUrl = optionalPublicValue(process.env.EXPO_PUBLIC_TERMS_URL);
const supportUrl = optionalPublicValue(process.env.EXPO_PUBLIC_SUPPORT_URL);
const appStoreUrl = optionalPublicValue(process.env.EXPO_PUBLIC_APP_STORE_URL);
const playStoreUrl = optionalPublicValue(process.env.EXPO_PUBLIC_PLAY_STORE_URL);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Aiyomi",
  slug: "aiyomi",
  owner: "markyyesters-team",
  version: "0.1.0",
  orientation: "portrait",
  scheme: "aiyomi",
  userInterfaceStyle: "light",
  icon: "./assets/icons/aiyomi-icon.png",
  assetBundlePatterns: ["assets/**/*"],
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FBF7EE",
        image: "./assets/brand/aiyomi-launch.png",
        imageWidth: 168,
        resizeMode: "contain",
      },
    ],
    [
      "expo-notifications",
      {
        color: "#2F7F73",
        defaultChannel: "helpful-reminders",
        icon: "./assets/icons/aiyomi-notification.png",
      },
    ],
    [
      "expo-secure-store",
      {
        configureAndroidBackup: false,
        faceIDPermission:
          "Allow Aiyomi to securely access your signed-in session.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: iosBundleIdentifier,
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
    },
  },
  android: {
    package: androidPackage,
    adaptiveIcon: {
      foregroundImage: "./assets/icons/aiyomi-adaptive-foreground.png",
      backgroundColor: "#FBF7EE",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/icons/aiyomi-icon.png",
  },
  updates: {
    url: updatesUrl,
  },
  runtimeVersion: {
    policy: "appVersion",
  },
  extra: {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      projectId: easProjectId,
    },
    aiyomi: {
      environment,
      ...(supabaseProjectRef ? { supabaseProjectRef } : {}),
      publicSiteUrl,
      ...(privacyUrl ? { privacyUrl } : {}),
      ...(termsUrl ? { termsUrl } : {}),
      ...(supportUrl ? { supportUrl } : {}),
      ...(appStoreUrl ? { appStoreUrl } : {}),
      ...(playStoreUrl ? { playStoreUrl } : {}),
    },
  },
});
