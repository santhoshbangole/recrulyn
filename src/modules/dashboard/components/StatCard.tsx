import { MetricCard } from "../../../components/ui/MetricCard";
import type { MetricSeriesPoint } from "../../../types/domain";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  series?: MetricSeriesPoint[];
  tone?: "violet" | "green" | "amber" | "red" | "neutral";
  icon?: ReactNode;
  loading?: boolean;
}

export function StatCard(props: StatCardProps) {
  return <MetricCard {...props} />;
}