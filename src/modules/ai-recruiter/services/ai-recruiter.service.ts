import { candidateService } from "../../candidates/services/candidate.service";
import { profileService } from "../../recrulyn/services/profile.service";
import { requirementService } from "../../requirements/services/requirement.service";
import { recrulynExtractorService } from "../../recrulyn/services/recrulyn-extractor.service";
import { recrulynAnalysisService } from "../../recrulyn/services/recrulyn-analysis.service";
import { localProfileStore } from "../../../lib/offline-store";
import type { AIRecruiterResult } from "../types/ai-recruiter.types";

const FIT_THRESHOLD = 60;
const EXTRACT_CONCURRENCY = 4;

function parseProfileField(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(String)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  const text = value.trim();

  // Profile data is commonly stored as JSON strings.
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (typeof parsed === "string" && parsed.trim()) {
      return [parsed.trim()];
    }
  } catch {
    // Not JSON — treat it as normal text.
  }

  return [text];
}

function skillsText(value: unknown) {
  return parseProfileField(value).join(", ");
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (true) {
      const index = next++;

      if (index >= items.length) {
        return;
      }

      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(limit, items.length) },
      () => worker()
    )
  );

  return results;
}

async function getCandidateProfile(candidateId: string) {
  const local =
    localProfileStore
      .list()
      .find((p) => p.candidate_id === candidateId) || null;

  try {
    const profile = await profileService.getProfile(candidateId);
    return profile || local;
  } catch {
    return local;
  }
}

async function loadTalentPool() {
  const candidates = await candidateService.getCandidates();

  return Promise.all(
    (candidates || []).map(async (candidate: any) => {
      const profile = await getCandidateProfile(candidate.id);

      let resumeText = "";

      /*
       * Always use the current uploaded resume when available.
       * This prevents stale candidate_profiles.resume_text
       * from affecting AI Recruiter matching.
       */
      if (candidate.resume_url) {
        try {
          const extracted =
            await recrulynExtractorService.extractText(
              candidate.resume_url
            );

          resumeText = String(
            extracted?.resumeText || ""
          ).trim();
        } catch (error) {
          console.warn(
            `AI Recruiter: resume extraction failed for ${candidate.id}`,
            error
          );
        }
      }

      /*
       * Fallback only when the candidate has no resume URL.
       */
      if (!resumeText) {
        resumeText = String(
          profile?.resume_text || ""
        ).trim();
      }

      return {
        id: candidate.id,

        candidate_name:
          candidate.full_name || "Candidate",

        email:
          candidate.email || "",

        resume_url:
          candidate.resume_url || "",

        resume_text: resumeText,

        skills: parseProfileField(
          profile?.skills
        ),

        education: parseProfileField(
          profile?.education
        ),

        experience: parseProfileField(
          profile?.experience
        ),

        projects: parseProfileField(
          profile?.projects
        ),

        certifications: parseProfileField(
          profile?.certifications
        ),

        job_title:
          candidate.job_title || "",

        department:
          candidate.department || "",
      };
    })
  );
}
function buildJdText(
  role: string,
  skills: string[]
) {
  const cleanRole = role.trim();

  /*
   * IMPORTANT:
   *
   * recrulynAnalysisService reads the FIRST LINE as the role.
   * Therefore the role must be the first line of the JD.
   */
  return [
    cleanRole,
    ...skills.map((skill) => skill.trim()).filter(Boolean),
  ].join("\n");
}

