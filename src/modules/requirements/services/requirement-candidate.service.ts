import { supabase } from "../../../services/supabase/client";

export const requirementCandidateService = {
  async assignCandidate(
    requirementId: string,
    candidateId: string
  ) {
    const { data, error } =
      await supabase
        .from("requirement_candidates")
        .insert([
          {
            requirement_id: requirementId,
            candidate_id: candidateId,
          },
        ])
        .select()
        .single();

    if (error) throw error;

    return data;
  },
  async getRequirementIdForCandidate(
    candidateId: string
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from("requirement_candidates")
      .select("requirement_id")
      .eq("candidate_id", candidateId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn("getRequirementIdForCandidate error:", error);
      return null;
    }

    return data?.requirement_id || null;
  },

  async getAssignedCandidates(
    requirementId: string
  ) {
    const { data, error } =
      await supabase
        .from("requirement_candidates")
        .select("*")
        .eq(
          "requirement_id",
          requirementId
        );

    if (error) throw error;

    return data || [];
  },
};