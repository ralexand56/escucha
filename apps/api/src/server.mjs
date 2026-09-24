import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { evaluateTranscript, generateLesson, synthesizeSpeech, transcribeAudio } from "./openai.mjs";
import { combineWav } from "./wav.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const audioDir = join(here, "..", "data", "audio");
const port = Number(process.env.PORT || 8787);
await mkdir(audioDir, { recursive: true });

function json(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

async function parseJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function requestUrl(request) {
  return new URL(request.url, `http://${request.headers.host || "localhost"}`);
}

const server = createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
      });
      return response.end();
    }

    const url = requestUrl(request);
    if (request.method === "GET" && url.pathname === "/health") {
      return json(response, 200, { ok: true, configured: Boolean(process.env.OPENAI_API_KEY) });
    }

    if (request.method === "GET" && url.pathname.startsWith("/audio/")) {
      const fileName = url.pathname.slice("/audio/".length);
      if (!/^[a-f0-9-]+\.wav$/.test(fileName)) return json(response, 404, { message: "Audio not found." });
      const bytes = await readFile(join(audioDir, fileName));
      response.writeHead(200, { "Content-Type": "audio/wav", "Cache-Control": "private, max-age=86400" });
      return response.end(bytes);
    }

    if (request.method === "POST" && url.pathname === "/v1/lessons") {
      const body = await parseJson(request);
      const level = ["A1", "A2", "B1", "B2"].includes(body.level) ? body.level : "A2";
      const topic = typeof body.topic === "string" && body.topic.trim() ? body.topic.trim().slice(0, 80) : "ordering at a café";
      const lesson = await generateLesson({ level, topic });
      const origin = `${url.protocol}//${request.headers.host}`;
      const voices = {
        A: process.env.OPENAI_TTS_VOICE_A || "coral",
        B: process.env.OPENAI_TTS_VOICE_B || "onyx"
      };
      const sentenceAudio = await Promise.all(
        lesson.sentences.map((sentence) => synthesizeSpeech(sentence.spanish, voices[sentence.speaker]))
      );
      const sentences = await Promise.all(lesson.sentences.map(async (sentence, index) => {
        const fileName = `${randomUUID()}.wav`;
        await writeFile(join(audioDir, fileName), sentenceAudio[index]);
        return { ...sentence, id: `sentence-${index + 1}`, audioUrl: `${origin}/audio/${fileName}` };
      }));
      const lessonFileName = `${randomUUID()}.wav`;
      await writeFile(join(audioDir, lessonFileName), combineWav(sentenceAudio));
      return json(response, 201, {
        ...lesson,
        id: randomUUID(),
        audioUrl: `${origin}/audio/${lessonFileName}`,
        sentences
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/evaluations") {
      const webRequest = new Request(url, { method: "POST", headers: request.headers, body: request, duplex: "half" });
      const form = await webRequest.formData();
      const audio = form.get("audio");
      const target = String(form.get("target") || "").slice(0, 500);
      if (!(audio instanceof File) || !target) return json(response, 400, { message: "Audio and target are required." });
      if (audio.size > 10_000_000) return json(response, 413, { message: "Recording must be smaller than 10 MB." });
      const transcript = await transcribeAudio(await audio.arrayBuffer(), audio.name || `recording${extname(audio.name) || ".m4a"}`, audio.type || "audio/mp4");
      const evaluation = await evaluateTranscript(target, transcript);
      return json(response, 200, { ...evaluation, transcript });
    }

    return json(response, 404, { message: "Not found." });
  } catch (error) {
    if (error?.code === "ENOENT") return json(response, 404, { message: "Audio not found." });
    console.error(error);
    return json(response, error.status || 500, { message: error.message || "Unexpected server error." });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Escucha API listening on http://localhost:${port}`);
});
