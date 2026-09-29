import CandidateCard from "./CandidateCard";
import type {
  AIRecruiterResult,
} from "../types/ai-recruiter.types";

interface Props {
  candidates: AIRecruiterResult[];
}

export default function CandidateResults({
  candidates,
}: Props) {
  return (
    <div className="mx-auto mt-10 max-w-7xl">

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">
            Best Matching Candidates
          </h2>

          <p className="mt-2 text-muted-foreground">
            AI ranked candidates based on resume relevance.
          </p>

        </div>

        <div className="rounded-2xl bg-signal-violet/10 px-6 py-4">

          <div className="text-3xl font-bold text-signal-violet">
            {candidates.length}
          </div>

          <div className="text-sm">
            Matches Found
          </div>

        </div>

      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-default p-12 text-center text-muted-foreground">
          No candidates currently meet the fit threshold for this role.
          Try a role with a fuller job description, or check back once more
          candidates have applied.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">

          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
            />
          ))}

        </div>
      )}

    </div>
  );
}