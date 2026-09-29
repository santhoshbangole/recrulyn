export interface EducationEntry {
  degree: string;
  college: string;
  cgpa: string;
  percentage: string;
  year: string;
  raw: string;
}

export interface ExperienceEntry {
  company: string;
  designation: string;
  duration: string;
  description: string[];
  raw: string;
}

export interface ProjectEntry {
  title: string;
  technologies: string[];
  description: string[];
  raw: string;
}

export interface ParsedResume {
  resumeText: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  college: string;
  degree: string;
  cgpa: string;
  skills: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  certifications: string[];
}

export interface ScoredCandidate<T> {
  value: T;
  score: number;
}