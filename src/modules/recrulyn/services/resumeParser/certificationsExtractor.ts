import { stripBullet } from "./textNormalizer";

export function extractCertifications(sectionLines: string[]): string[] {
  if (sectionLines.length === 0) return [];

  const certifications: string[] = [];

  for (const line of sectionLines) {
    const cleaned = stripBullet(line).trim();
    if (cleaned.length < 3 || cleaned.length > 150) continue;
    certifications.push(cleaned);
  }

  // De-duplicate while preserving order.
  return [...new Set(certifications)];
}