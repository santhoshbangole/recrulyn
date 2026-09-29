import { supabase } from "../../../services/supabase/client";

export const officerService = {
  async getOfficers() {
    const { data, error } =
      await supabase
        .from("officers")
        .select("*")
        .order("name");

    if (error) throw error;

    return data || [];
  },
};