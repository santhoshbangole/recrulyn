export const DEPARTMENTS = [
  "Engineering Product Development",
  "Engineering System Design",
  "Information Systems Technology and Design",
  "Business Operations and Development",
  "Marketing and Sales Strategy",
  "Talent Acquisition",
  "Supply Chain and Logistics Operations",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