export const aiRecruiterService = {
  async findCandidates(
    inputOrRole:
      | {
          requirementId?: string;
          role?: string;
          skills?: string[];
        }
      | string,
    legacySkills: string[] = []
  ) {
    /*
     * Support both:
     *
     * findCandidates({
     *   requirementId,
     *   role,
     *   skills
     * })
     *
     * and the older:
     *
     * findCandidates(role, skills)
     *
     * This prevents the AI Recruiter page from breaking if it
     * still uses the older call format.
     */

    const input =
      typeof inputOrRole === "string"
        ? {
            role: inputOrRole,
            skills: legacySkills,
          }
        : inputOrRole || {};

    const requirementId =
      input.requirementId;

    let role =
      String(input.role || "").trim();

    const skills =
      Array.isArray(input.skills)
        ? input.skills
            .map(String)
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];

    let jdText = "";

    /*
     * ============================================================
     * EXISTING ROLE
     * ============================================================
     */

    if (requirementId) {
      const requirement =
        await requirementService.getRequirementById(
          requirementId
        );

      const requirementTitle = String(
        requirement?.title ||
          requirement?.job_title ||
          role ||
          ""
      ).trim();

      const description = String(
        requirement?.job_description ||
          requirement?.description ||
          ""
      ).trim();

      if (!description) {
        throw new Error(
          "This role has no job description saved yet — add one before matching candidates."
        );
      }

      role = requirementTitle;

      /*
       * Put the role first so the local analysis engine can
       * correctly identify role-specific required skills.
       */
      jdText = [
        requirementTitle,
        description,
        ...skills.map(
          (skill) =>
            `Required skill: ${skill}`
        ),
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    /*
     * ============================================================
     * CASUAL ROLE
     * ============================================================
     */

    else if (role) {
      jdText = buildJdText(
        role,
        skills
      );
    }

    else {
      throw new Error(
        "Select a role or type one to match candidates against."
      );
    }

    /*
     * ============================================================
     * LOAD ALL CANDIDATES
     * ============================================================
     */

    const candidates =
      await loadTalentPool();

    /*
     * ============================================================
     * LOCAL MATCHING
     *
     * IMPORTANT:
     *
     * There is NO:
     *
     * resumeMatchingAIService.matchResume(...)
     *
     * here.
     *
     * Every candidate is scored locally.
     * ============================================================
     */

    const scored =
      await mapWithConcurrency(
        candidates,
        EXTRACT_CONCURRENCY,
        async (
          candidate: any
        ): Promise<AIRecruiterResult | null> => {
          const resumeText =
            String(
              candidate.resume_text || ""
            ).trim();

          if (!resumeText) {
            console.warn(
              `AI Recruiter: no resume text for candidate ${candidate.id}`
            );

            return null;
          }

          let analysis;

          try {
            analysis =
              recrulynAnalysisService.calculateAnalysis(
                {
                  resumeText,
                  resume_text: resumeText,

                  skills:
                    candidate.skills,

                  education:
                    candidate.education,

                  experience:
                    candidate.experience,

                  projects:
                    candidate.projects,

                  certifications:
                    candidate.certifications,
                },
                jdText
              );
          } catch (error) {
            console.error(
              `AI Recruiter: local analysis failed for candidate ${candidate.id}`,
              error
            );

            return null;
          }

          /*
 * Show only candidates with a meaningful role-skill match.
 */
const matchedSkills = String(
  analysis.matchedKeywords || ""
)
  .split(",")
  .map((skill) => skill.trim())
  .filter(Boolean);

if (
  analysis.score < FIT_THRESHOLD ||
  matchedSkills.length === 0
) {
  return null;
}

          return {
            id: candidate.id,

            candidate_name:
              candidate.candidate_name ||
              "Candidate",

            email:
              candidate.email || "",

            resume_url:
              candidate.resume_url || "",

            resume_text:
              resumeText,

            skills:
              skillsText(
                candidate.skills
              ),

            ai_score:
              analysis.score,

            recommendation:
              analysis.recommendation,

            matched_keywords:
              analysis.matchedKeywords || "",

            missing_keywords:
              analysis.missingKeywords || "",

            strengths:
              analysis.strengths || "",

            weaknesses:
              analysis.weaknesses || "",

            interview_questions:
              analysis.interviewQuestions || "",

            risk_factors:
              analysis.riskFactors || "",

            requirement_role:
              role,

            required_skills:
              skills.join(", "),
          } as AIRecruiterResult;
        }
      );

    /*
     * ============================================================
     * RANK RESULTS
     * ============================================================
     */

    const ranked =
      scored.filter(
        (
          result
        ): result is AIRecruiterResult =>
          result !== null
      );

    ranked.sort(
      (a, b) =>
        b.ai_score - a.ai_score
    );

    return ranked;
  },
};