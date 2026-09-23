import { useState } from "react";
import { Alert, Text, View } from "react-native";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState
} from "expo-audio";
import { ActionButton } from "@/components/action-button";
import { evaluateRecording } from "@/services/api";
import type { Evaluation } from "@/types/lesson";
import { colors } from "@/theme/colors";

export function ShadowRecorder({ target }: { target: string }) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const start = async () => {
    setError(null);
    setEvaluation(null);
    setRecordedUri(null);
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Microphone access needed", "Allow microphone access in Settings to record your shadowing attempt.");
      return;
    }
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopAndEvaluate = async () => {
    await recorder.stop();
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
    if (!recorder.uri) {
      setError("The recording could not be saved. Please try again.");
      return;
    }
    setRecordedUri(recorder.uri);
    await upload(recorder.uri);
  };

  const upload = async (uri: string) => {
    setIsEvaluating(true);
    try {
      setError(null);
      setEvaluation(await evaluateRecording(uri, target));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not evaluate the recording.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <ActionButton
        label={recorderState.isRecording ? "Stop and evaluate" : "Record my attempt"}
        onPress={recorderState.isRecording ? stopAndEvaluate : start}
        loading={isEvaluating}
      />
      {recorderState.isRecording ? (
        <Text selectable style={{ color: colors.danger, textAlign: "center", fontVariant: ["tabular-nums"] }}>
          Recording · {Math.round(recorderState.durationMillis / 1000)}s
        </Text>
      ) : null}
      {error ? (
        <View style={{ padding: 14, borderRadius: 14, borderCurve: "continuous", backgroundColor: colors.surface }}>
          <Text selectable style={{ color: colors.danger }}>{error}</Text>
          <ActionButton label="Try upload again" onPress={() => recordedUri && upload(recordedUri)} disabled={!recordedUri} />
        </View>
      ) : null}
      {evaluation ? (
        <View style={{ gap: 10, padding: 18, borderRadius: 18, borderCurve: "continuous", backgroundColor: colors.accentSoft }}>
          <Text selectable style={{ color: colors.text, fontSize: 26, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
            {evaluation.score}% match
          </Text>
          <Text selectable style={{ color: colors.text, fontSize: 16 }}>{evaluation.summary}</Text>
          <Text selectable style={{ color: colors.secondaryText }}>We heard: “{evaluation.transcript}”</Text>
          {evaluation.missedWords.length ? (
            <Text selectable style={{ color: colors.secondaryText }}>Practice: {evaluation.missedWords.join(", ")}</Text>
          ) : null}
          <Text selectable style={{ color: colors.text, fontWeight: "600" }}>Next try: {evaluation.nextTry}</Text>
        </View>
      ) : null}
    </View>
  );
}
