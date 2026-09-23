import { evaluationPrompt, evaluationSchema, lessonPrompt, lessonSchema } from "./prompts.mjs";

const apiBase = "https://api.openai.com/v1";

function key() {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(new Error("OPENAI_API_KEY is not configured on the server."), { status: 503 });
  }
  return process.env.OPENAI_API_KEY;
}

async function openai(path, init) {
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key()}`, ...init.headers }
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error("OpenAI request failed", response.status, detail);
    throw Object.assign(new Error("The AI service could not complete the request."), { status: 502 });
  }
  return response;
}

async function structuredResponse({ input, schema, name }) {
  const response = await openai("/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4o-mini",
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } }
    })
  });
  const data = await response.json();
  const outputText = data.output?.flatMap((item) => item.content || []).find((item) => item.type === "output_text")?.text;
  if (!outputText) throw Object.assign(new Error("The AI service returned no structured result."), { status: 502 });
  return JSON.parse(outputText);
}

export function generateLesson(input) {
  return structuredResponse({ input: lessonPrompt(input), schema: lessonSchema, name: "spanish_lesson" });
}

export async function synthesizeSpeech(text) {
  const response = await openai("/audio/speech", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions: "Speak in clear, natural Latin American Spanish at a friendly conversational pace.",
      response_format: "mp3"
    })
  });
  return Buffer.from(await response.arrayBuffer());
}

export async function transcribeAudio(bytes, fileName, mimeType) {
  const body = new FormData();
  body.append("file", new Blob([bytes], { type: mimeType }), fileName);
  body.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  body.append("language", "es");
  const response = await openai("/audio/transcriptions", { method: "POST", body });
  const result = await response.json();
  return result.text;
}

export function evaluateTranscript(target, transcript) {
  return structuredResponse({
    input: evaluationPrompt(target, transcript),
    schema: evaluationSchema,
    name: "shadowing_evaluation"
  });
}
