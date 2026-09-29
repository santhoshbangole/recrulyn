export type ReudeyIntent =
  | "candidate"
  | "employee"
  | "document"
  | "email"
  | "leave"
  | "requirement"
  | "report"
  | "general";

export const reudeyIntentService = {
  detect(question: string): ReudeyIntent {
    const q = question.toLowerCase();

    // Candidate
    // Candidate
if (
  q.includes("candidate") ||
  q.includes("candidates") ||
  q.includes("resume") ||
  q.includes("skill") ||
  q.includes("interview") ||
  q.includes("hire") ||
  q.includes("react") ||
  q.includes("python") ||
  q.includes("developer") ||
  q.includes("intern") ||
  q.includes("internship") ||
  q.includes("joining") ||
  q.includes("selected") ||
  q.includes("rejected") ||
  q.includes("top") ||
  q.includes("best") ||
  q.includes("score") ||
  q.includes("how many") ||
  q.includes("count") ||
  q.includes("about") ||
  q.includes("tell me") ||
  q.includes("who is") ||
  q.includes("summarize") ||
  q.includes("summary") ||
  q.includes("strength") ||
  q.includes("weakness") ||
  q.includes("compare") ||
  q.includes("analysis") ||
  q.includes("analyze")
)  {
  return "candidate";
}

    // Employee
    if (
      q.includes("employee") ||
      q.includes("staff") ||
      q.includes("manager") ||
      q.includes("department")
    ) {
      return "employee";
    }

    // Email
    if (
      q.includes("email") ||
      q.includes("mail") ||
      q.includes("inbox")
    ) {
      return "email";
    }

    // Leave
    if (
      q.includes("leave") ||
      q.includes("vacation")
    ) {
      return "leave";
    }

    // Requirement
    if (
      q.includes("requirement") ||
      q.includes("job") ||
      q.includes("opening") ||
      q.includes("role")
    ) {
      return "requirement";
    }

    // Documents
    if (
      q.includes("loa") ||
      q.includes("nda") ||
      q.includes("certificate") ||
      q.includes("document")
    ) {
      return "document";
    }

    // Reports
    if (
      q.includes("report") ||
      q.includes("analytics") ||
      q.includes("summary")
    ) {
      return "report";
    }

    return "general";
  },
};