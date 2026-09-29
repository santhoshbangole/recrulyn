export const resumeParserService = {
  async extractResumeData(
    _resumeText: string
  ) {
    return {
      skills: "",
      education: "",
      experience: "",
      projects: "",
      certifications: "",
      strengths: "",
      weaknesses: "",
    };
  },
};