import { supabase } from "../../../services/supabase/client";
import { activityLogService }
from "../../candidates/services/activity-log.service";
import {
  generateNDATemplate,
} from "../templates/nda.template";
import { uploadVaultFile } from "./vault.service";
import {
  isIgnorableDbError,
  isUuid,
  localGeneratedDocumentStore,
} from "../../../lib/offline-store";
import { htmlToPdfBlob } from "../utils/htmlToPdf";

async function persistNDA(
  insertPayload: Record<string, unknown>
) {
  const candidateId = String(insertPayload.candidate_id || "");
  const localRow = localGeneratedDocumentStore.upsert(insertPayload);

  if (!isUuid(candidateId)) {
    try {
      await activityLogService.logActivity({
        candidate_id: candidateId,
        action: "NDA Generated",
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
      action: "NDA Generated",
    });
    return data;
  } catch (error) {
    if (isIgnorableDbError(error)) {
      try {
        await activityLogService.logActivity({
          candidate_id: candidateId,
          action: "NDA Generated",
        });
      } catch {
        /* activity log may be local-only */
      }
      return localRow;
    }
    throw error;
  }
}

export const ndaService = {
  async generateNDAPdf(
    candidate: any,
    requirement: any,
    ndaData: any
  ) {
    const html =
      generateNDATemplate({
        candidate_name:
          candidate.full_name,

        guardian_name:
          ndaData.guardian_name,

        area:
          ndaData.area,

        district:
          ndaData.district,

        state:
          ndaData.state,

        pincode:
          ndaData.pincode,

        internship_role:
          requirement.title,

        issue_date:
          new Date().toLocaleDateString(
            "en-GB",
            {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          ),
      });

    const currentDate =
      new Date();

    const monthYear =
      currentDate
        .toLocaleString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        )
        .replace(" ", "");

    const candidateName =
      candidate.full_name.replace(
        /\s+/g,
        "_"
      );

    const fileName =
      `RECRULYN_NDA_Intern_${candidateName}_${monthYear}.pdf`;
    const pdfBlob = await htmlToPdfBlob(html, fileName);
    return uploadVaultFile({
      file: pdfBlob,
      filename: fileName,
      category: "nda",
      contentType: "application/pdf",
    });
  },

  async createNDA(
    payload: {
      candidate_id: string;

      requirement_id:
        string | null;

      document_url: string;

      guardian_name: string;

      area: string;

      district: string;

      state: string;

      pincode: string;

      internship_role: string;
    }
  ) {
    return persistNDA({
      candidate_id: payload.candidate_id,
      requirement_id: payload.requirement_id,
      document_type: "NDA",
      document_url: payload.document_url,
      status: "GENERATED",
      approval_status: "PENDING_APPROVAL",
      internship_role: payload.internship_role,
      project_title: JSON.stringify({
        guardian_name: payload.guardian_name,
        area: payload.area,
        district: payload.district,
        state: payload.state,
        pincode: payload.pincode,
      }),
    });
  },
};