import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

export async function extractResumeText(file) {
  const filename = file.filename.toLowerCase();

  if (filename.endsWith(".pdf")) {
    const data = await pdf(file.content);
    return data.text;
  }

  if (filename.endsWith(".docx")) {
    const result = await mammoth.extractRawText({
      buffer: file.content,
    });

    return result.value;
  }

  return "";
}