import { Host, Button } from "@expo/ui";
import { ActivityIndicator, View } from "react-native";

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
        <Host matchContents>
          <Button onPress={onPress} disabled={disabled}>{label}</Button>
        </Host>
      )}
    </View>
  );
}
