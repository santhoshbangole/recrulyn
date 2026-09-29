import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Users,
  Briefcase,
  FileCheck,
  AlertTriangle,
  UserCheck,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { getDashboardMetrics } from "../../modules/dashboard/services/dashboard.service";
import { supabase } from "../../services/supabase/client";
import { employeeService } from "../../modules/employees/services/employee.service";
import {
  getLocalAssignments,
  getLocalCandidates,
  isDemoMode,
} from "../../modules/demo/seed";
import { approvalService } from "../../modules/documents/services/approval.service";

const BORDER = "#E8EDF2";
const INK = "#111827";
const MUTED = "#6B7280";
const PRIMARY = "#2F7D4A";

function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const end = new Date(dateStr);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function statusStyle(status?: string) {
  const s = String(status || "").toUpperCase();
  if (s === "HIRED" || s === "COMPLETED") return { bg: "#E9F5EE", text: "#1F5C36" };
  if (s === "JOINING" || s === "INTERVIEW") return { bg: "#E0F2FE", text: "#0369A1" };
  if (s === "REJECTED") return { bg: "#FEE2E2", text: "#B91C1C" };
  if (s === "SCREENING" || s === "NEW") return { bg: "#FEF3C7", text: "#92400E" };
  return { bg: "#F3F4F6", text: "#374151" };
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: BORDER }}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
          {label}
        </span>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ color: INK }}>
        {value}
      </p>
    </div>
  );
}

function Panel({ title, icon: Icon, children }: { title: string; icon: ComponentType<{ size?: number }>; children: ReactNode }) {
  return (
    <section
      className="overflow-hidden rounded-2xl border bg-white"
      style={{ borderColor: BORDER }}
    >
      <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: BORDER }}>
        <Icon size={18} />
        <h2 className="text-base font-semibold" style={{ color: INK }}>
          {title}
        </h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function ManagementDashboard() {
  usePageTitle();

  const [metrics, setMetrics] = useState({ open_roles: 0, active_candidates: 0, offers_pending: 0 });
  const [employeeCount, setEmployeeCount] = useState(0);
  const [candidateStats, setCandidateStats] = useState({ new: 0, selected: 0, joined: 0, rejected: 0 });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const data = await getDashboardMetrics();
    const employees = await employeeService.getAll();
    setEmployeeCount(employees?.length || 0);
    setMetrics(data);

    const applyLocal = async () => {
      const rows = getLocalCandidates();
      setCandidateStats({
        new: rows.filter((r) => r.status === "NEW" || r.status === "SCREENING").length,
        selected: rows.filter((r) => r.status === "SELECTED" || r.status === "INTERVIEW").length,
        joined: rows.filter((r) => r.status === "HIRED" || r.status === "JOINING" || r.status === "COMPLETED").length,
        rejected: rows.filter((r) => r.status === "REJECTED").length,
      });
      setRecentCandidates(
        rows.slice(0, 8).map((c) => ({
          id: c.id,
          candidate_name: c.full_name,
          status: c.status,
          created_at: c.created_at,
        }))
      );
      setAssignments(
        getLocalAssignments().map((a) => ({
          ...a,
          candidate_name:
            rows.find((c) => c.id === a.candidate_id)?.full_name || a.candidate_name || "Unknown",
        }))
      );
      const stats = await approvalService.getApprovalStats();
      setPendingApprovals(stats.pending);
    };

    if (isDemoMode()) {
      await applyLocal();
      return;
    }

    try {
      const { data: resumes } = await supabase.from("recrulyn_resume_index").select("status");
      const rows = resumes || [];
      setCandidateStats({
        new: rows.filter((r) => r.status === "NEW").length,
        selected: rows.filter((r) => r.status === "SELECTED").length,
        joined: rows.filter((r) => r.status === "JOINED").length,
        rejected: rows.filter((r) => r.status === "REJECTED").length,
      });
      const { data: candidates } = await supabase
        .from("recrulyn_resume_index")
        .select("id,candidate_name,status,created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      setRecentCandidates(candidates || []);
      const { data: interns } = await supabase.from("intern_assignments").select("*");
      setAssignments(interns || []);
      const stats = await approvalService.getApprovalStats();
      setPendingApprovals(stats.pending);
    } catch {
      await applyLocal();
    }
  }

  const internshipAlerts = useMemo(() => {
    return assignments
      .map((row) => {
        const left = daysUntil(row.end_date);
        return { ...row, daysLeft: left };
      })
      .filter((row) => row.daysLeft !== null && row.daysLeft >= 0 && row.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99))
      .slice(0, 6);
  }, [assignments]);

  const hiringStages = [
    { key: "new", label: "New / Screening", value: candidateStats.new, icon: Clock, color: "#D97706" },
    { key: "selected", label: "Interview", value: candidateStats.selected, icon: UserCheck, color: "#2563EB" },
    { key: "joined", label: "Joined / Hired", value: candidateStats.joined, icon: CheckCircle2, color: PRIMARY },
    { key: "rejected", label: "Rejected", value: candidateStats.rejected, icon: XCircle, color: "#DC2626" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Executive view
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: INK }}>
          Management Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          Company overview and decision center for hiring, approvals, and intern timelines.
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total employees" value={employeeCount} icon={Users} accent={PRIMARY} />
        <StatCard label="Active candidates" value={metrics.active_candidates} icon={Briefcase} accent="#2563EB" />
        <StatCard label="Open requirements" value={metrics.open_roles} icon={FileCheck} accent="#7C3AED" />
        <StatCard label="Pending approvals" value={pendingApprovals} icon={AlertTriangle} accent="#D97706" />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Hiring overview" icon={UserCheck}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {hiringStages.map((stage) => (
              <div
                key={stage.key}
                className="rounded-xl border px-4 py-4 text-center"
                style={{ borderColor: BORDER, background: "#FAFBFC" }}
              >
                <div
                  className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full text-lg font-bold"
                  style={{ background: `${stage.color}14`, color: stage.color }}
                >
                  {stage.value}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: MUTED }}>
                  {stage.label}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Internship alerts" icon={AlertTriangle}>
          {internshipAlerts.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>
              No internships ending in the next 30 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {internshipAlerts.map((intern) => (
                <li
                  key={intern.id || `${intern.candidate_id}-${intern.role_name}`}
                  className="flex items-start justify-between gap-3 rounded-xl border px-3 py-3"
                  style={{ borderColor: BORDER, background: "#FAFBFC" }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: INK }}>
                      {intern.candidate_name || intern.role_name}
                    </p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>
                      {intern.role_name}
                      {intern.department ? ` · ${intern.department}` : ""}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: (intern.daysLeft ?? 99) <= 7 ? "#FEE2E2" : "#FEF3C7",
                      color: (intern.daysLeft ?? 99) <= 7 ? "#B91C1C" : "#92400E",
                    }}
                  >
                    {intern.daysLeft === 0 ? "Ends today" : `${intern.daysLeft}d left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent candidates" icon={Users}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ borderColor: BORDER, color: MUTED }}>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Applied</th>
              </tr>
            </thead>
            <tbody>
              {recentCandidates.map((candidate) => {
                const chip = statusStyle(candidate.status);
                return (
                  <tr key={candidate.id} className="border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                    <td className="px-3 py-3 font-medium" style={{ color: INK }}>
                      {candidate.candidate_name || "Unknown"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
                        style={{ background: chip.bg, color: chip.text }}
                      >
                        {candidate.status || "NEW"}
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums" style={{ color: MUTED }}>
                      {formatDate(candidate.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
