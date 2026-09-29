export function scoreResume(candidate, resumeText) {
  let score = 0;
  const reasons = [];

  // ---------- Basic Details ----------
  if (candidate.name) {
    score += 10;
    reasons.push("Name found");
  }

  if (candidate.email) {
    score += 10;
    reasons.push("Email found");
  }

  if (candidate.phone) {
    score += 10;
    reasons.push("Phone found");
  }

  // ---------- Skills ----------
  const skillPoints = {
    "Java": 8,
    "Python": 8,
    "C": 4,
    "C++": 5,
    "JavaScript": 6,
    "TypeScript": 6,
    "React": 8,
    "Next.js": 8,
    "Node.js": 8,
    "SQL": 6,
    "MySQL": 5,
    "PostgreSQL": 5,
    "MongoDB": 5,
    "Spring Boot": 8,
    "Flask": 6,
    "FastAPI": 6,
    "Docker": 8,
    "Git": 4,
    "AWS": 8,
    "Azure": 8
  };

  for (const skill of candidate.skills) {
    if (skillPoints[skill]) {
      score += skillPoints[skill];
      reasons.push(`Skill: ${skill}`);
    }
  }

  // ---------- Education ----------
  const educationKeywords = [
    "b.e",
    "b.tech",
    "bachelor",
    "m.e",
    "m.tech",
    "master"
  ];

  if (
    educationKeywords.some(word =>
      resumeText.toLowerCase().includes(word)
    )
  ) {
    score += 10;
    reasons.push("Education detected");
  }

  // ---------- Projects ----------
  if (
    resumeText.toLowerCase().includes("project")
  ) {
    score += 10;
    reasons.push("Projects mentioned");
  }

  // ---------- Experience ----------
  if (
    resumeText.toLowerCase().includes("experience") ||
    resumeText.toLowerCase().includes("intern")
  ) {
    score += 10;
    reasons.push("Experience detected");
  }

  // Maximum score = 100
  score = Math.min(score, 100);

  return {
    score,
    reasons,
  };
}