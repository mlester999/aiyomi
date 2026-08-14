import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import { safeAuthError } from "../../src/auth/errors";
import {
  clearPendingVerificationEmail,
  readPendingVerificationEmail,
} from "../../src/auth/pending-verification";
import { authService } from "../../src/auth/service";
import { LoadingButton, SecondaryButton } from "../../src/components";
import { AuthScaffold, FormError } from "../../src/features/auth/AuthScaffold";
import { colors, radii, spacing, typography } from "../../src/theme";

export default function VerifyEmailScreen() {
  const router = useRouter();
  const [email] = useState(readPendingVerificationEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const resend = async () => {
    if (!email) return;
    setPending(true);
    setError(null);
    try {
      const { error: authError } = await authService.resendVerification(email);
      if (authError) throw authError;
      setResent(true);
    } catch (caught) {
      setError(safeAuthError(caught));
    } finally {
      setPending(false);
    }
  };

  const changeEmail = () => {
    clearPendingVerificationEmail();
    router.replace("/auth/sign-up");
  };

  const openMail = async () => {
    if (await Linking.canOpenURL("mailto:")) await Linking.openURL("mailto:");
    else setError("Open your email app to find the verification link.");
  };

  return (
    <AuthScaffold
      body={
        email
          ? "We sent a verification link to:"
          : "Open the inbox you used to create your account."
      }
      title="Check your email"
    >
      {email ? (
        <Text
          accessibilityLabel={`Verification email sent to ${email}`}
          style={styles.email}
        >
          {email}
        </Text>
      ) : null}
      <Text style={styles.explanation}>
        Tap the link in the message. Aiyomi will continue only after Supabase confirms your email.
      </Text>
      {resent ? (
        <Text accessibilityLiveRegion="polite" style={styles.resent}>
          A fresh verification email is on its way.
        </Text>
      ) : null}
      <FormError message={error} />
      <SecondaryButton label="Open email app" onPress={() => void openMail()} />
      <LoadingButton
        disabled={!email || pending}
        label="Resend email"
        loading={pending}
        loadingLabel="Sending verification..."
        onPress={() => void resend()}
        style={styles.action}
        variant="secondary"
      />
      <SecondaryButton
        label="Change email"
        onPress={changeEmail}
        style={styles.action}
      />
      <SecondaryButton
        label="I’ve verified, sign in"
        onPress={() => router.replace("/auth/sign-in")}
        style={styles.action}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  email: {
    ...typography.cardTitle,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    padding: spacing.md,
    textAlign: "center",
  },
  explanation: {
    ...typography.bodySmall,
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    textAlign: "center",
  },
  resent: {
    ...typography.bodySmall,
    color: colors.success,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  action: { marginTop: spacing.sm },
});
