import { supabase } from "../../../services/supabase/client";
import {
  isIgnorableDbError,
  isUuid,
  localProfileStore,
} from "../../../lib/offline-store";

export const profileService = {
  async createProfile(payload: {
    candidate_id: string;
    resume_text: string;
    skills: string;
    education: string;
    experience: string;
    projects: string;
    certifications: string;
  }) {
    localProfileStore.upsert(payload);

    if (!isUuid(payload.candidate_id)) {
      return localProfileStore
        .list()
        .find(
          (p) => p.candidate_id === payload.candidate_id
        );
    }

    try {
      const existing = await supabase
        .from("candidate_profiles")
        .select("id")
        .eq("candidate_id", payload.candidate_id)
        .maybeSingle();

      if (existing.data?.id) {
        const { data, error } = await supabase
  .from("candidate_profiles")
  .insert([payload])
  .select()
  .single();

if (error) {
  console.error("CANDIDATE PROFILE INSERT ERROR:", error);
  console.error("CANDIDATE PROFILE INSERT PAYLOAD:", payload);
  throw error;
}

        return data;
      }

      const { data, error } = await supabase
        .from("candidate_profiles")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
  console.error("CANDIDATE PROFILE SAVE FAILED:", error);
  console.error("PROFILE PAYLOAD:", payload);

  localProfileStore.upsert(payload);

      if (
        !isIgnorableDbError(error) &&
        !String(
          (error as any)?.message || ""
        ).includes("duplicate")
      ) {
        return localProfileStore.upsert(
          payload
        );
      }

      return localProfileStore.upsert(
        payload
      );
    }
  },

  async getProfile(candidateId: string) {
    const local =
      localProfileStore
        .list()
        .find(
          (p) =>
            p.candidate_id === candidateId
        ) || null;

    if (!isUuid(candidateId)) {
      return local;
    }

    try {
      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .select("*")
          .eq(
            "candidate_id",
            candidateId
          )
          .maybeSingle();

      if (error) throw error;
return data || local; 
    } catch (error) {
      if (!isIgnorableDbError(error)) {
        throw error;
      }

      return local;
    }
  },

  async updateAIAnalysis(
    candidateId: string,
    analysis: any
  ) {
    /*
     * IMPORTANT:
     *
     * These are the actual columns that exist
     * in the candidate_profiles table.
     *
     * We intentionally DO NOT send:
     * - missing_skills
     * - interview_ready
     *
     * because those columns do not exist
     * in Supabase.
     */

    const patch = {
      candidate_id: candidateId,

      resume_score: Number(
        analysis.resumeScore ?? 0
      ),

      confidence: Number(
        analysis.confidence ?? 0
      ),

      career_level:
        analysis.careerLevel || "",

      domain:
        analysis.domain || "",

      recommended_role:
        analysis.recommendedRoles?.[0]?.role ||
        analysis.recommendedRoles?.[0] ||
        analysis.recommendedRole ||
        "",

      current_company:
        analysis.currentCompany || "",

      current_designation:
        analysis.currentDesignation ||
        "",

      total_experience:
        analysis.totalExperience || "",

      career_summary:
        analysis.careerSummary || "",

      ai_summary:
        analysis.careerSummary || "",

      strengths: JSON.stringify(
        analysis.strengths || []
      ),

      weaknesses: JSON.stringify(
        analysis.weaknesses || []
      ),
    };

    /*
     * Always keep the local profile updated.
     */
    localProfileStore.upsert(patch);

    /*
     * Local/offline candidate.
     */
    if (!isUuid(candidateId)) {
      return;
    }

    /*
     * Save AI analysis to Supabase.
     */
    try {
      const { error } =
        await supabase
          .from("candidate_profiles")
          .update(patch)
          .eq(
            "candidate_id",
            candidateId
          );

      if (error) {
        throw error;
      }

      console.log(
        "AI ANALYSIS SAVED:",
        patch
      );
    } catch (error) {
      console.error(
        "AI ANALYSIS SAVE ERROR:",
        error
      );

      if (
        !isIgnorableDbError(error)
      ) {
        throw error;
      }
    }
  },

  // Unlike updateAIAnalysis (which owns the JD-match-specific fields:
  // resume_score, strengths, weaknesses — these change per job and are
  // written by "AI Analyze"), this only touches the fields that describe
  // the candidate's resume/career on its own, independent of any job:
  // career level, domain, recommended role, company, designation,
  // experience, confidence, and the career summary. Written by
  // "Re-parse Profile", which re-runs the generic resume parse. Keeping
  // these two update paths separate stops one feature from silently
  // overwriting the other's data in the same table.
  async updateProfileEnrichment(
    candidateId: string,
    analysis: any
  ) {
    const patch = {
      candidate_id: candidateId,

      confidence: Number(
        analysis.confidence ?? 0
      ),

      career_level:
        analysis.careerLevel || "",

      domain:
        analysis.domain || "",

      recommended_role:
        analysis.recommendedRoles?.[0]?.role ||
        analysis.recommendedRoles?.[0] ||
        analysis.recommendedRole ||
        "",

      current_company:
        analysis.currentCompany || "",

      current_designation:
        analysis.currentDesignation ||
        "",

      total_experience:
        analysis.totalExperience || "",

      career_summary:
        analysis.careerSummary || "",

      ai_summary:
        analysis.careerSummary || "",
    };

    localProfileStore.upsert(patch);

    if (!isUuid(candidateId)) {
      return;
    }

    try {
      const { error } =
        await supabase
          .from("candidate_profiles")
          .update(patch)
          .eq(
            "candidate_id",
            candidateId
          );

      if (error) {
        throw error;
      }

      console.log(
        "PROFILE ENRICHMENT SAVED:",
        patch
      );
    } catch (error) {
      console.error(
        "PROFILE ENRICHMENT SAVE ERROR:",
        error
      );

      if (
        !isIgnorableDbError(error)
      ) {
        throw error;
      }
    }
  },
};