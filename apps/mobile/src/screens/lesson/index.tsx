import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { ActionButton } from "@/components/action-button";
import { AudioButton } from "@/components/audio-button";
import { ProgressSteps } from "@/components/progress-steps";
import { ShadowRecorder } from "@/components/shadow-recorder";
import { createLesson } from "@/services/api";
import { colors } from "@/theme/colors";
import type { Lesson, Level } from "@/types/lesson";

const topics = ["ordering at a café", "making weekend plans", "asking for directions"];
const levels: Level[] = ["A1", "A2", "B1", "B2"];

export function LessonScreen() {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [level, setLevel] = useState<Level>("A2");
  const [topic, setTopic] = useState(topics[0]);
  const [step, setStep] = useState(1);
  const [shadowIndex, setShadowIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLesson = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await createLesson(level, topic);
      if (!result.sentences.length) {
        setError("The lesson came back empty. Please generate another one.");
        return;
      }
      setLesson(result);
      setStep(1);
      setShadowIndex(0);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create a lesson.");
    } finally {
      setLoading(false);
    }
  };

  if (!lesson) {
    return (
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, gap: 22 }}>
        <View style={{ gap: 8 }}>
          <Text selectable style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.text }}>
            Train your ear, one scene at a time.
          </Text>
          <Text selectable style={{ fontSize: 17, lineHeight: 24, color: colors.secondaryText }}>
            Listen first. Read only when you’re ready. Then shadow a native-paced sentence and get focused feedback.
          </Text>
        </View>

        <ChoiceGroup title="Your level" values={levels} selected={level} onSelect={(value) => setLevel(value as Level)} />
        <ChoiceGroup title="Today’s scene" values={topics} selected={topic} onSelect={setTopic} />

        {error ? (
          <View style={{ padding: 16, gap: 6, borderRadius: 16, borderCurve: "continuous", backgroundColor: colors.surface }}>
            <Text selectable style={{ color: colors.danger, fontWeight: "700" }}>Couldn’t create the lesson</Text>
            <Text selectable style={{ color: colors.secondaryText }}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={{ padding: 28, gap: 12, alignItems: "center" }}>
            <ActivityIndicator />
            <Text selectable style={{ color: colors.secondaryText }}>Writing and voicing your lesson…</Text>
          </View>
        ) : (
          <ActionButton label={error ? "Try again" : "Create my lesson"} onPress={loadLesson} />
        )}
        <Text selectable style={{ fontSize: 12, lineHeight: 17, color: colors.secondaryText }}>
          Audio is AI-generated. Your recording is sent to your private server for transcription and feedback.
        </Text>
      </ScrollView>
    );
  }

  const currentSentence = lesson.sentences[shadowIndex];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 22 }}>
      <ProgressSteps current={step} />
      <View style={{ gap: 4 }}>
        <Text selectable style={{ fontSize: 25, fontWeight: "800", color: colors.text }}>{lesson.title}</Text>
        <Text selectable style={{ color: colors.secondaryText }}>{lesson.level} · {lesson.topic}</Text>
      </View>

      {step === 1 ? (
        <LessonCard eyebrow="No transcript yet" title="Just listen for the situation and rhythm.">
          <AudioButton uri={lesson.audioUrl} label="Play the scene" />
          <ActionButton label="I listened — reveal transcript" onPress={() => setStep(2)} />
        </LessonCard>
      ) : null}

      {step === 2 ? (
        <LessonCard eyebrow="Transcript revealed" title="Read once and notice what your ear missed.">
          <Transcript lesson={lesson} showTranslation />
          <ActionButton label="Practice sentence by sentence" onPress={() => setStep(3)} />
        </LessonCard>
      ) : null}

      {step === 3 ? (
        <LessonCard eyebrow="Sentence replay" title="Replay each line as many times as you need.">
          <Transcript lesson={lesson} withAudio showTranslation />
          <ActionButton label="Hide transcript and listen again" onPress={() => setStep(4)} />
        </LessonCard>
      ) : null}

      {step === 4 ? (
        <LessonCard eyebrow="Transcript hidden" title="Listen again. Does the scene sound clearer now?">
          <AudioButton uri={lesson.audioUrl} label="Replay the full scene" />
          <ActionButton label="Start shadowing" onPress={() => setStep(5)} />
        </LessonCard>
      ) : null}

      {step === 5 ? (
        <LessonCard eyebrow={`Sentence ${shadowIndex + 1} of ${lesson.sentences.length}`} title="Listen, then repeat the sentence aloud.">
          <Text selectable style={{ color: colors.text, fontSize: 22, lineHeight: 30, fontWeight: "700" }}>
            {currentSentence.spanish}
          </Text>
          <Text selectable style={{ color: colors.secondaryText }}>{currentSentence.tip}</Text>
          <AudioButton uri={currentSentence.audioUrl} label="Hear this sentence" />
          <ShadowRecorder key={currentSentence.id} target={currentSentence.spanish} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {shadowIndex > 0 ? (
              <View style={{ flex: 1 }}><ActionButton label="Previous" onPress={() => setShadowIndex((value) => value - 1)} /></View>
            ) : null}
            {shadowIndex < lesson.sentences.length - 1 ? (
              <View style={{ flex: 1 }}><ActionButton label="Next sentence" onPress={() => setShadowIndex((value) => value + 1)} /></View>
            ) : (
              <View style={{ flex: 1 }}><ActionButton label="New lesson" onPress={() => setLesson(null)} /></View>
            )}
          </View>
        </LessonCard>
      ) : null}
    </ScrollView>
  );
}

function ChoiceGroup({ title, values, selected, onSelect }: { title: string; values: readonly string[]; selected: string; onSelect: (value: string) => void }) {
  return (
    <View style={{ gap: 10 }}>
      <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>{title}</Text>
      <View style={{ gap: 8 }}>
        {values.map((value) => (
          <View key={value} style={{ padding: 4, borderWidth: selected === value ? 2 : 1, borderColor: selected === value ? colors.accent : colors.border, borderRadius: 14, borderCurve: "continuous", backgroundColor: selected === value ? colors.accentSoft : colors.surface }}>
            <ActionButton label={value} onPress={() => onSelect(value)} />
          </View>
        ))}
      </View>
    </View>
  );
}

function LessonCard({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <View style={{ padding: 20, gap: 18, borderRadius: 22, borderCurve: "continuous", backgroundColor: colors.surface, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
      <View style={{ gap: 5 }}>
        <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>{eyebrow}</Text>
        <Text selectable style={{ color: colors.text, fontSize: 20, lineHeight: 27, fontWeight: "700" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Transcript({ lesson, withAudio, showTranslation }: { lesson: Lesson; withAudio?: boolean; showTranslation?: boolean }) {
  return (
    <View style={{ gap: 18 }}>
      {lesson.sentences.map((sentence, index) => (
        <View key={sentence.id} style={{ gap: 6, paddingBottom: 16, borderBottomWidth: index === lesson.sentences.length - 1 ? 0 : 1, borderBottomColor: colors.border }}>
          <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: "600" }}>{sentence.spanish}</Text>
          {showTranslation ? <Text selectable style={{ color: colors.secondaryText }}>{sentence.english}</Text> : null}
          {withAudio ? <AudioButton uri={sentence.audioUrl} label={`Play sentence ${index + 1}`} /> : null}
        </View>
      ))}
    </View>
  );
}
