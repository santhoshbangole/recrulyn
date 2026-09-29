import type { ProjectEntry } from "./types";
import { stripBullet } from "./textNormalizer";
import { extractSkillsFromText } from "./skillsDictionary";

// A title line is typically short, doesn't start with a bullet-style verb,
// and is often followed by a "|" or ":" separating it from a tech stack.
function looksLikeTitleLine(line: string): boolean {

  const stripped = stripBullet(line).trim();

  if (!stripped)
    return false;

  if (stripped.length > 100)
    return false;

  if (
    /^(developed|implemented|designed|created|worked|built|using|used|responsible|managed|led|integrated|collaborated|optimized|improved)/i.test(stripped)
  ) {
    return false;
  }

  if (
    /^[•●▪◦-]/.test(line)
  ) {
    return false;
  }

  return true;
}

export function extractProjects(sectionLines: string[]): ProjectEntry[] {
  if (sectionLines.length === 0) return [];

  const blocks = groupIntoEntryBlocks(sectionLines);
  return blocks
    .map((block) => parseProjectBlock(block))
    .filter((entry) => entry.title || entry.technologies.length > 0);
}

function groupIntoEntryBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsNewEntry = looksLikeTitleLine(line) && current.length > 0;
    if (startsNewEntry) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) blocks.push(current);
  return blocks;
}

function parseProjectBlock(block: string[]): ProjectEntry {
  const raw = block.join(" ");
  const headerLine = block[0];

  let title = headerLine;
  let inlineTechSegment = "";

  // Common pattern: "Project Title | React, Node.js, MongoDB"
  const pipeSplit = headerLine.split("|");
  if (pipeSplit.length > 1) {
    title = pipeSplit[0].trim();
    inlineTechSegment = pipeSplit.slice(1).join(" ");
  } else {
    const colonSplit = headerLine.split(":");
    if (colonSplit.length > 1 && colonSplit[0].split(/\s+/).length <= 6) {
      title = colonSplit[0].trim();
      inlineTechSegment = colonSplit.slice(1).join(" ");
    }
  }

  const technologies =
  Array.from(
    new Set(
      extractSkillsFromText(
        `${title}
${inlineTechSegment}
${raw}`
      )
    )
  );

const description = block
  .slice(1)
  .map(stripBullet)
  .map(line =>
    line.replace(/^[-•●▪◦]\s*/, "").trim()
  )
  .filter(line => line.length > 3);

  return {
    title: stripBullet(title)
  .replace(/\|/g,"")
  .replace(/:+$/,"")
  .trim(),
    technologies,
    description,
    raw,
  };
}