export interface CandidateFilters {
  status?: string;
  minScore?: number;
  maxScore?: number;
  skills: string[];
  location?: string;
  role?: string;
}

export const reudeyFilterService = {

  extract(question: string): CandidateFilters {

    const q = question.toLowerCase();

    const filters: CandidateFilters = {
      skills: [],
    };

    // ---------- Status ----------

    if (q.includes("new"))
      filters.status = "NEW";

    if (q.includes("interview"))
      filters.status = "INTERVIEW";

    if (q.includes("selected"))
      filters.status = "SELECTED";

    if (q.includes("rejected"))
      filters.status = "REJECTED";

    // ---------- AI Score ----------

    const score =
      q.match(/(\d+)/);

    if (score)
      filters.minScore =
        Number(score[1]);

    // ---------- Skills ----------

    const skills = [
      "react",
      "node",
      "nodejs",
      "python",
      "java",
      "spring",
      "spring boot",
      "javascript",
      "typescript",
      "angular",
      "vue",
      "mysql",
      "postgresql",
      "mongodb",
      "html",
      "css",
      "flutter",
      "dart",
      "aws",
      "azure",
      "docker",
      "kubernetes",
      "figma",
      "ui",
      "ux",
      "seo",
      "content writing",
      "content writer",
      "machine learning",
      "deep learning",
      "ai",
      "data science",
      "c",
      "c++",
      "c#"
    ];

    skills.forEach(skill => {

      if (q.includes(skill))
        filters.skills.push(skill);

    });

    return filters;

  },
  apply(candidates: any[], filters: CandidateFilters) {

  return candidates.filter((candidate) => {

    const profile =
      candidate.candidate_profiles?.[0] || {};

    // Status
    if (
      filters.status &&
      candidate.status !== filters.status
    ) {
      return false;
    }

    // AI Score
    if (
      filters.minScore &&
      Number(candidate.ai_score || 0) <
        filters.minScore
    ) {
      return false;
    }

    // Skills
    if (filters.skills.length) {

      const skills =
        JSON.stringify(profile.skills || "")
          .toLowerCase();

      const found =
        filters.skills.every(skill =>
          skills.includes(skill)
        );

      if (!found) return false;
    }

    return true;

  });

},

};