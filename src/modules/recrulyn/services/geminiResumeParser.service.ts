import { groqChatCompletion } from "../../../lib/groq-client";
import { resumeParserService } from "./resumeParser/resumeParser.service";

type RecommendedRole = {
  role: string;
  matchScore: number;
};

type ResumeMatchAnalysis = {
  resumeScore: number;
  confidence: number;
  careerLevel: string;
  domain: string;
  recommendedRoles: RecommendedRole[];
  currentCompany: string;
  currentDesignation: string;
  totalExperience: string;
  noticeability: string;
  hireRecommendation: string;
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
  careerSummary: string;
  interviewQuestions: string[];
  riskFactors: string[];
  technicalRating: number;
  communicationRating: number;
  leadershipRating: number;
  problemSolvingRating: number;
  learningPotential: number;
  cultureFit: number;
  atsKeywordsMatched: string[];
  atsKeywordsMissing: string[];
  improvementSuggestions: string[];
  recruiterNotes: string;
  jdMatchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  candidateRankingReason: string;
  salaryRange: string;
  noticePeriodRisk: string;
  interviewDifficulty: string;
  atsCompatibility: number;
  resumeReadability: number;
  grammarScore: number;
  formattingScore: number;
  keywordDensity: number;
};

function toStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,;\n|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function clampScore(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}

function normalizeRoles(value: unknown): RecommendedRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: any) => {
      if (typeof item === "string") {
        return {
          role: item.trim(),
          matchScore: 0,
        };
      }

      return {
        role: String(
          item?.role ||
          item?.title ||
          ""
        ).trim(),

        matchScore: clampScore(
          item?.matchScore ??
          item?.match_score ??
          0
        ),
      };
    })
    .filter((item) => item.role);
}

function normalizeConfidence(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  // Defensive: despite the prompt now specifying 0-100, models sometimes
  // still fall back to the more common "confidence" convention of a 0-1
  // fraction (e.g. 0.85). If we see a small positive fraction, treat it
  // as that convention rather than a literal "1% confident" result.
  const scaled =
    number > 0 && number <= 1 ? number * 100 : number;

  return clampScore(scaled);
}

function normalizeAnalysis(raw: any): ResumeMatchAnalysis {
  const analysis = raw?.analysis || {};

  return {
    resumeScore: clampScore(
      analysis.resumeScore
    ),

    confidence: normalizeConfidence(
      analysis.confidence
    ),

    careerLevel:
      String(
        analysis.careerLevel || ""
      ).trim(),

    domain:
      String(
        analysis.domain || ""
      ).trim(),

    recommendedRoles:
      normalizeRoles(
        analysis.recommendedRoles
      ),

    currentCompany:
      String(
        analysis.currentCompany || ""
      ).trim(),

    currentDesignation:
      String(
        analysis.currentDesignation || ""
      ).trim(),

    totalExperience:
      String(
        analysis.totalExperience || ""
      ).trim(),

    noticeability:
      String(
        analysis.noticeability || ""
      ).trim(),

    hireRecommendation:
      String(
        analysis.hireRecommendation || ""
      ).trim(),

    strengths:
      toStringList(
        analysis.strengths
      ),

    weaknesses:
      toStringList(
        analysis.weaknesses
      ),

    missingInformation:
      toStringList(
        analysis.missingInformation
      ),

    careerSummary:
      String(
        analysis.careerSummary || ""
      ).trim(),

    interviewQuestions:
      toStringList(
        analysis.interviewQuestions
      ),

    riskFactors:
      toStringList(
        analysis.riskFactors
      ),

    technicalRating:
      clampScore(
        analysis.technicalRating
      ),

    communicationRating:
      clampScore(
        analysis.communicationRating
      ),

    leadershipRating:
      clampScore(
        analysis.leadershipRating
      ),

    problemSolvingRating:
      clampScore(
        analysis.problemSolvingRating
      ),

    learningPotential:
      clampScore(
        analysis.learningPotential
      ),

    cultureFit:
      clampScore(
        analysis.cultureFit
      ),

    atsKeywordsMatched:
      toStringList(
        analysis.atsKeywordsMatched
      ),

    atsKeywordsMissing:
      toStringList(
        analysis.atsKeywordsMissing
      ),

    improvementSuggestions:
      toStringList(
        analysis.improvementSuggestions
      ),

    recruiterNotes:
      String(
        analysis.recruiterNotes || ""
      ).trim(),

    jdMatchScore:
      clampScore(
        analysis.jdMatchScore
      ),

    matchedSkills:
      toStringList(
        analysis.matchedSkills
      ),

    missingSkills:
      toStringList(
        analysis.missingSkills
      ),

    candidateRankingReason:
      String(
        analysis.candidateRankingReason || ""
      ).trim(),

    salaryRange:
      String(
        analysis.salaryRange || ""
      ).trim(),

    noticePeriodRisk:
      String(
        analysis.noticePeriodRisk || ""
      ).trim(),

    interviewDifficulty:
      String(
        analysis.interviewDifficulty || ""
      ).trim(),

    atsCompatibility:
      clampScore(
        analysis.atsCompatibility
      ),

    resumeReadability:
      clampScore(
        analysis.resumeReadability
      ),

    grammarScore:
      clampScore(
        analysis.grammarScore
      ),

    formattingScore:
      clampScore(
        analysis.formattingScore
      ),

    keywordDensity:
      clampScore(
        analysis.keywordDensity
      ),
  };
}

