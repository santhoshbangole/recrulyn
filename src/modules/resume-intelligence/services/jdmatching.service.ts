export interface JobDescription {
  title: string;
  description: string;
}

export interface CandidateResume {
  skills: string[];
  education: string;
  experience: string;
  projects: string;
  certifications: string;
}

export const jdMatchingService = {
  matchResume(
    jd: JobDescription,
    resume: CandidateResume
  ) {
    const jdText =
      `${jd.title} ${jd.description}`.toLowerCase();

    const skills = resume.skills || [];

    let skillMatch = 0;
    let matchedSkills: string[] = [];
    let missingSkills: string[] = [];

    skills.forEach((skill) => {
      if (jdText.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
        skillMatch += 10;
      }
    });

    const commonSkills = [
      "python",
      "java",
      "react",
      "node",
      "typescript",
      "javascript",
      "sql",
      "docker",
      "aws",
      "linux",
      "opencv",
      "matlab",
      "ros",
      "c++",
      "embedded"
    ];

    commonSkills.forEach((skill) => {
      if (
        jdText.includes(skill) &&
        !matchedSkills
          .map((s) => s.toLowerCase())
          .includes(skill)
      ) {
        missingSkills.push(skill);
      }
    });

    let educationMatch = 0;

    if (
      jdText.includes("b.tech") ||
      jdText.includes("engineering")
    ) {
      educationMatch = 100;
    }

    let experienceMatch = 70;

    if (
      resume.experience.toLowerCase().includes("intern")
    ) {
      experienceMatch = 90;
    }

    let projectMatch = 70;

    if (
      resume.projects.length > 20
    ) {
      projectMatch = 90;
    }

    const overall =
      Math.round(
        skillMatch * 0.4 +
        educationMatch * 0.2 +
        experienceMatch * 0.2 +
        projectMatch * 0.2
      );

    return {
      overallMatch: Math.min(overall, 100),
      skillMatch: Math.min(skillMatch, 100),
      educationMatch,
      experienceMatch,
      projectMatch,
      matchedSkills,
      missingSkills,
    };
  },
};