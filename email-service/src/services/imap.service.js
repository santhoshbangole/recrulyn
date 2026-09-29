import "../loadEnv.js";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { uploadFile } from "./storage.service.js";
import { filterUnprocessed, markProcessed } from "./processedEmail.service.js";
import { extractResumeText } from "./resumeParser.service.js";
import { extractCandidateDetails } from "./candidateExtractor.service.js";
import { saveEmailMessage } from "./emailMessage.service.js";
import { classifyAttachment } from "./attachmentKind.js";

const HR_ALIAS = (process.env.EMAIL_FROM || "hr@reude.tech").toLowerCase();
const SYNC_DAYS = Number(process.env.IMAP_SYNC_DAYS || 21);

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function subjectsMatch(left, right) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function guessFilename(attachment) {
  if (attachment?.filename) return attachment.filename;
  const type = (attachment?.contentType || "").toLowerCase();
  if (type.includes("pdf")) return "attachment.pdf";
  if (type.includes("wordprocessingml") || type.includes("msword")) return "attachment.docx";
  if (type.startsWith("image/jpeg")) return "photo.jpg";
  if (type.startsWith("image/png")) return "photo.png";
  if (type.startsWith("image/")) return "photo.jpg";
  return "attachment.bin";
}

function isLogoOrTracking(filename) {
  return /logo|banner|icon|facebook|twitter|linkedin|instagram|pixel|tracking/.test(
    String(filename || "").toLowerCase()
  );
}

function isStoredAttachment(attachment) {
  const filename = guessFilename(attachment);
  const type = (attachment?.contentType || "").toLowerCase();
  if (isLogoOrTracking(filename)) return false;
  if (
    attachment?.contentDisposition === "inline" &&
    type.startsWith("image/") &&
    !/photo|id|aadhar|aadhaar|passport|address/.test(filename.toLowerCase())
  ) {
    return false;
  }
  if (/\.(pdf|docx?|jpe?g|png|webp)$/i.test(filename)) return true;
  return (
    type.includes("pdf") ||
    type.includes("officedocument") ||
    type.includes("msword") ||
    type.startsWith("image/")
  );
}

