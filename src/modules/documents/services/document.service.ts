import { supabase } from "../../../services/supabase/client";
import { loaSettingsService }
from "./loa-settings.service";
import {
  generateLOATemplate,
} from "../templates/loa.template";
import { activityLogService }
from "../../candidates/services/activity-log.service";
import {
  generateCertificateTemplate,
} from "../templates/certificate.template";
import {
  generateLORTemplate,
} from "../templates/lor.template";
import {
  generateLOCTemplate,
} from "../templates/loc.template";
import { uploadVaultFile } from "./vault.service";
import { getDemoDocuments, isDemoMode } from "../../demo/seed";
import {
  isIgnorableDbError,
  isUuid,
  localGeneratedDocumentStore,
} from "../../../lib/offline-store";
import { htmlToPdfBlob } from "../utils/htmlToPdf";

async function storeGeneratedPdf(
  fileName: string,
  pdfBlob: Blob,
  category: "loa" | "certificate" | "lor" | "loc"
) {
  return uploadVaultFile({
    file: pdfBlob,
    filename: fileName,
    category,
    contentType: "application/pdf",
  });
}

function mergeDocuments(primary: any[], secondary: any[]) {
  const map = new Map<string, any>();
  for (const doc of [...secondary, ...primary]) {
    if (doc?.id) map.set(doc.id, doc);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(b.created_at || 0).getTime() -
      new Date(a.created_at || 0).getTime()
  );
}

async function persistGeneratedDocument(
  insertPayload: Record<string, unknown>,
  activityAction: string
) {
  const candidateId = String(insertPayload.candidate_id || "");
  const localRow = localGeneratedDocumentStore.upsert(insertPayload);

  if (!isUuid(candidateId)) {
    try {
      await activityLogService.logActivity({
        candidate_id: candidateId,
        action: activityAction,
      });
    } catch {
      /* activity log may be local-only */
    }
    return localRow;
  }

  try {
    const { data, error } = await supabase
      .from("generated_documents")
      .insert([insertPayload])
      .select()
      .single();
    if (error) throw error;
    await activityLogService.logActivity({
      candidate_id: candidateId,
      action: activityAction,
    });
    return data;
  } catch (error) {
    if (isIgnorableDbError(error)) {
      try {
        await activityLogService.logActivity({
          candidate_id: candidateId,
          action: activityAction,
        });
      } catch {
        /* activity log may be local-only */
      }
      return localRow;
    }
    throw error;
  }
}

function matchesCandidateDocument(
  doc: any,
  candidateId: string,
  types: string[],
  email?: string
) {
  const type = String(doc?.document_type || "").toUpperCase();
  if (!types.includes(type)) return false;
  if (doc?.candidate_id && doc.candidate_id === candidateId) return true;
  const docEmail = String(doc?.candidates?.email || "").toLowerCase();
  if (email && docEmail && docEmail === email.toLowerCase()) return true;
  return false;
}

function documentTypesFor(kind: string) {
  const type = String(kind || "").toUpperCase();
  if (type === "CERTIFICATE" || type === "COMPLETION_CERTIFICATE") {
    return ["CERTIFICATE", "COMPLETION_CERTIFICATE"];
  }
  return [type];
}

