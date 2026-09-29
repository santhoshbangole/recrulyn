import { supabase } from "../../../services/supabase/client";

class EmailHistoryService {

  async createHistory(email: {

    sent_by?: string | null;

    to_email: string;

    cc?: string;

    bcc?: string;

    subject: string;

    body: string;

    attachment_url?: string;

    status?: string;

  }) {

    const { data, error } =
      await supabase
        .from("email_history")
        .insert([
          {
            ...email,
            status:
              email.status || "SENT",
          },
        ])
        .select()
        .single();

    if (error) throw error;

    return data;

  }

  async getHistory() {

    const { data, error } =
      await supabase
        .from("email_history")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return data || [];

  }

}

export const emailHistoryService =
  new EmailHistoryService();