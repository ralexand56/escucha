export type Level = "A1" | "A2" | "B1" | "B2";

export type LessonSentence = {
  id: string;
  spanish: string;
  english: string;
  tip: string;
  audioUrl: string;
};

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  level: Level;
  audioUrl: string;
  sentences: LessonSentence[];
};

export type Evaluation = {
  score: number;
  summary: string;
  transcript: string;
  heard: string;
  missedWords: string[];
  nextTry: string;
};
