import { groqChatCompletion } from "../../../lib/groq-client";

export const geminiRecruiterService = {
  async ask(question: string, candidates: any[]) {


    const q = question.toLowerCase();
    if (q.includes("compare")) {

  const context = candidates.map((c) => {

    const p = c.candidate_profiles?.[0] || {};

    return {
      name: c.full_name,
      email: c.email,
      status: c.status,
      aiScore: c.ai_score,
      role: p.recommended_role,
      skills: p.skills,
      education: p.education,
      experience: p.experience,
      summary: p.career_summary,
    };

  });

  const prompt = `
You are Recrulyn, the AI HR Copilot.

Compare these candidates.

Use ONLY the data below.

${JSON.stringify(context)}

Return:
1. Comparison table
2. Strengths
3. Weaknesses
4. Best Candidate
5. Recommendation
`;

  const completion = await groqChatCompletion({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return (
    completion.choices[0]?.message?.content ||
    "No comparison available."
  );
}

    // ---------- Filter Candidates ----------
    let filtered = [...candidates];

    if (q.includes("new")) {
      filtered = filtered.filter(
        c => c.status === "NEW"
      );
    }

    if (q.includes("interview")) {
      filtered = filtered.filter(
        c =>
          c.status?.toLowerCase().includes("interview")
      );
    }

    if (q.includes("selected")) {
      filtered = filtered.filter(
        c =>
          c.status?.toLowerCase().includes("selected")
      );
    }

    if (q.includes("react")) {
      filtered = filtered.filter(c =>
        JSON.stringify(c)
          .toLowerCase()
          .includes("react")
      );
    }

    if (q.includes("python")) {
      filtered = filtered.filter(c =>
        JSON.stringify(c)
          .toLowerCase()
          .includes("python")
      );
    }

    // Highest AI Score First
    filtered.sort(
      (a, b) => (b.ai_score || 0) - (a.ai_score || 0)
    );
    // Best / Top Candidate
if (
  q.includes("best") ||
  q.includes("top")
) {

  return filtered
    .slice(0, 5)
    .map(
      (c, i) =>
        `${i + 1}. ${c.full_name}
⭐ AI Score: ${c.ai_score}
📌 Status: ${c.status}`
    )
    .join("\n\n");

}
// Count
if (
  q.includes("how many")
) {

  return `Found ${filtered.length} matching candidate(s).`;

}
// List Candidates
if (
  q.includes("list") ||
  q.includes("show") ||
  q.includes("find")
) {

  return filtered
    .slice(0, 20)
    .map(
      c =>
        `• ${c.full_name} (${c.status}) - ${c.ai_score}%`
    )
    .join("\n");

}

    // Send ONLY top 20 candidates
    filtered = filtered.slice(0, 20);

   const context = filtered.map((c) => {

  const p =
    c.candidate_profiles?.[0] || {};

  return {
    name: c.full_name,
    email: c.email,
    status: c.status,
    aiScore: c.ai_score,
    role: p.recommended_role,
    skills: p.skills,
    education: p.education,
    experience: p.experience,
    summary: p.career_summary
  };

});

 const prompt = `
You are Recrulyn, the AI HR Copilot.

Rules:

- Use ONLY the candidate data provided.
- Never invent information.
- Keep the response concise and professional.
- Use markdown formatting.
- Do not repeat information.
- Maximum 120 words.

If ONLY ONE candidate is provided, return:

## Candidate Summary

**Name**
**Status**
**AI Score**

**Profile**
Write a maximum of 2 short sentences using the available information only.

**Key Skills**
List up to 5 important skills if available.

**Recommendation**
One short HR recommendation.

---------------------------------------

If MULTIPLE candidates are provided, return:

## Candidate Comparison

- Markdown comparison table
- Strengths
- Recommendation

Do NOT include:
- Best Candidate
- Reason
- Weaknesses (unless specifically asked)

Candidate Data:

${JSON.stringify(context)}

Question:

${question}
`;
try {

 const completion = await groqChatCompletion({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

return (
  completion.choices[0]?.message?.content ||
  "No response from Recrulyn."
);

}catch (error: any) {

  console.error("Groq Error:", error);

  if (error?.status === 429) {

    return `🚫 Recrulyn AI is temporarily unavailable because the Groq rate limit has been reached.

You can still use:
• Candidate Search
• Resume Filtering
• Database Queries

Please try again in a few moments.`;

  }

  if (error?.status >= 500) {

    return `⏳ Recrulyn AI service is temporarily unavailable. Please try again shortly.`;

  }

  return `❌ AI Error: ${error?.message || "Unknown error."}`;

}
}
};