import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { clsx } from "clsx";
import { Pulse } from "./Pulse";
import type { MetricSeriesPoint } from "../../types/domain";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  series?: MetricSeriesPoint[];
  tone?: "violet" | "green" | "amber" | "red" | "neutral";
  icon?: ReactNode;
  loading?: boolean;
}

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaLabel = "vs last 14d",
  series,
  tone = "violet",
  icon,
  loading = false,
}: MetricCardProps) {
  const deltaPositive = typeof delta === "number" && delta > 0;
  const deltaNegative = typeof delta === "number" && delta < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group relative flex flex-col justify-between rounded-[var(--radius-card)] border border-border-default bg-base-150 p-5 shadow-[var(--shadow-card)] transition-colors hover:border-border-strong"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-base-200 text-text-secondary">
              {icon}
            </span>
          ) : null}
          <span className="text-[13px] font-medium text-text-secondary">{label}</span>
        </div>
        {typeof delta === "number" ? (
          <span
            className={clsx(
              "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-tabular font-medium",
              deltaPositive && "bg-signal-green/10 text-signal-green",
              deltaNegative && "bg-signal-red/10 text-signal-red",
              !deltaPositive && !deltaNegative && "bg-base-200 text-text-tertiary"
            )}
            title={deltaLabel}
          >
            {deltaPositive ? (
              <ArrowUpRight size={12} strokeWidth={2.5} />
            ) : deltaNegative ? (
              <ArrowDownRight size={12} strokeWidth={2.5} />
            ) : (
              <Minus size={12} strokeWidth={2.5} />
            )}
            {Math.abs(delta)}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        {loading ? (
          <div className="h-9 w-20 animate-pulse rounded-md bg-base-200" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="font-tabular text-[32px] font-semibold leading-none tracking-tight text-text-primary">
              {value}
            </span>
            {unit ? (
              <span className="text-[13px] font-medium text-text-tertiary">{unit}</span>
            ) : null}
          </div>
        )}

        {series && series.length > 1 ? (
          <Pulse data={series} tone={tone} width={104} height={30} />
        ) : null}
      </div>
    </motion.div>
  );
}