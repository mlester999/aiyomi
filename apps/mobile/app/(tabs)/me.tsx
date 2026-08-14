import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { appConfig } from "../../src/config/app";
import { Screen } from "../../src/components";
import { useApp } from "../../src/providers/AppProvider";
import { colors, radii, spacing, typography } from "../../src/theme";

const settingsRows = [
  { label: "Profile", detail: "Your preferred name", href: "/settings/profile" },
  { label: "Companion", detail: "Choice, name, and support style", href: "/settings/companion" },
  { label: "Life setup", detail: "Life Areas, schedule, roles, and commitments", href: "/settings/life" },
  { label: "Notifications", detail: "Permission, reminders, and quiet hours", href: "/settings/notifications" },
  { label: "Account", detail: "Email and sign out", href: "/settings/account" },
  { label: "Privacy & Data", detail: "Foundation for future controls", href: "/settings/privacy" },
] as const;

export default function MeScreen() {
  const router = useRouter();
  const { profile, session } = useApp();
  const externalRows = [
    { label: "Support", url: appConfig.urls.support },
    { label: "Privacy", url: appConfig.urls.privacy },
    { label: "Terms", url: appConfig.urls.terms },
  ].filter((row): row is { label: string; url: string } => Boolean(row.url));

  return (
    <Screen scroll>
      <Text accessibilityRole="header" style={styles.heading}>Me</Text>
      <View style={styles.identityCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile?.first_name?.[0]?.toUpperCase() ?? "A"}</Text>
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{profile?.first_name ?? "Aiyomi member"}</Text>
          <Text numberOfLines={1} style={styles.email}>{session?.user.email ?? "Signed in"}</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.rows}>
        {settingsRows.map((row) => (
          <Pressable
            key={row.href}
            accessibilityLabel={`${row.label}, ${row.detail}`}
            accessibilityRole="button"
            onPress={() => router.push(row.href)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{row.label}</Text>
              <Text style={styles.rowDetail}>{row.detail}</Text>
            </View>
            <Text accessibilityElementsHidden style={styles.chevron}>›</Text>
          </Pressable>
        ))}
      </View>
      {externalRows.length ? (
        <>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <View style={styles.rows}>
            {externalRows.map((row) => (
              <Pressable
                key={row.label}
                accessibilityRole="link"
                onPress={() => void Linking.openURL(row.url)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              >
                <Text style={styles.rowTitle}>{row.label}</Text>
                <Text accessibilityElementsHidden style={styles.chevron}>↗</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : null}
      {appConfig.isDevelopment ? (
        <Text style={styles.environment}>Development · aiyomi-dev</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { ...typography.screenTitle },
  identityCard: { alignItems: "center", backgroundColor: colors.primarySoft, borderRadius: radii.xl, flexDirection: "row", marginTop: spacing.lg, padding: spacing.lg },
  avatar: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  avatarText: { color: colors.textInverse, fontSize: 24, fontWeight: "800" },
  identityCopy: { flex: 1, marginLeft: spacing.md, minWidth: 0 },
  name: { ...typography.cardTitle },
  email: { ...typography.bodySmall, marginTop: 2 },
  sectionTitle: { ...typography.label, color: colors.textMuted, marginBottom: spacing.xs, marginTop: spacing.xl, textTransform: "uppercase" },
  rows: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, borderWidth: 1, overflow: "hidden" },
  row: { alignItems: "center", borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", minHeight: 70, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  rowPressed: { backgroundColor: colors.primarySoft },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { ...typography.cardTitle, fontSize: 16 },
  rowDetail: { ...typography.bodySmall, marginTop: 1 },
  chevron: { color: colors.textMuted, fontSize: 25, marginLeft: spacing.md },
  environment: { ...typography.caption, color: colors.primary, marginTop: spacing.xl, textAlign: "center" },
});
