import { supabase }
from "../../../services/supabase/client";

export const recrulynTaskService = {
  async createTask(
    payload: any
  ) {
    const { error } =
      await supabase
        .from(
          "recrulyn_candidate_tasks"
        )
        .insert([payload]);

    if (error)
      throw error;
  },

  async getTasks(
    candidateId: string
  ) {
    const { data } =
      await supabase
        .from(
          "recrulyn_candidate_tasks"
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