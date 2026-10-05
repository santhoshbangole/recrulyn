import { calculateRecruitmentScore } from "../../recrulyn/services/recruitmentScoring.service";

import type {
  CandidateEvidence,
  JobRequirement,
  RequirementMatch,
} from "../../recrulyn/services/recruitmentScoring.service";

import { groqChatCompletion } from "../../../lib/groq-client";

export type ResumeMatchResult = {
  overallMatch: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  interviewQuestions: string[];
  usedFallback?: boolean;
  fallbackReason?: string;
};

function extractBalancedJson(text: string): string | null {
  const start = text.indexOf("{");

  if (start === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\" && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

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

function normalizeNumber(value: unknown): number {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(number))
  );
}

function buildCandidateEvidence(
  raw: any,
  resumeText: string
): CandidateEvidence {
  const candidate = raw?.candidate || raw || {};

  return {
    skills: toStringList(candidate.skills),

    experience: Array.isArray(candidate.experience)
      ? candidate.experience.map((item: any) => ({
          company: String(item?.company || ""),
          designation: String(item?.designation || ""),
          duration: String(item?.duration || ""),
          description: toStringList(
            item?.description
          ),
        }))
      : [],

    education: Array.isArray(candidate.education)
      ? candidate.education.map((item: any) => ({
          degree: String(item?.degree || ""),
          college: String(item?.college || ""),
          field: String(item?.field || ""),
          cgpa: String(item?.cgpa || ""),
          percentage: String(
            item?.percentage || ""
          ),
          year: String(item?.year || ""),
        }))
      : [],

    projects: Array.isArray(candidate.projects)
      ? candidate.projects.map((item: any) => ({
          title: String(item?.title || ""),
          technologies: toStringList(
            item?.technologies
          ),
          description: toStringList(
            item?.description
          ),
        }))
      : [],

    certifications: Array.isArray(
      candidate.certifications
    )
      ? candidate.certifications.map(
          (item: any) => ({
            name:
              typeof item === "string"
                ? item
                : String(item?.name || ""),

            issuer:
              typeof item === "string"
                ? ""
                : String(item?.issuer || ""),

            year:
              typeof item === "string"
                ? ""
                : String(item?.year || ""),
          })
        )
      : [],

    resumeText,
  };
}

function buildJobRequirement(
  raw: any
): JobRequirement {
  const job = raw?.job || raw || {};

  return {
    role: String(
      job.role || ""
    ).trim(),

    mandatorySkills: toStringList(
      job.mandatorySkills
    ),

    preferredSkills: toStringList(
      job.preferredSkills
    ),

    minimumExperienceYears: Number(
      job.minimumExperienceYears || 0
    ),

    educationRequirements: toStringList(
      job.educationRequirements
    ),

    responsibilities: toStringList(
      job.responsibilities
    ),

    certifications: toStringList(
      job.certifications
    ),

    domain: String(
      job.domain || ""
    ).trim(),
  };
}

function createInterviewQuestions(
  missingSkills: string[],
  matchedSkills: string[]
): string[] {
  const questions: string[] = [];

  matchedSkills
    .slice(0, 5)
    .forEach((skill) => {
      questions.push(
        `Explain your practical experience with ${skill}.`
      );
    });

  missingSkills
    .slice(0, 5)
    .forEach((skill) => {
      questions.push(
        `Do you have practical experience with ${skill} that is not clearly stated in the resume?`
      );
    });

  return [...new Set(questions)];
}

function localScore(
  candidate: CandidateEvidence,
  job: JobRequirement
): ResumeMatchResult {
  const result = calculateRecruitmentScore(
    candidate,
    job
  );

  const matchedSkills: string[] =
    result.matchedRequirements.map(
      (item: RequirementMatch) =>
        item.requirement
    );

  const missingSkills: string[] =
    result.missingRequirements.map(
      (item: RequirementMatch) =>
        item.requirement
    );

  return {
    overallMatch: normalizeNumber(
      result.overallMatch
    ),

    skillMatch: normalizeNumber(
      result.skillScore
    ),

    experienceMatch: normalizeNumber(
      result.experienceScore
    ),

    educationMatch: normalizeNumber(
      result.educationScore
    ),

    matchedSkills,

    missingSkills,

    strengths: result.strengths,

    weaknesses: result.weaknesses,

    recommendation:
      result.recommendation,

    interviewQuestions:
      createInterviewQuestions(
        missingSkills,
        matchedSkills
      ),
  };
}

