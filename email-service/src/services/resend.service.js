import { Resend } from "resend";
import "../loadEnv.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, cc, bcc, subject, html, attachments }) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    cc,
    bcc,
    subject,
    html,
    attachments: attachments?.map((file) => ({
      filename: file.filename,
      path: file.url,
    })),
  });
}