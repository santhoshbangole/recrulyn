import { supabase } from "../../../services/supabase/client";
import { isUuid } from "../../../lib/offline-store";

export const activityLogService = {
  async logActivity(payload: {
    candidate_id: string;
    action: string;
    old_status?: string;
    new_status?: string;
    performed_by?: string;
    performed_by_name?: string;
  }) {
    if (!isUuid(payload.candidate_id)) return;

    const { error } = await supabase
      .from("candidate_activity_logs")
      .insert([
        {
          candidate_id: payload.candidate_id,
          action: payload.action,
          old_status: payload.old_status || null,
          new_status: payload.new_status || null,
          performed_by: payload.performed_by || null,
          performed_by_name: payload.performed_by_name || null,
        },
      ]);

    if (error) throw error;
  },
};
