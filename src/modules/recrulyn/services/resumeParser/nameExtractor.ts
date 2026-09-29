/**
 * nameExtractor.ts
 * Extracts the candidate's name by scoring plausible lines from the top of
 * the resume, rejecting lines that look like labels, institutions, or
 * companies.
 */

const NON_NAME_KEYWORDS = [
  "resume",
  "curriculum vitae",
  "cv",
  "profile",
  "objective",
  "summary",
  "about",
  "career objective",
  "professional summary",
  "education",
  "experience",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "university",
  "college",
  "institute",
  "school",
  "academy",
  "department",
  "faculty",
  "email",
  "phone",
  "mobile",
  "address",
  "linkedin",
  "github",
  "portfolio",
  "b.tech",
  "m.tech",
  "b.e",
  "m.e",
  "mba",
  "mca",
  "bca",
  "b.sc",
  "m.sc",
  "diploma",
  "technologies",
  "technology",
  "solutions",
  "systems",
  "private limited",
  "private",
  "limited",
  "ltd",
  "llp",
  "inc",
  "corporation",
];

export function extractName(text: string, email: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 15);

  const candidates: { value: string; score: number }[] = [];

  lines.forEach((line, idx) => {
    if (!isPlausibleNameLine(line)) return;

    let score = 0;
    score += Math.max(0, 10 - idx * 2); // earlier lines score higher

    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 4) score += 5;

   const looksTitleCase =
  words.every(
    w =>
      /^[A-Z][a-zA-Z.'-]*$/.test(w)
  );

if (looksTitleCase)
  score += 5;

const allCaps =
  /^[A-Z\s]+$/.test(line);

if (allCaps)
  score -= 3;
    const letters = line.replace(/[^a-zA-Z]/g, "");
    if (letters === letters.toUpperCase() && letters.length > 0) score += 2;

    if (/\d/.test(line)) score -= 20;

    candidates.push({ value: line, score });
  });

  if (candidates.length === 0) {
    return email ? guessNameFromEmail(email) : "";
  }

  candidates.sort((a, b) => b.score - a.score);
  return toDisplayCase(candidates[0].value);
}

function isPlausibleNameLine(line: string): boolean {
  if (line.length > 40) return false;

  const lower = ` ${line.toLowerCase()} `;
  if (NON_NAME_KEYWORDS.some((kw) => lower.includes(kw))) return false;
  if (/@|http|www\.|\+?\d{3,}/.test(line)) return false;

  const words = line.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;
if (
  /[:;|/@]/.test(line)
) {
  return false;
}
  return true;
}

function guessNameFromEmail(email: string): string {
  const local = email.split("@")[0] || "";
const guess = local
  .replace(/[._-]+/g, " ")
  .replace(/\d+/g, "")
  .trim();
    return guess ? toDisplayCase(guess) : "";
}

function toDisplayCase(str: string): string {
  return str
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}