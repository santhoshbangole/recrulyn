import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type {
  AIRecruiterResult,
} from "../types/ai-recruiter.types";
import { recrulynShortlistService } from "../services/recrulyn-shortlist.service";
import { useNotification } from "../../../components/notification/useNotification";
interface Props {
  candidate: AIRecruiterResult;
}

export default function CandidateCard({
  candidate,
}: Props) {
    const navigate = useNavigate();
const notify = useNotification();
    async function handleShortlist() {
  try {

    await recrulynShortlistService.shortlistCandidate({

      requirement_role: candidate.requirement_role || "",

      required_skills:
  candidate.required_skills || "",

      candidate_id:
        candidate.id,

      candidate_name:
        candidate.candidate_name,

      email:
        candidate.email,

      ai_score:
        candidate.ai_score,

      shortlisted_by:
        "HR",

    });

    notify.success(
  "Success",
  "Candidate shortlisted successfully."
);

  } catch (error) {

    console.error(error);

    notify.error(
  "Failed",
  "Failed to shortlist candidate."
);

  }
}
  return (
<div className="w-full min-w-0 overflow-hidden rounded-3xl border border-border-default bg-base-100 p-6 transition hover:shadow-xl">
      {/* Header */}

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-semibold">
            {candidate.candidate_name}
          </h2>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
  <Mail size={15} className="shrink-0" />
  <span className="min-w-0 break-all">
    {candidate.email}
  </span>
</div>

        </div>

        <div className="text-right">

          <div className="text-3xl font-bold text-signal-violet">
            {candidate.ai_score}%
          </div>

          <div className="text-xs text-muted-foreground">
            Match Score
          </div>

        </div>

      </div>

      {/* Recommendation */}

      <div className="mt-6">

        <span className="inline-flex max-w-full break-words rounded-full  bg-signal-violet/10 px-4 py-2 text-sm font-semibold text-signal-violet">
          {candidate.recommendation}
        </span>

      </div>

      {/* Skills */}

      <div className="mt-6">

        <p className="mb-3 text-sm font-semibold">
          Matched Skills
        </p>

        <div className="flex flex-wrap gap-2">

          {String(candidate.matched_keywords || "")
            .split(",")
            .filter(Boolean)
            .slice(0, 6)
            .map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-700"
              >
                {skill.trim()}
              </span>
            ))}

        </div>

      </div>

      {/* Strength */}

      <div className="mt-6 flex items-start gap-3">

        <CheckCircle2
          className="mt-1 text-green-600"
          size={18}
        />

        <div>

          <div className="font-medium">
            Strengths
          </div>

<p className="break-words text-sm text-muted-foreground">            {candidate.strengths || "No strengths available."}
          </p>

        </div>

      </div>

      {/* Weakness */}

      <div className="mt-5 flex items-start gap-3">

        <AlertCircle
          className="mt-1 text-orange-500"
          size={18}
        />

        <div>

          <div className="font-medium">
            Weaknesses
          </div>

<p className="break-words text-sm text-muted-foreground">            {candidate.weaknesses || "No weaknesses available."}
          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-8 flex gap-4">

      <button
  type="button"
  onClick={() =>
    navigate(
      `/app/candidate-review/${candidate.id}`
    )
  }
  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-signal-violet py-3 text-white"
>
  <Eye size={18} />
  View Resume
</button>

        <button
  onClick={handleShortlist}
  className="rounded-xl bg-signal-violet px-6 py-3 text-white"
>
  ⭐ Shortlist
</button>
      </div>

    </div>
  );
}