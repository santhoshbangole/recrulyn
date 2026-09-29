import { uploadVaultFile } from "../../documents/services/vault.service";

class EmailAutomationService {
async uploadAttachment(file: File) {

  const fileName =
    `email-attachments/${Date.now()}-${file.name}`;

  return uploadVaultFile({
    file,
    filename: fileName.replace(/\//g, "-"),
    category: "attachment",
    contentType: file.type || "application/octet-stream",
  });
}
  async sendEmail(email: {
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    html: string;
    attachments?: any[];
  }) {

    const API_URL =
  import.meta.env.VITE_EMAIL_API_URL;

const response = await fetch(
  `${API_URL}/send-email`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  }
);
    if (!response.ok) {
      throw new Error("Failed to send email.");
    }

    return await response.json();
  }

  async sendTestEmail() {
    return this.sendEmail({
      to: "shobanasivakumar21@gmail.com",
      subject: "RECRULYN SMTP Test",
      html: "<h2>SMTP is working successfully 🚀</h2>",
    });
  }
}

export const emailAutomationService =
  new EmailAutomationService();