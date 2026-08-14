import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { validateEmail } from "../../src/auth/validation";
import {
  LoadingButton,
  PasswordField,
  SecondaryButton,
  TextField,
} from "../../src/components";
import { AuthScaffold, FormError, OrDivider } from "../../src/features/auth/AuthScaffold";
import { colors, spacing, typography } from "../../src/theme";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const actionInFlight = useRef(false);

  const submit = async () => {
    if (actionInFlight.current) return;
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError);
    if (nextEmailError || !password) {
      if (!password) setError("Enter your password to continue.");
      return;
    }

    setError(null);
    actionInFlight.current = true;
    setPending("email");
    try {
      const { error: authError } = await authService.signIn(email, password);
      if (authError) throw authError;
      trackMobileEvent(ANALYTICS_EVENTS.LOGIN_COMPLETED, { method: "email" });
      router.replace("/");
    } catch (caught) {
      setError(safeAuthError(caught));
    } finally {
      actionInFlight.current = false;
      setPending(null);
    }
  };

  const google = async () => {
    if (actionInFlight.current) return;
    setError(null);
    actionInFlight.current = true;
    setPending("google");
    trackMobileEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_STARTED);
    try {
      await authService.signInWithGoogle();
      trackMobileEvent(ANALYTICS_EVENTS.GOOGLE_AUTH_COMPLETED);
      trackMobileEvent(ANALYTICS_EVENTS.LOGIN_COMPLETED, { method: "google" });
      router.replace("/");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (!message.toLowerCase().includes("canceled")) setError(safeAuthError(caught));
    } finally {
      actionInFlight.current = false;
      setPending(null);
    }
  };

  return (
    <AuthScaffold body="Welcome back. Your companion is ready when you are." title="Sign in">
      <FormError message={error} />
      <View style={styles.fields}>
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <PasswordField
          autoComplete="current-password"
          label="Password"
          onChangeText={setPassword}
          onSubmitEditing={() => void submit()}
          returnKeyType="done"
          textContentType="password"
          value={password}
        />
      </View>
      <Pressable
        accessibilityRole="link"
        accessibilityState={{ disabled: pending !== null }}
        disabled={pending !== null}
        onPress={() => router.push("/auth/forgot-password")}
        style={({ pressed }) => [styles.forgot, pressed && styles.pressed]}
      >
        <Text style={styles.link}>Forgot password?</Text>
      </Pressable>
      <LoadingButton
        disabled={pending !== null}
        label="Sign In"
        loading={pending === "email"}
        loadingLabel="Signing in..."
        onPress={() => void submit()}
      />
      <OrDivider />
      <LoadingButton
        disabled={pending !== null}
        label="Continue with Google"
        loading={pending === "google"}
        loadingLabel="Continuing with Google..."
        onPress={() => void google()}
        variant="secondary"
      />
      <Text style={styles.prompt}>New to Aiyomi?</Text>
      <SecondaryButton
        disabled={pending !== null}
        label="Create account"
        onPress={() => router.replace("/auth/sign-up")}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  forgot: { alignSelf: "flex-end", minHeight: 44, justifyContent: "center" },
  pressed: { opacity: 0.65 },
  link: { ...typography.label, color: colors.primary },
  prompt: { ...typography.bodySmall, marginVertical: spacing.sm, textAlign: "center" },
});
