import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function ActionButton({ label, onPress, disabled, loading }: Props) {
  return (
    <View style={{ minHeight: 48, justifyContent: "center" }}>
      {loading ? (
        <ActivityIndicator accessibilityLabel={`${label} in progress`} />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: Boolean(disabled) }}
          disabled={disabled}
          onPress={onPress}
          style={({ pressed }) => ({
            minHeight: 46,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 13,
            borderCurve: "continuous",
            backgroundColor: colors.accent,
            opacity: disabled ? 0.45 : pressed ? 0.72 : 1
          })}
        >
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700", textAlign: "center" }}>
            {label}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
