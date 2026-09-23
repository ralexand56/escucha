export const lessonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "level", "topic", "sentences"],
  properties: {
    title: { type: "string" },
    level: { type: "string", enum: ["A1", "A2", "B1", "B2"] },
    topic: { type: "string" },
    sentences: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["spanish", "english", "tip"],
        properties: {
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
Write a natural, connected mini-scene of 3 to 5 short sentences in neutral Latin American Spanish.
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
