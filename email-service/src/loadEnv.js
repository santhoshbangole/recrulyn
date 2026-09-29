import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const emailServiceDir = path.resolve(srcDir, "..");
const recrulynDir = path.resolve(emailServiceDir, "..");
const workspaceDir = path.resolve(recrulynDir, "..");

const envFiles = [
  path.join(workspaceDir, ".env"),
  path.join(recrulynDir, ".env"),
  path.join(emailServiceDir, ".env"),
];

for (const file of envFiles) {
  if (fs.existsSync(file)) {
    dotenv.config({ path: file, override: true });
  }
}
