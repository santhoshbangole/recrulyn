import { candidateService }
from "../../candidates/services/candidate.service";
import { emailMessageService }
from "./email-message.service";
import { recrulynExtractorService }
from "../../recrulyn/services/recrulyn-extractor.service";
import { geminiResumeParserService }
from "../../recrulyn/services/geminiResumeParser.service";
import { profileService }
from "../../recrulyn/services/profile.service";
import { documentService }
from "../../documents/services/document.service";
import { classifyAttachment }
from "../../documents/utils/attachmentKind";
import { isDemoMode } from "../../demo/seed";

export interface EmailAttachment {
  filename: string;
  url: string;
  contentType?: string;
  kind?: "RESUME" | "ID_PROOF" | "ADDRESS_PROOF" | "PHOTO" | "OTHER";
}

export interface EmailMessage {
  id: string;
  sender: string;
  subject: string;
  receivedAt: string;
  hasAttachment: boolean;
  resumeUrl?: string | null;
  candidateName?: string | null;
  candidateEmail?: string | null;
  candidatePhone?: string | null;
  skills?: string | null;
  education?: string | null;
  experience?: string | null;
  projects?: string | null;
  certifications?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
  college?: string | null;
  degree?: string | null;
  cgpa?: string | null;
  location?: string | null;
  resumeText?: string | null;
  bodyText?: string | null;
  attachments?: EmailAttachment[];
  mailbox?: string | null;
  imapUid?: number | null;
  status: "NEW" | "IMPORTED";
}

/* ─────────────────────────────────────────────────────────────────────
   JOB-APPLICATION FILTER
   The mailbox this app syncs from is a shared/plain inbox, so it picks
   up everything — newsletters, OTPs, vendor mail, internal notices —
   not just candidate applications. HR should only see mail that (a)
   carries a resume-like attachment and (b) reads like someone applying
   for a role. Both the sync layer and the UI call isCandidateApplicationEmail
   so nothing unrelated ever reaches the inbox.
────────────────────────────────────────────────────────────────────── */

const APPLICATION_KEYWORDS = [
  "job application", "application for", "applying for", "apply for",
  "resume", "cv", "curriculum vitae", "job opening", "vacancy",
  "job opportunity", "career opportunity", "open position", "hiring",
  "interested in the position", "interested in this role", "interview",
  "candidature", "candidacy", "job vacancy", "job role", "profile for",
];

const NON_APPLICATION_KEYWORDS = [
  "unsubscribe", "newsletter", "invoice", "receipt", "otp", "one time password",
  "verification code", "password reset", "order confirmation", "no-reply",
  "noreply", "promo code", "discount", "% off", "webinar invite",
  "meeting invite", "calendar invite", "out of office", "subscription",
];

function hasResumeAttachment(email: {
  hasAttachment: boolean;
  resumeUrl?: string | null;
  resumeText?: string | null;
  attachments?: EmailAttachment[];
}): boolean {
  if (email.resumeUrl || email.resumeText) return true;
  const files = email.attachments || [];
  if (files.length) {
    return files.some(
      (file) => (file.kind || classifyAttachment(file.filename, file.contentType)) === "RESUME"
    );
  }
  // Attachments aren't fetched until the email is opened (see openEmail),
  // so at list time we trust the mail server's own "has attachment" flag.
  return Boolean(email.hasAttachment);
}

function looksLikeJobApplication(email: { subject?: string | null; bodyText?: string | null }): boolean {
  const text = `${email.subject || ""} ${email.bodyText || ""}`.toLowerCase();
  if (NON_APPLICATION_KEYWORDS.some((keyword) => text.includes(keyword))) return false;
  if (APPLICATION_KEYWORDS.some((keyword) => text.includes(keyword))) return true;
  // No explicit wording either way — fall back to the resume attachment alone.
  return true;
}

export function isCandidateApplicationEmail(email: EmailMessage): boolean {
  return hasResumeAttachment(email) && looksLikeJobApplication(email);
}

