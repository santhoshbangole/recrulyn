/**
 * textNormalizer.ts
 * Cleans raw extracted resume text before any section detection or field
 * extraction happens. Every downstream extractor assumes it is working
 * with normalized text.
 */

const PAGE_NUMBER_PATTERNS = [
  /^page\s+\d+(\s+of\s+\d+)?$/i,
  /^\d+\s*\/\s*\d+$/,
  /^-\s*\d+\s*-$/,
];

// Bullets, arrows, decorative separators commonly found in PDF/DOCX exports.
const DECORATIVE_CHARS_REGEX =
  /[•●○◦▪▫■□❖✦✧∙‣⁃➤➢➔→»«★☆♦◆]/g;

const MULTI_DASH_REGEX = /[-_=]{3,}/g;

export function normalizeText(raw: string): string {
  if (!raw) return "";

  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  text = text.replace(/\u00A0/g, " ");
  text = text.replace(DECORATIVE_CHARS_REGEX, " ");
  text = text.replace(MULTI_DASH_REGEX, " ");
  text = text.replace(/[ \t]+/g, " ");

  const rawLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const cleaned: string[] = [];
  const seenLongLines = new Set<string>();

  for (const line of rawLines) {
    if (isPageArtifact(line)) continue;

    const key = line.toLowerCase();

    // Only dedupe longer lines. Short lines (e.g. a skill name repeated in
    // both the Skills section and a project description) are legitimate
    // repeats and must be preserved.
    if (line.length > 25) {
      if (seenLongLines.has(key)) continue;
      seenLongLines.add(key);
    }

    cleaned.push(line);
  }

  return cleaned.join("\n");
}

function isPageArtifact(line: string): boolean {
  if (PAGE_NUMBER_PATTERNS.some((re) => re.test(line))) return true;
  if (/^\d+$/.test(line) && line.length <= 3) return true;
  return false;
}

export function splitLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Strips leading bullet markers / numbering from a single line. */
export function stripBullet(line: string): string {
  return line
    .replace(/^[\u2022\u25CF\u25E6\u2023\u2043▪▫■□»«*\-–—.]+\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
}