import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
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
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: 20, paddingBottom: 44, gap: 28 }}>
        <View style={{ gap: 10 }}>
          <Text selectable style={{ color: colors.accent, fontSize: 13, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" }}>
            5-minute listening practice
          </Text>
          <Text selectable style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.text }}>
            What do you want to practice?
          </Text>
          <Text selectable style={{ fontSize: 17, lineHeight: 24, color: colors.secondaryText }}>
            Choose a level and a real-life scene. We’ll build a short Spanish lesson for you.
          </Text>
        </View>

        <ChoiceGroup title="1 · Your level" values={levels} selected={level} onSelect={(value) => setLevel(value as Level)} compact />
        <ChoiceGroup title="2 · Choose a scene" values={topics} selected={topic} onSelect={setTopic} />

        {error ? (
          <View style={{ padding: 16, gap: 6, borderRadius: 16, borderCurve: "continuous", backgroundColor: colors.surface }}>
            <Text selectable style={{ color: colors.danger, fontWeight: "700" }}>Couldn’t create the lesson</Text>
            <Text selectable style={{ color: colors.secondaryText }}>{error}</Text>
          </View>
        ) : null}

        <View style={{ padding: 18, gap: 12, borderRadius: 20, borderCurve: "continuous", backgroundColor: colors.surface, boxShadow: "0 4px 18px rgba(0,0,0,0.08)" }}>
          <View style={{ gap: 3 }}>
            <Text selectable style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
              Ready for your {level} lesson?
            </Text>
            <Text selectable style={{ color: colors.secondaryText, fontSize: 14, lineHeight: 20 }}>
              {sentenceCase(topic)} · about 5 minutes
            </Text>
          </View>
          {loading ? (
            <View style={{ minHeight: 56, gap: 10, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
              <Text selectable style={{ color: colors.secondaryText }}>Writing and voicing your lesson…</Text>
            </View>
          ) : (
            <ActionButton label={error ? "Try again" : "Start this lesson  →"} onPress={loadLesson} />
          )}
          <Text selectable style={{ fontSize: 12, lineHeight: 17, color: colors.secondaryText }}>
            AI-generated audio · Your recordings stay on your private server.
          </Text>
        </View>
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
          <Text selectable style={{ color: colors.accent, fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 }}>
            {lesson.speakers[currentSentence.speaker]}
          </Text>
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

function ChoiceGroup({ title, values, selected, onSelect, compact = false }: { title: string; values: readonly string[]; selected: string; onSelect: (value: string) => void; compact?: boolean }) {
  return (
    <View style={{ gap: 10 }}>
      <Text selectable style={{ color: colors.text, fontSize: 17, fontWeight: "700" }}>{title}</Text>
      <View style={{ gap: 8, flexDirection: compact ? "row" : "column", flexWrap: compact ? "wrap" : "nowrap" }}>
        {values.map((value) => {
          const isSelected = selected === value;

          return (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(value)}
              style={({ pressed }) => ({
                minHeight: compact ? 44 : 54,
                minWidth: compact ? 64 : undefined,
                flexGrow: compact ? 1 : 0,
                paddingHorizontal: compact ? 15 : 16,
                paddingVertical: compact ? 10 : 14,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? colors.accent : colors.border,
                borderRadius: 14,
                borderCurve: "continuous",
                backgroundColor: isSelected ? colors.accentSoft : colors.surface,
                opacity: pressed ? 0.72 : 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12
              })}
            >
              <Text style={{ flex: compact ? 0 : 1, color: colors.text, fontSize: 16, fontWeight: isSelected ? "700" : "600", textAlign: compact ? "center" : "left" }}>
                {compact ? value : sentenceCase(value)}
              </Text>
              {isSelected ? (
                <Text accessibilityElementsHidden style={{ color: colors.accent, fontSize: 16, fontWeight: "800" }}>
                  {compact ? "✓" : "Selected  ✓"}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function sentenceCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
          <Text selectable style={{ color: colors.accent, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.6 }}>
            {lesson.speakers[sentence.speaker]}
          </Text>
          <Text selectable style={{ color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: "600" }}>{sentence.spanish}</Text>
          {showTranslation ? <Text selectable style={{ color: colors.secondaryText }}>{sentence.english}</Text> : null}
          {withAudio ? <AudioButton uri={sentence.audioUrl} label={`Play sentence ${index + 1}`} /> : null}
        </View>
      ))}
    </View>
  );
}
