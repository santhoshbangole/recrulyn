export interface ReudeyAction {
  type:
    | "MOVE_TO_INTERVIEW"
    | "SELECT_CANDIDATE"
    | "REJECT_CANDIDATE"
    | "GENERATE_LOA"
    | "SEND_EMAIL"
    | "NONE";

  candidateName?: string;
}

export const reudeyActionService = {

  detect(question: string): ReudeyAction {

    const q = question.toLowerCase();

    if (
      q.includes("move") &&
      q.includes("interview")
    ) {
      return {
        type: "MOVE_TO_INTERVIEW",
      };
    }

    if (
      q.includes("select")
    ) {
      return {
        type: "SELECT_CANDIDATE",
      };
    }

    if (
      q.includes("reject")
    ) {
      return {
        type: "REJECT_CANDIDATE",
      };
    }

    if (
      q.includes("loa")
    ) {
      return {
        type: "GENERATE_LOA",
      };
    }

    if (
      q.includes("email") ||
      q.includes("mail")
    ) {
      return {
        type: "SEND_EMAIL",
      };
    }

    return {
      type: "NONE",
    };

  },

};