import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CalendarDays,
  Briefcase,
  Clock,
  UserRound,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import usePageTitle from "../../hooks/usePageTitle";
import { useAuth } from "../../app/providers/AuthProvider";
import { employeeService } from "../../modules/employees/services/employee.service";
import { leaveService } from "../../modules/leave/services/leave.service";
import {
  getDemoLeaveRequests,
  getLocalAssignments,
  getLocalCandidates,
  isDemoMode,
} from "../../modules/demo/seed";

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

function addMonths(dateStr: string, months: number) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function firstName(name?: string) {
  return String(name || "there").split(" ")[0];
}

function statusStyle(status?: string) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED" || s === "HIRED" || s === "COMPLETED") return { bg: "#E9F5EE", text: "#1F5C36" };
  if (s === "PENDING" || s === "INTERVIEW" || s === "JOINING") return { bg: "#FEF3C7", text: "#92400E" };
  if (s === "REJECTED") return { bg: "#FEE2E2", text: "#B91C1C" };
  if (s === "SCREENING" || s === "NEW") return { bg: "#E0F2FE", text: "#0369A1" };
  return { bg: "#F3F4F6", text: "#374151" };
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
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
      {hint ? (
        <p className="mt-1 text-xs" style={{ color: MUTED }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: BORDER }}>
        <div className="flex items-center gap-2">
          <Icon size={18} />
          <h2 className="text-base font-semibold" style={{ color: INK }}>
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function EmployeeDashboard() {
  usePageTitle();
  const { profile } = useAuth();

  const [employee, setEmployee] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [pipeline, setPipeline] = useState<any[]>([]);

  useEffect(() => {
    loadDashboard();
  }, [profile?.id, profile?.email]);

  async function loadDashboard() {
    const employees = await employeeService.getAll();
    const me =
      employees.find((e: any) => e.email === profile?.email)
      (profile?.id ? await employeeService.getByProfileId(profile.id) : null) ||
      employees.find((e: any) => e.email === "intern@reude.tech")
      employees[0] ||
      null;

    setEmployee(me);
    setTeam(
      employees
        .filter((e: any) => (me?.department ? e.department === me.department : true) && e.id !== me?.id)
        .slice(0, 6)
    );

    const candidates = getLocalCandidates();
    setPipeline(
      candidates
        .filter((c) => c.status === "SCREENING" || c.status === "INTERVIEW" || c.status === "NEW")
        .slice(0, 5)
        .map((c) => ({
          id: c.id,
          name: c.full_name,
          role: c.job_title,
          status: c.status,
          applied: c.created_at,
        }))
    );
    setAssignments(
      getLocalAssignments().map((a) => ({
        ...a,
        candidate_name:
          candidates.find((c) => c.id === a.candidate_id)?.full_name || a.candidate_name || "Unknown",
      }))
    );

    if (isDemoMode() || !me?.id) {
      setLeaves(getDemoLeaveRequests(me?.id || "demo-emp-4"));
      return;
    }

    try {
      const leaveData = await leaveService.getByEmployeeId(me.id);
      setLeaves(leaveData?.length ? leaveData : getDemoLeaveRequests(me.id));
    } catch {
      setLeaves(getDemoLeaveRequests(me.id));
    }
  }

  const internshipEnd = useMemo(() => {
    if (!employee?.joining_date) return "";
    if (String(employee.employment_type || "").toLowerCase().includes("intern")) {
      return addMonths(employee.joining_date, 6);
    }
    return "";
  }, [employee]);

  const daysLeft = daysUntil(internshipEnd);
  const pendingLeaves = leaves.filter((l) => String(l.status || "").toUpperCase() === "PENDING").length;
  const approvedLeaves = leaves.filter((l) => String(l.status || "").toUpperCase() === "APPROVED").length;

  const internAlerts = useMemo(() => {
    return assignments
      .map((row) => ({ ...row, daysLeft: daysUntil(row.end_date) }))
      .filter((row) => row.daysLeft !== null && row.daysLeft >= 0 && row.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 99) - (b.daysLeft ?? 99))
      .slice(0, 4);
  }, [assignments]);

  const tasks = [
    pendingLeaves > 0
      ? { id: "leave", label: "Leave request awaiting manager review", to: "/app/employee-leave" }
      : { id: "leave", label: "No pending leave — apply if you need time off", to: "/app/employee-leave" },
    pipeline.length
      ? { id: "review", label: `Review ${pipeline.length} screening / interview candidates`, to: "/app/candidates" }
      : { id: "review", label: "No candidates waiting in your pipeline", to: "/app/candidates" },
    { id: "ai", label: "Run AI Apps on a new resume", to: "/app/resume-intelligence" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Employee workspace
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: INK }}>
          {greeting()}, {firstName(profile?.full_name || employee?.full_name)}
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          {employee?.designation || profile?.title || "Team member"}
          {employee?.department ? ` · ${employee.department}` : ""}
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Team members"
          value={team.length + (employee ? 1 : 0)}
          hint={employee?.department || "Your department"}
          icon={Users}
          accent={PRIMARY}
        />
        <StatCard
          label="Pipeline to review"
          value={pipeline.length}
          hint="New, screening, interview"
          icon={Briefcase}
          accent="#2563EB"
        />
        <StatCard
          label="Leave pending"
          value={pendingLeaves}
          hint={`${approvedLeaves} approved this year`}
          icon={CalendarDays}
          accent="#D97706"
        />
        <StatCard
          label="Engagement remaining"
          value={daysLeft == null ? "—" : daysLeft < 0 ? "Ended" : `${daysLeft}d`}
          hint={internshipEnd ? `Ends ${formatDate(internshipEnd)}` : "Full-time"}
          icon={Clock}
          accent="#7C3AED"
        />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="My assignment" icon={UserRound}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Info label="Role" value={employee?.designation} />
            <Info label="Employee ID" value={employee?.employee_code} />
            <Info label="Department" value={employee?.department} />
            <Info label="Reporting manager" value={employee?.reporting_manager} />
            <Info label="Joined" value={formatDate(employee?.joining_date)} />
            <Info label="Type" value={employee?.employment_type} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <QuickLink to="/app/employee-leave" label="My leave" />
            <QuickLink to="/app/candidates" label="Candidates" />
            <QuickLink to="/app/resume-intelligence" label="AI Apps" />
          </div>
        </Panel>

        <Panel title="This week" icon={CheckCircle2}>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id}>
                <Link
                  to={task.to}
                  className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm font-medium hover:bg-[#FAFBFC]"
                  style={{ borderColor: BORDER, color: INK }}
                >
                  <span>{task.label}</span>
                  <ArrowRight size={14} style={{ color: MUTED }} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <Panel
          title="My leave"
          icon={CalendarDays}
          action={
            <Link to="/app/employee-leave" className="text-xs font-semibold" style={{ color: PRIMARY }}>
              Manage
            </Link>
          }
        >
          {leaves.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>
              No leave requests yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {leaves.slice(0, 4).map((leave) => {
                const chip = statusStyle(leave.status);
                return (
                  <li
                    key={leave.id}
                    className="flex items-center justify-between gap-3 rounded-xl border px-3 py-3"
                    style={{ borderColor: BORDER, background: "#FAFBFC" }}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold" style={{ color: INK }}>
                        {leave.leave_type}
                      </p>
                      <p className="text-xs" style={{ color: MUTED }}>
                        {formatDate(leave.start_date)} – {formatDate(leave.end_date)}
                      </p>
                    </div>
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
                      style={{ background: chip.bg, color: chip.text }}
                    >
                      {leave.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Internships ending soon" icon={AlertTriangle}>
          {internAlerts.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>
              No internships ending in the next 30 days.
            </p>
          ) : (
            <ul className="space-y-3">
              {internAlerts.map((intern) => (
                <li
                  key={intern.id || intern.candidate_id}
                  className="flex items-start justify-between gap-3 rounded-xl border px-3 py-3"
                  style={{ borderColor: BORDER, background: "#FAFBFC" }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: INK }}>
                      {intern.candidate_name}
                    </p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>
                      {intern.role_name}
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

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="My team" icon={Users}>
          {team.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>
              No teammates listed yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {team.map((member) => (
                <li key={member.id} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: "#E9F5EE", color: PRIMARY }}
                  >
                    {String(member.full_name || "?")
                      .split(" ")
                      .map((p: string) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: INK }}>
                      {member.full_name}
                    </p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>
                      {member.designation}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Candidates to review"
          icon={FileText}
          action={
            <Link to="/app/candidates" className="text-xs font-semibold" style={{ color: PRIMARY }}>
              Open pipeline
            </Link>
          }
        >
          {pipeline.length === 0 ? (
            <p className="text-sm" style={{ color: MUTED }}>
              No candidates waiting for review.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ borderColor: BORDER, color: MUTED }}>
                    <th className="px-2 py-2">Name</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeline.map((row) => {
                    const chip = statusStyle(row.status);
                    return (
                      <tr key={row.id} className="border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                        <td className="px-2 py-3 font-medium" style={{ color: INK }}>
                          {row.name}
                        </td>
                        <td className="px-2 py-3" style={{ color: MUTED }}>
                          {row.role}
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
                            style={{ background: chip.bg, color: chip.text }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
        {label}
      </p>
      <p className="mt-1 text-sm font-medium" style={{ color: INK }}>
        {value || "—"}
      </p>
    </div>
  );
}

function QuickLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-[#FAFBFC]"
      style={{ borderColor: BORDER, color: INK }}
    >
      {label}
      <ArrowRight size={12} />
    </Link>
  );
}
