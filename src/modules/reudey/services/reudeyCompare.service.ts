import { geminiRecruiterService } from "./geminiRecruiter.service";

export const reudeyCompareService = {
  isCompare(question: string) {
    return question.toLowerCase().includes("compare");
  },

  getNames(question: string) {
    const text = question
      .replace(/compare/i, "")
      .replace(/\?/g, "")
      .trim();

    const names = text
      .split(/\band\b|,/i)
      .map(n => n.trim())
      .filter(Boolean);

    return names;
  },

 async compare(question: string, candidates: any[]) {

  const names = this.getNames(question);

  console.log("Searching:", names);

  console.log(
    "Candidates:",
    candidates.map(c => c.full_name)
  );

  const selected = candidates.filter(c => {

    const fullName =
      (c.full_name || "").toLowerCase();

    return names.some(name => {

      const search =
        name.toLowerCase().trim();

      return (
        fullName.includes(search) ||
        search.includes(fullName) ||
        fullName
          .split(" ")
          .some((part: string) =>
  part.startsWith(search)
)
      );

    });

  });

  console.log("Matched:", selected);

  if (selected.length < 2) {
    return "I couldn't find both candidates.";
  }

  return await geminiRecruiterService.ask(
    `Compare these candidates.\n${question}`,
    selected
  );

}
};