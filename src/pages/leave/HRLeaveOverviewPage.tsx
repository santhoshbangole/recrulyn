import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Users,
  Search,
  ListFilter,
  RotateCcw,
} from "lucide-react";
import { leaveReportService } from "../../modules/leave/services/leave-report.service";

import { motion } from "framer-motion";
import { leaveService } from "../../modules/leave/services/leave.service";
import { GlassCard } from "../../components/ui/GlassCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";

// Presentation-only: maps a leave type string to a visual tone. Falls back
// to a neutral tone for any type not in the list, so nothing ever breaks
// if new leave types are added on the backend.
function leaveTypeTone(type: string) {
  const t = (type || "").toLowerCase();
  if (t.includes("sick")) return { dot: "bg-violet-500", text: "text-violet-500", bg: "bg-violet-500/10" };
  if (t.includes("casual")) return { dot: "bg-blue-500", text: "text-blue-500", bg: "bg-blue-500/10" };
  if (t.includes("annual")) return { dot: "bg-emerald-500", text: "text-emerald-500", bg: "bg-emerald-500/10" };
  if (t.includes("earned")) return { dot: "bg-cyan-500", text: "text-cyan-500", bg: "bg-cyan-500/10" };
  if (t.includes("unpaid")) return { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" };
  return { dot: "bg-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" };
}

function initialsOf(name: string) {
  return (name || "?")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HRLeaveOverviewPage() {
  const [leaves, setLeaves] =
    useState<any[]>([]);
  const totalLeaves = useMemo(
  () => leaves.length,
  [leaves]
);
const acknowledgedLeaves =
  useMemo(
    () =>
      leaves.filter(
        (leave) =>
          leave.acknowledged
      ).length,
    [leaves]
  );
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const data =
      await leaveService.getAll();

    setLeaves(data || []);
  }

  async function acknowledgeLeave(
    id: string
  ) {
    await leaveService.acknowledgeLeave(
      id
    );

    loadData();
  }

  // Presentation-only state below — search, status tab, and the calendar
  // month. None of this touches leaveService or the data model; it only
  // filters/derives views over the same `leaves` array above.
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "acknowledged">("all");

  const pendingLeaves = totalLeaves - acknowledgedLeaves;

  const thisWeekLeaves = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return leaves.filter((leave) => {
      if (!leave.start_date) return false;
      const start = new Date(leave.start_date);
      return start >= startOfWeek && start <= endOfWeek;
    }).length;
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves
      .filter((leave) => {
        if (activeTab === "pending") return !leave.acknowledged;
        if (activeTab === "acknowledged") return leave.acknowledged;
        return true;
      })
      .filter((leave) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.trim().toLowerCase();
        return (
          (leave.employees?.full_name || "").toLowerCase().includes(q) ||
          (leave.leave_type || "").toLowerCase().includes(q) ||
          (leave.reason || "").toLowerCase().includes(q)
        );
      });
  }, [leaves, activeTab, searchTerm]);

  // Builds a real calendar grid for the current month and marks the days
  // on which an actual leave record starts, using the leave's own type
  // for the dot color. No invented data — purely derived from `leaves`.
  const calendar = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const leavesByDay: Record<number, any[]> = {};
    leaves.forEach((leave) => {
      if (!leave.start_date) return;
      const d = new Date(leave.start_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        leavesByDay[day] = leavesByDay[day] || [];
        leavesByDay[day].push(leave);
      }
    });

    const cells: { day: number | null; leaves: any[] }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ day: null, leaves: [] });
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, leaves: leavesByDay[d] || [] });
    }

    return {
      label: now.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      today: now.getDate(),
      cells,
    };
  }, [leaves]);

  return (
    <div className="space-y-6">
    <PageHeader
  eyebrow="People Operations"
  title="Leave Management"
  description="Track, approve and manage employee leave requests in one place."
  actions={
    <button
      onClick={() =>
        leaveReportService.downloadExcel(filteredLeaves)
      }
      className="rounded-xl bg-signal-violet px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
    >
      ⬇ Download Report
    </button>
  }
/>

      {/* Stat strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leaves", value: totalLeaves, sub: "All time", icon: CalendarDays, tone: "text-text-primary", iconBg: "bg-base-200" },
          { label: "Pending", value: pendingLeaves, sub: "Awaiting action", icon: Clock, tone: "text-amber-500", iconBg: "bg-amber-500/10" },
          { label: "Acknowledged", value: acknowledgedLeaves, sub: "Approved leaves", icon: CheckCircle2, tone: "text-emerald-500", iconBg: "bg-emerald-500/10" },
          { label: "This Week", value: thisWeekLeaves, sub: "Leaves scheduled", icon: Users, tone: "text-blue-500", iconBg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
          >
            <GlassCard className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${stat.iconBg} ${stat.tone}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">{stat.label}</p>
                <h3 className={`text-[28px] font-bold leading-tight ${stat.tone}`}>{stat.value}</h3>
                <p className="text-[13px] text-text-tertiary">{stat.sub}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <GlassCard className="flex flex-wrap items-center gap-3 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-base-150 px-3 py-2.5 text-text-secondary">
          <ListFilter size={16} />
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as any)}
            className="bg-transparent text-[15px] font-medium text-text-primary outline-none"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending ({pendingLeaves})</option>
            <option value="acknowledged">Acknowledged ({acknowledgedLeaves})</option>
          </select>
        </div>

        <div className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-border-default bg-base-150 px-3 py-2.5">
          <Search size={16} className="text-text-secondary" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee, type, or reason..."
            className="w-full bg-transparent text-[15px] text-text-primary placeholder:text-text-secondary outline-none"
          />
        </div>

        <button
          onClick={() => {
            setSearchTerm("");
            setActiveTab("all");
          }}
          className="flex items-center gap-1.5 rounded-lg bg-base-200 px-3.5 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-base-150"
        >
          <RotateCcw size={14} />
          Reset
        </button>

        <span className="rounded-lg bg-base-200 px-3 py-2 text-sm font-medium text-text-secondary">
          {filteredLeaves.length} of {totalLeaves}
        </span>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* LEFT: leave request list */}
        <GlassCard className="p-0">
          <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
            <h2 className="text-[15px] font-semibold text-text-primary">
              {activeTab === "all" && "All Requests"}
              {activeTab === "pending" && "Pending Requests"}
              {activeTab === "acknowledged" && "Acknowledged Requests"}
              <span className="ml-1.5 text-text-secondary">({filteredLeaves.length})</span>
            </h2>
          </div>

          {filteredLeaves.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="No leave requests found"
                description="Try adjusting your filters, or check back once new requests come in."
              />
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {filteredLeaves.map((leave, i) => {
                const tone = leaveTypeTone(leave.leave_type);
                const duration = daysBetween(leave.start_date, leave.end_date);

                return (
                  <motion.div
                    key={leave.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                    className="flex flex-wrap items-start gap-4 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-signal-violet to-signal-violet-dim text-[13px] font-semibold text-white">
                      {initialsOf(leave.employees?.full_name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-text-primary">
                          {leave.employees?.full_name || "Unknown Employee"}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                            leave.acknowledged
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {leave.acknowledged ? "Acknowledged" : "Pending"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                        <span className="flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                          {leave.leave_type || "Leave"}
                        </span>
                        {duration && (
                          <span>{duration} {duration === 1 ? "Day" : "Days"}</span>
                        )}
                        <span className="flex items-center gap-1.5">
                          <CalendarDays size={13} />
                          {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                        </span>
                      </div>

                      {leave.reason && (
                        <p className="mt-2 text-sm text-text-primary">
                          <span className="font-semibold text-text-secondary">Reason: </span>
                          {leave.reason}
                        </p>
                      )}

                      <p className="mt-1 text-[13px] text-text-tertiary">
                        {leave.acknowledged && leave.acknowledged_at
                          ? `Acknowledged on ${formatDate(leave.acknowledged_at)}`
                          : "Awaiting acknowledgement"}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {leave.acknowledged ? (
                        <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3.5 py-2.5 text-sm font-medium text-emerald-500">
                          <CheckCircle2 size={14} />
                          Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeLeave(leave.id)}
                          className="rounded-lg bg-signal-violet px-3.5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* RIGHT: calendar derived from real leave start dates */}
        <GlassCard className="p-5">
          <h3 className="mb-4 text-[15px] font-semibold text-text-primary">
            Leave Calendar
          </h3>
          <p className="mb-3 text-sm font-medium text-text-secondary">{calendar.label}</p>

          <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-semibold text-text-tertiary">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendar.cells.map((cell, idx) => (
              <div
                key={idx}
                className={`flex h-9 flex-col items-center justify-center rounded-lg text-[13px] ${
                  cell.day === null
                    ? ""
                    : cell.day === calendar.today
                    ? "bg-signal-violet text-white font-semibold"
                    : "text-text-primary hover:bg-base-150"
                }`}
              >
                {cell.day}
                {cell.leaves.length > 0 && (
                  <div className="mt-0.5 flex gap-0.5">
                    {cell.leaves.slice(0, 3).map((l, li) => (
                      <span
                        key={li}
                        className={`h-1.5 w-1.5 rounded-full ${leaveTypeTone(l.leave_type).dot}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[12px] text-text-secondary">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-violet-500" /> Sick</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Casual</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Annual</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Other</span>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}