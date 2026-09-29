import { supabase } from "../../../services/supabase/client";
import { uploadVaultFile } from "../../documents/services/vault.service";

export const resumeService = {
  async getCandidates() {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("ai_score", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  async getRequirements() {
    const { data, error } = await supabase
      .from("requirements")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) throw error;

    return data || [];
  },

  async getAnalysis() {
  const { data, error } = await supabase
    .from("recrulyn_resume_index")
    .select("*")
    .order("ai_score", {
      ascending: false,
    });

  if (error) throw error;

  return data || [];
},

  async getTopCandidates(limit = 10) {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("ai_score", {
        ascending: false,
      })
      .limit(limit);

    if (error) throw error;

    return data || [];
  },

  async createAnalysis(payload: {
    candidate_id: string;
    requirement_id: string;
    score: number;
    strengths: string;
    weaknesses: string;
    recommendation: string;
  }) {
    const { data, error } = await supabase
      .from("ai_analysis")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async uploadResume(file: File) {
    const fileName =
      `${Date.now()}-${file.name}`;

    const url = await uploadVaultFile({
      file,
      filename: fileName,
      category: "resume",
      contentType: file.type || "application/octet-stream",
    });

    return { path: fileName, url };
  },

  async uploadRequirementFile(file: File) {
    const fileName =
      `${Date.now()}-${file.name}`;

    const url = await uploadVaultFile({
      file,
      filename: fileName,
      category: "jd",
      contentType: file.type || "application/octet-stream",
    });

    return { path: fileName, url };
  },

  async createCandidate(payload: {
    full_name: string;
    email: string;
    phone?: string;
    job_id?: string;
    status?: string;
    resume_url?: string;
    ai_score?: number;
    source?: string;
    linkedin_url?: string;
  }) {
    const { data, error } =
      await supabase
        .from("candidates")
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    return data;
  },
async askRecrulyn(question: string) {
  const query =
    question.toLowerCase();

  const { data } =
    await supabase
      .from("recrulyn_resume_index")
      .select("*");

  if (!data?.length) {
    return "No candidates found.";
  }

  const candidateMatch =
    data.find(
      (candidate) =>
        query.includes(
          candidate.candidate_name?.toLowerCase()
        )
    );

  if (candidateMatch) {
    return `
Name: ${candidateMatch.candidate_name}

Email: ${candidateMatch.email}

Phone: ${candidateMatch.phone}

Skills: ${candidateMatch.skills}

Education: ${candidateMatch.education}

Score: ${candidateMatch.ai_score}%

Recommendation: ${candidateMatch.recommendation}
`;
  }

  const skillMatches =
    data.filter(
      (candidate) =>
        candidate.skills
          ?.toLowerCase()
          .includes(query)
    );

  if (
    skillMatches.length > 0
  ) {
    return skillMatches
      .map(
        (candidate) =>
          `${candidate.candidate_name} (${candidate.ai_score}%)`
      )
      .join("\n");
  }

  return "No matching candidates found.";
},
  
  async getRecrulynUploads() {
  const { data, error } =
    await supabase
      .from("recrulyn_uploads")
      .select("*")
      .order(
        "uploaded_at",
        {
          ascending: false,
        }
      );

  if (error)
    throw error;

  return data || [];
},
};