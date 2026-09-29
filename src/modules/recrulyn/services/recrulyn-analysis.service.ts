export const recrulynAnalysisService = {
  calculateAnalysis(
    candidate: any,
    jdText: string
  ) {
    /*
      ============================================================
      SKILL SYNONYMS
      ============================================================
    */

    const SKILL_SYNONYMS: Record<string, string[]> = {
      react: ["react", "reactjs", "react.js"],

      javascript: ["javascript", "js"],

      typescript: ["typescript", "ts"],

      excel: [
        "excel",
        "ms excel",
        "microsoft excel",
      ],

      "power bi": [
        "power bi",
        "powerbi",
      ],

      sql: [
        "sql",
        "mysql",
        "postgresql",
        "postgres",
      ],

      python: [
        "python",
        "python3",
      ],

      "cybersecurity": [
  "cybersecurity",
  "cyber security",
  "information security",
  "infosec",
],
"ethical hacking": [
  "ethical hacking",
  "ethical hacker",
],
"penetration testing": [
  "penetration testing",
  "penetration test",
  "pentesting",
  "pen testing",
],
"vulnerability assessment": [
  "vulnerability assessment",
  "vulnerability testing",
],
"soc": [
  "soc",
  "security operations center",
  "security operations",
],
"siem": [
  "siem",
  "security information and event management",
],
"incident response": [
  "incident response",
  "incident handling",
],
"digital forensics": [
  "digital forensics",
  "forensics",
],
"network security": [
  "network security",
  "networking security",
],

      "digital marketing": [
        "digital marketing",
        "social media marketing",
        "online marketing",
      ],

      "ui/ux": [
        "ui",
        "ux",
        "ui ux",
        "user experience",
        "user interface",
      ],

      recruitment: [
        "recruitment",
        "talent acquisition",
        "hiring",
      ],
    };

    /*
      ============================================================
      ROLE -> REQUIRED SKILLS
      ============================================================
    */

    const ROLE_SKILLS: Record<string, string[]> = {
  "marketing intern": [
    "digital marketing",
    "excel",
  ],

  "hr intern": [
    "recruitment",
    "excel",
  ],

  "uav engineer": [
    "python",
  ],

  "frontend developer": [
  "react",
  "javascript",
  "typescript",
  "html",
  "css",
  "frontend",
  "front end",
  "web development",
  "ui development",
],

  "finance intern": [
    "excel",
    "power bi",
    "sql",
  ],

  "ui/ux designer": [
    "ui/ux",
  ],

  "cybersecurity intern": [
    "cybersecurity",
    "ethical hacking",
    "penetration testing",
    "vulnerability assessment",
    "soc",
    "siem",
    "incident response",
    "digital forensics",
    "linux",
    "python",
    "network security",
  ],
};

    /*
      ============================================================
      HELPERS
      ============================================================
    */

    function toList(value: unknown): string[] {
      if (Array.isArray(value)) {
        return value
          .map(String)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (
        typeof value === "string" &&
        value.trim()
      ) {
        return value
          .split(/[,;\n|]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      return [];
    }

    function normalizeSkill(skill: string) {
      const lower = skill
        .toLowerCase()
        .trim();

      for (const [
        canonical,
        aliases,
      ] of Object.entries(SKILL_SYNONYMS)) {
        if (
          aliases.some((alias) =>
            lower.includes(alias.toLowerCase())
          )
        ) {
          return canonical;
        }
      }

      return lower;
    }

    /*
      ============================================================
      RESUME TEXT
      ============================================================
    */

    const resumeSource =
      typeof candidate === "string"
        ? candidate
        : candidate?.resumeText ||
          candidate?.resume_text ||
          "";

    const resume = String(
      resumeSource
    ).toLowerCase();

    /*
      ============================================================
      JOB DESCRIPTION / ROLE
      ============================================================
    */

    const jd = String(
      jdText || ""
    ).toLowerCase();

    /*
      The first line is the role because the AI Recruiter
      creates jdText like:

      role
      skill1
      skill2
      ...
    */

    const jdLines = String(
      jdText || ""
    )
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const roleName =
      jdLines[0]?.toLowerCase().trim() || "";

    /*
      Find role-specific required skills.
    */

    const roleSkills =
      Object.entries(ROLE_SKILLS)
        .filter(([role]) =>
          roleName.includes(role)
        )
        .flatMap(([, skills]) => skills);

    /*
      Find explicitly supplied skills from the JD.

      Only skills that actually occur in the JD are added.
    */

    const detectedJdSkills =
      Object.keys(SKILL_SYNONYMS).filter(
        (skill) => {
          const aliases =
            SKILL_SYNONYMS[skill];

          return (
            jd.includes(skill) ||
            aliases.some((alias) =>
              jd.includes(
                alias.toLowerCase()
              )
            )
          );
        }
      );

    /*
      Combine role skills + explicitly supplied skills.
    */

    const knownSkills = [
      ...new Set([
        ...roleSkills,
        ...detectedJdSkills,
      ]),
    ];

    /*
      ============================================================
      NORMALIZE RESUME SKILLS
      ============================================================
    */

    const normalizedResume =
      Object.entries(
        SKILL_SYNONYMS
      ).reduce(
        (text, [canonical, aliases]) => {
          let result = text;

          aliases.forEach(
            (alias) => {
              result =
                result.replaceAll(
                  alias.toLowerCase(),
                  canonical
                );
            }
          );

          return result;
        },
        resume
      );

    /*
      ============================================================
      EXTRACT RESUME SECTIONS
      ============================================================
    */

    const skills = Array.isArray(
      candidate?.skills
    )
      ? candidate.skills
      : toList(candidate?.skills);

    const projects = Array.isArray(
      candidate?.projects
    )
      ? candidate.projects
      : toList(candidate?.projects);

    const experience = Array.isArray(
      candidate?.experience
    )
      ? candidate.experience
      : toList(candidate?.experience);

    const education = Array.isArray(
      candidate?.education
    )
      ? candidate.education
      : toList(candidate?.education);

    const certifications = Array.isArray(
      candidate?.certifications
    )
      ? candidate.certifications
      : toList(
          candidate?.certifications
        );

    /*
      ============================================================
      SKILL MATCHING
      Maximum contribution: 45 points
      ============================================================
    */

    const matched: string[] = [];
    const missing: string[] = [];

    knownSkills.forEach(
      (skill) => {
        const canonical =
          normalizeSkill(skill);

        const aliases =
          SKILL_SYNONYMS[canonical] ||
          [canonical];

        /*
          Check whether this required skill
          is actually present in the JD.
        */

        const skillRequired =
          roleSkills.includes(canonical) ||
          aliases.some((alias) =>
            jd.includes(
              alias.toLowerCase()
            )
          );

        if (!skillRequired) {
          return;
        }

        /*
          Check whether the candidate resume
          contains the required skill.
        */

        const skillPresent =
          normalizedResume.includes(
            canonical
          ) ||
          aliases.some((alias) =>
            normalizedResume.includes(
              alias.toLowerCase()
            )
          );

        if (skillPresent) {
          matched.push(canonical);
        } else {
          missing.push(canonical);
        }
      }
    );

    const uniqueMatched = [
      ...new Set(matched),
    ];

    const uniqueMissing = [
      ...new Set(missing),
    ];

    /*
      ============================================================
      RESULT COLLECTIONS
      ============================================================
    */

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const interviewQuestions: string[] = [];
    const riskFactors: string[] = [];

    /*
      ============================================================
      SKILL SCORE
      Maximum: 45
      ============================================================
    */

    const totalRequiredSkills =
      uniqueMatched.length +
      uniqueMissing.length;

    const skillMatchPercentage =
      totalRequiredSkills > 0
        ? (
            uniqueMatched.length /
            totalRequiredSkills
          ) * 100
        : 0;

    const skillScore =
      skillMatchPercentage * 0.45;

    /*
      ============================================================
      EXPERIENCE SCORE
      Maximum: 25
      ============================================================
    */

    let experienceScore = 0;

    if (experience.length > 0) {
      experienceScore = Math.min(
        25,
        experience.length * 8
      );
      
      strengths.push(
        "Relevant experience is present in the resume."
      );
      
    } else {
      weaknesses.push(
        "No internship or industry experience detected."
      );

      riskFactors.push(
        "No internship or industry experience."
      );
    }

    /*
      ============================================================
      EDUCATION SCORE
      Maximum: 15
      ============================================================
    */

    let educationScore = 0;

    if (education.length > 0) {
      educationScore = Math.min(
        15,
        education.length * 8
      );

      strengths.push(
        "Educational qualification is present."
      );

      
    } else {
      weaknesses.push(
        "Education details were not detected."
      );
    }

    /*
      ============================================================
      PROJECT SCORE
      Maximum: 10
      ============================================================
    */

    let projectScore = 0;

    if (projects.length > 0) {
      projectScore = Math.min(
        10,
        projects.length * 4
      );

      strengths.push(
        "Project experience is present in the resume."
      );

     
    } else {
      weaknesses.push(
        "No projects were detected."
      );
    }

    /*
      ============================================================
      EVIDENCE / COMPLETENESS SCORE
      Maximum: 5
      ============================================================
    */

    let evidenceScore = 0;

    if (skills.length > 0) {
      evidenceScore += 1;
    }

    if (projects.length > 0) {
      evidenceScore += 1;
    }

    if (experience.length > 0) {
      evidenceScore += 1;
    }

    if (education.length > 0) {
      evidenceScore += 1;
    }

    if (certifications.length > 0) {
      evidenceScore += 1;
    }

    /*
      ============================================================
      FINAL SCORE
      ============================================================
    */

    let score =
      skillScore +
      experienceScore +
      educationScore +
      projectScore +
      evidenceScore;

    /*
      Prevent artificially high scores when
      required skills are missing.
    */

    if (
      uniqueMissing.length >= 1 &&
      score > 89
    ) {
      score = 89;
    }

    if (
      uniqueMissing.length >= 2 &&
      score > 79
    ) {
      score = 79;
    }

    if (
      uniqueMissing.length >= 4 &&
      score > 69
    ) {
      score = 69;
    }

    score = Math.max(
      0,
      Math.min(
        Math.round(score),
        100
      )
    );

    /*
      ============================================================
      STRENGTHS
      ============================================================
    */

    uniqueMatched
      .slice(0, 8)
      .forEach((skill) => {
        strengths.push(
          `Resume matches ${skill}.`
        );
      });

    /*
      ============================================================
      WEAKNESSES
      ============================================================
    */

    uniqueMissing
      .slice(0, 8)
      .forEach((skill) => {
        weaknesses.push(
          `Missing required skill: ${skill}.`
        );
      });

    /*
      ============================================================
      INTERVIEW QUESTIONS
      ============================================================
    */

    uniqueMatched
      .slice(0, 5)
      .forEach((skill) => {
        interviewQuestions.push(
          `Explain your experience with ${skill}.`
        );
      });

    uniqueMissing
      .slice(0, 3)
      .forEach((skill) => {
        interviewQuestions.push(
          `Do you have experience with ${skill}?`
        );
      });

    /*
      ============================================================
      RISK FACTORS
      ============================================================
    */

    if (
      uniqueMissing.length >= 4
    ) {
      riskFactors.push(
        "Several required skills are missing from the resume."
      );
    } else if (
      uniqueMissing.length > 0
    ) {
      riskFactors.push(
        "Some required skills are missing from the resume."
      );
    }

    if (
      jd.trim() &&
      totalRequiredSkills === 0
    ) {
      riskFactors.push(
        "No clearly identifiable technical or role-specific skills were detected in the Job Description."
      );
    }

    /*
      ============================================================
      RECOMMENDATION
      ============================================================
    */

    let recommendation =
      "Not Recommended";

    let analysisSummary =
      "Significant gaps against requirements.";

    if (score >= 80) {
      recommendation =
        "Highly Recommended";

      analysisSummary =
        "Strong match with the supplied Job Description.";
    } else if (score >= 60) {
      recommendation =
        "Recommended";

      analysisSummary =
        "Good candidate with some skill gaps.";
    } else if (score >= 40) {
      recommendation =
        "Consider";

      analysisSummary =
        "Partial match. Requires further review.";
    }

    /*
      ============================================================
      RETURN RESULT
      ============================================================
    */

    const matchedSkillNames =
      uniqueMatched.join(", ");

    const missingSkillNames =
      uniqueMissing.join(", ");

    return {
      score,

      matchedKeywords:
        matchedSkillNames,

      missingKeywords:
        missingSkillNames,

      recommendation,

      analysisSummary,

      strengths: [
        ...new Set(strengths),
      ].join("\n"),

      weaknesses: [
        ...new Set(weaknesses),
      ].join("\n"),

      interviewQuestions: [
        ...new Set(
          interviewQuestions
        ),
      ].join("\n"),

      riskFactors: [
        ...new Set(riskFactors),
      ].join("\n"),
    };
  },
};