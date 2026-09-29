import { QUESTION_BANK }
from "../data/question-bank";

export const recrulynQuestionService = {
  generateQuestions(
  role: string,
  skills: string,
  score: number
) {
    const skillText =
      (skills || "").toLowerCase();

    const questions: string[] = [];
const roleText =
  (role || "")
    .toLowerCase();

const isHR =
  roleText.includes("hr");

const isFinance =
  roleText.includes("finance");

const isMarketing =
  roleText.includes("marketing");

const isSales =
  roleText.includes("business") ||
  roleText.includes("sales");

const isSoftware =
  roleText.includes("software");

const isUIUX =
  roleText.includes("ui") ||
  roleText.includes("ux");

const isGraphic =
  roleText.includes("graphic");

const isUAV =
  roleText.includes("uav");
    /*
      Technical Questions
    */
    Object.entries(
  QUESTION_BANK.technical
).forEach(
  ([skill, bank]) => {

    if (
      typeof bank !== "object" ||
      Array.isArray(bank)
    ) {

      if (
        skillText.includes(skill)
      ) {
        const selected =
          score >= 80
            ? bank.slice(0, 4)
            : score >= 60
            ? bank.slice(0, 3)
            : bank.slice(0, 2);

        questions.push(
          ...selected
        );
      }

    }

  }
);

    /*
      Scenario Questions
    */
    questions.push(
      ...QUESTION_BANK.scenario.slice(
        0,
        3
      )
    );
if (isHR) {
  const level =
    score >= 80
      ? "advanced"
      : score >= 60
      ? "intermediate"
      : "beginner";

  questions.push(
    ...QUESTION_BANK.technical.hr[level].slice(0, 3)
  );
}

if (isFinance) {
  const level =
    score >= 80
      ? "advanced"
      : score >= 60
      ? "intermediate"
      : "beginner";

  questions.push(
    ...QUESTION_BANK.technical.finance[level].slice(0, 3)
  );
}

if (isMarketing) {
  const level =
    score >= 80
      ? "advanced"
      : score >= 60
      ? "intermediate"
      : "beginner";

  questions.push(
    ...QUESTION_BANK.technical.marketing[level].slice(0, 3)
  );
} 
if (isSales) {
  questions.push(
    ...QUESTION_BANK.technical.sales.slice(0, 3)
  );
}

if (isSoftware) {
  // skills-based questions already cover this
}

if (isUIUX) {
  questions.push(
    ...QUESTION_BANK.technical.uiux.slice(0, 3)
  );
}

if (isGraphic) {
  questions.push(
    ...QUESTION_BANK.technical.graphicdesign.slice(0, 3)
  );
}

if (isUAV) {
  questions.push(
    ...QUESTION_BANK.technical.uav.slice(0, 3)
  );
}
    /*
      Behavioral Questions
    */
    questions.push(
      ...QUESTION_BANK.behavioral.slice(
        0,
        3
      )
    );

    /*
      Culture Fit
    */
    questions.push(
      ...QUESTION_BANK.cultureFit.slice(
        0,
        2
      )
    );

    return questions;
  },
};