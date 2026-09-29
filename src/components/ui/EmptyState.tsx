import { type ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        gap-3
        rounded-[var(--radius-card)]
        border
        border-dashed
        border-border-default
        bg-base-150/40
        px-6
        py-14
        text-center
      "
    >
      {icon ? (
        <span
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            bg-base-200
            text-text-tertiary
          "
        >
          {icon}
        </span>
      ) : null}

      <div>
        <p
          className="
            text-[14px]
            font-medium
            text-text-primary
          "
        >
          {title}
        </p>

        {description ? (
          <p
            className="
              mx-auto
              mt-1
              max-w-sm
              text-[13px]
              text-text-secondary
            "
          >
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="mt-1">
          {action}
        </div>
      ) : null}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Couldn't load this",
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        gap-3
        rounded-[var(--radius-card)]
        border
        border-signal-red/20
        bg-signal-red/[0.04]
        px-6
        py-14
        text-center
      "
    >
      <div>
        <p
          className="
            text-[14px]
            font-medium
            text-text-primary
          "
        >
          {title}
        </p>

        <p
          className="
            mx-auto
            mt-1
            max-w-sm
            text-[13px]
            text-text-secondary
          "
        >
          {description}
        </p>
      </div>

      {onRetry ? (
        <button
          onClick={onRetry}
          className="
            mt-1
            rounded-[var(--radius-control)]
            border
            border-border-default
            bg-base-200
            px-3
            py-1.5
            text-[13px]
            font-medium
            text-text-primary
            transition-colors
            hover:bg-base-250
          "
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}