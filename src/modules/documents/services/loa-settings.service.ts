import { supabase } from "../../../services/supabase/client";
import { isDemoMode } from "../../demo/seed";

const DEFAULT_SETTINGS = {
  logo_url: "/Logo-Monogram.png",
  seal_url: "/reude-seal.png",
  header_image_url: "/header.png",
  signature_url: "",
};

export const loaSettingsService = {
  async getSettings() {
    if (isDemoMode()) return DEFAULT_SETTINGS;

    const { data, error } = await supabase
      .from("loa_settings")
      .select("*")
      .maybeSingle();

    if (error || !data) {
      console.warn("loa_settings unavailable, using defaults", error);
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...data,
      logo_url: data.logo_url || DEFAULT_SETTINGS.logo_url,
      seal_url: data.seal_url || DEFAULT_SETTINGS.seal_url,
    };
  },

  async updateSettings(
    payload: any
  ) {
    const { data, error } =
      await supabase
        .from("loa_settings")
        .update(payload)
        .eq("id", payload.id)
        .select()
        .single();

    if (error) throw error;

    return data;
  },
};