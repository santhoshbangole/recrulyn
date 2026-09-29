import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { ActivityEvent } from "../../../types/domain";

interface RecentActivityProps {
  events: ActivityEvent[] | null;
  loading: boolean;
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function RecentActivity({ events, loading }: RecentActivityProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border-default bg-base-150 p-5 shadow-[var(--shadow-card)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-text-primary">Activity</h2>
        <span className="text-[11px] text-text-tertiary">Last 8 events</span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-[var(--radius-control)] bg-base-200" />
          ))}
        </div>
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={<Activity size={18} strokeWidth={2} />}
          title="No activity yet"
          description="Actions across roles, candidates, and documents will show up here as they happen."
        />
      ) : (
        <ul className="flex flex-col">
          {events.map((event, i) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              className="flex items-center gap-3 border-b border-border-subtle py-2.5 last:border-0"
            >
              {event.actor_avatar_url ? (
                <img
                  src={event.actor_avatar_url}
                  alt={event.actor_name}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-base-250 text-[10.5px] font-semibold text-text-secondary">
                  {initialsOf(event.actor_name)}
                </span>
              )}
              <p className="min-w-0 flex-1 truncate text-[13px] text-text-secondary">
                <span className="font-medium text-text-primary">{event.actor_name}</span>{" "}
                {event.verb}{" "}
                <span className="font-medium text-text-primary">{event.target_label}</span>
              </p>
              <span className="shrink-0 font-tabular text-[11px] text-text-tertiary">
                {timeAgo(event.created_at)}
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}