import { Brain, Search, FileSearch, Sparkles } from "lucide-react";

const steps = [
  {
    icon: FileSearch,
    title: "Reading Resume Intelligence",
    description: "Loading structured candidate profiles...",
  },
  {
    icon: Search,
    title: "Finding Matching Candidates",
    description: "Comparing role and skills against every resume...",
  },
  {
    icon: Brain,
    title: "Calculating AI Match Score",
    description: "Evaluating strengths, weaknesses and skill match...",
  },
  {
    icon: Sparkles,
    title: "Preparing Recommendations",
    description: "Ranking candidates and generating interview insights...",
  },
];

export default function AnalysisProgress() {
  return (
    <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border-default bg-base-100 p-10">

      <div className="text-center">

        <div className="mb-4 text-6xl">
          🤖
        </div>

        <h2 className="text-3xl font-bold">
          Recrulyn AI is analyzing candidates...
        </h2>

        <p className="mt-3 text-muted-foreground">
          This usually takes only a few seconds.
        </p>

      </div>

      <div className="mt-10 h-3 overflow-hidden rounded-full bg-base-200">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-signal-violet" />
      </div>

      <div className="mt-10 space-y-6">

        {steps.map((step) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="flex items-start gap-4 rounded-2xl border border-border-default p-5"
            >
              <div className="rounded-xl bg-signal-violet/10 p-3">
                <Icon
                  size={22}
                  className="text-signal-violet"
                />
              </div>

              <div>
                <h3 className="font-semibold">
                  {step.title}
                </h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}