/**
 * sectionDetector.ts
 * Splits normalized resume text into canonical sections regardless of the
 * exact heading wording used (e.g. "Academic Qualification" -> education).
 */

export type SectionName =
  | "summary"
  | "skills"
  | "education"
  | "experience"
  | "projects"
  | "certifications"
  | "achievements"
  | "other";

const SECTION_ALIASES: Record<SectionName, string[]> = {
  summary: [
    "summary",
    "objective",
    "profile",
    "career objective",
    "about me",
    "professional summary",
    "personal summary",
  ],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "key skills",
    "competencies",
    "technologies",
    "tech stack",
    "technical proficiencies",
    "skill set",
    "skillset",
    "areas of expertise",
    "expertise",
  ],
  education: [
    "education",
    "academic qualification",
    "academic qualifications",
    "educational background",
    "qualification",
    "qualifications",
    "academic background",
    "academic details",
    "academics",
    "education background",
  ],
  experience: [
    "experience",
    "professional experience",
    "work experience",
    "work history",
    "employment",
    "employment history",
    "career history",
    "professional background",
    "internship experience",
    "internships",
    "experience summary",
  ],
  projects: [
    "projects",
    "project experience",
    "academic projects",
    "personal projects",
    "key projects",
    "major projects",
    "project work",
    "notable projects",
  ],
  certifications: [
    "certifications",
    "certificates",
    "courses",
    "licenses",
    "licenses and certifications",
    "licenses & certifications",
    "training",
    "certification",
    "course work",
    "coursework",
    "online courses",
  ],
  achievements: [
    "achievements",
    "awards",
    "honors",
    "honours",
    "accomplishments",
    "extra curricular",
    "extracurricular activities",
    "activities",
    "awards and achievements",
  ],
  other: [],
};

const HEADING_LOOKUP = new Map<string, SectionName>();
for (const [section, aliases] of Object.entries(SECTION_ALIASES) as [
  SectionName,
  string[]
][]) {
  for (const alias of aliases) {
    HEADING_LOOKUP.set(alias.toLowerCase(), section);
  }
}

// Sorted longest-first so "academic qualification" is checked before the
// shorter "qualification" when doing substring fallback matching.
const SORTED_ALIASES = [...HEADING_LOOKUP.keys()].sort(
  (a, b) => b.length - a.length
);

function normalizeHeading(line: string): string {
  return line
    .toLowerCase()
    .replace(/[:\-–_]+$/g, "")
    .replace(/[^a-z0-9& ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** A heading is short, low word-count, and either ALL CAPS or Title Case. */
export function isLikelyHeading(line: string): boolean {
  if (line.length > 45) return false;
  const wordCount = line.split(/\s+/).filter(Boolean).length;
  if (wordCount === 0 || wordCount > 5) return false;

  const letters = line.replace(/[^a-zA-Z]/g, "");
  if (letters.length === 0) return false;

  const isAllCaps = letters === letters.toUpperCase() && letters.length >= 3;
  const isTitleCaseShort = wordCount <= 4 && /^[A-Z]/.test(line.trim());

  return isAllCaps || isTitleCaseShort;
}

export function detectSection(line: string): SectionName | null {
  const normalized = normalizeHeading(line);
  if (!normalized) return null;

  if (HEADING_LOOKUP.has(normalized)) return HEADING_LOOKUP.get(normalized)!;

  for (const alias of SORTED_ALIASES) {
    if (alias.length < 4) continue; // avoid noisy short-alias false positives
    if (normalized === alias || normalized.includes(alias)) {
      return HEADING_LOOKUP.get(alias)!;
    }
  }

  return null;
}

export function splitIntoSections(
  lines: string[]
): Record<SectionName, string[]> {
  const sections: Record<SectionName, string[]> = {
    summary: [],
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    other: [],
  };

  let current: SectionName = "other";

  for (const line of lines) {
    if (isLikelyHeading(line)) {
      const detected = detectSection(line);
      if (detected) {
        current = detected;
        continue; // heading itself is not section content
      }
    }
    sections[current].push(line);
  }

  return sections;
}