/* ── Role extraction ──────────────────────────────────────────────────
   Best-effort guess at the role a candidate applied for, read from the
   subject line (e.g. "Application — Frontend Developer | Jane Doe",
   "Applying for the Backend Engineer role"). Used to power the Inbox's
   "Role" filter so HR can narrow the list down to one opening. Returns
   null when no role can be confidently extracted.
────────────────────────────────────────────────────────────────────── */
export function extractRoleFromSubject(subject?: string | null): string | null {
  if (!subject) return null;
  const patterns: RegExp[] = [
    /application\s*[—\-:]\s*(.+?)\s*(?:\||$)/i,
    /(?:applying|apply)\s+for\s+(?:the\s+)?(.+?)\s+(?:position|role|opening|opportunity)\b/i,
    /application\s+for\s+(?:the\s+)?(.+?)\s*(?:position|role|opening)?\s*$/i,
    /for\s+the\s+role\s+of\s+(.+?)\s*$/i,
    /profile\s+for\s+(.+?)\s*$/i,
  ];
  for (const pattern of patterns) {
    const match = subject.match(pattern);
    if (match?.[1]) {
      const role = match[1].trim().replace(/^[-–—:|]+|[-–—:|]+$/g, "").trim();
      if (role && role.length <= 60) return role;
    }
  }
  return null;
}

function mapEmail(email: any): EmailMessage {
  const attachments = Array.isArray(email.attachments) ? email.attachments : [];
  return {
    id: email.id,
    sender: email.sender,
    subject: email.subject,
    receivedAt: email.received_at,
    hasAttachment: email.has_attachment || attachments.length > 0,
    resumeUrl: email.resume_url,
    candidateName: email.candidate_name,
    candidateEmail: email.candidate_email,
    candidatePhone: email.candidate_phone,
    skills: email.skills,
    education: email.education,
    experience: email.experience,
    projects: email.projects,
    certifications: email.certifications,
    linkedin: email.linkedin,
    github: email.github,
    portfolio: email.portfolio,
    college: email.college,
    degree: email.degree,
    cgpa: email.cgpa,
    location: email.location,
    resumeText: email.resume_text,
    bodyText: email.body_text,
    attachments,
    mailbox: email.mailbox,
    imapUid: email.imap_uid,
    status: email.status,
  };
}

class EmailService {
  async getInbox(): Promise<EmailMessage[]> {
    const data = await emailMessageService.getAll();
    return (data || []).map(mapEmail).filter(isCandidateApplicationEmail);
  }

  async syncInbox(): Promise<void> {
    if (isDemoMode()) return;

    const apiUrl = import.meta.env.VITE_EMAIL_API_URL;
    if (!apiUrl) {
      throw new Error("Email service is not configured. Set VITE_EMAIL_API_URL.");
    }

    const response = await fetch(`${apiUrl}/sync-inbox`, {
      method: "POST",
      signal: AbortSignal.timeout(130000),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || "Inbox sync failed.");
    }
  }

