import { supabase } from "../../services/supabase/client";

export const settingsService = {
  async updatePassword(
    password: string
  ) {
    const { error } =
      await supabase.auth.updateUser({
        password,
      });

    if (error) throw error;
  },
};