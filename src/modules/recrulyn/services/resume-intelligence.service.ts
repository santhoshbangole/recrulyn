export const resumeIntelligenceService = {
  analyzeResume(resumeText: string) {
    const resume = resumeText.toLowerCase();

    let score = 0;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const insights: string[] = [];

    // Education
    if (
      resume.includes("b.tech") ||
      resume.includes("b.e") ||
      resume.includes("engineering") ||
      resume.includes("bachelor")
    ) {
      score += 15;
      strengths.push("Engineering qualification detected");
    }

    // Experience
    if (
      resume.includes("intern") ||
      resume.includes("experience")
    ) {
      score += 20;
      strengths.push("Internship / Industry experience");
    } else {
      weaknesses.push("No internship experience found");
    }

    // Projects
    if (
      resume.includes("project") ||
      resume.includes("developed") ||
      resume.includes("built")
    ) {
      score += 20;
      strengths.push("Good project exposure");
    } else {
      weaknesses.push("Projects not clearly mentioned");
    }

    // Certifications
    if (
      resume.includes("certification") ||
      resume.includes("certificate")
    ) {
      score += 10;
      strengths.push("Certifications available");
    }

    // GitHub
    if (resume.includes("github")) {
      score += 10;
      insights.push("GitHub profile available");
    }

    // LinkedIn
    if (resume.includes("linkedin")) {
      score += 5;
      insights.push("LinkedIn profile available");
    }

    // Portfolio
    if (
      resume.includes("portfolio") ||
      resume.includes("vercel") ||
      resume.includes("netlify")
    ) {
      score += 10;
      insights.push("Portfolio available");
    }

    // Communication
    if (
      resume.includes("leadership") ||
      resume.includes("communication") ||
      resume.includes("team")
    ) {
      score += 10;
    }

    score = Math.min(score, 100);

    let quality = "Poor";

    if (score >= 80)
      quality = "Excellent";
    else if (score >= 60)
      quality = "Good";
    else if (score >= 40)
      quality = "Average";

    return {
      resumeScore: score,
      resumeQuality: quality,
      strengths,
      weaknesses,
      insights,
    };
  },
};