import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_PX_WIDTH = 794;

function waitForImages(doc: Document) {
  return Promise.all(
    Array.from(doc.images).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
    )
  );
}

async function waitForFrame(iframe: HTMLIFrameElement, html: string) {
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) throw new Error("PDF renderer failed to load");

  // Write directly instead of relying on the iframe 'load' event for
  // srcdoc — under rapid back-to-back calls (e.g. generating several
  // documents in a row) the load event can race with the previous
  // frame's teardown and resolve against a stale/blank document.
  doc.open();
  doc.write(html);
  doc.close();

  await waitForImages(doc);
  try {
    await (doc as any).fonts?.ready;
  } catch {
    /* ignore */
  }
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  return doc;
}

function ensureIsolationCss() {
  if (document.getElementById("recrulyn-pdf-isolation")) return;
  const style = document.createElement("style");
  style.id = "recrulyn-pdf-isolation";
  style.textContent = `
    iframe.html2canvas-container,
    .html2canvas-container,
    .html2pdf__overlay,
    .html2pdf__container {
      position: fixed !important;
      left: -20000px !important;
      right: auto !important;
      top: 0 !important;
      bottom: auto !important;
      width: ${A4_PX_WIDTH}px !important;
      pointer-events: none !important;
      z-index: -1 !important;
    }
  `;
  document.head.appendChild(style);
}

export async function htmlToPdfBlob(html: string, _fileName: string): Promise<Blob> {
  ensureIsolationCss();
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  iframe.style.cssText = [
    "position:fixed",
    "left:-14000px",
    "top:0",
    `width:${A4_PX_WIDTH}px`,
    "height:1123px",
    "border:0",
    "margin:0",
    "padding:0",
    "pointer-events:none",
    "z-index:-1",
    "background:#fff",
    "visibility:visible",
  ].join(";");

  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  document.body.appendChild(iframe);

  try {
    const doc = await waitForFrame(iframe, html);
    const source = doc.body;
    if (!source) throw new Error("PDF renderer failed to load");

    iframe.style.height = `${Math.max(source.scrollHeight, 1123)}px`;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const canvas = await html2canvas(source, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: A4_PX_WIDTH,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0.5) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output("blob");
  } finally {
    iframe.remove();
    window.scrollTo(scrollX, scrollY);
  }
}