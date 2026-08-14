import type { CompanionKey, CompanionPersonality } from "@aiyomi/types";
import { useCallback, useEffect, useState } from "react";

import { requireSupabase } from "../lib/supabase";
import { useApp } from "../providers/AppProvider";
import { cacheCompanion, readCachedCompanion } from "../storage/local";

export interface DisplayCompanion {
  userId: string;
  definitionId: string;
  key: CompanionKey;
  defaultName: string;
  customName: string;
  personality: CompanionPersonality;
}

export function useUserCompanion(
  { autoLoad = true }: { autoLoad?: boolean } = {},
) {
  const { session } = useApp();
  const [companion, setCompanion] = useState<DisplayCompanion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!session) {
      setCompanion(null);
      setError(null);
      setLoading(false);
      return null;
    }
    setCompanion((current) =>
      current?.userId === session.user.id ? current : null,
    );
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await requireSupabase()
        .from("user_companions")
        .select("companion_definition_id,custom_name,personality,companion_definitions(key,name)")
        .eq("user_id", session.user.id)
        .single();
      if (error) throw error;
      const definition = data.companion_definitions as unknown as {
        key: CompanionKey;
        name: string;
      };
      const result: DisplayCompanion = {
        userId: session.user.id,
        definitionId: data.companion_definition_id as string,
        key: definition.key,
        defaultName: definition.name,
        customName: data.custom_name as string,
        personality: data.personality as CompanionPersonality,
      };
      setCompanion(result);
      try {
        await cacheCompanion(result);
      } catch {
        // The authenticated result remains valid even if local caching is unavailable.
      }
      return result;
    } catch {
      let cached: DisplayCompanion | null;
      try {
        cached = await readCachedCompanion<DisplayCompanion>();
      } catch {
        cached = null;
      }
      const ownedCache = cached?.userId === session.user.id ? cached : null;
      setCompanion(ownedCache);
      setError(
        ownedCache
          ? null
          : "Aiyomi couldn't load your companion yet. Check your connection and try again.",
      );
      return ownedCache;
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (autoLoad) void reload();
  }, [autoLoad, reload]);

  return { companion, error, loading, reload };
}
