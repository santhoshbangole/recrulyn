import "./loadEnv.js";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { transporter, verifySmtp } from "./services/smtp.service.js";
import { syncInbox, hydrateEmailFromImap } from "./services/imap.service.js";
import {
  uploadToVault,
  getWorkDriveStatus,
  downloadFromVault,
} from "./services/workdrive.service.js";
import {
  resolveLocalAttachment,
  saveLocalAttachment,
} from "./services/localAttachment.service.js";
import { updateEmailContent } from "./services/emailMessage.service.js";
const HR_APP_PUBLIC_DIR =
  process.env.HR_APP_PUBLIC_DIR || path.resolve(process.cwd(), "..", "public");

function resolveEmailAttachment(fileUrl) {
  if (!fileUrl) return fileUrl;

  if (fileUrl.startsWith("/generated/")) {
    return path.join(HR_APP_PUBLIC_DIR, fileUrl.replace(/^\/+/, ""));
  }

  return fileUrl;
}
const app = express();

app.use(cors());
app.use(express.json({ limit: "25mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    service: "RECRULYN Email Service",
    status: "Running",
  });
});

app.get("/vault/status", async (_req, res) => {
  try {
    const status = await getWorkDriveStatus();
    res.json({ success: true, ...status });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/vault/upload", async (req, res) => {
  try {
    const { filename, category, contentType, data } = req.body || {};
    if (!filename || !data) {
      return res.status(400).json({
        success: false,
        message: "filename and data are required.",
      });
    }

    const buffer = Buffer.from(data, "base64");
    const result = await uploadToVault({
      filename,
      category: category || "other",
      contentType: contentType || "application/octet-stream",
      buffer,
    });

    res.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      folderId: result.folderId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/send-email", async (req, res) => {
  try {
    const { to, cc, bcc, subject, html, attachments } = req.body;

    const info = await transporter.sendMail({
      from: `"HR" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments: (attachments || []).map((file) => ({
        filename: file.filename,
        path: file.url,
      })),
    });

    res.json({
      success: true,
      message: "Email sent successfully.",
      info,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/files/:id/:filename", (req, res) => {
  const filePath = resolveLocalAttachment(req.params.id, req.params.filename);
  if (!filePath) {
    return res.status(404).json({ success: false, message: "File not found." });
  }
  res.sendFile(filePath);
});

app.get("/vault/files/:id/:filename", async (req, res) => {
  try {
    const file = await downloadFromVault(req.params.id);
    const filename = req.params.filename || file.filename;
    res.setHeader(
      "Content-Type",
      file.contentType || "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(filename)}"`,
    );
    res.send(file.buffer);
  } catch (error) {
    console.error(error);
    res.status(404).json({
      success: false,
      message: error.message || "WorkDrive file not found.",
    });
  }
});

app.post("/store-text", async (req, res) => {
  try {
    const { filename, text } = req.body || {};
    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: "text is required." });
    }
    const stored = saveLocalAttachment({
      filename: filename || "resume-extract.txt",
      content: Buffer.from(String(text), "utf8"),
      contentType: "text/plain",
    });
    res.json({ success: true, ...stored });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/open-email", async (req, res) => {
  try {
    const { id, sender, subject, receivedAt, mailbox, imapUid } =
      req.body || {};
    const opened = await hydrateEmailFromImap({
      sender,
      subject,
      receivedAt,
      mailbox,
      imapUid,
    });
    if (id) {
      await updateEmailContent(id, {
        resumeUrl: opened.resumeUrl,
        resumeText: opened.resumeText,
        bodyText: opened.bodyText,
        attachments: opened.attachments,
        mailbox: opened.mailbox,
        imapUid: opened.imapUid,
      });
    }
    res.json({
      success: true,
      bodyText: opened.bodyText,
      attachments: opened.attachments,
      resumeUrl: opened.resumeUrl,
      resumeText: opened.resumeText,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.post("/sync-inbox", async (_req, res) => {
  try {
    const result = await runInboxSync();
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Email Service running on port ${PORT}`);
  verifySmtp();
});

let syncing = false;
let lastResult = { fetched: 0, imported: 0 };
const SYNC_WAIT_MS = 120000;

async function runInboxSync() {
  if (syncing) {
    const started = Date.now();
    while (syncing) {
      if (Date.now() - started > SYNC_WAIT_MS) {
        throw new Error(
          "Inbox sync is still running. WorkDrive storage may be blocking mailbox import.",
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return lastResult;
  }

  syncing = true;
  try {
    console.log("Checking Zoho mailbox...");
    lastResult = await syncInbox();
    console.log("Mailbox sync completed.", lastResult);
    return lastResult;
  } catch (err) {
    console.error("Mailbox sync failed:", err);
    throw err;
  } finally {
    syncing = false;
  }
}

runInboxSync().catch((err) => {
  console.error("Initial mailbox sync failed:", err);
});
setInterval(() => {
  runInboxSync().catch((err) => {
    console.error("Scheduled mailbox sync failed:", err);
  });
}, 30000);
