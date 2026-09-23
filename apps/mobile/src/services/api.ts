import type { Evaluation, Lesson, Level } from "@/types/lesson";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:8787").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, readonly status = 0) {
    super(message);
  }
}

async function parse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.message || "Something went wrong.", response.status);
  return body as T;
}

export async function createLesson(level: Level, topic: string): Promise<Lesson> {
  try {
    const response = await fetch(`${API_URL}/v1/lessons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, topic })
    });
    return parse<Lesson>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not reach the lesson server. Check the API URL and your connection.");
  }
}

export async function evaluateRecording(uri: string, target: string): Promise<Evaluation> {
  const form = new FormData();
  form.append("target", target);
  form.append("audio", { uri, name: "shadowing.m4a", type: "audio/mp4" } as unknown as Blob);
  try {
    const response = await fetch(`${API_URL}/v1/evaluations`, { method: "POST", body: form });
    return parse<Evaluation>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Could not upload the recording. Check your connection and try again.");
  }
}