  async openEmail(email: EmailMessage): Promise<EmailMessage> {
    if (email.attachments?.length || email.resumeUrl) {
      return email;
    }

    const apiUrl = import.meta.env.VITE_EMAIL_API_URL;
    if (!apiUrl) {
      return email;
    }

    const response = await fetch(`${apiUrl}/open-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        receivedAt: email.receivedAt,
        mailbox: email.mailbox,
        imapUid: email.imapUid,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || "Could not open email attachments.");
    }

    return {
      ...email,
      bodyText: payload.bodyText || email.bodyText,
      resumeText: payload.resumeText || email.resumeText,
      attachments: payload.attachments?.length ? payload.attachments : email.attachments,
      resumeUrl: payload.resumeUrl || email.resumeUrl,
      hasAttachment: Boolean(payload.attachments?.length || email.hasAttachment),
    };
  }

  async storeTextFile(filename: string, text: string): Promise<EmailAttachment> {
    const apiUrl = import.meta.env.VITE_EMAIL_API_URL;
    if (!apiUrl) {
      throw new Error("Email service is not configured. Set VITE_EMAIL_API_URL.");
    }
    const response = await fetch(`${apiUrl}/store-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, text }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || "Could not store document text.");
    }
    return {
      filename: payload.filename || filename,
      url: payload.url,
      contentType: payload.contentType || "text/plain",
      kind: "RESUME",
    };
  }

  async saveAttachmentsToDocuments(email: EmailMessage, candidateId?: string) {
    let files = [...(email.attachments || [])];
    if (!files.length && email.resumeUrl) {
      files = [{
        filename: `${email.candidateName || "resume"}.pdf`,
        url: email.resumeUrl,
        kind: "RESUME",
      }];
    }

    const candidate = candidateId
      ? { id: candidateId, full_name: email.candidateName || email.sender }
      : await candidateService.findOrCreateCandidate({
          full_name: email.candidateName || email.sender,
          email: email.candidateEmail || email.sender,
          phone: email.candidatePhone || "",
          source: "EMAIL_AUTOMATION",
        });

    const hasResumeFile = files.some(
      (file) => (file.kind || classifyAttachment(file.filename, file.contentType)) === "RESUME"
    );
    if (!hasResumeFile && (email.resumeText || email.bodyText)) {
      files.push(
        await this.storeTextFile(
          `${candidate.full_name || email.sender}-resume-extract.txt`,
          email.resumeText || email.bodyText || ""
        )
      );
    }

    if (!files.length) {
      throw new Error("No resume, ID, address proof, or photo was found on this email.");
    }

    for (const file of files) {
      const kind = file.kind || classifyAttachment(file.filename, file.contentType);
      await documentService.saveSourceDocument({
        candidate_id: candidate.id,
        document_type: kind === "OTHER" ? "OTHER" : kind,
        document_url: file.url,
        file_name: file.filename,
        source_subject: email.subject,
      });
      if (kind === "RESUME") {
        await candidateService.attachExistingResume(
          candidate.id,
          file.url,
          file.filename
        ).catch(() => {});
      }
    }

    return { count: files.length, candidate };
  }

  async importCandidate(emailId: string) {
    const emails = await this.getInbox();
    let email = emails.find((item) => item.id === emailId);
    if (!email) throw new Error("Email not found");

    if (!email.resumeUrl && email.hasAttachment) {
      email = await this.openEmail(email);
    }

    let resumeText = email.resumeText || "";
    if (!resumeText && email.resumeUrl) {
      const extracted = await recrulynExtractorService.extractText(email.resumeUrl);
      resumeText = extracted.resumeText;
    }

    let parsed: any = null;
    if (resumeText) {
      try {
        parsed = await geminiResumeParserService.parseResume(resumeText);
      } catch (error) {
        console.warn("Resume parse skipped:", error);
      }
    }

    const candidate = await candidateService.findOrCreateCandidate({
      full_name:
        parsed?.candidate?.candidateName ||
        email.candidateName ||
        email.sender,
      email:
        parsed?.candidate?.email ||
        email.candidateEmail ||
        email.sender,
      phone: parsed?.candidate?.phone || email.candidatePhone || "",
      source: "EMAIL_AUTOMATION",
      linkedin: parsed?.candidate?.linkedin || email.linkedin || "",
      github: parsed?.candidate?.github || email.github || "",
      portfolio: parsed?.candidate?.portfolio || email.portfolio || "",
    });

    if (resumeText) {
      const existingProfile = await profileService.getProfile(candidate.id);
      if (!existingProfile) {
        await profileService.createProfile({
          candidate_id: candidate.id,
          resume_text: resumeText,
          skills: JSON.stringify(parsed?.candidate?.skills || email.skills || []),
          education: JSON.stringify(parsed?.candidate?.education || email.education || ""),
          experience: JSON.stringify(parsed?.candidate?.experience || email.experience || ""),
          projects: JSON.stringify(parsed?.candidate?.projects || email.projects || ""),
          certifications: JSON.stringify(
            parsed?.candidate?.certifications || email.certifications || ""
          ),
        });
      }
    }

    if (parsed?.analysis) {
      await profileService.updateAIAnalysis(candidate.id, parsed.analysis);
      if (parsed.analysis.resumeScore) {
        await candidateService.updateCandidateScore(
          candidate.id,
          parsed.analysis.resumeScore
        );
      }
    }

    await this.saveAttachmentsToDocuments(email, candidate.id);
    await emailMessageService.markImported(emailId);
    return candidate;
  }
}

export const emailService = new EmailService();