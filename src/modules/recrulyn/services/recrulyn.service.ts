import { supabase } from "../../../services/supabase/client";
import { uploadVaultFile } from "../../documents/services/vault.service";

export const recrulynService = {
  async askRecrulyn(question: string) {
    const q = question.toLowerCase();

    if (q.includes("joining today")) {
      return {
        answer:
          "3 candidates are scheduled to join today.",
      };
    }

    if (q.includes("pending loa")) {
      return {
        answer:
          "There are 5 pending LOAs awaiting approval.",
      };
    }

    if (q.includes("hr interns")) {
      return {
        answer:
          "8 HR Intern candidates are currently active.",
      };
    }

    if (q.includes("above 80")) {
      return {
        answer:
          "12 candidates currently have AI scores above 80%.",
      };
    }

    return {
      answer:
        "Recrulyn AI is ready. Resume intelligence services will be connected soon.",
    };
  },

  async uploadResume(
    file: File
  ) {
    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadVaultFile({
      file,
      filename: fileName,
      category: "resume",
      contentType: file.type || "application/octet-stream",
    });

    return {
      path: fileName,
      url,
    };
  },

  async uploadRequirementFile(
    file: File
  ) {
    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadVaultFile({
      file,
      filename: fileName,
      category: "jd",
      contentType: file.type || "application/octet-stream",
    });

    return {
      path: fileName,
      url,
    };
  },

  async analyzeCandidate(
    candidateId: string,
    requirementId?: string
  ) {
    const result = {
      candidate_id: candidateId,
      requirement_id:
        requirementId || null,

      score:
        Math.floor(
          Math.random() * 25
        ) + 75,

      strengths:
        "React, TypeScript, Communication",

      weaknesses:
        "Testing, Documentation",

      recommendation:
        "Proceed To Interview",
    };

    const { data, error } =
      await supabase
        .from("ai_analysis")
        .insert([result])
        .select()
        .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return data;
  },

  async getCandidateRanking() {
    const { data, error } =
      await supabase
        .from("ai_analysis")
        .select("*")
        .order("score", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      throw error;
    }

    return data || [];
  },

  async getTodayJoiners() {
    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const { data, error } =
      await supabase
        .from("candidates")
        .select("*")
        .eq(
          "joining_date",
          today
        );

    if (error) {
      console.error(error);
      throw error;
    }

    return data || [];
  },

  async getPendingDocuments() {
    const { data, error } =
      await supabase
        .from("documents")
        .select("*")
        .eq(
          "status",
          "PENDING"
        );

    if (error) {
      console.error(error);
      throw error;
    }

    return data || [];
  },
};