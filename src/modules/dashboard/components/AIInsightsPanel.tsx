import { motion } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  ShieldAlert,
  Users2,
} from "lucide-react";
import { clsx } from "clsx";

import GlassCard from "../../../components/ui/GlassCard";
import { EmptyState } from "../../../components/ui/EmptyState";

import type { AIInsight, RiskLevel } from "../../../types/domain";

interface AIInsightsPanelProps {
  insights: AIInsight[] | null;
  loading: boolean;
}

const CATEGORY_ICON: Record<
  AIInsight["category"],
  typeof TrendingUp
> = {
  pipeline: TrendingUp,
  retention: Users2,
  sourcing: Sparkles,
  compliance: ShieldAlert,
  velocity: TrendingUp,
};

const SEVERITY_DOT: Record<RiskLevel, string> = {
  low: "bg-signal-green",
  medium: "bg-signal-amber",
  high: "bg-signal-red",
};

function timeAgo(iso: string): string {
  const diffMs =
    Date.now() - new Date(iso).getTime();

  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);

  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export function AIInsightsPanel({
  insights,
  loading,
}: AIInsightsPanelProps) {
  return (
    <GlassCard className="h-full p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-signal-violet/10 text-signal-violet">
            <Sparkles
              size={14}
              strokeWidth={2.25}
            />
          </span>

          <h2 className="text-[14px] font-semibold text-text-primary">
            Signals from Recrulyn AI
          </h2>
        </div>

        <span className="text-[11px] text-text-tertiary">
          Live
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-base-200"
            />
          ))}
        </div>
      ) : !insights || insights.length === 0 ? (
        <EmptyState
          title="No signals surfaced yet"
          description="Recrulyn AI is monitoring recruitment activity."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {insights.map((insight, i) => {
            const Icon =
              CATEGORY_ICON[
                insight.category
              ] ?? Sparkles;

            return (
              <motion.li
                key={insight.id}
                initial={{
                  opacity: 0,
                  x: -6,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.04,
                }}
                className="rounded-xl px-3 py-3 transition-colors hover:bg-base-200"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={clsx(
                      "mt-2 h-2 w-2 rounded-full",
                      SEVERITY_DOT[
                        insight.severity
                      ]
                    )}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon
                        size={12}
                        className="text-text-tertiary"
                      />

                      <p className="font-medium text-text-primary">
                        {insight.title}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                      {insight.body}
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-tertiary">
                      <span>
                        {timeAgo(
                          insight.created_at
                        )}
                      </span>

                      {insight.related_entity_label && (
                        <>
                          <span>•</span>

                          <span className="text-signal-violet">
                            {
                              insight.related_entity_label
                            }
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}

export default AIInsightsPanel;