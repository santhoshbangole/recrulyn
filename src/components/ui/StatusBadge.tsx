import { clsx } from "clsx";


type StatusValue = string;

interface StatusBadgeProps {
  status: StatusValue;
  size?: "sm" | "md";
}

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    tone: string;
  }
> = {
  draft: {
    label: "Draft",
    tone: "neutral",
  },

  open: {
    label: "Open",
    tone: "green",
  },

  OPEN: {
    label: "Open",
    tone: "green",
  },

  paused: {
    label: "Paused",
    tone: "amber",
  },

  closed: {
    label: "Closed",
    tone: "neutral",
  },

  filled: {
    label: "Filled",
    tone: "violet",
  },

  sourced: {
    label: "Sourced",
    tone: "neutral",
  },

  applied: {
    label: "Applied",
    tone: "blue",
  },

  screening: {
    label: "Screening",
    tone: "blue",
  },

  interview: {
    label: "Interview",
    tone: "violet",
  },

  offer: {
    label: "Offer",
    tone: "amber",
  },

  hired: {
    label: "Hired",
    tone: "green",
  },

  rejected: {
    label: "Rejected",
    tone: "red",
  },

  low: {
    label: "Low Risk",
    tone: "green",
  },

  medium: {
    label: "Medium Risk",
    tone: "amber",
  },

  high: {
    label: "High Risk",
    tone: "red",
  },

  processed: {
    label: "Processed",
    tone: "green",
  },

  processing: {
    label: "Processing",
    tone: "amber",
  },

  failed: {
    label: "Failed",
    tone: "red",
  },
};

const TONE_CLASSES: Record<
  string,
  string
> = {
  neutral:
    "bg-base-250 text-text-secondary border-border-default",

  green:
    "bg-signal-green/10 text-signal-green border-signal-green/20",

  amber:
    "bg-signal-amber/10 text-signal-amber border-signal-amber/20",

  red:
    "bg-signal-red/10 text-signal-red border-signal-red/20",

  violet:
    "bg-signal-violet/10 text-signal-violet border-signal-violet/20",

  blue:
    "bg-signal-blue/10 text-signal-blue border-signal-blue/20",
};

export function StatusBadge({
  status,
  size = "md",
}: StatusBadgeProps) {
  const config =
    STATUS_CONFIG[status] ?? {
      label: status,
      tone: "neutral",
    };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",

        TONE_CLASSES[config.tone],

        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-[12px]"
      )}
    >
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",

          config.tone === "green" &&
            "bg-signal-green",

          config.tone === "amber" &&
            "bg-signal-amber",

          config.tone === "red" &&
            "bg-signal-red",

          config.tone === "violet" &&
            "bg-signal-violet",

          config.tone === "blue" &&
            "bg-signal-blue",

          config.tone === "neutral" &&
            "bg-text-tertiary"
        )}
      />

      {config.label}
    </span>
  );
}