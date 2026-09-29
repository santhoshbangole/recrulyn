import { supabase }
from "../../../services/supabase/client";

import { recrulynTimelineService }
from "./recrulyn-timeline.service";
export const recrulynIndexService = {
  async createIndex(
    payload: any
  ) {
    const { data, error } =
      await supabase
        .from(
          "recrulyn_resume_index"
        )
        .insert([payload]);

    if (error)
      throw error;

    return data;
  },

  async getExistingIndex(
    uploadId: string
  ) {
    const { data } =
      await supabase
        .from(
          "recrulyn_resume_index"
        )
        .select("*")
        .eq(
          "upload_id",
          uploadId
        )
        .maybeSingle();

    return data;
  },
  async getRankedCandidates() {
  const { data, error } =
    await supabase
      .from("recrulyn_resume_index")
      .select("*")
      .order("ai_score", {
        ascending: false,
      });

  if (error) throw error;

  return data || [];
},

 async updateAnalysis(
  id: string,
  payload: {
  ai_score: number;
  recommendation: string;
  matched_keywords: string;
  missing_keywords: string;
  analysis_summary: string;

  strengths: string;
  weaknesses: string;
  interview_questions: string;
  risk_factors: string;
}
)
 {
    const { error } =
      await supabase
        .from(
          "recrulyn_resume_index"
        )
        .update(payload)
        .eq("id", id);

    if (error)
      throw error;
  },

  async updateStatus(
    id: string,
    status: string
  ) {
    const { error } =
      await supabase
        .from(
          "recrulyn_resume_index"
        )
        .update({
          status,
        })
        .eq("id", id);

    if (error)
      throw error;

    await recrulynTimelineService.createEvent(
      id,
      "STATUS_CHANGE",
      `Status changed to ${status}`
    );
  },

  async updateInterview(
    id: string,
    payload: {
      interview_date: string;
      interview_feedback: string;
    }
  ) {
    const { error } =
      await supabase
        .from(
          "recrulyn_resume_index"
        )
        .update(payload)
        .eq("id", id);

    if (error)
      throw error;

    await recrulynTimelineService.createEvent(
      id,
      "INTERVIEW_UPDATED",
      "Interview details updated"
    );
  },
  async updateNotes(
  id: string,
  notes: string
) {
  const { error } =
    await supabase
      .from(
        "recrulyn_resume_index"
      )
      .update({
        notes,
      })
      .eq("id", id);

  if (error)
    throw error;

  await recrulynTimelineService.createEvent(
    id,
    "NOTE_ADDED",
    "Candidate notes updated"
  );
},
async updateTags(
  id: string,
  tags: string
) {
  const { error } =
    await supabase
      .from(
        "recrulyn_resume_index"
      )
      .update({
        tags,
      })
      .eq("id", id);

  if (error)
    throw error;

  await recrulynTimelineService.createEvent(
    id,
    "TAGS_UPDATED",
    `Tags updated: ${tags}`
  );
},
};