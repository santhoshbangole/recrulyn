/* ====================================================================
   candidateExtractor.service.js
   RECRULYN — Resume Parser
   ----------------------------------------------------------------
   Architecture:
     1. normalizeText()   -> clean raw pdf-parse text
     2. parseSections()   -> split resume into labeled sections (single pass)
     3. field extractors  -> each works ONLY on its relevant section(s)
     4. extractCandidateDetails() -> public API (UNCHANGED SHAPE)
   ==================================================================== */

/* --------------------------------------------------
   1. SECTION HEADING DEFINITIONS
-------------------------------------------------- */

// Canonical section key -> list of heading variants that map to it.
// Order matters for matching priority (longer/more specific first).
const SECTION_HEADINGS = {
  summary: [
    "professional summary",
    "career summary",
    "summary",
    "profile",
    "objective",
    "career objective",
  ],
  education: ["education", "academic background", "academics", "qualification"],
  experience: [
    "professional experience",
    "work experience",
    "employment history",
    "employment",
    "internship experience",
    "internship",
    "experience",
  ],
  projects: ["academic projects", "personal projects", "projects"],
  skills: [
    "technical skills",
    "core skills",
    "key skills",
    "skills & abilities",
    "skills",
  ],
  certifications: ["certifications", "certificates", "certification"],
  achievements: ["achievements", "accomplishments", "honors", "awards"],
  interests: ["areas of interest", "interests", "hobbies"],
  languages: ["languages known", "languages"],
  responsibilities: ["responsibilities", "roles and responsibilities"],
};

// Flat list of every heading phrase, sorted longest-first so that
// "professional experience" matches before "experience".
const ALL_HEADINGS = Object.entries(SECTION_HEADINGS)
  .flatMap(([key, variants]) => variants.map((v) => ({ key, phrase: v })))
  .sort((a, b) => b.phrase.length - a.phrase.length);

/* --------------------------------------------------
   2. CENTRALIZED SKILL DICTIONARY
-------------------------------------------------- */

