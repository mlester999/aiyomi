import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { aiyomiMark } from "../src/assets/brand";
import { PrimaryButton } from "../src/components";
import { useApp } from "../src/providers/AppProvider";
import {
  resolveLaunchState,
  routeForLaunchState,
} from "../src/routing/launch-resolver";

export default function LaunchGate() {
  const {
    bootstrapComplete,
    bootstrapError,
    hasSeenIntro,
    profile,
    retryBootstrap,
    session,
  } = useApp();
  const router = useRouter();
  const state = resolveLaunchState({
    bootstrapComplete,
    hasSeenIntro,
    hasSession: Boolean(session),
    profile,
  });

  useEffect(() => {
    if (state === "BOOTSTRAPPING" || bootstrapError) return;
    router.replace(routeForLaunchState(state) as Href);
  }, [bootstrapError, router, state]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.glow} />
      <View accessibilityLiveRegion="polite" style={styles.content}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel="Aiyomi app icon"
          resizeMode="contain"
          source={aiyomiMark}
          style={styles.icon}
        />
        <Text accessibilityRole="header" style={styles.name}>
          Aiyomi
        </Text>
        <Text style={styles.tagline}>Your AI companion for better days.</Text>
        {bootstrapError ? (
          <View style={styles.errorCard}>
            <Text accessibilityRole="header" style={styles.errorTitle}>
              Aiyomi needs another moment.
            </Text>
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.errorBody}
            >
              {bootstrapError}
            </Text>
            <PrimaryButton
              label="Try again"
              onPress={() => void retryBootstrap()}
            />
          </View>
        ) : (
          <ActivityIndicator
            accessibilityLabel="Getting Aiyomi ready"
            color="#2F7F73"
            size="small"
            style={styles.spinner}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#FBF7EE",
  },
  glow: {
    position: "absolute",
    width: 390,
    height: 390,
    borderRadius: 195,
    backgroundColor: "#DCEFE6",
    opacity: 0.62,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 28,
  },
  icon: {
    width: 118,
    height: 118,
    borderRadius: 30,
  },
  name: {
    marginTop: 22,
    color: "#243633",
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 8,
    color: "#5D6D68",
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
  },
  spinner: {
    marginTop: 26,
  },
  errorCard: {
    alignItems: "stretch",
    marginTop: 26,
    maxWidth: 360,
    width: "100%",
  },
  errorTitle: {
    color: "#243633",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  errorBody: {
    color: "#5D6D68",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    marginTop: 8,
    textAlign: "center",
  },
});
