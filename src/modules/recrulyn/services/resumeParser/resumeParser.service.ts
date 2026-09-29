/**
 * resumeParser.service.ts
 * Drop-in replacement for the existing resumeParserService. Pure
 * TypeScript, zero AI/API calls, zero external network dependencies.
 *
 * Public API (unchanged shape expected by candidateService / profileService):
 *   resumeParserService.extractResumeData(resumeText: string): ParsedResume
 */

import type { ParsedResume } from "./types";
import { normalizeText, splitLines } from "./textNormalizer";
import { splitIntoSections } from "./sectionDetector";
import { extractSkillsFromText } from "./skillsDictionary";
import {
  extractEmail,
  extractPhone,
  extractLinkedIn,
  extractGithub,
  extractPortfolio,
} from "./contactExtractor";
import { extractLocation } from "./locationExtractor";
import { extractName } from "./nameExtractor";
import { extractEducation } from "./educationExtractor";
import { extractExperience } from "./experienceExtractor";
import { extractProjects } from "./projectsExtractor";
import { extractCertifications } from "./certificationsExtractor";

function buildEmptyResult(resumeText: string): ParsedResume {
  return {
    resumeText,
    candidateName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    college: "",
    degree: "",
    cgpa: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  };
}

function parseResumeSync(resumeText: string): ParsedResume {
  if (!resumeText || !resumeText.trim()) {
    return buildEmptyResult(resumeText || "");
  }

  const normalized = normalizeText(resumeText);
  const lines = splitLines(normalized);
  const sections = splitIntoSections(lines);

  const email = extractEmail(normalized);
  const phone = extractPhone(normalized);
  const linkedin = extractLinkedIn(normalized);
  const github = extractGithub(normalized);
  const portfolio = extractPortfolio(normalized);
  const location = extractLocation(normalized);
  const candidateName = extractName(normalized, email);

  // Skills: combine the dedicated Skills section with the whole document,
  // since candidates often mention tools inside Projects/Experience too.
  const skills = extractSkillsFromText(
    sections.skills.length > 0 ? sections.skills.join(" ") + " " + normalized : normalized
  );

  const education = extractEducation(sections.education);
  const experience = extractExperience(sections.experience);
  const projects = extractProjects(sections.projects);
  const certifications = extractCertifications(sections.certifications);

  const primaryEducation = education[0];

  return {
    resumeText: normalized,
    candidateName,
    email,
    phone,
    location,
    linkedin,
    github,
    portfolio,
    college: primaryEducation?.college || "",
    degree: primaryEducation?.degree || "",
    cgpa: primaryEducation?.cgpa || "",
    skills,
    education,
    experience,
    projects,
    certifications,
  };
}

export const resumeParserService = {
  /**
   * Parses a single resume's raw text into a fully structured object.
   * Synchronous under the hood (no I/O) but kept async to preserve the
   * existing call signature used by recrulynExtractorService / candidateService.
   */
  async extractResumeData(resumeText: string): Promise<ParsedResume> {
    return parseResumeSync(resumeText);
  },

  /**
   * Bulk variant for processing many resumes efficiently (e.g. 100 at
   * once). Parsing is CPU-bound and synchronous per resume, so this simply
   * loops rather than spawning workers -- typical resume text (a few KB)
   * parses in low single-digit milliseconds, so 100 resumes complete well
   * under a second on a single thread.
   */
  async extractResumeDataBulk(
    resumeTexts: string[]
  ): Promise<ParsedResume[]> {
    return resumeTexts.map((text) => parseResumeSync(text));
  },
};