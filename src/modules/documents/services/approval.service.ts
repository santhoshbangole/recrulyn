import { supabase } from "../../../services/supabase/client";
import {
  getDemoDocuments,
  getLocalCandidates,
  isDemoMode,
  updateDemoDocument,
} from "../../demo/seed";
import { isIgnorableDbError, isUuid, localGeneratedDocumentStore } from "../../../lib/offline-store";
import { uploadVaultFile } from "./vault.service";

const LOA_HTML_PREVIEW = "/generated/rajesh-kumar-loa.html";

const DEMO_LOA_DEFAULTS = {
  internship_drive: "Campus Hiring 2026",
  internship_type: "Internship",
  work_mode: "Hybrid",
  working_hours: "40 hours / week",
  officer_name: "Reginald",
  officer_designation: "Managing Director",
  officer_email: "reginald@reude.tech",
  officer_phone: "+65 9123 4567",
};

function resolveLoaPreviewUrl(url: string | undefined | null) {
  const value = String(url || "").trim();
  if (!value || value.startsWith("blob:")) return LOA_HTML_PREVIEW;
  return value;
}

function docCompletenessScore(doc: any) {
  let score = 0;
  if (String(doc.id || "").startsWith("demo-doc-")) score += 20;
  if (doc.candidate_name && doc.candidate_name !== "Unknown Candidate") score += 10;
  if (doc.document_url && !String(doc.document_url).startsWith("blob:")) score += 5;
  if (doc.internship_role) score += 2;
  if (doc.start_date) score += 2;
  return score;
}

function enrichApprovalDoc(raw: any) {
  const candidates = getLocalCandidates();
  const match = candidates.find((c) => c.id === raw.candidate_id);
  const nested = raw.candidates;

  const candidate_name =
    nested?.full_name || raw.candidate_name || match?.full_name || "Unknown Candidate";

  return {
    ...DEMO_LOA_DEFAULTS,
    ...raw,
    candidate_name,
    candidate_email: nested?.email || raw.candidate_email || match?.email,
    candidate_phone: nested?.phone || raw.candidate_phone || match?.phone,
    internship_role: raw.internship_role || match?.job_title,
    department: raw.department || match?.department,
    project_title: raw.project_title || match?.project_title,
    start_date: raw.start_date || match?.joining_date,
    end_date: raw.end_date || match?.end_date,
    candidates:
      nested ||
      (match
        ? { full_name: match.full_name, email: match.email, phone: match.phone }
        : undefined),
    document_url: resolveLoaPreviewUrl(raw.document_url),
  };
}

function mapApprovalDoc(doc: any) {
  return enrichApprovalDoc(doc);
}

function listDemoLoas() {
  const merged = [...getDemoDocuments(), ...localGeneratedDocumentStore.list()];
  const byKey = new Map<string, any>();

  for (const doc of merged) {
    if (!doc?.id) continue;
    const enriched = enrichApprovalDoc(doc);
    const key = enriched.id;
    const existing = byKey.get(key);
    if (!existing || docCompletenessScore(enriched) > docCompletenessScore(existing)) {
      byKey.set(key, enriched);
    }
  }

  return Array.from(byKey.values())
    .filter((doc: any) => doc.candidate_id || (doc.candidate_name && doc.candidate_name !== "Unknown Candidate"))
    .sort(
    (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  );
}

function statsFromLoas(loas: any[]) {
  return {
    pending: loas.filter((d) => d.approval_status === "PENDING_APPROVAL").length,
    approved: loas.filter((d) => d.approval_status === "APPROVED").length,
    rejected: loas.filter((d) => d.approval_status === "REJECTED").length,
  };
}

export function normalizeApprovalFilter(status?: string) {
  const value = String(status || "").toUpperCase();
  if (value === "PENDING_APPROVAL" || value === "PENDING") return "pending";
  if (value === "APPROVED") return "approved";
  if (value === "REJECTED") return "rejected";
  return value.toLowerCase();
}

export const approvalService = {
  async getManagementLOAs() {
    if (isDemoMode()) return listDemoLoas();

    try {
      const { data, error } = await supabase
        .from("generated_documents")
        .select(`
          *,
          candidates(
            full_name,
            email,
            phone
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const mapped = (data || []).map(mapApprovalDoc);
      return mapped.length ? mapped : listDemoLoas();
    } catch {
      return listDemoLoas();
    }
  },

  async getPendingLOAs() {
    const all = await this.getManagementLOAs();
    return all.filter((doc: any) => doc.approval_status === "PENDING_APPROVAL");
  },

  async getLOAById(documentId: string) {
    const all = await this.getManagementLOAs();
    return all.find((doc: any) => doc.id === documentId) || null;
  },

  async getDocumentById(documentId: string) {
    return this.getLOAById(documentId);
  },

  async approveDocument(documentId: string, signatureUrl: string) {
    if (isDemoMode() || !isUuid(documentId)) {
      updateDemoDocument(documentId, {
        approval_status: "APPROVED",
        signature_url: signatureUrl,
        approved_at: new Date().toISOString(),
      });
      return;
    }

    const { error } = await supabase
      .from("generated_documents")
      .update({
        approval_status: "APPROVED",
        signature_url: signatureUrl,
        approved_at: new Date(),
      })
      .eq("id", documentId);

    if (error && !isIgnorableDbError(error)) throw error;
  },

  async uploadSignature(file: File) {
    const fileName = `signature-${Date.now()}.png`;
    return uploadVaultFile({
      file,
      filename: fileName,
      category: "signature",
      contentType: file.type || "image/png",
    });
  },

  async updateDocumentUrl(documentId: string, documentUrl: string) {
    if (isDemoMode() || !isUuid(documentId)) {
      updateDemoDocument(documentId, { document_url: documentUrl });
      return;
    }

    const { error } = await supabase
      .from("generated_documents")
      .update({ document_url: documentUrl })
      .eq("id", documentId);

    if (error && !isIgnorableDbError(error)) throw error;
  },

  async rejectDocument(documentId: string) {
    if (isDemoMode() || !isUuid(documentId)) {
      updateDemoDocument(documentId, { approval_status: "REJECTED" });
      return;
    }

    const { error } = await supabase
      .from("generated_documents")
      .update({ approval_status: "REJECTED" })
      .eq("id", documentId);

    if (error && !isIgnorableDbError(error)) throw error;
  },

  async getApprovalStats() {
    if (isDemoMode()) return statsFromLoas(listDemoLoas());

    try {
      const { data, error } = await supabase
        .from("generated_documents")
        .select("approval_status");

      if (error) throw error;
      if (!data?.length) return statsFromLoas(listDemoLoas());
      return statsFromLoas(data);
    } catch {
      return statsFromLoas(listDemoLoas());
    }
  },
};