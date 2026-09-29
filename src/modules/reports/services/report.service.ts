import { supabase } from "../../../services/supabase/client";

class ReportService {
  async getCandidateReport() {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data || [];
  }
}

export const reportService = new ReportService();