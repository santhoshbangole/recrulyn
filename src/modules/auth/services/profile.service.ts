import { supabase } from "../../../services/supabase/client";

export const profileService = {
  async getCurrentProfile(userId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const email = user?.email;
    if (!email) return null;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("PROFILE ERROR:", error);
      return null;
    }

    if (data) {
      console.log("PROFILE DATA:", data);
      return data;
    }

    // Auto-provision profile for first-time sign-in
    return await this.ensureProfile({
      id: userId || user.id,
      email,
      full_name:
        user.user_metadata?.full_name ||
        (email.startsWith("hr@") ? "HR User" : email.split("@")[0]),
      role_name:
        user.app_metadata?.role ||
        user.user_metadata?.role ||
        (email.toLowerCase() === "hr@reude.tech" ? "HR" : "EMPLOYEE"),
    });
  },

  async ensureProfile(payload: {
    id: string;
    email: string;
    full_name: string;
    role_name: string;
  }) {
    const row = {
      id: payload.id,
      email: payload.email,
      full_name: payload.full_name,
      role_name: payload.role_name,
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert(row, { onConflict: "email" })
      .select("*")
      .maybeSingle();

    if (error) {
      // Fallback if unique constraint is on id
      const retry = await supabase
        .from("user_profiles")
        .upsert(row, { onConflict: "id" })
        .select("*")
        .maybeSingle();

      if (retry.error) {
        console.error("PROFILE ENSURE ERROR:", retry.error);
        return {
          ...row,
          role_name: payload.role_name,
        };
      }

      return retry.data;
    }

    return data;
  },
};
