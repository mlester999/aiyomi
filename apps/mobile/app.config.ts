import type { ConfigContext, ExpoConfig } from "expo/config";

const environment =
  process.env.EXPO_PUBLIC_AIYOMI_ENVIRONMENT?.trim() || "development";
const isProduction = environment === "production";

const iosBundleIdentifier =
  process.env.AIYOMI_IOS_BUNDLE_IDENTIFIER?.trim() ||
  (isProduction ? "com.aiyomi.mobile" : "com.aiyomi.mobile.dev");
const androidPackage =
  process.env.AIYOMI_ANDROID_PACKAGE?.trim() ||
  (isProduction ? "com.aiyomi.mobile" : "com.aiyomi.mobile.dev");
const easProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Aiyomi",
  slug: "aiyomi",
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
  extra: {
    ...config.extra,
    ...(easProjectId ? { eas: { projectId: easProjectId } } : {}),
    aiyomi: {
      environment,
      supabaseProjectRef:
        process.env.EXPO_PUBLIC_SUPABASE_PROJECT_REF?.trim() || null,
      publicSiteUrl:
        process.env.EXPO_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
      privacyUrl: process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() || null,
      termsUrl: process.env.EXPO_PUBLIC_TERMS_URL?.trim() || null,
      supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL?.trim() || null,
      appStoreUrl: process.env.EXPO_PUBLIC_APP_STORE_URL?.trim() || null,
      playStoreUrl: process.env.EXPO_PUBLIC_PLAY_STORE_URL?.trim() || null,
    },
  },
});
