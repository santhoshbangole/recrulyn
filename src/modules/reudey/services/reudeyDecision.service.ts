export const reudeyDecisionService = {

  shouldUseGemini(question: string): boolean {

    const q = question.toLowerCase();

    const aiQuestions = [
      "compare",
      "comparison",
      "summarize",
      "summary",
      "tell me",
      "about",
      "who is",
      "analyze",
      "analysis",
      "why",
      "reason",
      "strength",
      "strengths",
      "weakness",
      "weaknesses",
      "recommend",
      "recommendation",
      "career summary",
      "interview questions",
      "draft",
      "email",
      "explain"
    ];

    // AI questions always take priority
    if (
      aiQuestions.some(word => q.includes(word))
    ) {
      return true;
    }

    const databaseQuestions = [
      "best",
      "top",
      "show",
      "find",
      "list",
      "candidate",
      "candidates",
      "employee",
      "employees",
      "intern",
      "internship",
      "react",
      "python",
      "java",
      "node",
      "flutter",
      "status",
      "selected",
      "rejected",
      "interview",
      "new",
      "score",
      "above",
      "below",
      "how many",
      "count"
    ];

    if (
      databaseQuestions.some(word => q.includes(word))
    ) {
      return false;
    }

    return false;

  },

};