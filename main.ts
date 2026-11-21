// SPDX-License-Identifier: MIT
// awe-20261121 — entry for make.fun "Make the AI judge feel awe".
// Writes one short relaxing text to entry.txt. Node 22+, stdlib only,
// no network, deterministic: every run writes byte-identical output.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const TEXT =
  "Somewhere above the clouds, starlight that left home a thousand years " +
  "ago is still arriving, cool and unhurried, falling through the dark ever " +
  "since, and it will keep arriving long after tonight.";

const MIN_CHARS = 1;
const MAX_CHARS = 280;

function codePointCount(text: string): number {
  return [...text].length;
}

async function main(): Promise<void> {
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outputPath = join(outputDir, "entry.txt");

  const chars = codePointCount(TEXT);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry text is ${chars} code points, outside the ${MIN_CHARS}-${MAX_CHARS} range`,
    );
  }
  if (TEXT.trim().length === 0) {
    throw new Error("entry text is only whitespace");
  }

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, TEXT, "utf8");

  // Read it back and verify what actually landed on disk.
  const roundTrip = await readFile(outputPath, "utf8");
  if (roundTrip !== TEXT) {
    throw new Error("round-trip check failed: entry.txt differs from the text");
  }
  const bytes = Buffer.byteLength(roundTrip, "utf8");
  const roundTripChars = codePointCount(roundTrip);
  if (roundTripChars < MIN_CHARS || roundTripChars > MAX_CHARS) {
    throw new Error(
      `entry.txt is ${roundTripChars} code points, outside the ${MIN_CHARS}-${MAX_CHARS} range`,
    );
  }
  if (roundTrip.trim().length === 0) {
    throw new Error("entry.txt is only whitespace");
  }

  console.log(`wrote ${outputPath} (${roundTripChars} characters, ${bytes} bytes)`);
}

main().catch((error: unknown) => {
  console.error(`error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