// canonical skill -> array of alias strings (lowercase, no punctuation needed, handled in matching)
const SKILL_DICTIONARY = {
  // Programming
  Java: ["java"],
  Python: ["python"],
  C: ["c programming", "c language"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp"],
  Go: ["golang", "go"],
  Rust: ["rust"],

  // Frontend
  HTML: ["html", "html5"],
  CSS: ["css", "css3"],
  JavaScript: ["javascript", "js"],
  TypeScript: ["typescript", "ts"],
  React: ["react", "reactjs", "react.js"],
  Angular: ["angular", "angularjs"],
  Vue: ["vue", "vuejs", "vue.js"],
  "Next.js": ["next.js", "nextjs", "next js"],

  // Backend
  "Node.js": ["node.js", "nodejs", "node"],
  Express: ["express", "expressjs", "express.js"],
  "Spring Boot": ["spring boot", "springboot", "spring"],
  FastAPI: ["fastapi", "fast api"],
  Flask: ["flask"],
  ".NET": [".net", "dotnet", "asp.net"],

  // Databases
  MySQL: ["mysql"],
  PostgreSQL: ["postgresql", "postgres"],
  "SQL Server": ["sql server", "mssql"],
  Oracle: ["oracle"],
  MongoDB: ["mongodb", "mongo"],
  SQLite: ["sqlite"],
  Firebase: ["firebase"],

  // Cloud
  AWS: ["aws", "amazon web services"],
  Azure: ["azure", "microsoft azure"],
  GCP: ["gcp", "google cloud", "google cloud platform"],

  // DevOps
  Git: ["git"],
  GitHub: ["github"],
  Docker: ["docker"],
  Kubernetes: ["kubernetes", "k8s"],
  Jenkins: ["jenkins"],

  // AI / ML / Data Science
  TensorFlow: ["tensorflow"],
  PyTorch: ["pytorch"],
  OpenCV: ["opencv"],
  "Scikit Learn": ["scikit learn", "scikit-learn", "sklearn"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  "Machine Learning": ["machine learning", "ml"],
  "Deep Learning": ["deep learning", "dl"],
  LLM: ["llm", "large language model", "large language models"],
  LangChain: ["langchain"],

  // Data / BI
  "Power BI": ["power bi", "powerbi"],
  Tableau: ["tableau"],
  Excel: ["excel", "ms excel", "advanced excel"],

  // HR
  Recruitment: ["recruitment", "recruiting"],
  "Talent Acquisition": ["talent acquisition"],
  HRMS: ["hrms", "hris"],
  Onboarding: ["onboarding"],

  // Marketing
  SEO: ["seo"],
  SEM: ["sem"],
  "Digital Marketing": ["digital marketing"],

  // Soft Skills
  Leadership: ["leadership"],
  Communication: ["communication", "communication skills"],
  "Problem Solving": ["problem solving", "problem-solving"],
  Teamwork: ["teamwork", "team work", "team player"],
};

// Build a single lookup map: alias (lowercase) -> canonical skill name.
// Longer aliases are checked first to avoid partial-match collisions
// (e.g. "react" should not swallow "react native" if added later).
const SKILL_ALIAS_MAP = new Map();
for (const [canonical, aliases] of Object.entries(SKILL_DICTIONARY)) {
  for (const alias of aliases) {
    SKILL_ALIAS_MAP.set(alias.toLowerCase(), canonical);
  }
}
const SKILL_ALIASES_SORTED = [...SKILL_ALIAS_MAP.keys()].sort(
  (a, b) => b.length - a.length
);

/* --------------------------------------------------
   3. DEGREE DICTIONARY
-------------------------------------------------- */

const DEGREE_PATTERNS = [
  "B\\.?\\s?Tech",
  "Bachelor of Technology",
  "B\\.?\\s?E\\b",
  "Bachelor of Engineering",
  "M\\.?\\s?Tech",
  "Master of Technology",
  "M\\.?\\s?E\\b",
  "Master of Engineering",
  "MBA",
  "BCA",
  "MCA",
  "B\\.?\\s?Sc",
  "Bachelor of Science",
  "M\\.?\\s?Sc",
  "Master of Science",
  "B\\.?\\s?Com",
  "M\\.?\\s?Com",
  "Diploma",
  "Polytechnic",
  "Ph\\.?D",
];

const DEGREE_REGEX = new RegExp(`(${DEGREE_PATTERNS.join("|")})[^\\n]*`, "i");

/* --------------------------------------------------
   4. NORMALIZE TEXT
-------------------------------------------------- */

function normalizeText(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // Normalize unicode (accented chars, smart quotes, etc.)
  text = text.normalize("NFKC");

  // Normalize bullets to a consistent marker + newline so each bullet
  // becomes its own line (preserves paragraph/list structure).
  text = text.replace(/[•◦▪‣∙·●○]/g, "\n• ");

  // Normalize line breaks (Windows/Mac -> Unix).
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Tabs -> single space.
  text = text.replace(/\t/g, " ");

  // Collapse runs of spaces/horizontal whitespace (but keep newlines).
  text = text.replace(/[ \u00A0]{2,}/g, " ");

  // Fix words broken across a line by a hyphen + line break, e.g.
  // "Soft-\nware Engineer" -> "Software Engineer"
  text = text.replace(/([A-Za-z])-\n([a-z])/g, "$1$2");

  // Collapse 3+ blank lines into a single blank line (preserve paragraphs).
  text = text.replace(/\n{3,}/g, "\n\n");

  // Trim trailing spaces on each line.
  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").trim())
    .join("\n");

  return text.trim();
}

/* --------------------------------------------------
   5. PARSE SECTIONS (single pass)
-------------------------------------------------- */

function isLikelyHeadingLine(line) {
  // A heading line is short, has no sentence punctuation, and is not a bullet.
  if (!line) return false;
  if (line.startsWith("•")) return false;
  if (line.length > 60) return false;
  if (/[.;,]$/.test(line)) return false;
  return true;
}

function matchHeading(line) {
  const lower = line.toLowerCase().replace(/[:\-–]+$/g, "").trim();

  for (const { key, phrase } of ALL_HEADINGS) {
    if (lower === phrase || lower.startsWith(phrase + " ") || lower === phrase + "s") {
      return key;
    }
    // exact-ish match for short heading lines (allow trailing colon already stripped)
    if (lower === phrase) return key;
  }

  // Fallback: heading line that *contains* a known phrase and is short enough
  if (isLikelyHeadingLine(line)) {
    for (const { key, phrase } of ALL_HEADINGS) {
      if (lower.includes(phrase)) return key;
    }
  }

  return null;
}

function parseSections(text) {
  const sections = {
    summary: "",
    education: "",
    experience: "",
    projects: "",
    skills: "",
    certifications: "",
    achievements: "",
    interests: "",
    languages: "",
    responsibilities: "",
  };

  const lines = text.split("\n");
  let currentKey = null;
  const buffers = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const headingKey = isLikelyHeadingLine(line) ? matchHeading(line) : null;

    if (headingKey) {
      currentKey = headingKey;
      if (!buffers[currentKey]) buffers[currentKey] = [];
      continue;
    }

    if (currentKey) {
      buffers[currentKey].push(line);
    }
  }

  for (const key of Object.keys(sections)) {
    if (buffers[key]) {
      sections[key] = buffers[key].join("\n").trim();
    }
  }

  return sections;
}

/* --------------------------------------------------
   6. CONTACT / IDENTITY EXTRACTORS (full text)
-------------------------------------------------- */

const NAME_BLOCKLIST = new Set([
  "resume",
  "curriculum",
  "vitae",
  "email",
  "phone",
  "mobile",
  "contact",
  "linkedin",
  "github",
  "address",
  "profile",
  "summary",
  "objective",
  "education",
  "skills",
  "projects",
  "experience",
  "declaration",
  "references",
  "qualification",
  "portfolio",
  "certifications",
]);

function extractName(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 15);

  for (const line of lines) {
    if (line.includes("@") || /https?:\/\/|www\.|\.com/i.test(line)) continue;

    const cleaned = line
      .replace(/[0-9]/g, "")
      .replace(/[^A-Za-z\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    if (cleaned.length < 3 || cleaned.length > 40) continue;

    const lower = cleaned.toLowerCase();
    if ([...NAME_BLOCKLIST].some((word) => lower.includes(word))) continue;

    const words = cleaned.split(" ").filter(Boolean);
    if (words.length < 2 || words.length > 5) continue;
    if (!words.every((w) => /^[A-Za-z]+$/.test(w))) continue;

    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  return "";
}

function extractEmail(text) {
  const match = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  return match?.[0] || "";
}

function extractPhone(text) {
  const match = text.match(/(?:\+91[\s-]?)?[6-9]\d{9}\b/);
  return match?.[0] || "";
}

function extractLinkedIn(text) {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,)]+/i);
  return match ? match[0] : "";
}