function createFallback(
  resume: string,
  reason: string
): ResumeMatchResult {
  const fallback = localScore(
    {
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      resumeText: resume,
    },

    {
      role: "",
      mandatorySkills: [],
      preferredSkills: [],
      minimumExperienceYears: 0,
      educationRequirements: [],
      responsibilities: [],
      certifications: [],
      domain: "",
    }
  );

  return {
    ...fallback,
    usedFallback: true,
    fallbackReason: reason,
  };
}

function isRateLimitError(
  error: unknown
): boolean {
  const message = String(
    (error as any)?.message ||
      error ||
      ""
  ).toLowerCase();

  return (
    (error as any)?.status === 429 ||
    message.includes("rate limit") ||
    message.includes(
      "rate_limit_exceeded"
    ) ||
    message.includes("tokens per day") ||
    message.includes(
      "tokens per minute"
    ) ||
    message.includes("tpm") ||
    message.includes("tpd")
  );
}

export const resumeMatchingAIService = {
  async matchResume(
    jobDescription: string,
    resumeText: string
  ): Promise<ResumeMatchResult> {
    const jd = String(
      jobDescription || ""
    ).trim();

    const resume = String(
      resumeText || ""
    ).trim();

    if (!jd) {
      throw new Error(
        "Job description is empty."
      );
    }

    if (!resume) {
      throw new Error(
        "Resume text is empty."
      );
    }

    /*
     * Compact prompt to reduce Groq
     * token consumption.
     */
    const prompt = `
Extract facts from the resume and job description below.

Return ONE valid JSON object only.
No Markdown.
No explanation.
Do not calculate scores.
Do not invent facts.

Schema:

{
  "candidate": {
    "skills": [],
    "experience": [
      {
        "designation": "",
        "duration": ""
      }
    ],
    "education": [
      {
        "degree": "",
        "field": ""
      }
    ],
    "projects": [
      {
        "technologies": []
      }
    ],
    "certifications": []
  },

  "job": {
    "role": "",
    "mandatorySkills": [],
    "preferredSkills": [],
    "minimumExperienceYears": 0,
    "educationRequirements": [],
    "responsibilities": [],
    "certifications": [],
    "domain": ""
  }
}

Rules:

- Include only relevant facts.
- Mandatory skills must be explicitly required.
- Optional skills belong in preferredSkills.
- Experience years must be explicitly stated; otherwise use 0.
- Use short phrases.
- Do not write lengthy descriptions.
- Keep every list to a maximum of 15 items.
- Return every required JSON key.
- Use empty arrays or empty strings when unavailable.

RESUME:
${resume.slice(0, 6000)}

JOB DESCRIPTION:
${jd.slice(0, 4500)}
`;

    let lastError: unknown;

    /*
     * Only one Groq request.
     *
     * Retrying a 429 can consume more quota,
     * especially when the daily limit is reached.
     */
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

          /*
           * Reduced output size to save
           * Groq tokens.
           */
          max_tokens: 1400,
        });

      const text =
        completion.choices[0]?.message
          ?.content || "";

      const cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const json =
        extractBalancedJson(cleaned);

      if (!json) {
        throw new Error(
          "Groq returned incomplete JSON. The response may have been truncated."
        );
      }

      const parsed = JSON.parse(json);

      const candidate =
        buildCandidateEvidence(
          parsed,
          resume
        );

      const job =
        buildJobRequirement(parsed);

      /*
       * Prevent empty AI extraction from
       * appearing as a valid match.
       */
      if (
  (candidate.skills?.length ?? 0) === 0 &&
  (candidate.experience?.length ?? 0) === 0 &&
  (candidate.education?.length ?? 0) === 0 &&
  (candidate.projects?.length ?? 0) === 0 &&
  (job.mandatorySkills?.length ?? 0) === 0 &&
  (job.preferredSkills?.length ?? 0) === 0 &&
  (job.responsibilities?.length ?? 0) === 0
) {
  throw new Error(
    "AI could not extract enough resume and job details to calculate a reliable match."
  );
}

      return localScore(
        candidate,
        job
      );
    } catch (error) {
      lastError = error;

      console.warn(
        "AI extraction failed:",
        error
      );

      if (isRateLimitError(error)) {
        console.warn(
          "Groq rate limit/quota reached. Using local recruitment scoring."
        );
      }
    }

    const reason = String(
      (lastError as any)?.message ||
        lastError ||
        "AI extraction failed."
    );

    console.error(
      "Resume matching extraction failed:",
      reason
    );

    /*
     * Use local scoring when Groq is unavailable.
     */
    return createFallback(
      resume,
      reason
    );
  },
};