import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = path.join(process.cwd(), "data", "attachments");

function publicBase() {
  return (
    process.env.EMAIL_PUBLIC_URL ||
    `http://localhost:${process.env.PORT || 4000}`
  ).replace(/\/$/, "");
}

export function safeFilename(name) {
  const cleaned = String(name || "attachment.bin")
    .replace(/[<>:"/\\|?*[\]()]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
  return cleaned || "attachment.bin";
}

export function saveLocalAttachment(file) {
  const id = crypto.randomUUID();
  const filename = safeFilename(file.filename);
  const dir = path.join(ROOT, id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, filename), file.content);
  return {
    id,
    filename,
    contentType: file.contentType || "application/octet-stream",
    url: `${publicBase()}/files/${id}/${encodeURIComponent(filename)}`,
  };
}

export function resolveLocalAttachment(id, filename) {
  const root = path.resolve(ROOT);
  const filePath = path.resolve(root, id, safeFilename(decodeURIComponent(filename)));
  const relative = path.relative(root, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative) || !fs.existsSync(filePath)) {
    return null;
  }
  return filePath;
}
