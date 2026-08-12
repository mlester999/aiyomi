import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          animation: "fade",
          contentStyle: { backgroundColor: "#fbf7ef" },
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}
