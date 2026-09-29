import { useId, useMemo } from "react";
import { motion } from "framer-motion";
import type { MetricSeriesPoint } from "../../types/domain";

interface PulseProps {
  data: MetricSeriesPoint[];
  tone?: "violet" | "green" | "amber" | "red" | "neutral";
  height?: number;
  width?: number;
  animate?: boolean;
}

const TONE_COLOR: Record<NonNullable<PulseProps["tone"]>, string> = {
  violet: "var(--color-signal-violet)",
  green: "var(--color-signal-green)",
  amber: "var(--color-signal-amber)",
  red: "var(--color-signal-red)",
  neutral: "var(--color-text-tertiary)",
};

/**
 * The signature visual motif of Recrulyn: a thin, live signal trace.
 * Used sparingly — only beneath metrics that genuinely trend over time.
 */
export function Pulse({
  data,
  tone = "violet",
  height = 32,
  width = 120,
  animate = true,
}: PulseProps) {
  const gradientId = useId();
  const color = TONE_COLOR[tone];

  const { path, areaPath } = useMemo(() => {
    if (!data || data.length < 2) {
      return { path: "", areaPath: "" };
    }
    const values = data.map((d) => d.v);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);

    const points = data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.v - min) / range) * (height - 4) - 2;
      return [x, y];
    });

    const linePath = points
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
      .join(" ");

    const area = `${linePath} L${width},${height} L0,${height} Z`;

    return { path: linePath, areaPath: area };
  }, [data, width, height]);

  if (!path) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center text-[10px] text-text-tertiary font-tabular"
        aria-hidden
      >
        — — —
      </div>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      role="img"
      aria-label="Trend over the last 14 days"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
      {animate ? (
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        />
      ) : (
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}