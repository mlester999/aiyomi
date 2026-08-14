import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const KEYS = {
  hasSeenIntro: "aiyomi.first-run.has-seen-intro.v1",
  preAuthIntent: "aiyomi.first-run.intent.v1",
  cachedProfile: "aiyomi.profile-cache.v1",
  cachedCompanion: "aiyomi.companion-cache.v1",
  installationId: "aiyomi.installation-id.v1",
} as const;

export const readHasSeenIntro = async (): Promise<boolean> =>
  (await AsyncStorage.getItem(KEYS.hasSeenIntro)) === "true";

export const markIntroSeen = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.hasSeenIntro, "true");
};

export const readPreAuthIntent = async (): Promise<string | null> =>
  AsyncStorage.getItem(KEYS.preAuthIntent);

export const savePreAuthIntent = async (intent: string | null): Promise<void> => {
  if (intent) {
    await AsyncStorage.setItem(KEYS.preAuthIntent, intent);
    return;
  }

  await AsyncStorage.removeItem(KEYS.preAuthIntent);
};

export const readCachedProfile = async <Profile>(): Promise<Profile | null> => {
  const raw = await AsyncStorage.getItem(KEYS.cachedProfile);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Profile;
  } catch {
    await AsyncStorage.removeItem(KEYS.cachedProfile);
    return null;
  }
};

export const cacheProfile = async (profile: unknown): Promise<void> => {
  await AsyncStorage.setItem(KEYS.cachedProfile, JSON.stringify(profile));
};

export const clearCachedProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.cachedProfile);
};

export const readCachedCompanion = async <Companion>(): Promise<Companion | null> => {
  const raw = await AsyncStorage.getItem(KEYS.cachedCompanion);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Companion;
  } catch {
    await AsyncStorage.removeItem(KEYS.cachedCompanion);
    return null;
  }
};

export const cacheCompanion = async (companion: unknown): Promise<void> => {
  await AsyncStorage.setItem(KEYS.cachedCompanion, JSON.stringify(companion));
};

export const clearCachedCompanion = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEYS.cachedCompanion);
};

export const getInstallationId = async (): Promise<string> => {
  const existing = await AsyncStorage.getItem(KEYS.installationId);
  if (existing) return existing;

  const created = Crypto.randomUUID();
  await AsyncStorage.setItem(KEYS.installationId, created);
  return created;
};
