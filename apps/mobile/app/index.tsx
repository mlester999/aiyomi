import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.skyGlow}
        />
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.peachGlow}
        />

        <View style={styles.content}>
          <View style={styles.brandRow}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.brandMark}
            >
              <Text style={styles.brandLetter}>A</Text>
            </View>
            <View>
              <Text style={styles.brandName}>Aiyomi</Text>
              <Text style={styles.brandMeaning}>AI + You + Me</Text>
            </View>
          </View>

          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.companionStage}
          >
            <Text style={[styles.sparkle, styles.sparkleTop]}>✦</Text>
            <Text style={[styles.sparkle, styles.sparkleSide]}>✦</Text>
            <View style={styles.companionShadow} />
            <View style={styles.companion}>
              <View style={styles.companionHighlight} />
              <View style={styles.face}>
                <View style={styles.eye} />
                <View style={styles.eye} />
              </View>
              <View style={styles.smile} />
            </View>
          </View>

          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.heading}>
              Your AI companion for better days.
            </Text>
            <Text style={styles.description}>
              A calm place to plan, focus, and grow is taking shape. This build
              only establishes the mobile app foundation.
            </Text>
          </View>

          <View style={styles.foundationCard}>
            <View style={styles.foundationBadge}>
              <View style={styles.foundationDot} />
              <Text style={styles.foundationBadgeText}>Foundation ready</Text>
            </View>
            <Text style={styles.foundationTitle}>No account setup yet</Text>
            <Text style={styles.foundationDescription}>
              Authentication, onboarding, personal data, and live services are
              intentionally not connected in this phase.
            </Text>
          </View>

          <Text style={styles.footer}>Expo Router foundation · SDK 56</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fbf7ef",
  },
  scrollContent: {
    position: "relative",
    minHeight: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  skyGlow: {
    position: "absolute",
    top: -120,
    right: -130,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: "#dcecf5",
    opacity: 0.72,
  },
  peachGlow: {
    position: "absolute",
    bottom: -150,
    left: -150,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#f5dfd0",
    opacity: 0.62,
  },
  content: {
    width: "100%",
    maxWidth: 560,
    alignItems: "center",
  },
  brandRow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  brandMark: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(61, 104, 88, 0.16)",
    borderRadius: 15,
    backgroundColor: "#dcefe6",
  },
  brandLetter: {
    color: "#315c50",
    fontSize: 20,
    fontWeight: "800",
  },
  brandName: {
    color: "#243c3a",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  brandMeaning: {
    marginTop: 1,
    color: "#687b78",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  companionStage: {
    position: "relative",
    width: 210,
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 34,
  },
  companionShadow: {
    position: "absolute",
    bottom: 24,
    width: 114,
    height: 22,
    borderRadius: 57,
    backgroundColor: "rgba(54, 78, 72, 0.1)",
    transform: [{ scaleX: 1.15 }],
  },
  companion: {
    position: "relative",
    width: 138,
    height: 146,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(64, 99, 85, 0.15)",
    borderTopLeftRadius: 72,
    borderTopRightRadius: 72,
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    backgroundColor: "#a9d4c0",
    shadowColor: "#41695b",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 8,
  },
  companionHighlight: {
    position: "absolute",
    top: -18,
    left: -12,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255, 255, 255, 0.28)",
  },
  face: {
    flexDirection: "row",
    gap: 28,
    marginTop: 8,
  },
  eye: {
    width: 10,
    height: 15,
    borderRadius: 5,
    backgroundColor: "#294b43",
  },
  smile: {
    width: 25,
    height: 13,
    marginTop: 14,
    borderRightWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: "#3b655a",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  sparkle: {
    position: "absolute",
    color: "#d19a62",
    fontSize: 22,
    fontWeight: "800",
  },
  sparkleTop: {
    top: 13,
    right: 24,
  },
  sparkleSide: {
    top: 75,
    left: 18,
    color: "#8b82b3",
    fontSize: 15,
  },
  copy: {
    alignItems: "center",
    maxWidth: 480,
  },
  heading: {
    color: "#243c3a",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1.25,
    lineHeight: 41,
    textAlign: "center",
  },
  description: {
    marginTop: 14,
    color: "#596f6b",
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
  },
  foundationCard: {
    width: "100%",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "rgba(57, 87, 80, 0.12)",
    borderRadius: 24,
    backgroundColor: "rgba(255, 253, 248, 0.86)",
    padding: 20,
    shadowColor: "#526b63",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  foundationBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    backgroundColor: "#dcefe6",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  foundationDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4f876f",
  },
  foundationBadgeText: {
    color: "#315f50",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.35,
    textTransform: "uppercase",
  },
  foundationTitle: {
    marginTop: 16,
    color: "#2c4743",
    fontSize: 18,
    fontWeight: "800",
  },
  foundationDescription: {
    marginTop: 7,
    color: "#60736f",
    fontSize: 14,
    lineHeight: 22,
  },
  footer: {
    marginTop: 20,
    color: "#7d8c89",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.25,
  },
});
