import { supabase } from "../../../services/supabase/client";

export const documentApprovalService = {
  async getPendingDocuments() {
    const { data, error } =
      await supabase
        .from("generated_documents")
        .select("*")
        .eq(
          "approval_status",
          "PENDING_APPROVAL"
        )
        .order("created_at", {
          ascending: false,
        });

    if (error) throw error;

    return data || [];
  },

  async approveDocument(
    documentId: string,
    officerId: string
  ) {
    const { data, error } =
      await supabase
        .from("generated_documents")
        .update({
          approval_status:
            "APPROVED",

          approved_by:
            officerId,

          approved_at:
            new Date()
              .toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

    if (error) throw error;

    return data;
  },

  async rejectDocument(
    documentId: string,
    remarks: string
  ) {
    const { data, error } =
      await supabase
        .from("generated_documents")
        .update({
          approval_status:
            "REJECTED",

          remarks,
        })
        .eq("id", documentId)
        .select()
        .single();

    if (error) throw error;

    return data;
  },
};