import { supabase }
from "../../../services/supabase/client";

export const recrulynTimelineService = {
  async createEvent(
    candidateId: string,
    eventType: string,
    description: string
  ) {
    const { error } =
      await supabase
        .from(
          "recrulyn_candidate_timeline"
        )
        .insert([
          {
            candidate_id:
              candidateId,

            event_type:
              eventType,

            description,
          },
        ]);

    if (error)
      throw error;
  },

  async getTimeline(
    candidateId: string
  ) {
    const { data } =
      await supabase
        .from(
          "recrulyn_candidate_timeline"
        )
        .select("*")
        .eq(
          "candidate_id",
          candidateId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    return data || [];
  },
};