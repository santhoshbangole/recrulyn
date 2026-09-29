import { calculateRecruitmentScore } from "../../recrulyn/services/recruitmentScoring.service";
import type {
  CandidateEvidence,
  JobRequirement,
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
  // True when the Groq extraction step failed and scoring ran on
  // empty/neutral data instead of real extracted facts. Any caller
  // showing this result to a user should surface that clearly —
  // this is NOT a real match score.
  usedFallback?: boolean;
  fallbackReason?: string;
};

function extractBalancedJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

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

    if (inString) continue;

    if (char === "{") depth++;
    if (char === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  // Never closed — the response was genuinely truncated mid-object.
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
  const candidate =
    raw?.candidate || raw || {};

  return {
    skills: toStringList(
      candidate.skills
    ),

    experience: Array.isArray(
      candidate.experience
    )
      ? candidate.experience.map(
          (item: any) => ({
            company:
              String(
                item?.company || ""
              ),

            designation:
              String(
                item?.designation || ""
              ),

            duration:
              String(
                item?.duration || ""
              ),

            description:
              toStringList(
                item?.description
              ),
          })
        )
      : [],

    education: Array.isArray(
      candidate.education
    )
      ? candidate.education.map(
          (item: any) => ({
            degree:
              String(
                item?.degree || ""
              ),

            college:
              String(
                item?.college || ""
              ),

            field:
              String(
                item?.field || ""
              ),

            cgpa:
              String(
                item?.cgpa || ""
              ),

            percentage:
              String(
                item?.percentage || ""
              ),

            year:
              String(
                item?.year || ""
              ),
          })
        )
      : [],

    projects: Array.isArray(
      candidate.projects
    )
      ? candidate.projects.map(
          (item: any) => ({
            title:
              String(
                item?.title || ""
              ),

            technologies:
              toStringList(
                item?.technologies
              ),

            description:
              toStringList(
                item?.description
              ),
          })
        )
      : [],

    certifications:
      Array.isArray(
        candidate.certifications
      )
        ? candidate.certifications.map(
            (item: any) => ({
              name:
                typeof item === "string"
                  ? item
                  : String(
                      item?.name || ""
                    ),

              issuer:
                typeof item === "string"
                  ? ""
                  : String(
                      item?.issuer || ""
                    ),

              year:
                typeof item === "string"
                  ? ""
                  : String(
                      item?.year || ""
                    ),
            })
          )
        : [],

    resumeText,
  };
}