function extractGithub(text) {
  const match = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s,)]+/i);
  return match ? match[0] : "";
}

function extractPortfolio(text) {
  const match = text.match(
    /(?:https?:\/\/)?[a-z0-9.-]+\.(?:netlify\.app|vercel\.app|github\.io)[^\s,)]*/i
  );
  return match ? match[0] : "";
}

function extractLocation(text) {
  const patterns = [
    /Location[:\s]+([A-Za-z\s,]+)/i,
    /Address[:\s]+([A-Za-z\s,0-9]+)/i,
    /([A-Za-z][A-Za-z\s]+),\s*India\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return (match[1] || match[0]).trim();
  }

  return "";
}

/* --------------------------------------------------
   7. EDUCATION-SPECIFIC EXTRACTORS (operate on education section,
      falling back to full text if section is empty)
-------------------------------------------------- */

function extractDegree(sectionText, fullText) {
  const source = sectionText || fullText;
  const match = source.match(DEGREE_REGEX);
  return match ? match[0].trim() : "";
}

function extractCollege(sectionText, fullText) {
  const source = sectionText || fullText;
  const regex =
    /([A-Z][A-Za-z&.,'\-\s]{5,100}(University|College|Institute|Institution|Technology|Polytechnic))/;
  const match = source.match(regex);
  return match ? match[1].trim() : "";
}

function extractCGPA(sectionText, fullText) {
  const source = sectionText || fullText;
  const match = source.match(
    /(CGPA|GPA|Percentage)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(%|\/\s*10)?/i
  );
  if (!match) return "";
  const value = match[2];
  const suffix = match[3] ? match[3].replace(/\s+/g, "") : "";
  return suffix ? `${value}${suffix}` : value;
}

/* --------------------------------------------------
   8. SKILLS EXTRACTOR (single-pass over skills section + full text fallback)
-------------------------------------------------- */

function extractSkills(sectionText, fullText) {
  // Prefer the dedicated skills section; fall back to scanning the
  // whole resume if no skills section was detected (keeps recall high
  // for resumes with non-standard formatting).
  const source = (sectionText && sectionText.length > 0 ? sectionText : fullText).toLowerCase();

  const found = new Set();

  for (const alias of SKILL_ALIASES_SORTED) {
    // Use word boundaries; escape regex special characters in alias.
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i");
    if (regex.test(source)) {
      found.add(SKILL_ALIAS_MAP.get(alias));
    }
  }

  return [...found];
}

/* --------------------------------------------------
   9. PUBLIC SECTION-BASED EXTRACTORS
      (these simply surface the already-parsed section text,
      preserving original formatting/line breaks)
-------------------------------------------------- */

function extractEducationBlock(sections, fullText) {
  return sections.education || fallbackBlock(fullText, ["education", "academics"]);
}

function extractExperienceBlock(sections, fullText) {
  return (
    sections.experience ||
    fallbackBlock(fullText, ["experience", "employment", "internship"])
  );
}

function extractProjectsBlock(sections, fullText) {
  return sections.projects || fallbackBlock(fullText, ["projects"]);
}

function extractCertificationsBlock(sections, fullText) {
  return (
    sections.certifications || fallbackBlock(fullText, ["certifications", "certificates"])
  );
}

// Lightweight fallback for resumes where parseSections() couldn't
// confidently detect a heading (rare, but keeps the parser resilient).
function fallbackBlock(text, headingWords) {
  const lower = text.toLowerCase();
  let start = -1;

  for (const word of headingWords) {
    const idx = lower.indexOf(word);
    if (idx !== -1 && (start === -1 || idx < start)) start = idx;
  }

  if (start === -1) return "";

  const restHeadings = Object.values(SECTION_HEADINGS)
    .flat()
    .filter((h) => !headingWords.some((w) => h.includes(w)));

  let end = text.length;
  for (const heading of restHeadings) {
    const idx = lower.indexOf(heading, start + 1);
    if (idx !== -1 && idx < end) end = idx;
  }

  return text.substring(start, end).trim();
}

/* --------------------------------------------------
   10. PUBLIC API — DO NOT CHANGE SHAPE
-------------------------------------------------- */

export function extractCandidateDetails(text) {
  const normalized = normalizeText(text);
  const sections = parseSections(normalized);

  const name = extractName(normalized);
  const email = extractEmail(normalized);
  const phone = extractPhone(normalized);

  const skills = extractSkills(sections.skills, normalized);

  const education = extractEducationBlock(sections, normalized);
  const experience = extractExperienceBlock(sections, normalized);
  const projects = extractProjectsBlock(sections, normalized);
  const certifications = extractCertificationsBlock(sections, normalized);

  const linkedin = extractLinkedIn(normalized);
  const github = extractGithub(normalized);
  const portfolio = extractPortfolio(normalized);

  const college = extractCollege(sections.education, normalized);
  const degree = extractDegree(sections.education, normalized);
  const cgpa = extractCGPA(sections.education, normalized);
  const location = extractLocation(normalized);

  return {
    name,
    email,
    phone,

    skills,

    education,
    experience,
    projects,
    certifications,

    linkedin,
    github,
    portfolio,

    college,
    degree,
    cgpa,
    location,
  };
}