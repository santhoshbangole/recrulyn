import { supabase } from "../../../services/supabase/client";

export const recrulynCandidateService = {
  async getCandidates() {
    try {
      const { data, error } = await supabase
        .from("recrulyn_resume_index")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;
      return data || [];
    } catch {
      return [];
    }
  },

  async getCandidateById(id: string) {
    try {
      const { data, error } = await supabase
        .from("recrulyn_resume_index")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch {
      const { candidateService } = await import(
        "../../candidates/services/candidate.service"
      );
      const person = await candidateService.getCandidateById(id);
      return {
        id: person.id,
        candidate_name: person.full_name,
        email: person.email,
        resume_url: person.resume_url || "",
        resume_text: "",
        skills: person.job_title || "",
      };
    }
  },

  async searchCandidates(
    search: string
  ) {
    const { data, error } =
      await supabase
        .from("recrulyn_resume_index")
        .select("*")
        .or(
          `
candidate_name.ilike.%${search}%,
email.ilike.%${search}%,
skills.ilike.%${search}%,
education.ilike.%${search}%,
projects.ilike.%${search}%
`
        );

    if (error) throw error;

    return data || [];
  },
};