function buildJobRequirement(
  raw: any
): JobRequirement {
  const job =
    raw?.job || raw || {};

  return {
    role:
      String(
        job.role || ""
      ).trim(),

    mandatorySkills:
      toStringList(
        job.mandatorySkills
      ),

    preferredSkills:
      toStringList(
        job.preferredSkills
      ),

    minimumExperienceYears:
      Number(
        job.minimumExperienceYears || 0
      ),

    educationRequirements:
      toStringList(
        job.educationRequirements
      ),

    responsibilities:
      toStringList(
        job.responsibilities
      ),

    certifications:
      toStringList(
        job.certifications
      ),

    domain:
      String(
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

  return [
    ...new Set(questions),
  ];
}

function localScore(
  candidate: CandidateEvidence,
  job: JobRequirement
): ResumeMatchResult {
  const result =
    calculateRecruitmentScore(
      candidate,
      job
    );

  const matchedSkills =
    result.matchedRequirements
      .map(
        (item) =>
          item.requirement
      );

  const missingSkills =
    result.missingRequirements
      .map(
        (item) =>
          item.requirement
      );

  return {
    overallMatch:
      normalizeNumber(
        result.overallMatch
      ),

    skillMatch:
      normalizeNumber(
        result.skillScore
      ),

    experienceMatch:
      normalizeNumber(
        result.experienceScore
      ),

    educationMatch:
      normalizeNumber(
        result.educationScore
      ),

    matchedSkills,

    missingSkills,

    strengths:
      result.strengths,

    weaknesses:
      result.weaknesses,

    recommendation:
      result.recommendation,

    interviewQuestions:
      createInterviewQuestions(
        missingSkills,
        matchedSkills
      ),
  };
}

export const resumeMatchingAIService = {
  async matchResume(
    jobDescription: string,
    resumeText: string
  ): Promise<ResumeMatchResult> {
    const jd =
      String(
        jobDescription || ""
      ).trim();

    const resume =
      String(
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
     * Groq is used ONLY to structure the
     * resume and job description.
     *
     * Groq does NOT decide the final score.
     */
    try {
      const prompt = `
You are a recruitment information extraction engine.

Your job is to extract structured FACTS from a Job Description and Resume.

DO NOT calculate a candidate score.

DO NOT rank the candidate.

DO NOT make a hiring decision.

DO NOT invent information.

Use ONLY information explicitly supported by the supplied text.

Return ONLY valid JSON.

Required JSON:

{
  "candidate": {
    "skills": [],
    "experience": [
      {
        "company": "",
        "designation": "",
        "duration": "",
        "description": []
      }
    ],
    "education": [
      {
        "degree": "",
        "college": "",
        "field": "",
        "cgpa": "",
        "percentage": "",
        "year": ""
      }
    ],
    "projects": [
      {
        "title": "",
        "technologies": [],
        "description": []
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

IMPORTANT:

MANDATORY SKILLS:
Only put a skill in mandatorySkills if the JD clearly presents it as required, mandatory, must-have, minimum qualification, or equivalent.

PREFERRED SKILLS:
Put optional, preferred, nice-to-have, bonus, or advantageous skills here.

EXPERIENCE:
Extract the minimum required experience from the JD only when explicitly stated.

If the JD says "2+ years", return 2.

If experience is not specified, return 0.

CANDIDATE EXPERIENCE:
Copy the actual duration from the resume when explicitly stated.

Do NOT calculate missing experience.

EDUCATION:
Extract only explicitly stated qualifications.

RESPONSIBILITIES:
Extract the important responsibilities and duties from the JD.

DOMAIN:
Identify the professional domain explicitly suggested by the JD.

RESUME:

${resume}

JOB DESCRIPTION:

${jd}
`;

      let lastExtractionError: unknown;
      const MAX_ATTEMPTS = 3;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
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
              // Extraction JSON for a detailed resume can run long; give it
              // enough room so the model doesn't get cut off mid-object.
              max_tokens: 4096,
            });

          const text =
            completion
              .choices[0]
              ?.message
              ?.content || "";

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

          // Some models add a stray sentence before/after the JSON, or
          // (rarely) still get cut off despite the higher token budget
          // above. Extract just the outermost balanced {...} object rather
          // than trusting the whole trimmed string, so a wrapped or
          // slightly truncated response still has the best chance of
          // parsing.
          const jsonSlice = extractBalancedJson(cleaned);

          const parsed =
            JSON.parse(jsonSlice ?? cleaned);

          const candidate =
            buildCandidateEvidence(
              parsed,
              resume
            );

          const job =
            buildJobRequirement(
              parsed
            );

          /*
           * FINAL SCORE IS CALCULATED LOCALLY.
           *
           * The LLM cannot override it.
           */
          return localScore(
            candidate,
            job
          );
        } catch (error) {
          lastExtractionError = error;

          console.warn(
            `AI extraction attempt ${attempt}/${MAX_ATTEMPTS} failed.`,
            error
          );

          // Most failures here are transient (rate limits, a momentary
          // network blip, or the model occasionally producing malformed
          // JSON) rather than a permanent problem with this candidate/JD
          // pair. Retrying a couple of times before giving up avoids
          // presenting the neutral fallback score as if it were a real,
          // deterministic result.
          if (attempt < MAX_ATTEMPTS) {
            await new Promise((resolve) =>
              setTimeout(resolve, attempt * 800)
            );
          }
        }
      }

      throw lastExtractionError;
    } catch (error) {
      const reason = String(
        (error as any)?.message || error || "Unknown error",
      );

      console.warn(
        "AI extraction unavailable after retries. Falling back to local scoring.",
        error
      );

      /*
       * Even when Groq fails, scoring still
       * happens through the controlled engine.
       *
       * NOTE: with no extracted facts, every mandatory/preferred/
       * responsibility/education/certification score collapses to
       * its neutral default and the weighted formula always lands
       * on ~48%, regardless of the candidate or JD. This is NOT a
       * real match score — callers must check usedFallback and
       * surface this to the user rather than presenting it as a
       * genuine result.
       */
      const fallback = localScore(
        {
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
  },
};