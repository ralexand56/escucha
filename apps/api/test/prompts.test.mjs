import test from "node:test";
import assert from "node:assert/strict";
import { evaluationPrompt, lessonPrompt } from "../src/prompts.mjs";

test("lesson prompt includes selected constraints", () => {
  const prompt = lessonPrompt({ level: "B1", topic: "catching a train" });
  assert.match(prompt, /B1/);
  assert.match(prompt, /catching a train/);
  assert.match(prompt, /two-person conversation/);
  assert.match(prompt, /Both people must speak at least twice/);
});

test("evaluation prompt safely quotes learner text", () => {
  const prompt = evaluationPrompt("¿Cómo estás?", "como estas");
  assert.match(prompt, /¿Cómo estás\?/);
  assert.match(prompt, /como estas/);
});
