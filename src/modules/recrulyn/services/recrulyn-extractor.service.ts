import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const recrulynExtractorService = {
 async extractText(input: File | string) {
    try {
     let blob: Blob;

let fileName: string;

if (typeof input === "string") {

  const response = await fetch(input);

  blob = await response.blob();

  fileName =
    input.split("/").pop()?.toLowerCase() || "";

} else {

  blob = input;

  fileName =
    input.name.toLowerCase();

}
      // ===========================
      // PDF
      // ===========================
      if (fileName.endsWith(".pdf")) {
        const arrayBuffer = await blob.arrayBuffer();

        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
        }).promise;

        let text = "";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);

          const content = await page.getTextContent();

          const lines = new Map<number, string[]>();

          for (const item of content.items as any[]) {
            if (!("str" in item)) continue;

            const y = Math.round(item.transform[5]);

            if (!lines.has(y)) {
              lines.set(y, []);
            }

            lines.get(y)!.push(item.str);
          }

          const pageText = [...lines.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([, words]) => words.join(" "))
            .join("\n");

                    // Also extract actual hyperlink URLs embedded in the PDF.
          // PDF.js text extraction may only return the visible/truncated text.
          let linkText = "";

          try {
            const annotations = await page.getAnnotations();

            const urls = annotations
              .map((annotation: any) => annotation.url || annotation.unsafeUrl || "")
              .filter((url: string) => /^https?:\/\//i.test(url));

            linkText = [...new Set(urls)].join("\n");
          } catch (annotationError) {
            console.warn("PDF hyperlink extraction failed", annotationError);
          }

          console.log("PDF PAGE LINKS:", linkText);
          text += pageText + "\n" + linkText + "\n";
        }

        console.log("PDF TEXT START");
        console.log(text.substring(0, 1000));
        console.log("PDF TEXT END");

return {
  resumeText: text,
};
      }
      // ===========================
      // DOCX
      // ===========================
      if (fileName.endsWith(".docx")) {
        const arrayBuffer = await blob.arrayBuffer();

        const result = await mammoth.extractRawText({
          arrayBuffer,
        });

        const text = result.value;

       return {
  resumeText: text,
};
      }

      // ===========================
      // HTML (demo / generated resumes)
      // ===========================
      if (fileName.endsWith(".html") || fileName.endsWith(".htm")) {
        const html = await blob.text();
        const text = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

        return {
          resumeText: text,
        };
      }

      // ===========================
      // Plain text
      // ===========================
      if (fileName.endsWith(".txt")) {
        const text = await blob.text();
        return {
          resumeText: text,
        };
      }

      // ===========================
      // Unsupported File
      // ===========================
    return {
  resumeText: "",
};
    } catch (error) {
      console.error(error);

      return {
  resumeText: "",
};
    }
  },
};

