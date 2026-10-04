import { supabase } from "../../../services/supabase/client";
import { profileService } from "../../recrulyn/services/profile.service";
import { activityLogService } from "./activity-log.service";
import { geminiResumeParserService } from "../../recrulyn/services/geminiResumeParser.service";
import { recrulynExtractorService } from "../../recrulyn/services/recrulyn-extractor.service";
import { uploadVaultFile } from "../../documents/services/vault.service";
import {
  isIgnorableDbError,
  isOfflineFetchError,
  isUuid,
  localCandidateStore,
  pickAssignmentFields,
  toLocalFileUrl,
} from "../../../lib/offline-store";

function overlayAssignment(candidate: any) {
  const local = localCandidateStore.getById(candidate.id);
  if (!local) return candidate;
  return {
    ...candidate,
    ...pickAssignmentFields(local),
    full_name: local.full_name || candidate.full_name,
    resume_url: local.resume_url || candidate.resume_url,
  };
}

export const candidateService = {
  async getCandidates() {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) throw error;
      console.log("SUPABASE CANDIDATES:", data);
console.log("SUPABASE COUNT:", data?.length);

      const remote = (data || []).map(overlayAssignment);
      const local = localCandidateStore.list();
      const remoteIds = new Set(remote.map((c: any) => c.id));
      const onlyLocal = local.filter((c) => !remoteIds.has(c.id) && !c._overlay);
      const merged = [...onlyLocal, ...remote];
      return merged.length ? merged : local;
    } catch (error) {
      if (!isOfflineFetchError(error) && localCandidateStore.list().length === 0) throw error;
      return localCandidateStore.list();
    }
  },

  async createCandidate(payload: {
    full_name: string;
    email: string;
    phone?: string;
    job_id?: string;
    source?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    project_title?: string;
    job_title?: string;
    department?: string;
    supervisor?: string;
    manager?: string;
    joining_date?: string;
  }) {
    try {
      const { data: existing } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", payload.email)
        .maybeSingle();

      if (existing) {
        const extras = pickAssignmentFields(payload);
        if (Object.keys(extras).length) {
          localCandidateStore.update(existing.id, extras);
        }
        return this.getCandidateById(existing.id);
      }

      const { data, error } = await supabase
        .from("candidates")
        .insert([
          {
            full_name: payload.full_name,
            email: payload.email,
            phone: payload.phone,
            job_id: payload.job_id,
            source: payload.source,
            linkedin: payload.linkedin,
            github: payload.github,
            portfolio: payload.portfolio,
            status: "NEW",
            ai_score: 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const extras = pickAssignmentFields(payload);
      if (Object.keys(extras).length) {
        localCandidateStore.update(data.id, extras);
      }

      try {
        await activityLogService.logActivity({
          candidate_id: data.id,
          action: "Candidate Created",
          new_status: "NEW",
        });
      } catch {
        // ignore offline activity logging
      }

      return overlayAssignment(data);
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      return localCandidateStore.create(payload);
    }
  },

  async findOrCreateCandidate(payload: {
    full_name: string;
    email: string;
    phone?: string;
    job_id?: string;
    source?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  }) {
    return this.createCandidate(payload);
  },

  async updateCandidateScore(candidateId: string, score: number) {
    localCandidateStore.update(candidateId, { ai_score: score });
    if (!isUuid(candidateId)) {
      return localCandidateStore.getById(candidateId);
    }
    try {
      const { data, error } = await supabase
        .from("candidates")
        .update({
          ai_score: score,
        })
        .eq("id", candidateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
      return localCandidateStore.update(candidateId, { ai_score: score });
    }
  },
    async assignCandidateToRequirement(
    candidateId: string,
    requirementId: string
  ) {
    localCandidateStore.update(candidateId, {
      job_id: requirementId,
    });

    if (!isUuid(candidateId)) {
      return localCandidateStore.getById(candidateId);
    }

    try {
      const { data, error } = await supabase
        .from("candidates")
        .update({
          job_id: requirementId,
        })
        .eq("id", candidateId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
      return localCandidateStore.update(candidateId, {
        job_id: requirementId,
      });
    }
  },

  async uploadResume(candidateId: string, file: File) {
    let publicUrl = toLocalFileUrl(file);

    console.log("[resume-upload] candidateId =", candidateId, "isUuid =", isUuid(candidateId));
    if (isUuid(candidateId)) {
      try {
        const fileName = `${Date.now()}-${file.name}`;
        publicUrl = await uploadVaultFile({
          file,
          filename: fileName,
          category: "resume",
          contentType: file.type || "application/octet-stream",
        });
      } catch (error) {
  console.error("RESUME STORAGE UPLOAD FAILED:", error);
  throw new Error("Resume upload failed. Please try again.");
}
    }

    await this.attachExistingResume(candidateId, publicUrl, file.name);

    try {
      const extracted = (await recrulynExtractorService.extractText(file))!;
      if (extracted?.resumeText?.trim()) {
        const parsed = await geminiResumeParserService.parseResume(
          extracted.resumeText
        );
        console.log("CREATING CANDIDATE PROFILE:", candidateId);
        await profileService.createProfile({
          candidate_id: candidateId,
          resume_text: extracted.resumeText,
          skills: JSON.stringify(parsed?.candidate?.skills || []),
          education: JSON.stringify(parsed?.candidate?.education || []),
          experience: JSON.stringify(parsed?.candidate?.experience || []),
          projects: JSON.stringify(parsed?.candidate?.projects || []),
          certifications: JSON.stringify(parsed?.candidate?.certifications || []),
        });
      }
    } catch (parseError) {
      console.warn("Resume parsed file saved, AI parse skipped", parseError);
    }

    return publicUrl;
  },

  async renameCandidate(candidateId: string, fullName: string) {
    const name = fullName.trim();
    if (!name) throw new Error("Name is required");
    localCandidateStore.update(candidateId, { full_name: name });
    if (!isUuid(candidateId)) {
      return this.getCandidateById(candidateId);
    }
    try {
      const { error } = await supabase
        .from("candidates")
        .update({ full_name: name, updated_at: new Date().toISOString() })
        .eq("id", candidateId);
      if (error && !isIgnorableDbError(error)) throw error;
    } catch (error) {
      if (!isIgnorableDbError(error)) {
        // stay local
      }
    }
    return this.getCandidateById(candidateId);
  },

  async deleteCandidates(candidateIds: string[]) {
    const ids = [...new Set(candidateIds.filter(Boolean))];
    if (!ids.length) return;
    localCandidateStore.removeMany(ids);
    const remoteIds = ids.filter(isUuid);
    if (!remoteIds.length) return;
    try {
      const { error } = await supabase.from("candidates").delete().in("id", remoteIds);
      if (error && !isIgnorableDbError(error)) throw error;
    } catch (error) {
      if (!isIgnorableDbError(error)) {
        // keep local delete
      }
    }
  },


  async updateCandidateStatus(candidateId: string, status: string) {
    if (!isUuid(candidateId)) {
      return localCandidateStore.update(candidateId, { status });
    }
    try {
      const existing = await this.getCandidateById(candidateId);
      const oldStatus = existing.status;

      const { data, error } = await supabase
        .from("candidates")
        .update({
          status,
        })
        .eq("id", candidateId)
        .select()
        .single();

      if (error) throw error;

      try {
        await activityLogService.logActivity({
          candidate_id: candidateId,
          action: "Status Changed",
          old_status: oldStatus,
          new_status: status,
        });
      } catch {
        // ignore
      }

      return data;
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      return localCandidateStore.update(candidateId, { status });
    }
  },

  async attachExistingResume(
    candidateId: string,
    resumeUrl: string,
    fileName: string
  ) {
    localCandidateStore.update(candidateId, {
      resume_url: resumeUrl,
      resume_file_name: fileName,
    });

    if (!isUuid(candidateId)) return;

    try {
      const { error: candidateError } = await supabase
        .from("candidates")
        .update({
          resume_url: resumeUrl,
        })
        .eq("id", candidateId);

      if (candidateError && !isIgnorableDbError(candidateError)) {
        throw candidateError;
      }
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
    }

    try {
      const { error: documentError } = await supabase
        .from("candidate_documents")
        .insert([
          {
            candidate_id: candidateId,
            file_name: fileName,
            document_type: "resume",
            file_url: resumeUrl,
          },
        ]);

      if (documentError && !isIgnorableDbError(documentError)) {
        throw documentError;
      }
    } catch (error) {
      if (!isIgnorableDbError(error)) throw error;
    }
  },

  async getCandidateById(candidateId: string) {
    if (!isUuid(candidateId)) {
      const local = localCandidateStore.getById(candidateId);
      if (local) return overlayAssignment(local);
      throw new Error("Candidate not found");
    }
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (error) throw error;
      return overlayAssignment(data);
    } catch (error) {
      const local = localCandidateStore.getById(candidateId);
      if (local) return local;
      if (!isOfflineFetchError(error)) throw error;
      throw error;
    }
  },

  async getCandidatesForAI() {
    try {
      const { data: candidates, error } = await supabase
        .from("candidates")
        .select("*");

      if (error) throw error;

      const result = await Promise.all(
        (candidates || []).map(async (candidate) => {
          const { data: profile } = await supabase
            .from("candidate_profiles")
            .select("*")
            .eq("candidate_id", candidate.id)
            .maybeSingle();

          return {
            ...candidate,
            candidate_profiles: profile ? [profile] : [],
          };
        })
      );

      return result;
    } catch (error) {
      if (!isOfflineFetchError(error)) throw error;
      return localCandidateStore.list().map((c) => ({
        ...c,
        candidate_profiles: [],
      }));
    }
  },

  async assignPartnerOrg(candidateId: string, partnerOrgId: string | null) {
    const { data, error } = await supabase
      .from("candidates")
      .update({ partner_org_id: partnerOrgId })
      .eq("id", candidateId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async moveToInterview(candidateId: string) {
    return this.updateCandidateStatus(candidateId, "INTERVIEW");
  },
};
