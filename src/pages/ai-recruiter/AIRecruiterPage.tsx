import GlassCard from "../../components/ui/GlassCard";
import RecruiterPrompt from "../../modules/ai-recruiter/components/RecruiterPrompt";
import { useState } from "react";
import { ArrowLeft, Bot } from "lucide-react";

import AnalysisProgress from "../../modules/ai-recruiter/components/AnalysisProgress";
import CandidateResults from "../../modules/ai-recruiter/components/CandidateResults";
import { aiRecruiterService } from "../../modules/ai-recruiter/services/ai-recruiter.service";
import type { AIRecruiterState } from "../../modules/ai-recruiter/types/ai-recruiter-state";
import { useNotification } from "../../components/notification/useNotification";
import type { AIRecruiterResult } from "../../modules/ai-recruiter/types/ai-recruiter.types";

/* ============================================================
   DESIGN TOKENS — RUDE ONE Enterprise HR Design System v1.0
   Same palette as the Dashboard, Topbar, and Sidebar. Worth
   lifting into one shared tokens file once all pages are in
   place, so this can't drift from the system.
============================================================ */
const PRIMARY = "#3F6B46";
const SURFACE = "#F8F6F2";
const BORDER = "#E7E2D9";
const TEXT_PRIMARY = "#1D1D1F";
const TEXT_SECONDARY = "#555555";

export default function AIRecruiterPage() {
  const [state, setState] = useState<AIRecruiterState>("EMPTY");

  const [results, setResults] = useState<AIRecruiterResult[]>([]);
  const notification = useNotification();

  // 👇 ADD HERE
  async function handleAnalyze(requirementId: string, extraSkills: string[]) {
    try {
      setState("ANALYZING");

      const rankedCandidates = await aiRecruiterService.findCandidates(
        requirementId,
        extraSkills,
      );

      setResults(rankedCandidates);

      setState("RESULTS");
    } catch (error) {
      console.error(error);

      notification.error(
        "Analysis Failed",
        (error as Error)?.message || "Unable to analyze the resumes.",
      );

      setState("EMPTY");
    }
  }

  // 👇 Existing return stays below
  return (
    <div className="space-y-8" style={{ background: SURFACE }}>
      {/* Eyebrow — ties this page to the same system as Dashboard/Sidebar/Topbar */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span
          className="h-[6px] w-[6px] rounded-full"
          style={{ background: PRIMARY }}
        />
        <span
          className="text-[13px] font-bold uppercase tracking-[0.15em]"
          style={{ color: PRIMARY }}
        >
          AI Recruiter
        </span>
      </div>

     <GlassCard
  className="overflow-hidden !rounded-[20px] !border !bg-white !shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.06)]"
>
        <div className="mx-auto flex max-w-5xl flex-col items-center px-10 py-16">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "rgba(63,107,70,0.1)" }}
          >
            <Bot size={40} strokeWidth={1.5} style={{ color: PRIMARY }} />
          </div>

          <h1
            className="text-center text-[40px] font-bold leading-tight"
            style={{ color: TEXT_PRIMARY }}
          >
            Who would you like to hire today?
          </h1>

          <p
            className="mt-5 max-w-2xl text-center text-[18px] leading-relaxed"
            style={{ color: TEXT_SECONDARY }}
          >
            Tell Recrulyn the role you're hiring for. Our AI will analyze every
            uploaded resume, calculate candidate match scores, and recommend the
            best applicants.
          </p>
          {state === "EMPTY" && (
            <RecruiterPrompt
              onAnalyze={(input) =>
                handleAnalyze(input.requirementId || "", [])
              }
            />
          )}

          {state === "ANALYZING" && <AnalysisProgress />}

          {state === "RESULTS" && (
            <div className="w-full">
              <button
                type="button"
                onClick={() => {
                  setResults([]);
                  setState("EMPTY");
                }}
                className="mb-6 flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
                style={{
                  borderColor: BORDER,
                  color: TEXT_PRIMARY,
                }}
              >
                <ArrowLeft size={18} />
                Back
              </button>

              <CandidateResults candidates={results} />
            </div>
          )}
        </div>
      </GlassCard>

      {/* Dev state preview — same handlers as before, restyled to match the
          system's secondary-button spec (white fill, soft border, rounded). */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="flex justify-center gap-4"></div>
      </div>
    </div>
  );
}
