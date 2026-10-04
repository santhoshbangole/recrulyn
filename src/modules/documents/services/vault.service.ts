// import { supabase } from "../../../services/supabase/client";

// export type VaultCategory =
//   | "resume"
//   | "loa"
//   | "certificate"
//   | "lor"
//   | "loc"
//   | "nda"
//   | "attachment"
//   | "signature"
//   | "recrulyn"
//   | "jd"
//   | "other";

// const FALLBACK_BUCKET: Record<VaultCategory, string> = {
//   resume: "candidate-resumes",
//   loa: "generated-documents",
//   certificate: "generated-documents",
//   lor: "generated-documents",
//   loc: "generated-documents",
//   nda: "generated-documents",
//   attachment: "email-attachments",
//   signature: "officer-signatures",
//   recrulyn: "candidate-resumes",
//   jd: "job-descriptions",
//   other: "generated-documents",
// };

// async function uploadToSupabase(options: {
//   file: Blob;
//   filename: string;
//   category: VaultCategory;
//   contentType?: string;
// }) {
//   console.log(
//     "SUPABASE SESSION:",
//     (await supabase.auth.getSession()).data.session?.user?.id ||
//       "NOT AUTHENTICATED"
//   );

//   const bucket = FALLBACK_BUCKET[options.category];

//   const { error } = await supabase.storage
//     .from(bucket)
//     .upload(options.filename, options.file, {
//       contentType:
//         options.contentType ||
//         options.file.type ||
//         "application/octet-stream",
//       upsert: true,
//     });

//   if (error) throw error;

//   const {
//     data: { publicUrl },
//   } = supabase.storage
//     .from(bucket)
//     .getPublicUrl(options.filename);

//   return publicUrl;
// }

// export async function uploadVaultFile(options: {
//   file: Blob;
//   filename: string;
//   category: VaultCategory;
//   contentType?: string;
// }) {
//   return await uploadToSupabase(options);
// }

import { supabase } from "../../../services/supabase/client";

export type VaultCategory =
  | "resume"
  | "loa"
  | "certificate"
  | "lor"
  | "loc"
  | "nda"
  | "attachment"
  | "signature"
  | "recrulyn"
  | "jd"
  | "other";

const FALLBACK_BUCKET: Record<VaultCategory, string> = {
  resume: "candidate-resumes",
  loa: "generated-documents",
  certificate: "generated-documents",
  lor: "generated-documents",
  loc: "generated-documents",
  nda: "generated-documents",
  attachment: "candidate-resumes",
  signature: "officer-signatures",
  recrulyn: "candidate-resumes",
  jd: "job-descriptions",
  other: "generated-documents",
};

async function uploadToSupabase(options: {
  file: Blob;
  filename: string;
  category: VaultCategory;
  contentType?: string;
}) {
  console.log(
    "SUPABASE SESSION:",
    (await supabase.auth.getSession()).data.session?.user?.id ||
      "NOT AUTHENTICATED"
  );

  const bucket = FALLBACK_BUCKET[options.category];

  const { error } = await supabase.storage
    .from(bucket)
    .upload(options.filename, options.file, {
      contentType:
        options.contentType ||
        options.file.type ||
        "application/octet-stream",
      upsert: true,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage
    .from(bucket)
    .getPublicUrl(options.filename);

  return publicUrl;
}

export async function uploadVaultFile(options: {
  file: Blob;
  filename: string;
  category: VaultCategory;
  contentType?: string;
}) {
  return await uploadToSupabase(options);
}