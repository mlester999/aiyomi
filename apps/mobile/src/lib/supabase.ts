import "react-native-url-polyfill/auto";

import { createClient, processLock } from "@supabase/supabase-js";
import { Platform } from "react-native";

import { appConfig } from "../config/app";
import { secureSessionStorage } from "../storage/secure-storage";

const { url, publishableKey, isConfigured } = appConfig.supabase;
const isServerWeb = Platform.OS === "web" && typeof window === "undefined";

export const supabase =
  !isServerWeb && isConfigured && url && publishableKey
    ? createClient(url, publishableKey, {
        auth: {
          storage: secureSessionStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
          flowType: "pkce",
          lock: processLock,
        },
        global: {
          headers: {
            "X-Client-Info": "aiyomi-mobile/0.1.0",
          },
        },
      })
    : null;

export const requireSupabase = () => {
  if (!supabase) {
    throw new Error(
      appConfig.supabase.configurationError ??
        "Aiyomi account services are not configured.",
    );
  }

  return supabase;
};
