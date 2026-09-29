import "../loadEnv.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitize(value, fallback = "") {
  if (value == null) return fallback;
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item)).filter(Boolean).join(", ");
  }
  return String(value).replace(/\u0000/g, "").trim();
}

export async function saveEmailMessage({
  sender,
  subject,
  receivedAt,
  hasAttachment,
  resumeUrl,
  candidate,
  resumeText,
  bodyText,
  attachments,
  mailbox,
  imapUid,
  messageId,
}) {
  const skills = candidate?.skills;
  const payload = {
    sender: sanitize(sender),
    subject: sanitize(subject, "No Subject"),
    received_at: receivedAt
      ? new Date(receivedAt).toISOString()
      : new Date().toISOString(),
    has_attachment: Boolean(hasAttachment),
    resume_url: resumeUrl || null,
    candidate_name: sanitize(candidate?.name),
    candidate_email: sanitize(candidate?.email),
    candidate_phone: sanitize(candidate?.phone),
    skills: Array.isArray(skills) ? sanitize(skills) : sanitize(skills),
    education: sanitize(candidate?.education),
    experience: sanitize(candidate?.experience),
    projects: sanitize(candidate?.projects),
    certifications: sanitize(candidate?.certifications),
    linkedin: sanitize(candidate?.linkedin),
    github: sanitize(candidate?.github),
    portfolio: sanitize(candidate?.portfolio),
    college: sanitize(candidate?.college),
    degree: sanitize(candidate?.degree),
    cgpa: sanitize(candidate?.cgpa),
    location: sanitize(candidate?.location),
    resume_text: sanitize(resumeText),
    body_text: sanitize(bodyText),
    attachments: Array.isArray(attachments) ? attachments : [],
    mailbox: mailbox || null,
    imap_uid: imapUid || null,
    message_id: sanitize(messageId) || null,
    status: "NEW",
  };

  console.log("saveEmailMessage", {
    sender: payload.sender,
    subject: payload.subject,
    receivedAt: payload.received_at,
    hasAttachment: payload.has_attachment,
    resumeUrl: payload.resume_url,
    attachmentCount: payload.attachments.length,
    messageId: payload.message_id,
  });

  // Message-ID is a globally unique identifier assigned by the sending
  // mail server — the most reliable way to recognize "this is the same
  // email" regardless of IMAP UID quirks (UIDVALIDITY resets, re-syncs,
  // moving between folders, etc). Check it first when available.
  if (payload.message_id) {
    const { data: byMessageId } = await supabase
      .from("email_messages")
      .select("id")
      .eq("message_id", payload.message_id)
      .limit(1);

    if (byMessageId?.length) {
      await updateEmailContent(byMessageId[0].id, {
        resumeUrl: payload.resume_url,
        resumeText: payload.resume_text,
        bodyText: payload.body_text,
        attachments: payload.attachments,
        mailbox: payload.mailbox,
        imapUid: payload.imap_uid,
      });
      console.log("Email already in email_messages (by Message-ID), updated attachments");
      return;
    }
  }

  // Fallback for the rare email that arrives without a Message-ID header.
  const { data: existing } = await supabase
    .from("email_messages")
    .select("id")
    .eq("sender", payload.sender)
    .eq("subject", payload.subject)
    .eq("received_at", payload.received_at)
    .limit(1);

  if (existing?.length) {
    await updateEmailContent(existing[0].id, {
      resumeUrl: payload.resume_url,
      resumeText: payload.resume_text,
      bodyText: payload.body_text,
      attachments: payload.attachments,
      mailbox: payload.mailbox,
      imapUid: payload.imap_uid,
    });
    console.log("Email already in email_messages, updated attachments");
    return;
  }

  const { error } = await supabase.from("email_messages").insert(payload);

  if (error?.code === "23505") {
    console.log("Email already in email_messages, skipping insert");
    return;
  }

  if (error) {
    console.error("Supabase Insert Error:", error);
    throw error;
  }

  console.log("Email inserted into email_messages");
}

export async function updateEmailContent(id, {
  resumeUrl,
  resumeText,
  bodyText,
  attachments,
  mailbox,
  imapUid,
}) {
  const patch = {};
  if (resumeUrl) patch.resume_url = resumeUrl;
  if (resumeText) patch.resume_text = sanitize(resumeText);
  if (bodyText) patch.body_text = sanitize(bodyText);
  if (Array.isArray(attachments)) patch.attachments = attachments;
  if (mailbox) patch.mailbox = mailbox;
  if (imapUid) patch.imap_uid = imapUid;
  if (attachments?.length) patch.has_attachment = true;
  if (!Object.keys(patch).length) return;

  const { error } = await supabase.from("email_messages").update(patch).eq("id", id);
  if (error) {
    console.error("Supabase Update Error:", error);
    throw error;
  }
}