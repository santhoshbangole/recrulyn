import type { EducationEntry } from "./types";

const DEGREE_KEYWORDS = [
  "Ph.D", "PhD", "M.Tech", "MTech", "B.Tech", "BTech", "M.E", "B.E",
  "M.Sc", "B.Sc", "MCA", "BCA", "MBA", "BBA", "M.Com", "B.Com",
  "Bachelor of Technology", "Bachelor of Engineering", "Bachelor of Science",
  "Bachelor of Arts", "Bachelor of Commerce", "Master of Technology",
  "Master of Engineering", "Master of Science", "Master of Arts",
  "Master of Business Administration", "Diploma", "Associate Degree",
  "10th", "12th", "SSC", "HSC", "Higher Secondary",
];

const DEGREE_REGEX = new RegExp(
  `(${DEGREE_KEYWORDS.map((d) => escapeRegex(d)).join("|")})`,
  "i"
);

const INSTITUTION_REGEX =
/([A-Z][A-Za-z.&'()\- ]*(University|College|Institute|School|Polytechnic|Academy|Campus|CEG|MIT|IIT|NIT|VIT|SRM|PSG|Anna University)[A-Za-z.&'()\- ]*)/i;

const CGPA_REGEX =
/(CGPA|GPA)?\s*[:\-]?\s*([\d.]+)\s*(\/\s*(4|5|10))?/i;
const PERCENTAGE_REGEX =
  /(\d{1,3}(?:\.\d+)?)\s*%/i;
const YEAR_REGEX =
/((19|20)\d{2})\s*(-|–|to)?\s*((19|20)\d{2}|present|current)?/i;
export function extractEducation(sectionLines: string[]): EducationEntry[] {
  if (sectionLines.length === 0) return [];

  const blocks = groupIntoEntryBlocks(sectionLines);

  return blocks
    .map((block) => parseEducationBlock(block))
    .filter((entry) => entry.degree || entry.college);
}

/**
 * Groups raw lines into per-entry blocks. A new block starts whenever a
 * line contains a recognizable degree keyword, since each education entry
 * typically leads with (or clearly states) the degree.
 */
function groupIntoEntryBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    const startsNewEntry = DEGREE_REGEX.test(line) && current.length > 0;
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

function parseEducationBlock(block: string[]): EducationEntry {
  const raw = block.join(" ");

  const degreeMatch = raw.match(DEGREE_REGEX);
  const collegeMatch = raw.match(INSTITUTION_REGEX);
  const cgpaMatch = raw.match(CGPA_REGEX);
  const percentageMatch = raw.match(PERCENTAGE_REGEX);
  const yearMatch = raw.match(YEAR_REGEX);

  return {
    degree: degreeMatch ? degreeMatch[0].trim() : "",
    college: collegeMatch ? collegeMatch[0].trim() : "",
cgpa: cgpaMatch ? cgpaMatch[2].trim() : "",    percentage: percentageMatch ? `${percentageMatch[1]}%` : "",
    year: yearMatch ? yearMatch[0].trim() : "",
    raw,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}