export const documentService = {
  async findCandidateDocument(
    candidateId: string,
    kind: string,
    email?: string
  ) {
    const local = this.findLocalCandidateDocument(candidateId, kind, email);
    if (local) return local;

    if (!isUuid(candidateId)) return null;

    const types = documentTypesFor(kind);
    try {
      const { data, error } = await supabase
        .from("generated_documents")
        .select("*")
        .eq("candidate_id", candidateId)
        .in("document_type", types)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data?.[0] || null;
    } catch {
      return null;
    }
  },

  findLocalCandidateDocument(
    candidateId: string,
    kind: string,
    email?: string
  ) {
    const types = documentTypesFor(kind);
    const local = localGeneratedDocumentStore
      .list()
      .filter((doc: any) => matchesCandidateDocument(doc, candidateId, types, email));
    const demo = getDemoDocuments().filter((doc: any) =>
      matchesCandidateDocument(doc, candidateId, types, email)
    );
    return [...local, ...demo].find((doc: any) => doc?.document_url) || null;
  },

  async getDocuments() {
  const localDocs = localGeneratedDocumentStore.list();

  if (isDemoMode()) {
    return mergeDocuments(getDemoDocuments(), localDocs);
  }

  try {
  const { data, error } =
    await supabase
      .from("generated_documents")
      .select(`
        *,
        candidates (
          id,
          full_name,
          email,
          partner_org_id
        ),
        partner_organizations (
          id,
          name,
          org_type
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  if (error) throw error;

  return mergeDocuments(data || [], localDocs);
  } catch {
    return mergeDocuments(getDemoDocuments(), localDocs);
  }
},

  
async generateLOAPdf(
  candidate: any,
  requirement: any,
  loaData: any
) {
  const settings =
    await loaSettingsService.getSettings();
console.log(
  "LOA DATA",
  loaData
);

console.log(
  "SIGNATURE URL",
  loaData.signature_url
);console.log(
  "FINAL SIGNATURE URL:",
  loaData.signature_url
);

console.log("HEADER IMAGE:", settings.header_image_url);

  const html =
    generateLOATemplate({
      candidate_name:
        candidate.full_name,

      internship_drive:
        loaData.internship_drive,

      internship_role:
        requirement.title,

      internship_type:
        loaData.internship_type,

      department:
        requirement.department,

      start_date:
  new Date(
    loaData.start_date
  ).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ),

end_date:
  new Date(
    loaData.end_date
  ).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ),

      work_mode:
        loaData.work_mode,

      working_hours:
        loaData.working_hours,

      project_title:
        loaData.project_title,

      issue_date:
        new Date().toLocaleDateString(),

      officer_name:
        loaData.officer_name,

      officer_designation:
        loaData.officer_designation,

      officer_phone:
        loaData.officer_phone,

      officer_email:
        loaData.officer_email,

  logo_url:
  settings.logo_url ||
  "/Logo-Monogram.png",


headerImage: "/header.png",

seal_url:
  settings.seal_url ||
  "/reude-seal.png",

signature_url:
  loaData.signature_url || "",
    });

 const currentDate = new Date();

const monthYear =
  currentDate.toLocaleString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  ).replace(" ", "");

const candidateName =
  candidate.full_name
    .replace(/\s+/g, "_");

  const fileName =
  `RECRULYN_Internship_Acceptance_Letter_${candidateName}_${monthYear}_${Date.now()}.pdf`;
  const pdfBlob = await htmlToPdfBlob(html, fileName);

  return storeGeneratedPdf(fileName, pdfBlob, "loa");
},async generateCertificatePdf(
  certificateData: any
) {
  const settings =
    await loaSettingsService.getSettings();

  const html =
    generateCertificateTemplate({
      ...certificateData,

      logo_url:
        settings.logo_url,

      seal_url:
        settings.seal_url,
    });

  const fileName =
    `RECRULYN_Certificate_${certificateData.candidate_name}_${Date.now()}.pdf`;

  const pdfBlob = await htmlToPdfBlob(html, fileName);

  return storeGeneratedPdf(fileName, pdfBlob, "certificate");
},
async generateLORPdf(
lorData: any
) {
const html =
generateLORTemplate(
lorData
);

const fileName =
`RECRULYN_LOR_${lorData.candidate_name}_${Date.now()}.pdf`;

const pdfBlob = await htmlToPdfBlob(html, fileName);

return storeGeneratedPdf(fileName, pdfBlob, "lor");
},

async generateLOCPdf(
  locData: any
) {
  const settings =
    await loaSettingsService.getSettings();

  const html =
    generateLOCTemplate({
      ...locData,

      logo_url:
        settings.logo_url,

      seal_url:
        settings.seal_url,
    });

  const fileName =
    `RECRULYN_LOC_${locData.candidate_name}_${Date.now()}.pdf`;

  const pdfBlob = await htmlToPdfBlob(html, fileName);

  return storeGeneratedPdf(fileName, pdfBlob, "loc");
},

async createLOR(
  payload: {
    candidate_id: string;
    document_url: string;
    role_name: string;
    project_name: string;
    officer_name: string;
    officer_designation: string;
  }
) {
  return persistGeneratedDocument(
    {
      candidate_id: payload.candidate_id,
      document_type: "LOR",
      document_url: payload.document_url,
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      internship_role: payload.role_name,
      project_title: payload.project_name,
      officer_name: payload.officer_name,
      officer_designation: payload.officer_designation,
    },
    "LOR Generated"
  );
},
async createLOC(
  payload: {
    candidate_id: string;
    document_url: string;

    role_name: string;
    department: string;
    joining_date: string;
    reporting_manager: string;

    officer_name: string;
    officer_designation: string;
  }
) {
  return persistGeneratedDocument(
    {
      candidate_id: payload.candidate_id,
      document_type: "LOC",
      document_url: payload.document_url,
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      internship_role: payload.role_name,
      department: payload.department,
      start_date: payload.joining_date,
      officer_name: payload.officer_name,
      officer_designation: payload.officer_designation,
    },
    "LOC Generated"
  );
},
async createLOA(payload: {
  candidate_id: string;
  requirement_id: string | null;
  document_url: string;

  internship_drive: string;
  internship_role: string;
  internship_type: string;
  department: string;
  start_date: string;
  end_date: string;
  work_mode: string;
  working_hours: string;
  project_title: string;

  officer_name: string;
  officer_designation: string;
  officer_email: string;
  officer_phone: string;
  approval_officer?: string;
approval_officer_id?: string;
}) {
  return persistGeneratedDocument(
    {
      candidate_id: payload.candidate_id,
      requirement_id: payload.requirement_id,
      document_type: "LOA",
      document_url: payload.document_url,
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      internship_drive: payload.internship_drive,
      internship_role: payload.internship_role,
      internship_type: payload.internship_type,
      department: payload.department,
      start_date: payload.start_date,
      end_date: payload.end_date,
      work_mode: payload.work_mode,
      working_hours: payload.working_hours,
      project_title: payload.project_title,
      officer_name: payload.officer_name,
      officer_designation: payload.officer_designation,
      officer_email: payload.officer_email,
      officer_phone: payload.officer_phone,
      approval_officer: payload.approval_officer,
      approval_officer_id: payload.approval_officer_id,
    },
    "LOA Generated"
  );
  },
  async createCertificate(
  payload: {
    candidate_id: string;
    document_url: string;
    role_name: string;
    project_name: string;
    start_date: string;
    end_date: string;
    officer_name: string;
    officer_designation: string;
  }
) {
  return persistGeneratedDocument(
    {
      candidate_id: payload.candidate_id,
      document_type: "COMPLETION_CERTIFICATE",
      document_url: payload.document_url,
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      internship_role: payload.role_name,
      project_title: payload.project_name,
      start_date: payload.start_date,
      end_date: payload.end_date,
      officer_name: payload.officer_name,
      officer_designation: payload.officer_designation,
    },
    "Certificate Generated"
  );
},
  async saveSourceDocument(payload: {
    candidate_id: string | null;
    document_type: "RESUME" | "ID_PROOF" | "ADDRESS_PROOF" | "PHOTO" | "OTHER";
    document_url: string;
    file_name: string;
    source_subject?: string;
  }) {
    const { data: existing } = await supabase
      .from("generated_documents")
      .select("id")
      .eq("document_url", payload.document_url)
      .limit(1);
    if (existing?.length) return existing[0];

    let partnerOrgId: string | null = null;
    if (payload.candidate_id) {
      const { data: candidate } = await supabase
        .from("candidates")
        .select("partner_org_id")
        .eq("id", payload.candidate_id)
        .maybeSingle();
      partnerOrgId = candidate?.partner_org_id || null;
    }

    const { data, error } = await supabase
      .from("generated_documents")
      .insert([
        {
          candidate_id: payload.candidate_id,
          partner_org_id: partnerOrgId,
          document_type: payload.document_type,
          document_url: payload.document_url,
          status: "GENERATED",
          approval_status: "APPROVED",
          internship_role: payload.file_name,
          project_title: payload.source_subject || "Email attachment",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async updateDocument(
    documentId: string,
    patch: {
      document_type?: string;
      candidate_id?: string | null;
      partner_org_id?: string | null;
    }
  ) {
    const { data, error } = await supabase
      .from("generated_documents")
      .update(patch)
      .eq("id", documentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async deleteDocument(documentId: string) {
    if (!isUuid(documentId)) {
      // This document only exists in the browser's local fallback store
      // (created before Supabase was reachable) — nothing to delete server-side.
      localGeneratedDocumentStore.remove(documentId);
      return;
    }
    const { error } = await supabase
      .from("generated_documents")
      .delete()
      .eq("id", documentId);
    if (error) throw error;
    // Also clear it locally in case it was cached there too.
    localGeneratedDocumentStore.remove(documentId);
  },
  async assignCandidateDocumentsToOrg(candidateId: string, partnerOrgId: string | null) {
    const { error } = await supabase
      .from("generated_documents")
      .update({ partner_org_id: partnerOrgId })
      .eq("candidate_id", candidateId);
    if (error) throw error;
  },
  async markNDASigned(
  documentId: string
) {
  const { error } =
    await supabase
      .from("generated_documents")
      .update({
        is_signed: true,
        signed_at:
          new Date().toISOString(),
      })
      .eq("id", documentId);

  if (error) throw error;
}
};