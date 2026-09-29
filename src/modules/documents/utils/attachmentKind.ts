export type AttachmentKind =
  | "RESUME"
  | "ID_PROOF"
  | "ADDRESS_PROOF"
  | "PHOTO"
  | "OTHER";

export function classifyAttachment(
  filename?: string | null,
  contentType?: string | null
): AttachmentKind {
  const name = String(filename || "").toLowerCase();
  const type = String(contentType || "").toLowerCase();

  if (
    /aadhaar|aadhar|pan[\s_-]?card|\bpan\b|passport|voter|e-?aadhaar|driving|licence|license|college[\s_-]?id|\bid[\s_-]?proof\b|national[\s_-]?id/.test(
      name
    )
  ) {
    return "ID_PROOF";
  }

  if (
    /address[\s_-]?proof|utility|ration|residence|bank[\s_-]?statement|electricity|gas[\s_-]?bill|rent[\s_-]?agreement/.test(
      name
    )
  ) {
    return "ADDRESS_PROOF";
  }

  if (
    /photo|photograph|passport[\s_-]?size|selfie|profile[\s_-]?pic/.test(name) ||
    ((type.startsWith("image/") || /\.(jpe?g|png|webp|gif)$/.test(name)) &&
      !/resume|cv\b|loa|nda/.test(name))
  ) {
    return "PHOTO";
  }

  if (/resume|curriculum|biodata|\bcv\b/.test(name)) {
    return "RESUME";
  }

  if (/\.(pdf|docx?)$/.test(name) || type.includes("pdf") || type.includes("word")) {
    return "RESUME";
  }

  return "OTHER";
}
