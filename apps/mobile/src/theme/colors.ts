import { Platform } from "react-native";
import { Color } from "expo-router";

export const colors = {
  background: Platform.select({ ios: Color.ios.systemGroupedBackground, android: Color.android.dynamic.surface, default: "#F3F0E8" })!,
  surface: Platform.select({ ios: Color.ios.secondarySystemGroupedBackground, android: Color.android.dynamic.surfaceContainer, default: "#FFFFFF" })!,
  text: Platform.select({ ios: Color.ios.label, android: Color.android.dynamic.onSurface, default: "#18201C" })!,
  secondaryText: Platform.select({ ios: Color.ios.secondaryLabel, android: Color.android.dynamic.onSurfaceVariant, default: "#5F6B65" })!,
  accent: Platform.select({ ios: Color.ios.systemGreen, android: Color.android.dynamic.primary, default: "#167A58" })!,
  accentSoft: Platform.select({ ios: "rgba(52, 199, 89, 0.14)", android: Color.android.dynamic.primaryContainer, default: "#DDF3E8" })!,
  border: Platform.select({ ios: Color.ios.separator, android: Color.android.dynamic.outlineVariant, default: "#D8DED9" })!,
  danger: Platform.select({ ios: Color.ios.systemRed, android: Color.android.dynamic.error, default: "#B42318" })!
};
