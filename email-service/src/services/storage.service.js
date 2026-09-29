import "../loadEnv.js";
import { createClient } from "@supabase/supabase-js";
import {
  isWorkDriveAvailable,
  markWorkDriveFailure,
  uploadToVault,
} from "./workdrive.service.js";
import { saveLocalAttachment } from "./localAttachment.service.js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadToSupabase(file, category, fileName) {
  const bucket = category === "resume" ? "candidate-resumes" : "email-attachments";
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file.content, {
      contentType: file.contentType,
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl, filename: file.filename, contentType: file.contentType };
}

export async function uploadFile(file, category = "resume") {
  const now = new Date();
  const fileName =
    `${now.getFullYear()}/` +
    `${String(now.getMonth() + 1).padStart(2, "0")}/` +
    `${Date.now()}-${String(file.filename || "file").replace(/[^\w.\-]+/g, "_")}`;

  if (isWorkDriveAvailable()) {
    try {
      const result = await uploadToVault({
        filename: file.filename,
        category,
        contentType: file.contentType || "application/octet-stream",
        buffer: file.content,
      });
      if (result?.url) {
        console.log("Uploaded file to WorkDrive:", result.url);
        return {
          url: result.url,
          filename: file.filename,
          contentType: file.contentType,
          fileId: result.fileId,
          permalink: result.permalink,
        };
      }
      throw new Error("WorkDrive upload returned no accessible URL");
    } catch (error) {
      markWorkDriveFailure(error);
      console.warn("WorkDrive upload failed:", error.message);
    }
  }

  try {
    return await uploadToSupabase(file, category, fileName);
  } catch (error) {
    console.warn("Cloud file storage unavailable:", error.message || error);
  }

  const local = saveLocalAttachment(file);
  console.log("Stored attachment locally:", local.url);
  return local;
}

export async function uploadResume(file) {
  const stored = await uploadFile(file, "resume");
  return stored?.url || null;
}
