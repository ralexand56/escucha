export const lessonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "level", "topic", "speakers", "sentences"],
  properties: {
    title: { type: "string" },
    level: { type: "string", enum: ["A1", "A2", "B1", "B2"] },
    topic: { type: "string" },
    speakers: {
      type: "object",
      additionalProperties: false,
      required: ["A", "B"],
      properties: {
        A: { type: "string" },
        B: { type: "string" }
      }
    },
    sentences: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["speaker", "spanish", "english", "tip"],
        properties: {
          speaker: { type: "string", enum: ["A", "B"] },
          spanish: { type: "string" },
          english: { type: "string" },
          tip: { type: "string" }
        }
      }
    }
  }
};

export function lessonPrompt({ level, topic }) {
  return `Create one compact Spanish listening lesson for an English-speaking learner at ${level} level.
Topic: ${topic}.
Write a natural two-person conversation of 4 to 6 short lines in neutral Latin American Spanish.
Name both roles for this situation in the speakers object (for example, Customer and Server). Assign every line to speaker A or B and alternate speakers naturally. Both people must speak at least twice.
The title should be in Spanish. Provide a natural English translation and one concise listening tip per sentence.
Avoid sensitive content, names of real people, markdown, and explanations outside the requested structure.`;
}

export const evaluationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["score", "summary", "heard", "missedWords", "nextTry"],
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100 },
    summary: { type: "string" },
    heard: { type: "string" },
    missedWords: { type: "array", items: { type: "string" } },
    nextTry: { type: "string" }
  }
};

export function evaluationPrompt(target, transcript) {
  return `Evaluate a Spanish learner's shadowing attempt.
Target: ${JSON.stringify(target)}
Transcription: ${JSON.stringify(transcript)}
Score word/content accuracy from 0 to 100. Be encouraging and specific. Do not claim to assess accent or phonetics from text alone. Keep each message brief.`;
}
