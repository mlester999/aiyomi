import { Tabs } from "expo-router";

import { BottomNavigationIcon } from "../../src/components";
import { colors } from "../../src/theme";

export default function TabLayout() {
  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 64,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarAccessibilityLabel: "Today tab",
          tabBarIcon: ({ color, focused }) => (
            <BottomNavigationIcon active={focused} color={color} name="today" />
          ),
        }}
      />
      <Tabs.Screen
        name="companion"
        options={{
          title: "Companion",
          tabBarAccessibilityLabel: "Companion tab",
          tabBarIcon: ({ color, focused }) => (
            <BottomNavigationIcon active={focused} color={color} name="companion" />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarAccessibilityLabel: "Progress tab",
          tabBarIcon: ({ color, focused }) => (
            <BottomNavigationIcon active={focused} color={color} name="progress" />
          ),
        }}
      />
      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarAccessibilityLabel: "Me tab",
          tabBarIcon: ({ color, focused }) => (
            <BottomNavigationIcon active={focused} color={color} name="me" />
          ),
        }}
      />
    </Tabs>
  );
}
