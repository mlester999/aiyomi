import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { safeAuthError } from "../../src/auth/errors";
import { authService } from "../../src/auth/service";
import { validatePassword } from "../../src/auth/validation";
import { LoadingButton, PasswordField } from "../../src/components";
import { AuthScaffold, FormError } from "../../src/features/auth/AuthScaffold";
import { spacing } from "../../src/theme";

export default function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmationError, setConfirmationError] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    const nextPasswordError = validatePassword(password);
    const nextConfirmationError =
      password === confirmation ? undefined : "Passwords need to match.";
    setPasswordError(nextPasswordError);
    setConfirmationError(nextConfirmationError);
    if (nextPasswordError || nextConfirmationError) return;

    setPending(true);
    setError(null);
    try {
      const { error: authError } = await authService.updatePassword(password);
      if (authError) throw authError;
      router.replace("/");
    } catch (caught) {
      setError(safeAuthError(caught));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthScaffold body="Choose a new password for your Aiyomi account." title="Set a new password">
      <FormError message={error} />
      <View style={styles.fields}>
        <PasswordField
          autoComplete="new-password"
          error={passwordError}
          helperText="Use at least 12 characters."
          label="New password"
          onChangeText={setPassword}
          value={password}
        />
        <PasswordField
          autoComplete="new-password"
          error={confirmationError}
          label="Confirm new password"
          onChangeText={setConfirmation}
          onSubmitEditing={() => void submit()}
          returnKeyType="done"
          value={confirmation}
        />
      </View>
      <LoadingButton
        label="Save new password"
        loading={pending}
        loadingLabel="Updating password..."
        onPress={() => void submit()}
        style={styles.action}
      />
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  fields: { gap: spacing.md },
  action: { marginTop: spacing.lg },
});
