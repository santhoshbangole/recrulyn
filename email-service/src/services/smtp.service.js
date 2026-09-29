import "../loadEnv.js";
import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function verifySmtp() {
  return Promise.race([
    transporter.verify(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("SMTP verify timeout")), 5000)
    ),
  ])
    .then(() => console.log("✅ SMTP READY"))
    .catch((error) => {
      console.error("SMTP VERIFY ERROR");
      console.error(error);
    });
}
