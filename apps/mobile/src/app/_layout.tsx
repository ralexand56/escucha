import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" options={{ title: "Escucha", headerLargeTitle: true }} />
      </Stack>
    </>
  );
}
