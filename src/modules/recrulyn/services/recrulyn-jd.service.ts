import { supabase } from "../../../services/supabase/client";

export const recrulynJDService = {
  async createJD(payload: {
    title: string;
    department: string;
    job_description: string;
    required_skills: string;
    nice_to_have_skills: string;
    experience_required: string;
  }) {
    const { data, error } =
      await supabase
        .from("recrulyn_job_descriptions")
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    return data;
  },

  async getJDs() {
    const { data, error } =
      await supabase
        .from("recrulyn_job_descriptions")
        .select("*")
        .eq("status", "ACTIVE")
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return data || [];
  },

  async getJDById(id: string) {
    const { data, error } =
      await supabase
        .from("recrulyn_job_descriptions")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;

    return data;
  },

  async updateJD(
    id: string,
    payload: any
  ) {
    const { data, error } =
      await supabase
        .from("recrulyn_job_descriptions")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;

    return data;
  },

  async deleteJD(id: string) {
    const { error } =
      await supabase
        .from("recrulyn_job_descriptions")
        .update({
          status: "INACTIVE",
        })
        .eq("id", id);

    if (error) throw error;
  },
};