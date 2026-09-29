import { supabase } from "../../../services/supabase/client";

class EmailDraftService {

  async saveDraft(draft: any) {

    const { data, error } = await supabase
      .from("email_drafts")
      .insert([draft])
      .select()
      .single();

    if (error) throw error;

    return data;
  }
async getDrafts() {

  const { data, error } =
    await supabase
      .from("email_drafts")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return data || [];

}
}

export const emailDraftService =
  new EmailDraftService();