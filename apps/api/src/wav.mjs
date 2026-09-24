function findChunk(buffer, chunkId) {
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === chunkId) return { offset: offset + 8, size };
    offset += 8 + size + (size % 2);
  }
  throw new Error(`Invalid WAV: missing ${chunkId} chunk.`);
}

export function combineWav(buffers, pauseMs = 260) {
  if (!buffers.length) throw new Error("At least one WAV buffer is required.");

  const firstFmt = findChunk(buffers[0], "fmt ");
  const format = buffers[0].subarray(firstFmt.offset, firstFmt.offset + firstFmt.size);
  const byteRate = format.readUInt32LE(8);
  const blockAlign = format.readUInt16LE(12);
  const pauseLength = Math.floor((byteRate * pauseMs) / 1000 / blockAlign) * blockAlign;
  const pause = Buffer.alloc(pauseLength);
  const audioParts = [];

  buffers.forEach((buffer, index) => {
    const fmt = findChunk(buffer, "fmt ");
    if (!buffer.subarray(fmt.offset, fmt.offset + fmt.size).equals(format)) {
      throw new Error("Cannot combine WAV files with different audio formats.");
    }
    const data = findChunk(buffer, "data");
    audioParts.push(buffer.subarray(data.offset, data.offset + data.size));
    if (index < buffers.length - 1) audioParts.push(pause);
  });

  const audio = Buffer.concat(audioParts);
  const output = Buffer.alloc(12 + 8 + format.length + (format.length % 2) + 8 + audio.length);
  output.write("RIFF", 0);
  output.writeUInt32LE(output.length - 8, 4);
  output.write("WAVE", 8);
  output.write("fmt ", 12);
  output.writeUInt32LE(format.length, 16);
  format.copy(output, 20);
  const dataHeader = 20 + format.length + (format.length % 2);
  output.write("data", dataHeader);
  output.writeUInt32LE(audio.length, dataHeader + 4);
  audio.copy(output, dataHeader + 8);
  return output;
}