function isUsableAIResult(result: any): boolean {
  const analysis = result?.analysis;

  if (!analysis) {
    return false;
  }

  const resumeScore = Number(
    analysis.resumeScore
  );

  const confidence = Number(
    analysis.confidence
  );

  const hasCandidateName =
    Boolean(
      result?.candidate?.candidateName
    );

  const hasSkills =
    Array.isArray(
      result?.candidate?.skills
    ) &&
    result.candidate.skills.length > 0;

  const hasEducation =
    Array.isArray(
      result?.candidate?.education
    ) &&
    result.candidate.education.length > 0;

  const hasExperience =
    Array.isArray(
      result?.candidate?.experience
    ) &&
    result.candidate.experience.length > 0;

  const hasProjects =
    Array.isArray(
      result?.candidate?.projects
    ) &&
    result.candidate.projects.length > 0;

  /*
   * Reject the empty template returned by Groq.
   */
  if (
    resumeScore === 0 &&
    confidence === 0 &&
    !hasCandidateName &&
    !hasSkills &&
    !hasEducation &&
    !hasExperience &&
    !hasProjects
  ) {
    return false;
  }

  /*
   * Resume must contain at least some
   * meaningful information.
   */
  if (
    !hasCandidateName &&
    !hasSkills &&
    !hasEducation &&
    !hasExperience &&
    !hasProjects
  ) {
    return false;
  }

  return true;
}

function calculateResumeConfidence(
  local: any
): number {
  let score = 0;

  const candidateName =
    String(
      local?.candidateName || ""
    ).trim();

  const email =
    String(
      local?.email || ""
    ).trim();

  const phone =
    String(
      local?.phone || ""
    ).trim();

  const skills =
    Array.isArray(local?.skills)
      ? local.skills.length
      : 0;

  const education =
    Array.isArray(local?.education)
      ? local.education.length
      : 0;

  const experience =
    Array.isArray(local?.experience)
      ? local.experience.length
      : 0;

  const projects =
    Array.isArray(local?.projects)
      ? local.projects.length
      : 0;

  const certifications =
    Array.isArray(
      local?.certifications
    )
      ? local.certifications.length
      : 0;

  const resumeLength =
    String(
      local?.resumeText || ""
    ).length;

  if (candidateName) {
    score += 20;
  }

  if (email) {
    score += 15;
  }

  if (phone) {
    score += 10;
  }

  if (skills > 0) {
    score += 15;
  }

  if (education > 0) {
    score += 10;
  }

  if (experience > 0) {
    score += 10;
  }

  if (projects > 0) {
    score += 10;
  }

  if (certifications > 0) {
    score += 5;
  }

  if (resumeLength > 1000) {
    score += 5;
  }

  return Math.max(
    0,
    Math.min(100, score)
  );
}
function calculateExplicitTotalExperience(
  resumeText: string
): string {
  const text = String(resumeText || "");

  // Matches ranges such as:
  // May 2026 - July 2026
  // May 2026 – July 2026
  // May 2026 to July 2026
  const monthNames =
    "(January|February|March|April|May|June|July|August|September|October|November|December)";

  const rangeRegex = new RegExp(
    `${monthNames}\\s+(\\d{4})\\s*(?:-|–|—|to)\\s*${monthNames}\\s+(\\d{4})`,
    "gi"
  );

  let totalMonths = 0;
  let match: RegExpExecArray | null;

  while ((match = rangeRegex.exec(text)) !== null) {
    const startMonth = new Date(
      `${match[1]} 1, ${match[2]}`
    ).getMonth();

    const startYear = Number(match[2]);

    const endMonth = new Date(
      `${match[3]} 1, ${match[4]}`
    ).getMonth();

    const endYear = Number(match[4]);

    const months =
      (endYear - startYear) * 12 +
      (endMonth - startMonth) +
      1;

    if (months > 0 && months <= 120) {
      totalMonths += months;
    }
  }

  if (totalMonths === 0) {
    return "";
  }

  const years = Math.floor(
    totalMonths / 12
  );

  const months = totalMonths % 12;

  if (years > 0 && months > 0) {
    return `${years} year${years > 1 ? "s" : ""} ${months} month${months > 1 ? "s" : ""}`;
  }

  if (years > 0) {
    return `${years} year${years > 1 ? "s" : ""}`;
  }

  return `${months} month${months > 1 ? "s" : ""}`;
}

