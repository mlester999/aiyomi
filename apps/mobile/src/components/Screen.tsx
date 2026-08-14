import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  SafeAreaView,
  type Edge,
} from "react-native-safe-area-context";

import { colors, layout, spacing } from "../theme";

const defaultEdges: Edge[] = ["top", "right", "bottom", "left"];

interface SharedScreenProps {
  children: ReactNode;
  backgroundColor?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
  maxContentWidth?: number;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface ScreenProps extends SharedScreenProps {
  scroll?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  showsVerticalScrollIndicator?: boolean;
}

export interface KeyboardScreenProps extends SharedScreenProps {
  keyboardVerticalOffset?: number;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  showsVerticalScrollIndicator?: boolean;
}

function useHorizontalPadding(padded: boolean) {
  const { width } = useWindowDimensions();

  if (!padded) {
    return 0;
  }

  return width < 360 ? layout.compactScreenPadding : layout.screenPadding;
}

function Content({
  children,
  contentContainerStyle,
  horizontalPadding,
  maxContentWidth,
}: {
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontalPadding: number;
  maxContentWidth: number;
}) {
  return (
    <View
      style={[
        styles.content,
        {
          maxWidth: maxContentWidth,
          paddingHorizontal: horizontalPadding,
        },
        contentContainerStyle,
      ]}
    >
      {children}
    </View>
  );
}

export function Screen({
  children,
  backgroundColor = colors.canvas,
  contentContainerStyle,
  edges = defaultEdges,
  keyboardShouldPersistTaps = "handled",
  maxContentWidth = layout.maxContentWidth,
  padded = true,
  scroll = false,
  showsVerticalScrollIndicator = false,
  style,
  testID,
}: ScreenProps) {
  const horizontalPadding = useHorizontalPadding(padded);

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor }, style]}
      testID={testID}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          <Content
            contentContainerStyle={contentContainerStyle}
            horizontalPadding={horizontalPadding}
            maxContentWidth={maxContentWidth}
          >
            {children}
          </Content>
        </ScrollView>
      ) : (
        <Content
          contentContainerStyle={contentContainerStyle}
          horizontalPadding={horizontalPadding}
          maxContentWidth={maxContentWidth}
        >
          {children}
        </Content>
      )}
    </SafeAreaView>
  );
}

export function KeyboardScreen({
  children,
  backgroundColor = colors.canvas,
  contentContainerStyle,
  edges = defaultEdges,
  keyboardShouldPersistTaps = "handled",
  keyboardVerticalOffset = 0,
  maxContentWidth = layout.maxContentWidth,
  padded = true,
  showsVerticalScrollIndicator = false,
  style,
  testID,
}: KeyboardScreenProps) {
  const horizontalPadding = useHorizontalPadding(padded);

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.safeArea, { backgroundColor }, style]}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={styles.fill}
      >
        <ScrollView
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
          contentContainerStyle={styles.scrollContainer}
          contentInsetAdjustmentBehavior="never"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        >
          <Content
            contentContainerStyle={contentContainerStyle}
            horizontalPadding={horizontalPadding}
            maxContentWidth={maxContentWidth}
          >
            {children}
          </Content>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    alignSelf: "center",
    flexGrow: 1,
    paddingBottom: spacing.xl,
    paddingTop: spacing.md,
    width: "100%",
  },
});
