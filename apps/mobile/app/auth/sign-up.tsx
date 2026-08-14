import { ANALYTICS_EVENTS } from "@aiyomi/analytics";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { trackMobileEvent } from "../../src/analytics/mobile";
import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { validateSignUp } from "../../src/auth/validation";
import {
  LoadingButton,
  PasswordField,
  SecondaryButton,
  TextField,
} from "../../src/components";
import {
  AuthScaffold,
  FormError,
  OrDivider,
} from "../../src/features/auth/AuthScaffold";
import { spacing, typography } from "../../src/theme";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<ReturnType<typeof validateSignUp>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<"email" | "google" | null>(null);
  const actionInFlight = useRef(false);

  const submit = async () => {
    if (actionInFlight.current) return;
    const validation = validateSignUp(email, password, confirmation);
    setErrors(validation);
    if (Object.values(validation).some(Boolean)) return;

    setError(null);
    actionInFlight.current = true;
    setPending("email");
    trackMobileEvent(ANALYTICS_EVENTS.SIGNUP_STARTED, { method: "email" });
    try {
      const { data, error: authError } = await authService.signUp(email, password);
      if (authError) throw authError;
      trackMobileEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { method: "email" });
      if (data.session) router.replace("/");
      else router.replace("/auth/verify-email");
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
      trackMobileEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, { method: "google" });
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
    <AuthScaffold
      body="Aiyomi keeps your setup private and ready across your devices."
      title="Create your account"
    >
      <FormError message={error} />
      <LoadingButton
        disabled={pending !== null}
        label="Continue with Google"
        loading={pending === "google"}
        loadingLabel="Continuing with Google..."
        onPress={() => void google()}
      />
      <OrDivider />
      <View style={styles.fields}>
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          error={errors.email}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          returnKeyType="next"
          textContentType="emailAddress"
          value={email}
        />
        <PasswordField
          autoComplete="new-password"
          error={errors.password}
          helperText="Use at least 12 characters."
          label="Password"
          onChangeText={setPassword}
          returnKeyType="next"
          textContentType="newPassword"
          value={password}
        />
        <PasswordField
          autoComplete="new-password"
          error={errors.confirmation}
          label="Confirm password"
          onChangeText={setConfirmation}
          onSubmitEditing={() => void submit()}
          returnKeyType="done"
          textContentType="newPassword"
          value={confirmation}
        />
      </View>
      <LoadingButton
        disabled={pending !== null}
        label="Create Account"
        loading={pending === "email"}
        loadingLabel="Creating account..."
        onPress={() => void submit()}
        style={styles.submit}
      />
      <Text style={styles.prompt}>Already have an account?</Text>
      <SecondaryButton
        disabled={pending !== null}
        label="Sign in"
        onPress={() => router.replace("/auth/sign-in")}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  submit: { marginTop: spacing.lg },
  prompt: { ...typography.bodySmall, marginVertical: spacing.sm, textAlign: "center" },
});
