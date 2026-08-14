import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import type { Session } from "@supabase/supabase-js";
import * as Network from "expo-network";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { trackMobileEvent } from "../analytics/mobile";
import type { MobileProfile } from "../data/types";
import { supabase } from "../lib/supabase";
import {
  activateCurrentDeviceRegistration,
  refreshDeviceRegistration,
  stopPushTokenChanges,
} from "../notifications/service";
import {
  cacheProfile,
  clearCachedCompanion,
  clearCachedProfile,
  markIntroSeen,
  readCachedProfile,
  readHasSeenIntro,
  readPreAuthIntent,
  savePreAuthIntent,
} from "../storage/local";
import {
  BOOTSTRAP_TIMEOUT_MS,
  PROFILE_REQUEST_TIMEOUT_MS,
  withTimeout,
} from "./bootstrap";

let nativeAppOpenTracked = false;

interface AppContextValue {
  bootstrapComplete: boolean;
  bootstrapError: string | null;
  hasSeenIntro: boolean;
  preAuthIntent: string | null;
  session: Session | null;
  profile: MobileProfile | null;
  isOffline: boolean;
  finishIntro: (intent?: string | null) => Promise<void>;
  reloadProfile: () => Promise<MobileProfile | null>;
  retryBootstrap: () => Promise<void>;
  signOutLocally: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const loadProfileForUser = async (
  userId: string,
): Promise<MobileProfile | null> => {
  if (!supabase) return null;

  const { error: ensureError } = await supabase.rpc("ensure_mobile_profile");
  if (ensureError) throw ensureError;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, first_name, timezone, locale, onboarding_status, onboarding_step, onboarding_completed_at, created_at, updated_at",
    )
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as MobileProfile;
};

export function AppProvider({ children }: PropsWithChildren) {
  const [bootstrapComplete, setBootstrapComplete] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [preAuthIntent, setPreAuthIntent] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MobileProfile | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const bootstrapRunRef = useRef(0);
  const activeUserId = session?.user.id;

  useEffect(() => {
    if (
      nativeAppOpenTracked ||
      (Platform.OS !== "ios" && Platform.OS !== "android")
    ) {
      return;
    }

    nativeAppOpenTracked = true;
    const platform = Platform.OS;
    setTimeout(() => {
      try {
        trackMobileEvent(ANALYTICS_EVENTS.APP_OPENED, {
          launch: "cold",
          platform,
        });
      } catch {
        // Analytics must never delay or interrupt app startup.
      }
    }, 0);
  }, []);

  const hydrateProfile = useCallback(
    async (
      activeSession: Session | null,
      shouldApply: () => boolean = () => true,
    ) => {
      if (!activeSession) {
        if (shouldApply()) {
          setProfile(null);
          setBootstrapError(null);
        }
        return null;
      }

      try {
        const nextProfile = await withTimeout(
          loadProfileForUser(activeSession.user.id),
          PROFILE_REQUEST_TIMEOUT_MS,
        );
        if (!shouldApply()) return nextProfile;
        if (nextProfile) {
          setProfile(nextProfile);
          void cacheProfile(nextProfile).catch(() => {
            // A fresh profile remains usable even if its offline cache cannot update.
          });
        }
        setBootstrapError(null);
        return nextProfile;
      } catch {
        const cached = await readCachedProfile<MobileProfile>();
        if (!shouldApply()) return null;
        if (cached?.id === activeSession.user.id) {
          setProfile(cached);
          setIsOffline(true);
          setBootstrapError(null);
          return cached;
        }

        setBootstrapError(
          "Aiyomi couldn't load your profile yet. Check your connection and try again.",
        );
        return null;
      }
    },
    [],
  );

  const reloadProfile = useCallback(
    async () => {
      setBootstrapError(null);
      return hydrateProfile(session);
    },
    [hydrateProfile, session],
  );

  const runBootstrap = useCallback(async () => {
    const runId = ++bootstrapRunRef.current;
    let acceptingResults = true;
    setBootstrapComplete(false);
    setBootstrapError(null);

    try {
      await withTimeout(
        (async () => {
          const [seenIntro, intent, authResult] = await Promise.all([
            readHasSeenIntro(),
            readPreAuthIntent(),
            supabase?.auth.getSession() ??
              Promise.resolve({ data: { session: null }, error: null }),
          ]);
          if (!acceptingResults || runId !== bootstrapRunRef.current) {
            return;
          }

          setHasSeenIntro(seenIntro);
          setPreAuthIntent(intent);
          if (authResult.error) throw authResult.error;

          setSession(authResult.data.session);
          await hydrateProfile(
            authResult.data.session,
            () => acceptingResults && runId === bootstrapRunRef.current,
          );
        })(),
        BOOTSTRAP_TIMEOUT_MS,
      );
    } catch {
      acceptingResults = false;
      if (runId === bootstrapRunRef.current) {
        setBootstrapError(
          "Aiyomi couldn't get ready. Check your connection and try again.",
        );
      }
    } finally {
      if (runId === bootstrapRunRef.current) setBootstrapComplete(true);
    }
  }, [hydrateProfile]);

  useEffect(() => {
    let active = true;
    void runBootstrap();

    const authSubscription = supabase?.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        if (event === "SIGNED_OUT") {
          setBootstrapError(null);
          setProfile(null);
          void clearCachedProfile();
          return;
        }
        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          void hydrateProfile(nextSession);
        }
      },
    );

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (!supabase) return;
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });

    const networkSubscription = Network.addNetworkStateListener((state) => {
      setIsOffline(state.isInternetReachable === false || state.isConnected === false);
    });
    void Network.getNetworkStateAsync().then((state) => {
      if (active) {
        setIsOffline(
          state.isInternetReachable === false || state.isConnected === false,
        );
      }
    });

    return () => {
      active = false;
      bootstrapRunRef.current += 1;
      authSubscription?.data.subscription.unsubscribe();
      appStateSubscription.remove();
      networkSubscription.remove();
    };
  }, [hydrateProfile, runBootstrap]);

  useEffect(() => {
    if (!activeUserId) return;
    let active = true;
    const userId = activeUserId;

    const reconcileRegistration = () => {
      void refreshDeviceRegistration(userId).catch(() => {
        // Retry when the app next becomes active without exposing token details.
      });
    };
    void activateCurrentDeviceRegistration(userId).catch(() => {
      // Foreground lifecycle reconciliation will retry.
    });

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (active && state === "active") reconcileRegistration();
      },
    );

    return () => {
      active = false;
      appStateSubscription.remove();
      stopPushTokenChanges(userId);
    };
  }, [activeUserId]);

  const finishIntro = useCallback(async (intent?: string | null) => {
    await Promise.all([markIntroSeen(), savePreAuthIntent(intent ?? null)]);
    setHasSeenIntro(true);
    setPreAuthIntent(intent ?? null);
  }, []);

  const signOutLocally = useCallback(async () => {
    setSession(null);
    setProfile(null);
    await clearCachedProfile();
    await clearCachedCompanion();
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      bootstrapComplete,
      bootstrapError,
      hasSeenIntro,
      preAuthIntent,
      session,
      profile,
      isOffline,
      finishIntro,
      reloadProfile,
      retryBootstrap: runBootstrap,
      signOutLocally,
    }),
    [
      bootstrapComplete,
      bootstrapError,
      finishIntro,
      hasSeenIntro,
      isOffline,
      preAuthIntent,
      profile,
      reloadProfile,
      runBootstrap,
      session,
      signOutLocally,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider.");
  return value;
};
