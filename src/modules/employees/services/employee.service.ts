import { supabase } from "../../../services/supabase/client";
import { getDemoEmployees, isDemoMode } from "../../demo/seed";
import { isOfflineFetchError } from "../../../lib/offline-store";

export const employeeService = {
  async getAll() {
    if (isDemoMode()) return getDemoEmployees();

    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;
      return data?.length ? data : getDemoEmployees();
    } catch (error) {
      if (!isOfflineFetchError(error) && !getDemoEmployees().length) throw error;
      return getDemoEmployees();
    }
  },

  async create(payload: {
  profile_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  reporting_manager?: string;
  joining_date?: string;
  employment_type?: string;
}) {
    const { data, error } = await supabase
      .from("employees")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
  async getByProfileId(profileId: string) {
    const matchLocal = () => {
      const all = getDemoEmployees();
      return (
        all.find((e: any) => e.profile_id === profileId) ||
all.find((e: any) => profileId.includes(e.email)) ||
all.find((e: any) => e.email === "intern@reude.tech") ||
        null
      );
    };

    if (isDemoMode()) return matchLocal();

    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (error) throw error;
      return data || matchLocal();
    } catch {
      return matchLocal();
    }
  },
};