async function fallbackParsedResume(
  resumeText: string,
  jdText: string = ""
) {
  const local =
    await resumeParserService.extractResumeData(
      resumeText
    );

  const skills =
    Array.isArray(local.skills)
      ? local.skills.map((skill: any) =>
          String(skill)
            .toLowerCase()
            .trim()
        )
      : [];

  const jd =
    String(jdText || "")
      .toLowerCase()
      .trim();

  const resume =
    String(resumeText || "")
      .toLowerCase();

  /*
   * Common technical and professional
   * skills that can be detected.
   */
  const knownSkills = [
    "javascript",
    "typescript",
    "react",
    "reactjs",
    "angular",
    "vue",
    "python",
    "java",
    "c++",
    "c",
    "flutter",
    "dart",
    "sql",
    "mysql",
    "postgresql",
    "mongodb",
    "html",
    "html5",
    "css",
    "css3",
    "node.js",
    "nodejs",
    "express",
    "git",
    "github",
    "docker",
    "aws",
    "azure",
    "power bi",
    "excel",
    "tableau",
    "uipath",
    "rpa",
    "data structures",
    "algorithms",
    "oop",
    "rdbms",
    "seo",
    "sem",
    "digital marketing",
    "recruitment",
    "talent acquisition",
    "hr",
    "communication",
    "teamwork",
    "figma",
    "ui/ux",
  ];

  const aliases: Record<
    string,
    string[]
  > = {
    javascript: [
      "javascript",
      "js",
    ],

    typescript: [
      "typescript",
      "ts",
    ],

    react: [
      "react",
      "reactjs",
      "react.js",
    ],

    sql: [
      "sql",
      "mysql",
      "postgresql",
      "postgres",
    ],

    python: [
      "python",
      "python3",
    ],

    "power bi": [
      "power bi",
      "powerbi",
    ],

    excel: [
      "excel",
      "ms excel",
      "microsoft excel",
    ],

    "ui/ux": [
      "ui/ux",
      "ui ux",
      "user interface",
      "user experience",
    ],

    recruitment: [
      "recruitment",
      "talent acquisition",
      "hiring",
    ],
  };

  function canonicalSkill(
    skill: string
  ): string {
    const lower =
      skill
        .toLowerCase()
        .trim();

    for (
      const [
        canonical,
        values,
      ] of Object.entries(aliases)
    ) {
      if (
        values.some(
          (value) =>
            lower.includes(value)
        )
      ) {
        return canonical;
      }
    }

    return lower;
  }

  /*
   * Skills explicitly found in the resume.
   */
  const resumeSkills =
    new Set(
      skills.map(canonicalSkill)
    );

  knownSkills.forEach(
    (skill) => {
      const canonical =
        canonicalSkill(skill);

      if (
        aliases[canonical]?.some(
          (alias) =>
            resume.includes(alias)
        )
      ) {
        resumeSkills.add(
          canonical
        );
      }
    }
  );

  /*
   * Skills required by the JD.
   */
  const jdSkills =
  new Set<string>();

const roleSkills: Record<
  string,
  string[]
> = {
  "frontend developer": [
    "html",
    "css",
    "javascript",
    "react",
    "typescript",
    "git",
  ],
  "backend developer": [
    "python",
    "java",
    "sql",
    "api",
    "git",
  ],
  "full stack developer": [
    "html",
    "css",
    "javascript",
    "react",
    "typescript",
    "sql",
    "git",
  ],
  "ui/ux designer": [
    "ui/ux",
    "figma",
    "user interface",
    "user experience",
  ],
  "data analyst": [
    "python",
    "sql",
    "excel",
    "power bi",
    "tableau",
    "analytics",
  ],
  "hr intern": [
    "recruitment",
    "talent acquisition",
    "communication",
    "onboarding",
    "hr",
  ],
  "marketing intern": [
    "digital marketing",
    "seo",
    "sem",
    "social media marketing",
    "analytics",
  ],
  "finance intern": [
    "excel",
    "sql",
    "analytics",
  ],
  "uav engineer": [
    "python",
    "c",
    "c++",
    "embedded systems",
    "iot",
  ],
};

const detectedRole =
  Object.keys(roleSkills).find(
    (role) =>
      jd.includes(role)
  );

if (detectedRole) {
  roleSkills[detectedRole].forEach(
    (skill) => {
      jdSkills.add(
        canonicalSkill(skill)
      );
    }
  );
}

knownSkills.forEach(
  (skill) => {
    const canonical =
      canonicalSkill(skill);

    const skillAliases =
      aliases[canonical] || [
        canonical,
      ];

    if (
      skillAliases.some(
        (alias) =>
          jd.includes(alias)
      )
    ) {
      jdSkills.add(
        canonical
      );
    }
  }
);

  const matchedSkills =
    [...jdSkills].filter(
      (skill) =>
        resumeSkills.has(skill)
    );

  const missingSkills =
    [...jdSkills].filter(
      (skill) =>
        !resumeSkills.has(skill)
    );

  /*
   * Resume quality scoring.
   *
   * This is deliberately different from
   * JD matching.
   */
  const skillsCount =
    resumeSkills.size;

  const educationCount =
    Array.isArray(
      local.education
    )
      ? local.education.length
      : 0;

  const experienceCount =
    Array.isArray(
      local.experience
    )
      ? local.experience.length
      : 0;

  const projectCount =
    Array.isArray(
      local.projects
    )
      ? local.projects.length
      : 0;

  const certificationCount =
    Array.isArray(
      local.certifications
    )
      ? local.certifications.length
      : 0;

  let resumeScore = 0;

  /*
   * Contact information: 15 points
   */
  if (
    local.candidateName
  ) {
    resumeScore += 5;
  }

  if (
    local.email
  ) {
    resumeScore += 5;
  }

  if (
    local.phone
  ) {
    resumeScore += 5;
  }

  /*
   * Skills: 25 points
   */
  resumeScore += Math.min(
    25,
    skillsCount * 2.5
  );

  /*
   * Education: 15 points
   */
  if (
    educationCount > 0
  ) {
    resumeScore += 15;
  }

  /*
   * Experience: 20 points
   */
  if (
    experienceCount > 0
  ) {
    resumeScore += Math.min(
      20,
      experienceCount * 10
    );
  }

  /*
   * Projects: 15 points
   */
  if (
    projectCount > 0
  ) {
    resumeScore += Math.min(
      15,
      projectCount * 5
    );
  }

  /*
   * Certifications: 5 points
   */
  if (
    certificationCount > 0
  ) {
    resumeScore += 5;
  }

  /*
   * Resume completeness: 5 points
   */
  if (
    resumeText.length >= 500
  ) {
    resumeScore += 5;
  }

  resumeScore =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(
          resumeScore
        )
      )
    );

  /*
   * JD match score is completely separate.
   */
  let jdMatchScore = 0;

  if (
    jd &&
    jdSkills.size > 0
  ) {
    jdMatchScore =
      Math.round(
        (
          matchedSkills.length /
          jdSkills.size
        ) * 100
      );
  }

  /*
   * If the JD has no recognizable
   * technical skills, use evidence
   * from important JD words instead.
   */
  if (
    jd &&
    jdSkills.size === 0
  ) {
    const jdWords =
      new Set(
        jd
          .replace(
            /[^a-z0-9+#. ]/gi,
            " "
          )
          .split(/\s+/)
          .filter(
            (word) =>
              word.length >= 4
          )
      );

    const resumeWords =
      new Set(
        resume
          .replace(
            /[^a-z0-9+#. ]/gi,
            " "
          )
          .split(/\s+/)
          .filter(
            (word) =>
              word.length >= 4
          )
      );

    let matches = 0;

    jdWords.forEach(
      (word) => {
        if (
          resumeWords.has(word)
        ) {
          matches++;
        }
      }
    );

    jdMatchScore =
      jdWords.size > 0
        ? Math.round(
            (
              matches /
              jdWords.size
            ) * 100
          )
        : 0;
  }

  /*
   * Career level.
   */
  let careerLevel =
    "Fresher";

  if (
    experienceCount >= 3
  ) {
    careerLevel =
      "Experienced";
  } else if (
    experienceCount > 0
  ) {
    careerLevel =
      "Intern / Early Career";
  }

  /*
   * Domain detection.
   */
  let domain =
    "General / Technology";

  if (
    resume.includes("react") ||
    resume.includes("javascript") ||
    resume.includes("frontend")
  ) {
    domain =
      "Software Development";
  }

  if (
    resume.includes("python") ||
    resume.includes("data analysis") ||
    resume.includes("power bi") ||
    resume.includes("tableau")
  ) {
    domain =
      "Data / Analytics";
  }

  if (
    resume.includes("uipath") ||
    resume.includes("rpa")
  ) {
    domain =
      "RPA / Automation";
  }

  if (
    resume.includes("digital marketing") ||
    resume.includes("seo") ||
    resume.includes("sem")
  ) {
    domain =
      "Digital Marketing";
  }

  /*
   * Recommended roles.
   */
  const recommendedRoles: RecommendedRole[] =
    [];

  const addRole = (
    role: string,
    matchScore: number
  ) => {
    if (
      !recommendedRoles.some(
        (item) =>
          item.role === role
      )
    ) {
      recommendedRoles.push({
        role,
        matchScore:
          Math.max(
            0,
            Math.min(
              100,
              Math.round(
                matchScore
              )
            )
          ),
      });
    }
  };

  if (
    resume.includes("react") ||
    resume.includes("javascript") ||
    resume.includes("html") ||
    resume.includes("css")
  ) {
    addRole(
      "Frontend Developer",
      85
    );
  }

  if (
    resume.includes("python") ||
    resume.includes("sql")
  ) {
    addRole(
      "Python / Software Developer",
      78
    );
  }

  if (
    resume.includes("uipath") ||
    resume.includes("rpa")
  ) {
    addRole(
      "RPA Developer",
      82
    );
  }

  if (
    resume.includes("power bi") ||
    resume.includes("tableau") ||
    resume.includes("analytics")
  ) {
    addRole(
      "Data Analyst",
      80
    );
  }

  if (
    resume.includes(
      "digital marketing"
    ) ||
    resume.includes("seo")
  ) {
    addRole(
      "Digital Marketing Specialist",
      80
    );
  }

  if (
    recommendedRoles.length === 0
  ) {
    addRole(
      "Software / Technology Role",
      50
    );
  }

  /*
   * Strengths.
   */
  const strengths: string[] =
    [];

  if (
    skillsCount >= 5
  ) {
    strengths.push(
      "Broad technical skill set."
    );
  }

  if (
    experienceCount > 0
  ) {
    strengths.push(
      "Experience is present in the resume."
    );
  }

  if (
    projectCount > 0
  ) {
    strengths.push(
      "Project experience is documented."
    );
  }

  if (
    educationCount > 0
  ) {
    strengths.push(
      "Education details are available."
    );
  }

  matchedSkills
    .slice(0, 5)
    .forEach(
      (skill) =>
        strengths.push(
          `JD match found for ${skill}.`
        )
    );

  /*
   * Weaknesses.
   */
  const weaknesses: string[] =
    [];

  if (
    skillsCount < 3
  ) {
    weaknesses.push(
      "Limited technical skills detected."
    );
  }

  if (
    experienceCount === 0
  ) {
    weaknesses.push(
      "No professional experience detected."
    );
  }

  if (
    projectCount === 0
  ) {
    weaknesses.push(
      "No projects detected."
    );
  }

  missingSkills
    .slice(0, 8)
    .forEach(
      (skill) =>
        weaknesses.push(
          `Missing JD skill: ${skill}.`
        )
    );

  /*
   * Hire recommendation.
   */
  const effectiveScore =
    jd
      ? Math.round(
          (
            resumeScore +
            jdMatchScore
          ) / 2
        )
      : resumeScore;

  let hireRecommendation =
    "Reject";

  if (
    effectiveScore >= 80
  ) {
    hireRecommendation =
      "Strong Hire";
  } else if (
    effectiveScore >= 65
  ) {
    hireRecommendation =
      "Hire";
  } else if (
    effectiveScore >= 50
  ) {
    hireRecommendation =
      "Consider";
  } else if (
    effectiveScore >= 35
  ) {
    hireRecommendation =
      "Borderline";
  }

  /*
   * Interview questions.
   */
  const interviewQuestions =
    matchedSkills
      .slice(0, 5)
      .map(
        (skill) =>
          `Explain your practical experience with ${skill}.`
      );

  missingSkills
    .slice(0, 3)
    .forEach(
      (skill) =>
        interviewQuestions.push(
          `Do you have any practical experience with ${skill}?`
        )
    );

  /*
   * Risk factors.
   */
  const riskFactors: string[] =
    [];

  if (
    experienceCount === 0
  ) {
    riskFactors.push(
      "No professional experience detected."
    );
  }

  if (
    missingSkills.length >= 3
  ) {
    riskFactors.push(
      "Multiple JD-required skills are missing."
    );
  }

  /*
   * Missing information.
   */
  const missingInformation =
    [
      !local.candidateName
        ? "Name"
        : "",
      !local.email
        ? "Email"
        : "",
      !local.phone
        ? "Phone"
        : "",
      educationCount === 0
        ? "Education"
        : "",
      experienceCount === 0
        ? "Experience"
        : "",
      projectCount === 0
        ? "Projects"
        : "",
    ].filter(Boolean);

  /*
   * Confidence is dynamic.
   * NEVER hard-code 72.
   */
  const confidence =
    calculateResumeConfidence(
      {
        ...local,
        resumeText,
      }
    );

  const careerSummary =
    [
      local.candidateName,
      careerLevel,
      domain,
      local.degree,
      skills
        .slice(0, 6)
        .join(", "),
    ]
      .filter(Boolean)
      .join(" · ");

  return {
    candidate: {
      candidateName:
        local.candidateName || "",

      email:
        local.email || "",

      phone:
        local.phone || "",

      location:
        local.location || "",

      linkedin:
        local.linkedin || "",

      github:
        local.github || "",

      portfolio:
        local.portfolio || "",

      college:
        local.education?.[0]
          ?.college || "",

      degree:
        local.degree || "",

      cgpa:
        "",

      skills:
        local.skills || [],

      softSkills:
        [],

      languages:
        [],

      education:
        local.education || [],

      experience:
        local.experience || [],

      projects:
        local.projects || [],

      certifications:
        (
          local.certifications || []
        ).map((item: any) =>
          typeof item === "string"
            ? {
                name: item,
                issuer: "",
                year: "",
              }
            : item
        ),
    },

    analysis: {
      resumeScore,

      confidence,

      careerLevel,

      domain,

      recommendedRoles,

      currentCompany:
        local.experience?.[0]
          ?.company || "",

      currentDesignation:
        local.experience?.[0]
          ?.designation || "",

      totalExperience: 
      calculateExplicitTotalExperience(
        resumeText),
    

      noticeability: "",

      hireRecommendation,

      strengths: [
        ...new Set(strengths),
      ],

      weaknesses: [
        ...new Set(weaknesses),
      ],

      missingInformation,

      careerSummary,

      interviewQuestions: [
        ...new Set(
          interviewQuestions
        ),
      ],

      riskFactors: [
        ...new Set(riskFactors),
      ],

      technicalRating:
        Math.min(
          100,
          Math.round(
            resumeSkills.size * 5
          )
        ),

      communicationRating:
        resume.includes(
          "communication"
        )
          ? 80
          : 50,

      leadershipRating:
        resume.includes(
          "leadership"
        )
          ? 80
          : 40,

      problemSolvingRating:
        resume.includes(
          "problem solving"
        ) ||
        resume.includes(
          "problem-solving"
        )
          ? 80
          : 50,

      learningPotential:
        skillsCount >= 8
          ? 85
          : skillsCount >= 4
            ? 70
            : 50,

      cultureFit:
        resume.includes(
          "teamwork"
        ) ||
        resume.includes(
          "collaboration"
        )
          ? 80
          : 50,

      atsKeywordsMatched:
        matchedSkills,

      atsKeywordsMissing:
        missingSkills,

      improvementSuggestions: [
        !local.linkedin
          ? "Add a complete LinkedIn URL."
          : "",

        !local.portfolio
          ? "Add a portfolio URL if available."
          : "",

        projectCount === 0
          ? "Add relevant projects with technologies and measurable outcomes."
          : "",

        experienceCount === 0
          ? "Clearly highlight internships, training, or practical experience."
          : "",

        skillsCount < 5
          ? "Add relevant technical skills supported by resume evidence."
          : "",
      ].filter(Boolean),

      recruiterNotes:
        jd
          ? `Resume quality score: ${resumeScore}%. JD match score: ${jdMatchScore}%.`
          : `Resume quality score: ${resumeScore}%.`,

      jdMatchScore,

      matchedSkills,

      missingSkills,

      candidateRankingReason:
        jd
          ? `Resume quality is ${resumeScore}% and Job Description match is ${jdMatchScore}%.`
          : `Resume quality is ${resumeScore}%.`,

      salaryRange: "",

      noticePeriodRisk: "",

      interviewDifficulty:
        effectiveScore >= 80
          ? "Moderate"
          : effectiveScore >= 60
            ? "Moderate to High"
            : "High",

      atsCompatibility:
        Math.min(
          100,
          resumeScore
        ),

      resumeReadability:
        Math.min(
          100,
          resumeText.length >= 1000
            ? 85
            : resumeText.length >= 500
              ? 70
              : 50
        ),

      grammarScore: 0,

      formattingScore: 0,

      keywordDensity:
        skillsCount > 0
          ? Math.min(
              100,
              skillsCount * 5
            )
          : 0,
    },
  };
}

export const geminiResumeParserService = {
  async parseResume(
    resumeText: string,
    jdText: string = ""
  ) {
    const cleanResume =
      String(
        resumeText || ""
      ).trim();

    const cleanJD =
      String(
        jdText || ""
      ).trim();

    if (!cleanResume) {
      throw new Error(
        "Resume text is empty."
      );
    }

    const prompt = `
You are RECRULYN Resume Intelligence Engine.

You are an expert ATS Resume Parser and Senior HR Recruiter.

Analyze the supplied resume using ONLY factual evidence contained in the resume.

IMPORTANT:

- Never hallucinate.
- Never guess.
- Never fabricate.
- Never assume.
- Do not invent experience.
- Do not invent skills.
- Do not invent education.
- Do not invent salary.
- Do not invent employment history.
- If information is unavailable, return "" for strings, [] for arrays, and 0 for numeric scores.
- Return ONLY valid JSON.
- Do NOT return markdown.
- Do NOT return explanations outside JSON.

SCORING:

Resume Score is the quality/completeness of the resume itself.

Consider:

- Contact information: 15%
- Skills: 25%
- Education: 15%
- Experience: 20%
- Projects: 15%
- Certifications/completeness: 10%

Do NOT give 100 unless the resume provides exceptionally strong evidence across essentially all categories.

Confidence measures how confidently the information was extracted from the resume.

Confidence must be an integer from 0 to 100 (a percentage), on the exact same scale as resumeScore — NOT a 0-to-1 fraction.

Confidence must NOT be a fixed value.

JD MATCHING:

If a Job Description is supplied:

- Calculate jdMatchScore separately from resumeScore.
- Compare required skills, experience, education and role relevance.
- Missing important requirements must reduce the JD match score.
- Do not give 100 unless almost all important JD requirements are satisfied.

If no Job Description is supplied:

- jdMatchScore must be 0.
- matchedSkills must be [].
- missingSkills must be [].

RECOMMENDED ROLES:

Recommend up to 5 roles based ONLY on:

- skills
- education
- projects
- experience

Each role must have a matchScore from 0 to 100.

CURRENT COMPANY:

Current company must come ONLY from experience.

CURRENT DESIGNATION:

Current designation must come ONLY from experience.

TOTAL EXPERIENCE:

TOTAL EXPERIENCE:

Report total professional experience only from explicit evidence in the resume.

Rules:
- If the resume explicitly states total experience, use that value.
- If the resume gives exact start and end dates for employment or internships, calculate the duration from those dates.
- Do NOT infer experience from graduation year, education dates, project dates, or certification dates.
- Do NOT assume an internship lasted one year just because only a year is shown.
- Do NOT calculate experience from year-only entries such as "2025".
- Do NOT combine overlapping experience periods.
- For an ongoing role marked "Present" or "Ongoing", use the current date only when the start month and year are explicitly available.
- If there is not enough date information to calculate the duration accurately, return "".

Examples:
- "2 years of experience" → "2 years"
- "May 2026 - July 2026" → "3 months"
- "January 2024 - Present" → calculate from January 2024 to the current date
- "Web Development Intern - 2025" → ""
- "Internship - 2025" → ""

RETURN EXACTLY THIS JSON STRUCTURE:

{
  "candidate": {
    "candidateName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "github": "",
    "portfolio": "",
    "college": "",
    "degree": "",
    "cgpa": "",
    "skills": [],
    "softSkills": [],
    "languages": [],
    "education": [],
    "experience": [],
    "projects": [],
    "certifications": []
  },

  "analysis": {
    "resumeScore": 0,
    "confidence": 0,
    "careerLevel": "",
    "domain": "",

    "recommendedRoles": [
      {
        "role": "",
        "matchScore": 0
      }
    ],

    "currentCompany": "",
    "currentDesignation": "",
    "totalExperience": "",
    "noticeability": "",
    "hireRecommendation": "",

    "strengths": [],
    "weaknesses": [],
    "missingInformation": [],

    "careerSummary": "",

    "interviewQuestions": [],
    "riskFactors": [],

    "technicalRating": 0,
    "communicationRating": 0,
    "leadershipRating": 0,
    "problemSolvingRating": 0,
    "learningPotential": 0,
    "cultureFit": 0,

    "atsKeywordsMatched": [],
    "atsKeywordsMissing": [],
    "improvementSuggestions": [],

    "recruiterNotes": "",

    "jdMatchScore": 0,
    "matchedSkills": [],
    "missingSkills": [],

    "candidateRankingReason": "",

    "salaryRange": "",
    "noticePeriodRisk": "",
    "interviewDifficulty": "",

    "atsCompatibility": 0,
    "resumeReadability": 0,
    "grammarScore": 0,
    "formattingScore": 0,
    "keywordDensity": 0
  }
}

EDUCATION OBJECT:

{
  "degree": "",
  "college": "",
  "cgpa": "",
  "percentage": "",
  "year": ""
}

EXPERIENCE OBJECT:

{
  "company": "",
  "designation": "",
  "duration": "",
  "description": []
}

PROJECT OBJECT:

{
  "title": "",
  "technologies": [],
  "description": []
}

CERTIFICATION OBJECT:

{
  "name": "",
  "issuer": "",
  "year": ""
}

JOB DESCRIPTION:

${cleanJD}

RESUME:

${cleanResume}
`;

    let text = "";

    try {
      const completion =
        await groqChatCompletion({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0,
        });

      text =
        completion
          .choices[0]
          ?.message
          ?.content || "";

    } catch (err: any) {
      console.warn(
        "Groq resume parse unavailable, using local parser",
        err
      );

      if (
        err?.status === 429
      ) {
        console.warn(
          "Groq rate limit exceeded"
        );
      }

      return fallbackParsedResume(
        cleanResume,
        cleanJD
      );
    }

    const cleaned =
      text
        .replace(
          /```json/gi,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    console.log(
      "GROQ RAW RESUME ANALYSIS:",
      cleaned
    );

    try {
      const parsed =
        JSON.parse(cleaned);

      /*
       * IMPORTANT:
       * Do not accept the empty template
       * returned by the AI.
       */
      if (
        !isUsableAIResult(parsed)
      ) {
        console.warn(
          "Groq returned an empty/invalid analysis. Using local evidence-based parser."
        );

        return fallbackParsedResume(
          cleanResume,
          cleanJD
        );
      }

      /*
       * Normalize scores and arrays.
       */
      const normalized =
        normalizeAnalysis(parsed);

      /*
       * Preserve candidate data returned
       * by Groq.
       */
      return {
        candidate:
          parsed.candidate || {},

        analysis:
          normalized,
      };

    } catch (error) {
      console.warn(
        "Groq returned invalid JSON. Using local evidence-based parser.",
        error
      );

      return fallbackParsedResume(
        cleanResume,
        cleanJD
      );
    }
  },
};