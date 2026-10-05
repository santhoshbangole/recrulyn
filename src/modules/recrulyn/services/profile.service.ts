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
    // Always keep local storage updated.
    localProfileStore.upsert(payload);

    // Local/offline candidate.
    if (!isUuid(payload.candidate_id)) {
      return localProfileStore
        .list()
        .find((p) => p.candidate_id === payload.candidate_id);
    }

    try {
      // Check whether a profile already exists.
      const { data: existingProfile, error: checkError } =
        await supabase
          .from("candidate_profiles")
          .select("id")
          .eq("candidate_id", payload.candidate_id)
          .maybeSingle();

      if (checkError) {
        console.error(
          "CHECK EXISTING PROFILE ERROR:",
          checkError
        );
        throw checkError;
      }

      // Existing profile -> UPDATE.
      if (existingProfile?.id) {
        const { data, error } =
          await supabase
            .from("candidate_profiles")
            .update(payload)
            .eq("candidate_id", payload.candidate_id)
            .select()
            .single();

        if (error) {
          console.error(
            "CANDIDATE PROFILE UPDATE ERROR:",
            error
          );
          console.error(
            "CANDIDATE PROFILE UPDATE PAYLOAD:",
            payload
          );
          throw error;
        }

        console.log(
          "CANDIDATE PROFILE UPDATED:",
          data
        );

        return data;
      }

      // No profile -> INSERT.
      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .insert([payload])
          .select()
          .single();

      if (error) {
        console.error(
          "CANDIDATE PROFILE INSERT ERROR:",
          error
        );
        console.error(
          "CANDIDATE PROFILE INSERT PAYLOAD:",
          payload
        );
        throw error;
      }

      console.log(
        "CANDIDATE PROFILE CREATED:",
        data
      );

      return data;
    } catch (error) {
      console.error(
        "CANDIDATE PROFILE SAVE FAILED:",
        error
      );

      console.error(
        "PROFILE PAYLOAD:",
        payload
      );

      /*
       * Keep local data available for offline use.
       *
       * IMPORTANT:
       * For a UUID candidate, a database failure is re-thrown
       * so the application does not silently pretend that the
       * profile was permanently saved.
       */
      if (!isIgnorableDbError(error)) {
        throw error;
      }

      return localProfileStore.upsert(payload);
    }
  },

  async getProfile(candidateId: string) {
    const local =
      localProfileStore
        .list()
        .find((p) => p.candidate_id === candidateId) || null;

    // Local/offline candidate.
    if (!isUuid(candidateId)) {
      return local;
    }

    try {
      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .select("*")
          .eq("candidate_id", candidateId)
          .maybeSingle();

      if (error) {
        console.error(
          "GET PROFILE SUPABASE ERROR:",
          error
        );

        throw error;
      }

      console.log(
        "GET PROFILE RESULT:",
        data
      );

      /*
       * Supabase is the source of truth for UUID candidates.
       *
       * If the database has no profile, return local data only
       * as a temporary fallback.
       */
      return data || local;
    } catch (error) {
      console.error(
        "GET PROFILE FAILED:",
        error
      );

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
        analysis.currentDesignation || "",

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

    // Always keep local profile updated.
    localProfileStore.upsert(patch);

    // Local/offline candidate.
    if (!isUuid(candidateId)) {
      return;
    }

    try {
      // Check whether the profile exists.
      const { data: existingProfile, error: checkError } =
        await supabase
          .from("candidate_profiles")
          .select("id")
          .eq("candidate_id", candidateId)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      // Existing profile -> UPDATE.
      if (existingProfile?.id) {
        const { data, error } =
          await supabase
            .from("candidate_profiles")
            .update(patch)
            .eq("candidate_id", candidateId)
            .select()
            .single();

        if (error) {
          throw error;
        }

        console.log(
          "AI ANALYSIS UPDATED:",
          data
        );

        return data;
      }

      // Missing profile -> CREATE.
      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .insert([patch])
          .select()
          .single();

      if (error) {
        throw error;
      }

      console.log(
        "AI ANALYSIS PROFILE CREATED:",
        data
      );

      return data;
    } catch (error) {
      console.error(
        "AI ANALYSIS SAVE ERROR:",
        error
      );

      if (!isIgnorableDbError(error)) {
        throw error;
      }
    }
  },

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
        analysis.currentDesignation || "",

      total_experience:
        analysis.totalExperience || "",

      career_summary:
        analysis.careerSummary || "",

      ai_summary:
        analysis.careerSummary || "",
    };

    // Always keep local profile updated.
    localProfileStore.upsert(patch);

    // Local/offline candidate.
    if (!isUuid(candidateId)) {
      return;
    }

    try {
      // Check whether the profile exists.
      const { data: existingProfile, error: checkError } =
        await supabase
          .from("candidate_profiles")
          .select("id")
          .eq("candidate_id", candidateId)
          .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      // Existing profile -> UPDATE.
      if (existingProfile?.id) {
        const { data, error } =
          await supabase
            .from("candidate_profiles")
            .update(patch)
            .eq("candidate_id", candidateId)
            .select()
            .single();

        if (error) {
          throw error;
        }

        console.log(
          "PROFILE ENRICHMENT UPDATED:",
          data
        );

        return data;
      }

      // Missing profile -> CREATE.
      const { data, error } =
        await supabase
          .from("candidate_profiles")
          .insert([patch])
          .select()
          .single();

      if (error) {
        throw error;
      }

      console.log(
        "PROFILE ENRICHMENT PROFILE CREATED:",
        data
      );

      return data;
    } catch (error) {
      console.error(
        "PROFILE ENRICHMENT SAVE ERROR:",
        error
      );

      if (!isIgnorableDbError(error)) {
        throw error;
      }
    }
  },
};