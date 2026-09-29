import { GlassCard } from "../../../components/ui/GlassCard";

type MatchingResultsProps = {
  children: React.ReactNode;
  resultsRef: React.RefObject<HTMLDivElement | null>;
  matchingResult: any;
  notify: any;
  exportPdf: () => void;
};

export default function MatchingResults({
  children,
  resultsRef,
  matchingResult,
  notify,
  exportPdf,
}: MatchingResultsProps) {
  return (
  <div ref={resultsRef}>
    <GlassCard className="p-6">

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDEAE0] pb-4">

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6558]">
            Results
          </span>

          <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#1C1B18]">
            Matching Results
          </h2>
        </div>

        <button
          onClick={() => {
            if (!matchingResult) {
              notify.error("No matching result to export.");
              return;
            }

            exportPdf();
          }}
          className="rounded-xl border border-[#DEDACE] px-3.5 py-1.5 text-sm font-medium text-[#1C1B18] transition-colors hover:bg-[#3730A3]/5"
        >
          Export PDF
        </button>

      </div>

      <div className="mt-5">
        {children}
      </div>

    </GlassCard>
  </div>
);
}