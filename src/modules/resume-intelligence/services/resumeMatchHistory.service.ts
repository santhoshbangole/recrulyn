import { supabase } from "../../../services/supabase/client";
import {
  isIgnorableDbError,
  isUuid,
  localMatchHistoryStore,
} from "../../../lib/offline-store";

export const resumeMatchHistoryService = {
  async save(payload: any) {
    const row = localMatchHistoryStore.add(payload);

    const candidateId = payload?.candidate_id;
    if (candidateId && !isUuid(candidateId)) {
      return row;
    }

    try {
      const { error } = await supabase
        .from("resume_match_history")
        .insert([payload]);
      if (error) throw error;
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
    }

    return row;
  },

  async getHistory() {
    try {
      const { data, error } = await supabase
        .from("resume_match_history")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;
      const remote = data || [];
      const local = localMatchHistoryStore.list();
      const remoteIds = new Set(remote.map((item) => item.id));
      return [...local.filter((item) => !remoteIds.has(item.id)), ...remote];
    } catch {
      return localMatchHistoryStore.list();
    }
  },

  async deleteHistory(id: string) {
    localMatchHistoryStore.delete(id);
    if (String(id).startsWith("local-match-")) return;

    try {
      const { error } = await supabase
        .from("resume_match_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
    }
  },

  async deleteManyHistory(ids: string[]) {
    for (const id of ids) {
      await this.deleteHistory(id);
    }
  },
};
