export type RequirementPriority =
  | "mandatory"
  | "preferred";

export type RequirementItem = {
  name: string;
  priority: RequirementPriority;
};

export type CandidateEvidence = {
  skills?: string[];
  experience?: Array<{
    company?: string;
    designation?: string;
    duration?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    college?: string;
    field?: string;
    cgpa?: string;
    percentage?: string;
    year?: string;
  }>;
  projects?: Array<{
    title?: string;
    technologies?: string[];
    description?: string[];
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    year?: string;
  }>;
  resumeText?: string;
};

export type JobRequirement = {
  role?: string;
  mandatorySkills?: string[];
  preferredSkills?: string[];
  minimumExperienceYears?: number;
  educationRequirements?: string[];
  responsibilities?: string[];
  certifications?: string[];
  domain?: string;
};

export type RequirementMatch = {
  requirement: string;
  priority: RequirementPriority;
  status: "matched" | "partial" | "missing";
  score: number;
  evidence: string;
};

export type RecruitmentScore = {
  overallMatch: number;

  skillScore: number;
  experienceScore: number;
  responsibilityScore: number;
  educationScore: number;
  projectScore: number;
  certificationScore: number;

  mandatoryScore: number;
  preferredScore: number;

  matchedRequirements: RequirementMatch[];
  missingRequirements: RequirementMatch[];

  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

function normalizeText(value: unknown): string {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w+#./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTerm(value: unknown): string {
  return normalizeText(value)
    .replace(/[._-]/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return [...new Set(
    values
      .map((value) => value.trim())
      .filter(Boolean)
  )];
}

function clamp(
  value: number,
  min = 0,
  max = 100
): number {
  return Math.max(
    min,
    Math.min(max, Math.round(value))
  );
}


function partialMatchScore(
  candidateText: string,
  requirement: string
): number {
  const req = normalizeTerm(requirement);

  if (!req) {
    return 0;
  }

  if (candidateText.includes(req)) {
    return 100;
  }

  const words = req
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  if (!words.length) {
    return 0;
  }

  const matched =
    words.filter((word) =>
      candidateText.includes(word)
    ).length;

  return clamp(
    (matched / words.length) * 100
  );
}

function buildCandidateText(
  candidate: CandidateEvidence
): string {
  const parts: string[] = [];

  candidate.skills?.forEach((skill) => {
    parts.push(String(skill));
  });

  candidate.experience?.forEach((item) => {
    parts.push(
      String(item.company || ""),
      String(item.designation || "")
    );

    item.description?.forEach((text) => {
      parts.push(String(text));
    });
  });

  candidate.education?.forEach((item) => {
    parts.push(
      String(item.degree || ""),
      String(item.field || ""),
      String(item.college || "")
    );
  });

  candidate.projects?.forEach((project) => {
    parts.push(
      String(project.title || "")
    );

    project.technologies?.forEach(
      (technology) =>
        parts.push(String(technology))
    );

    project.description?.forEach(
      (description) =>
        parts.push(String(description))
    );
  });

  candidate.certifications?.forEach(
    (certification) => {
      parts.push(
        String(certification.name || ""),
        String(certification.issuer || "")
      );
    }
  );

  parts.push(
    String(candidate.resumeText || "")
  );

  return normalizeText(
    parts.join(" ")
  );
}

function estimateExperienceYears(
  candidate: CandidateEvidence
): number {
  const experience =
    candidate.experience || [];

  if (!experience.length) {
    return 0;
  }

  let totalMonths = 0;

  for (const item of experience) {
    const duration =
      normalizeText(item.duration);

    const yearMatch =
      duration.match(
        /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i
      );

    const monthMatch =
      duration.match(
        /(\d+(?:\.\d+)?)\s*(?:months?|mos?)/i
      );

    if (yearMatch) {
      totalMonths +=
        Number(yearMatch[1]) * 12;
    }

    if (monthMatch) {
      totalMonths +=
        Number(monthMatch[1]);
    }
  }

  /*
   * If dates are not represented as durations,
   * avoid inventing experience.
   */
  if (totalMonths === 0) {
    return 0;
  }

  return totalMonths / 12;
}

function scoreExperience(
  candidate: CandidateEvidence,
  requiredYears?: number
): number {
  if (
    requiredYears === undefined ||
    requiredYears <= 0
  ) {
    return candidate.experience?.length
      ? 100
      : 50;
  }

  const actualYears =
    estimateExperienceYears(candidate);

  if (actualYears >= requiredYears) {
    return 100;
  }

  if (actualYears <= 0) {
    return 0;
  }

  return clamp(
    (actualYears / requiredYears) * 100
  );
}

function scoreEducation(
  candidate: CandidateEvidence,
  requirements: string[]
): number {
  if (!requirements.length) {
    return candidate.education?.length
      ? 100
      : 50;
  }

  if (!candidate.education?.length) {
    return 0;
  }

  const educationText =
    normalizeText(
      candidate.education
        .map((item) =>
          [
            item.degree,
            item.field,
            item.college,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
    );

  const scores =
    requirements.map((requirement) =>
      partialMatchScore(
        educationText,
        requirement
      )
    );

  return scores.length
    ? clamp(
        scores.reduce(
          (sum, score) => sum + score,
          0
        ) / scores.length
      )
    : 0;
}

function scoreResponsibilities(
  candidate: CandidateEvidence,
  responsibilities: string[]
): number {
  if (!responsibilities.length) {
    return 50;
  }

  const candidateText =
    buildCandidateText(candidate);

  const scores =
    responsibilities.map(
      (responsibility) =>
        partialMatchScore(
          candidateText,
          responsibility
        )
    );

  return scores.length
    ? clamp(
        scores.reduce(
          (sum, score) => sum + score,
          0
        ) / scores.length
      )
    : 0;
}

function scoreProjects(
  candidate: CandidateEvidence,
  role?: string
): number {
  if (!candidate.projects?.length) {
    return 0;
  }

  if (!role) {
    return 100;
  }

  const projectText =
    normalizeText(
      candidate.projects
        .map((project) =>
          [
            project.title,
            ...(project.technologies || []),
            ...(project.description || []),
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
    );

  return partialMatchScore(
    projectText,
    role
  );
}

function scoreCertifications(
  candidate: CandidateEvidence,
  requirements: string[]
): number {
  if (!requirements.length) {
    return candidate.certifications?.length
      ? 100
      : 50;
  }

  if (!candidate.certifications?.length) {
    return 0;
  }

  const certificationText =
    normalizeText(
      candidate.certifications
        .map((certification) =>
          [
            certification.name,
            certification.issuer,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
    );

  const scores =
    requirements.map((requirement) =>
      partialMatchScore(
        certificationText,
        requirement
      )
    );

  return scores.length
    ? clamp(
        scores.reduce(
          (sum, score) => sum + score,
          0
        ) / scores.length
      )
    : 0;
}

function matchRequirements(
  candidateText: string,
  requirements: string[],
  priority: RequirementPriority
): RequirementMatch[] {
  return requirements.map(
    (requirement) => {
      const score =
        partialMatchScore(
          candidateText,
          requirement
        );

      let status:
        | "matched"
        | "partial"
        | "missing";

      if (score >= 85) {
        status = "matched";
      } else if (score >= 45) {
        status = "partial";
      } else {
        status = "missing";
      }

      return {
        requirement,
        priority,
        status,
        score,
        evidence:
          status === "matched"
            ? `Evidence found for "${requirement}".`
            : status === "partial"
              ? `Partial evidence found for "${requirement}".`
              : `No sufficient evidence found for "${requirement}".`,
      };
    }
  );
}

function calculateRequirementScore(
  matches: RequirementMatch[]
): number {
  if (!matches.length) {
    return 50;
  }

  return clamp(
    matches.reduce(
      (sum, item) =>
        sum + item.score,
      0
    ) / matches.length
  );
}

function determineRecommendation(
  score: number,
  mandatoryMatches: RequirementMatch[]
): string {
  const missingMandatory =
    mandatoryMatches.filter(
      (item) =>
        item.status === "missing"
    ).length;

  /*
   * A candidate cannot be called a strong
   * hire when important mandatory requirements
   * are missing.
   */
  if (
    missingMandatory >= 3
  ) {
    return "Low Match";
  }

  if (
    missingMandatory === 2
  ) {
    return score >= 75
      ? "Consider"
      : "Low Match";
  }

  if (
    missingMandatory === 1
  ) {
    return score >= 80
      ? "Consider"
      : "Borderline";
  }

  if (score >= 85) {
    return "Strong Match";
  }

  if (score >= 70) {
    return "Good Match";
  }

  if (score >= 55) {
    return "Consider";
  }

  return "Low Match";
}

function buildStrengths(
  matches: RequirementMatch[],
  candidate: CandidateEvidence
): string[] {
  const strengths: string[] = [];

  const matchedMandatory =
    matches.filter(
      (item) =>
        item.priority === "mandatory" &&
        item.status === "matched"
    );

  const matchedPreferred =
    matches.filter(
      (item) =>
        item.priority === "preferred" &&
        item.status === "matched"
    );

  if (matchedMandatory.length) {
    strengths.push(
      `${matchedMandatory.length} mandatory requirement(s) are supported by resume evidence.`
    );
  }

  if (matchedPreferred.length) {
    strengths.push(
      `${matchedPreferred.length} preferred requirement(s) are supported by resume evidence.`
    );
  }

  if (
    (candidate.experience?.length || 0) > 0
  ) {
    strengths.push(
      "Relevant work experience is documented."
    );
  }

  if (
    (candidate.projects?.length || 0) > 0
  ) {
    strengths.push(
      "Project evidence is available."
    );
  }

  if (
    (candidate.education?.length || 0) > 0
  ) {
    strengths.push(
      "Education information is available."
    );
  }

  return unique(strengths);
}

function buildWeaknesses(
  matches: RequirementMatch[]
): string[] {
  const weaknesses: string[] = [];

  const missingMandatory =
    matches.filter(
      (item) =>
        item.priority === "mandatory" &&
        item.status === "missing"
    );

  const partialMandatory =
    matches.filter(
      (item) =>
        item.priority === "mandatory" &&
        item.status === "partial"
    );

  const missingPreferred =
    matches.filter(
      (item) =>
        item.priority === "preferred" &&
        item.status === "missing"
    );

  if (missingMandatory.length) {
    weaknesses.push(
      `Missing mandatory requirements: ${missingMandatory
        .map((item) => item.requirement)
        .join(", ")}.`
    );
  }

  if (partialMandatory.length) {
    weaknesses.push(
      `Partially supported mandatory requirements: ${partialMandatory
        .map((item) => item.requirement)
        .join(", ")}.`
    );
  }

  if (missingPreferred.length) {
    weaknesses.push(
      `Missing preferred requirements: ${missingPreferred
        .map((item) => item.requirement)
        .join(", ")}.`
    );
  }

  return unique(weaknesses);
}

export function calculateRecruitmentScore(
  candidate: CandidateEvidence,
  job: JobRequirement
): RecruitmentScore {
  const candidateText =
    buildCandidateText(candidate);

  const mandatoryRequirements =
    unique(
      job.mandatorySkills || []
    );

  const preferredRequirements =
    unique(
      job.preferredSkills || []
    );

  const mandatoryMatches =
    matchRequirements(
      candidateText,
      mandatoryRequirements,
      "mandatory"
    );

  const preferredMatches =
    matchRequirements(
      candidateText,
      preferredRequirements,
      "preferred"
    );

  const allMatches = [
    ...mandatoryMatches,
    ...preferredMatches,
  ];

  const skillScore =
    calculateRequirementScore(
      allMatches
    );

  const mandatoryScore =
    calculateRequirementScore(
      mandatoryMatches
    );

  const preferredScore =
    calculateRequirementScore(
      preferredMatches
    );

  const experienceScore =
    scoreExperience(
      candidate,
      job.minimumExperienceYears
    );

  const responsibilityScore =
    scoreResponsibilities(
      candidate,
      job.responsibilities || []
    );

  const educationScore =
    scoreEducation(
      candidate,
      job.educationRequirements || []
    );

  const projectScore =
    scoreProjects(
      candidate,
      job.role
    );

  const certificationScore =
    scoreCertifications(
      candidate,
      job.certifications || []
    );

  /*
   * Universal weighted model.
   *
   * Mandatory skills are deliberately given
   * the highest influence.
   */
  let overallMatch =
    mandatoryScore * 0.30 +
    preferredScore * 0.10 +
    experienceScore * 0.25 +
    responsibilityScore * 0.15 +
    educationScore * 0.10 +
    projectScore * 0.05 +
    certificationScore * 0.05;

  /*
   * Hard caps prevent unrealistic scores when
   * mandatory requirements are missing.
   */
  const missingMandatory =
    mandatoryMatches.filter(
      (item) =>
        item.status === "missing"
    ).length;

  const partialMandatory =
    mandatoryMatches.filter(
      (item) =>
        item.status === "partial"
    ).length;

  if (missingMandatory >= 1) {
    overallMatch =
      Math.min(
        overallMatch,
        79
      );
  }

  if (missingMandatory >= 2) {
    overallMatch =
      Math.min(
        overallMatch,
        69
      );
  }

  if (missingMandatory >= 3) {
    overallMatch =
      Math.min(
        overallMatch,
        59
      );
  }

  if (partialMandatory >= 2) {
    overallMatch =
      Math.min(
        overallMatch,
        84
      );
  }

  overallMatch =
    clamp(overallMatch);

  const missingRequirements =
    allMatches.filter(
      (item) =>
        item.status !== "matched"
    );

  const strengths =
    buildStrengths(
      allMatches,
      candidate
    );

  const weaknesses =
    buildWeaknesses(
      allMatches
    );

  return {
    overallMatch,

    skillScore,
    experienceScore,
    responsibilityScore,
    educationScore,
    projectScore,
    certificationScore,

    mandatoryScore,
    preferredScore,

    matchedRequirements:
      allMatches.filter(
        (item) =>
          item.status === "matched"
      ),

    missingRequirements,

    strengths,
    weaknesses,

    recommendation:
      determineRecommendation(
        overallMatch,
        mandatoryMatches
      ),
  };
}