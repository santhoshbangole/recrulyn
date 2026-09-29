/**
 * contactExtractor.ts
 * Enterprise Resume Contact Extractor
 */

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const PHONE_REGEX =
  /(\+?\d{1,3}[\s.-]?)?(\(?\d{2,5}\)?[\s.-]?){2,5}\d{2,5}/g;

const LINKEDIN_REGEX =
  /(https?:\/\/)?(www\.)?linkedin\.com\/[^\s]+/gi;

const GITHUB_REGEX =
  /(https?:\/\/)?(www\.)?github\.com\/[^\s]+/gi;

const BEHANCE_REGEX =
  /(https?:\/\/)?(www\.)?behance\.net\/[^\s]+/gi;

const DRIBBBLE_REGEX =
  /(https?:\/\/)?(www\.)?dribbble\.com\/[^\s]+/gi;

const GITHUB_IO_REGEX =
  /[a-zA-Z0-9-]+\.github\.io(\/[^\s]*)?/gi;

const VERCEL_REGEX =
  /[a-zA-Z0-9-]+\.vercel\.app(\/[^\s]*)?/gi;

const NETLIFY_REGEX =
  /[a-zA-Z0-9-]+\.netlify\.app(\/[^\s]*)?/gi;

const WEBSITE_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;



function normalizeUrl(url: string) {
  let cleaned = url
    .trim()
    .replace(/[),.;]+$/, "");

  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }

  return cleaned;
}

function topRegion(text: string) {
  return text
    .split("\n")
    .slice(0, 25)
    .join("\n");
}

function isExcluded(url: string): boolean {

  const lower = url.toLowerCase();

  // Email domains
  if (
    lower.includes("gmail.com") ||
    lower.includes("outlook.com") ||
    lower.includes("hotmail.com") ||
    lower.includes("yahoo.com")
  ) {
    return true;
  }

  // Social links handled separately
  if (
    lower.includes("linkedin.com") ||
    lower.includes("github.com") ||
    lower.includes("facebook.com") ||
    lower.includes("instagram.com") ||
    lower.includes("twitter.com") ||
    lower.includes("x.com")
  ) {
    return true;
  }

  // Reject company names ending with .in
  if (
    lower.endsWith(".in") &&
    !lower.startsWith("http") &&
    !lower.startsWith("www.")
  ) {
    return true;
  }

  // Reject educational abbreviations
  if (
    /^(b\.?tech|m\.?tech|b\.?e|m\.?e|mba|mca|bca)$/i.test(lower)
  ) {
    return true;
  }

  // Reject common companies
  if (
    lower.includes("tcs") ||
    lower.includes("infosys") ||
    lower.includes("wipro") ||
    lower.includes("accenture") ||
    lower.includes("cognizant") ||
    lower.includes("zoho") ||
    lower.includes("amazon") ||
    lower.includes("google") ||
    lower.includes("microsoft") ||
    lower.includes("bluedart")
  ) {
    return true;
  }

  return false;
}
export function extractEmail(text: string): string {
  const matches = text.match(EMAIL_REGEX) || [];

  if (matches.length === 0) return "";

  const valid = matches.filter(
    (m) =>
      !m.toLowerCase().includes("example") &&
      !m.toLowerCase().includes("test")
  );

return (valid[0] ?? matches[0] ?? "").trim();}

export function extractPhone(text: string): string {
  const candidates = text.match(PHONE_REGEX) || [];

  let best = "";
  let score = -999;

  for (const phone of candidates) {
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10 || digits.length > 13)
      continue;

    let current = 0;

    if (phone.startsWith("+")) current += 3;

    if (digits.length === 10) current += 3;

    if (/^(19|20)\d{2}$/.test(digits))
      current -= 20;

    if (current > score) {
      score = current;
      best = phone.trim();
    }
  }

  return best;
}

export function extractLinkedIn(text: string): string {
  const top = topRegion(text);

  const match = top.match(LINKEDIN_REGEX);

return match?.[0]
  ? normalizeUrl(match[0])
  : "";
}

export function extractGithub(text: string): string {
  const top = topRegion(text);

  const match = top.match(GITHUB_REGEX);

return match?.[0]
  ? normalizeUrl(match[0])
  : "";
}
export function extractPortfolio(text: string): string {

  const top = topRegion(text);

  const lines = top.split("\n");

  // Highest priority: labelled portfolio/website line
  for (const line of lines) {

    if (/portfolio|website|personal website/i.test(line)) {

      const website = line.match(WEBSITE_REGEX);

      if (website) {

        const candidate = website.find(
          (url) => !isExcluded(url)
        );

        if (candidate) {
          return normalizeUrl(candidate);
        }
      }
    }
  }

  // Behance
  const behance = top.match(BEHANCE_REGEX);

  if (behance) {
return behance?.[0]
  ? normalizeUrl(behance[0])
  : "";  }

  // Dribbble
  const dribbble = top.match(DRIBBBLE_REGEX);

  if (dribbble) {
return dribbble?.[0]
  ? normalizeUrl(dribbble[0])
  : "";  }

  // GitHub Pages
  const githubPages = top.match(GITHUB_IO_REGEX);

  if (githubPages) {
return githubPages?.[0]
  ? normalizeUrl(githubPages[0])
  : "";
  }

  // Vercel
  const vercel = top.match(VERCEL_REGEX);

  if (vercel) {
return vercel?.[0]
  ? normalizeUrl(vercel[0])
  : "";  }

  // Netlify
  const netlify = top.match(NETLIFY_REGEX);

  if (netlify) {
return netlify?.[0]
  ? normalizeUrl(netlify[0])
  : "";  }

  // Generic website
const websites = top.match(WEBSITE_REGEX) || [];

for (const site of websites) {

  const lower = site.toLowerCase();

  if (isExcluded(lower))
    continue;

  // Reject file names
  if (
    lower.endsWith(".pdf") ||
    lower.endsWith(".doc") ||
    lower.endsWith(".docx")
  ) {
    continue;
  }

  // Reject degree abbreviations
  if (
    /^(b\.?tech|m\.?tech|b\.?e|m\.?e|mba|mca|bca|phd)$/i.test(site)
  ) {
    continue;
  }

  // Reject company names
  if (
    /\b(ltd|limited|private|pvt|inc|llp)\b/i.test(site)
  ) {
    continue;
  }

  // Accept only real websites
  if (
    lower.startsWith("http") ||
    lower.startsWith("www.") ||
    lower.includes("github.io") ||
    lower.includes("vercel.app") ||
    lower.includes("netlify.app")
  ) {
    return normalizeUrl(site);
  }
}

return "";
}