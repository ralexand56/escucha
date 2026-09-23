import { Text, View } from "react-native";
import { colors } from "@/theme/colors";

const labels = ["Listen", "Reveal", "Replay", "Listen again", "Shadow"];

export function ProgressSteps({ current }: { current: number }) {
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: 5, now: current }} style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {labels.map((label, index) => (
          <View key={label} style={{ flex: 1, height: 5, borderRadius: 99, backgroundColor: index < current ? colors.accent : colors.border }} />
        ))}
      </View>
      <Text selectable style={{ color: colors.secondaryText, fontSize: 13, fontWeight: "600" }}>
        Step {current} of 5 · {labels[current - 1]}
      </Text>
    </View>
  );
}
