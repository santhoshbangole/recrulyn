import { supabase } from "../../../services/supabase/client";
import { isDemoMode } from "../../demo/seed";

const SHORTLIST_KEY = "recrulyn_local_shortlists";

function readLocal() {
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY);
    return raw ? (JSON.parse(raw) as any[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(list: any[]) {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(list));
}

export const recrulynShortlistService = {
  async shortlistCandidate(payload: {
    requirement_role: string;
    required_skills: string;
    candidate_id: string;
    candidate_name: string;
    email: string;
    ai_score: number;
    shortlisted_by: string;
  }) {
    const row = {
      ...payload,
      id: `local-shortlist-${Date.now()}`,
      status: "SHORTLISTED",
      shortlisted_at: new Date().toISOString(),
    };

    if (isDemoMode()) {
      const list = readLocal();
      list.unshift(row);
      writeLocal(list);
      return row;
    }

    try {
      const { data, error } = await supabase
        .from("recrulyn_shortlists")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch {
      const list = readLocal();
      list.unshift(row);
      writeLocal(list);
      return row;
    }
  },

  async getShortlistedCandidates() {
    const local = readLocal();
    if (isDemoMode()) return local.filter((r) => r.status === "SHORTLISTED");

    try {
      const { data, error } = await supabase
        .from("recrulyn_shortlists")
        .select("*")
        .eq("status", "SHORTLISTED")
        .order("shortlisted_at", {
          ascending: false,
        });

      if (error) throw error;
      return [...local, ...(data || [])];
    } catch {
      return local;
    }
  },
};