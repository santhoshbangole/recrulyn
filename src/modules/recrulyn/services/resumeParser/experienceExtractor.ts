import type { ExperienceEntry } from "./types";
import { stripBullet } from "./textNormalizer";

  "(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?";

const DATE_RANGE_REGEX =
/((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*)?((19|20)\d{2}|\d{1,2}\/\d{4})\s*(-|–|—|to)\s*((Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s*)?((19|20)\d{2}|\d{1,2}\/\d{4}|Present|Current)/i;

const DESIGNATION_KEYWORDS = [
"Intern",
"Trainee",
"Software Engineer",
"Software Developer",
"Frontend Developer",
"Backend Developer",
"Full Stack Developer",
"Web Developer",
"Mobile Developer",
"Android Developer",
"IOS Developer",
"UI Developer",
"UX Designer",
"UI/UX Designer",
"Data Analyst",
"Business Analyst",
"ML Engineer",
"AI Engineer",
"Research Intern",
"Project Intern",
"Graduate Engineer Trainee",
"Engineer",
"Developer",
"Executive",
"Officer",
"Consultant",
"Analyst",
"Lead",
"Architect",
"Manager",
"Coordinator",
"Associate",
"Administrator",
"Scientist",
"Researcher",
"Founder",
"Co-Founder",
"President",
"Director"
];
const COMPANY_KEYWORDS = [
  "Technologies",
  "Technology",
  "Solutions",
  "Systems",
  "Software",
  "Labs",
  "Corporation",
  "Corp",
  "Limited",
  "Ltd",
  "Private",
  "Pvt",
  "LLP",
  "Inc",
  "Services",
  "Consulting",
  "Global",
  "University",
  "College",
  "Institute",
];
function looksLikeDesignation(text: string) {

  return (
  DESIGNATION_REGEX.test(text) ||
  /intern/i.test(text) ||
  /trainee/i.test(text) ||
  /graduate engineer/i.test(text) ||
  /apprentice/i.test(text)
);

}

const DESIGNATION_REGEX = new RegExp(
  `\\b(${DESIGNATION_KEYWORDS.join("|")})\\b`,
  "i"
);

export function extractExperience(sectionLines: string[]): ExperienceEntry[] {
  if (sectionLines.length === 0) return [];

  const merged = mergeHeaderWithDateLine(sectionLines);
  const blocks = groupIntoEntryBlocks(merged);
  return blocks
    .map((block) => parseExperienceBlock(block))
    .filter((entry) => entry.company || entry.designation || entry.duration);
}

/**
 * Many resumes put the role/company on one line and the date range on the
 * very next line, e.g.:
 *   "Software Engineer | Recrulyn Technologies"
 *   "Jan 2023 - Present"
 * Fold that date-only line into the preceding header line so the block
 * grouping below (which anchors on date ranges) treats them as one entry.
 */
function mergeHeaderWithDateLine(lines: string[]): string[] {
  const merged: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1];

    if (
      next &&
      !DATE_RANGE_REGEX.test(line) &&
      DATE_RANGE_REGEX.test(next) &&
      isMostlyDateRange(next)
    ) {
      merged.push(`${line} ${next}`);
      i++; // consume the date line
    } else {
      merged.push(line);
    }
  }

  return merged;
}

function isMostlyDateRange(line: string): boolean {

  const cleaned = line
    .replace(DATE_RANGE_REGEX, "")
    .replace(/[()|]/g, "")
    .trim();

  return cleaned.length <= 5;

}

/**
 * Each experience entry usually opens with a line containing a date range
 * (e.g. "Jan 2022 - Present") near the company/designation line. We treat
 * any line containing a date range as the start of a new block.
 */
function groupIntoEntryBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const hasDateRange = DATE_RANGE_REGEX.test(line);
    if (hasDateRange && current.length > 0) {
      blocks.push(current);
      current = [line];
    } else {
      current.push(line);
    }
  }

  if (current.length > 0) blocks.push(current);
  return blocks;
}

function parseExperienceBlock(block: string[]): ExperienceEntry {
  const raw = block.join(" ");
  const durationMatch = raw.match(DATE_RANGE_REGEX);
  const duration = durationMatch ? durationMatch[0].trim() : "";

  // The header line is the one containing the duration (or the first line
  // if no duration was found); everything after is treated as description.
  const headerIndex = block.findIndex((l) => DATE_RANGE_REGEX.test(l));
  const headerLine = headerIndex >= 0 ? block[headerIndex] : block[0];
  const descriptionLines = block
    .filter((_, idx) => idx !== headerIndex)
    .map(stripBullet)
.map(line =>
  line
    .replace(/^[-•●▪◦]\s*/, "")
    .trim()
)
    .filter((l) => l.length > 0);
for (let i = descriptionLines.length - 1; i >= 0; i--) {
  if (
    DATE_RANGE_REGEX.test(descriptionLines[i]) ||
    descriptionLines[i].trim().length <= 2
  ) {
    descriptionLines.splice(i, 1);
  }
}
 let { company, designation } = splitCompanyDesignation(
  headerLine.replace(DATE_RANGE_REGEX, "").trim()
);

company = company
  .replace(/\|/g, "")
  .replace(/,+$/, "")
  .replace(/-+$/, "")
  .trim();

designation = designation
  .replace(/\|/g, "")
  .replace(/,+$/, "")
  .replace(/-+$/, "")
  .trim();
  return {
    company,
    designation,
    duration,
    description: descriptionLines,
    raw,
  };
}
function looksLikeCompany(text: string): boolean {

  const lower = text.toLowerCase();

  if (
    COMPANY_KEYWORDS.some(k =>
      lower.includes(k.toLowerCase())
    )
  ) {
    return true;
  }

  if (/^[A-Z][A-Za-z0-9&.,'() -]{2,}$/.test(text)) {
    return true;
  }

  return false;
}

function splitCompanyDesignation(headerText: string): {
  company: string;
  designation: string;
} {
  const cleaned = headerText.replace(/^[\s|,\-–:]+|[\s|,\-–:]+$/g, "");
  if (!cleaned) return { company: "", designation: "" };

  const parts = cleaned
   .split(/\s*\|\s*|\s*@\s*|\s+at\s+|\s+-\s+|\s+–\s+|,\s*/i)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 1) {
    // Single fragment: guess based on presence of a role keyword.
    if (DESIGNATION_REGEX.test(parts[0])) {
      return { company: "", designation: parts[0] };
    }
    return { company: parts[0], designation: "" };
  }

  let designation = "";
  let company = "";

  for (const part of parts) {

  if (
    !designation &&
    looksLikeDesignation(part)
  ) {
    designation = part;
    continue;
  }

  if (
    !company &&
    looksLikeCompany(part)
  ) {
    company = part;
  }

}

  // Fallback: if no keyword matched, assume [designation, company] order.
 if (!designation && !company) {

  if (looksLikeDesignation(parts[0])) {

    designation = parts[0];
    company = parts[1] || "";

  } else {

    company = parts[0];
    designation = parts[1] || "";

  }

}

if (!company) {

  company =
    parts.find(
      p => p !== designation
    ) || "";

}

if (!designation) {

  designation =
    parts.find(
      p => p !== company
    ) || "";

}


  return { company, designation };
}