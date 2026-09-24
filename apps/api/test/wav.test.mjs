import test from "node:test";
import assert from "node:assert/strict";
import { combineWav } from "../src/wav.mjs";

function wav(samples) {
  const data = Buffer.from(samples);
  const output = Buffer.alloc(44 + data.length);
  output.write("RIFF", 0);
  output.writeUInt32LE(output.length - 8, 4);
  output.write("WAVEfmt ", 8);
  output.writeUInt32LE(16, 16);
  output.writeUInt16LE(1, 20);
  output.writeUInt16LE(1, 22);
  output.writeUInt32LE(1000, 24);
  output.writeUInt32LE(1000, 28);
  output.writeUInt16LE(1, 32);
  output.writeUInt16LE(8, 34);
  output.write("data", 36);
  output.writeUInt32LE(data.length, 40);
  data.copy(output, 44);
  return output;
}

test("combineWav joins compatible clips with silence", () => {
  const result = combineWav([wav([1, 2]), wav([3, 4])], 2);
  assert.equal(result.toString("ascii", 0, 4), "RIFF");
  assert.equal(result.readUInt32LE(40), 6);
  assert.deepEqual([...result.subarray(44)], [1, 2, 0, 0, 3, 4]);
});
