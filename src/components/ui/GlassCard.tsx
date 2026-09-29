import type { ReactNode } from "react";
import { clsx } from "clsx";

interface GlassCardProps {
  children?: ReactNode;
  className?: string;
}

export function GlassCard({
  children,
  className,
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-card)] border border-border-default bg-base-150 shadow-[var(--shadow-card)]",
        className
      )}
    >
      {children}
    </div>
  );
}

export default GlassCard;