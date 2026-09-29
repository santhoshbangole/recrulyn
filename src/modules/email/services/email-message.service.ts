import { supabase } from "../../../services/supabase/client";
import { getDemoEmails, isDemoMode } from "../../demo/seed";

export const emailMessageService = {
  async getAll() {
    if (isDemoMode()) {
      return getDemoEmails();
    }

    try {
    const { data, error } = await supabase
      .from("email_messages")
      .select("*")
      .order("received_at", {
        ascending: false,
      });

    if (error) throw error;

    const unique = [];
    const seen = new Set<string>();
    for (const email of data || []) {
      const key = `${email.sender}|${email.subject}|${email.received_at}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(email);
    }

    return unique;
    } catch (error) {
      console.error("getAll email_messages error:", error);
      return [];
    }
  },

  async markImported(
    emailId: string
  ) {
    if (isDemoMode()) return;
    const { error } =
      await supabase
        .from("email_messages")
        .update({
          status: "IMPORTED",
        })
        .eq("id", emailId);

    if (error) throw error;
  },
};