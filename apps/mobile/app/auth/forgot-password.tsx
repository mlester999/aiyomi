import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { validateEmail } from "../../src/auth/validation";
import { LoadingButton, SecondaryButton, TextField } from "../../src/components";
import { AuthScaffold, FormError } from "../../src/features/auth/AuthScaffold";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    const validation = validateEmail(email);
    setEmailError(validation);
    if (validation) return;

    setError(null);
    setPending(true);
    try {
      const { error: authError } = await authService.sendPasswordReset(email);
      if (authError) throw authError;
      setSent(true);
    } catch (caught) {
      setError(safeAuthError(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScaffold
      body="We’ll send a secure link that brings you back to Aiyomi."
      title="Reset your password"
    >
      <FormError message={error} />
      {sent ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          If an account can receive recovery email, a link is on its way. You can close this screen after checking your inbox.
        </Text>
      ) : (
        <TextField
          autoCapitalize="none"
          autoComplete="email"
          error={emailError}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          onSubmitEditing={() => void submit()}
          returnKeyType="send"
          value={email}
        />
      )}
      {!sent ? (
        <LoadingButton
          label="Send recovery email"
          loading={pending}
          loadingLabel="Sending reset link..."
          onPress={() => void submit()}
          style={styles.action}
        />
      ) : null}
      <SecondaryButton
        label="Back to sign in"
        onPress={() => router.replace("/auth/sign-in")}
        style={styles.secondary}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  success: {
    ...typography.body,
    backgroundColor: colors.successSoft,
    borderColor: "#B6DCC9",
    borderRadius: radii.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  action: { marginTop: spacing.lg },
  secondary: { marginTop: spacing.sm },
});