function createImapClient() {
  return new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    logger: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

function addressesOf(list) {
  if (!list) return [];
  return list
    .map((item) => (item.address || "").toLowerCase())
    .filter(Boolean);
}

function isHrFolder(folder) {
  return /(^|\/)(HR|Intern)$/i.test(folder);
}

function isHrMail(envelope, parsed) {
  const targets = [
    ...addressesOf(envelope?.to),
    ...addressesOf(envelope?.cc),
    ...addressesOf(envelope?.bcc),
    ...addressesOf(parsed?.to?.value),
    ...addressesOf(parsed?.cc?.value),
    ...addressesOf(parsed?.bcc?.value),
  ];
  const delivered = String(
    parsed?.headers?.get("delivered-to") ||
      parsed?.headers?.get("x-delivered-to") ||
      parsed?.headers?.get("x-original-to") ||
      ""
  ).toLowerCase();
  const subject = String(parsed?.subject || envelope?.subject || "").toLowerCase();
  return (
    targets.includes(HR_ALIAS) ||
    delivered.includes(HR_ALIAS) ||
    /application|intern|resume|cv\b|job\s+offer|interview/.test(subject)
  );
}

function emptyCandidate(envelope, parsed) {
  return {
    name: parsed?.from?.value?.[0]?.name || envelope?.from?.[0]?.name || "",
    email: envelope?.from?.[0]?.address || parsed?.from?.value?.[0]?.address || "",
    phone: "",
    skills: [],
    education: "",
    experience: "",
    projects: "",
    certifications: "",
    linkedin: "",
    github: "",
    portfolio: "",
    college: "",
    degree: "",
    cgpa: "",
    location: "",
  };
}

async function searchUids(client, query) {
  try {
    const result = await client.search(query, { uid: true });
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.warn("IMAP search skipped:", error.message);
    return [];
  }
}

function sinceDate() {
  const since = new Date();
  since.setDate(since.getDate() - SYNC_DAYS);
  return since;
}

async function collectUids(client, folder) {
  const since = sinceDate();
  if (isHrFolder(folder)) {
    const [unseen, recent] = await Promise.all([
      searchUids(client, { seen: false }),
      searchUids(client, { since }),
    ]);
    return [...new Set([...unseen, ...recent])].sort((a, b) => a - b);
  }

  const [toHr, unseenHr, recentHr] = await Promise.all([
    searchUids(client, { to: HR_ALIAS }),
    searchUids(client, { seen: false, to: HR_ALIAS }),
    searchUids(client, { since, to: HR_ALIAS }),
  ]);
  return [...new Set([...toHr, ...unseenHr, ...recentHr])].sort((a, b) => a - b);
}

function foldersToSync(mailboxes) {
  const paths = mailboxes.map((box) => box.path);
  console.log("IMAP folders:", paths.join(" | "));

  const wanted = ["Inbox/HR", "Inbox/Intern", "INBOX", "Junk", "Spam"];
  const byLower = new Map(paths.map((path) => [path.toLowerCase(), path]));
  const selected = [];

  for (const name of wanted) {
    const match = byLower.get(name.toLowerCase());
    if (match && !selected.includes(match)) selected.push(match);
  }

  for (const path of paths) {
    if (isHrFolder(path) && !selected.includes(path)) {
      selected.unshift(path);
    }
  }

  return selected.length ? selected : ["INBOX"];
}

async function storeParsedAttachments(parsed) {
  const stored = [];
  let resumeUrl = null;
  let resumeText = "";
  let candidate = null;

  for (const attachment of parsed.attachments || []) {
    if (!isStoredAttachment(attachment)) continue;
    try {
      const named = { ...attachment, filename: guessFilename(attachment) };
      const kind = classifyAttachment(named.filename, named.contentType);
      const uploaded = await uploadFile(
        named,
        kind === "RESUME" ? "resume" : "attachment"
      );
      if (!uploaded?.url) continue;
      stored.push({
        filename: uploaded.filename || named.filename,
        url: uploaded.url,
        contentType: uploaded.contentType || attachment.contentType,
        kind,
      });
      if (!resumeUrl && kind === "RESUME") {
        resumeUrl = uploaded.url;
        try {
          resumeText = await extractResumeText(attachment);
          candidate = extractCandidateDetails(resumeText);
        } catch (error) {
          console.warn("Resume parse skipped:", error.message);
        }
      }
    } catch (error) {
      console.warn("Attachment upload skipped:", error.message);
    }
  }

  return { stored, resumeUrl, resumeText, candidate };
}

async function processMessage(message, folder, uidValidity) {
  if (!message.source) {
    await markProcessed({
      mailbox: folder,
      uid: message.uid,
      uidValidity,
      messageId: message.envelope?.messageId,
      subject: message.envelope?.subject ?? "No Subject",
      senderEmail: message.envelope?.from?.[0]?.address,
    });
    return false;
  }

  const parsed = await simpleParser(message.source);
  const attachments = parsed.attachments || [];
  const stored = await storeParsedAttachments(parsed);
  let candidate = stored.candidate;
  if (candidate && !candidate.email) {
    candidate.email = message.envelope?.from?.[0]?.address || "";
  }

  const hrMail = isHrFolder(folder) || isHrMail(message.envelope, parsed);
  if (!candidate && hrMail) {
    candidate = emptyCandidate(message.envelope, parsed);
  }

  if (candidate) {
    await saveEmailMessage({
      sender: message.envelope?.from?.[0]?.address,
      subject: parsed.subject ?? "No Subject",
      receivedAt: message.envelope?.date,
      hasAttachment: attachments.length > 0 || stored.stored.length > 0,
      resumeUrl: stored.resumeUrl,
      candidate,
      resumeText: stored.resumeText,
      bodyText: parsed.text || "",
      attachments: stored.stored,
      mailbox: folder,
      imapUid: message.uid,
      messageId: message.envelope?.messageId,
    });
    console.log(
      `Imported ${hrMail ? "HR" : "resume"} mail from ${folder} UID ${message.uid}: ${parsed.subject}`
    );
  }

  await markProcessed({
    mailbox: folder,
    uid: message.uid,
    uidValidity,
    messageId: message.envelope?.messageId,
    subject: parsed.subject ?? "No Subject",
    senderEmail: message.envelope?.from?.[0]?.address,
  });

  return Boolean(candidate);
}

async function parseStoredMessage(message, folder) {
  if (!message?.source) return null;
  const parsed = await simpleParser(message.source);
  const stored = await storeParsedAttachments(parsed);
  return {
    bodyText: parsed.text || "",
    attachments: stored.stored,
    resumeUrl: stored.resumeUrl,
    resumeText: stored.resumeText,
    mailbox: folder,
    imapUid: message.uid,
  };
}

export async function hydrateEmailFromImap({
  sender,
  subject,
  receivedAt,
  mailbox,
  imapUid,
}) {
  const client = createImapClient();
  await client.connect();
  const targetSubject = normalize(subject);
  const targetSender = normalize(sender);
  const targetTime = receivedAt ? new Date(receivedAt).getTime() : 0;

  try {
    if (mailbox && imapUid) {
      await client.mailboxOpen(mailbox);
      for await (const message of client.fetch(String(imapUid), { envelope: true, source: true }, { uid: true })) {
        const parsed = await parseStoredMessage(message, mailbox);
        if (parsed) return parsed;
      }
    }

    const mailboxes = await client.list();
    const folders = foldersToSync(mailboxes);

    for (const folder of folders) {
      await client.mailboxOpen(folder);
      const since = receivedAt
        ? new Date(new Date(receivedAt).getTime() - 3 * 24 * 60 * 60 * 1000)
        : sinceDate();
      const uids = [
        ...new Set([
          ...(await searchUids(client, { from: targetSender, since })),
          ...(targetSubject
            ? await searchUids(client, { subject: String(subject || "").slice(0, 60), since })
            : []),
        ]),
      ];
      if (!uids.length) continue;

      let best = null;
      let bestScore = -1;
      for await (const message of client.fetch(
        uids.slice(-40).join(","),
        { envelope: true },
        { uid: true }
      )) {
        const from = normalize(message.envelope?.from?.[0]?.address);
        const subj = normalize(message.envelope?.subject);
        const date = message.envelope?.date ? new Date(message.envelope.date).getTime() : 0;
        let score = 0;
        if (subjectsMatch(subj, targetSubject)) score += 5;
        if (targetSender && from === targetSender) score += 3;
        if (targetTime && Math.abs(date - targetTime) < 48 * 60 * 60 * 1000) score += 2;
        if (score > bestScore) {
          bestScore = score;
          best = message.uid;
        }
      }

      if (!best || bestScore < 5) continue;

      for await (const message of client.fetch(String(best), { envelope: true, source: true }, { uid: true })) {
        const parsed = await parseStoredMessage(message, folder);
        if (parsed) return parsed;
      }
    }
  } finally {
    await client.logout().catch(() => {});
  }

  return {
    bodyText: "",
    attachments: [],
    resumeUrl: null,
    resumeText: "",
  };
}

export async function syncInbox() {
  const client = createImapClient();

  client.on("error", (err) => {
    console.error("IMAP ERROR:", err);
  });

  await client.connect();
  console.log("Connected to Zoho IMAP");

  const mailboxes = await client.list();
  const folders = foldersToSync(mailboxes);
  console.log("Syncing folders:", folders.join(" | "));
  let imported = 0;
  let fetched = 0;

  for (const folder of folders) {
    try {
      const box = await client.mailboxOpen(folder);
      const uidValidity = box.uidValidity;
      fetched += box.exists || 0;
      console.log(`Opened ${folder}. Messages:`, box.exists, "UIDVALIDITY:", uidValidity);

      const uids = await collectUids(client, folder);
      const recent = uids.slice(-400);
      const toFetch = await filterUnprocessed(folder, recent, uidValidity);

      if (!toFetch.length) {
        console.log(`No new messages in ${folder} (checked ${recent.length} UIDs)`);
        continue;
      }

      console.log(`Fetching ${toFetch.length} messages from ${folder}`);
      for await (const message of client.fetch(
        toFetch.join(","),
        { envelope: true, source: true },
        { uid: true }
      )) {
        try {
          if (await processMessage(message, folder, uidValidity)) imported += 1;
        } catch (err) {
          console.error(`Failed to process ${folder} UID ${message.uid}`);
          console.error(err);
        }
      }
    } catch (error) {
      console.warn(`Could not sync folder ${folder}:`, error.message);
    }
  }

  await client.logout();
  return { fetched, imported };
}