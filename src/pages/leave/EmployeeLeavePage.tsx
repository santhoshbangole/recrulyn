import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, Clock, CheckCircle2, Plus } from "lucide-react";
import { leaveService } from "../../modules/leave/services/leave.service";
import { employeeService } from "../../modules/employees/services/employee.service";
import { useAuth } from "../../app/providers/AuthProvider";
import { useNotification } from "../../components/notification/useNotification";
import usePageTitle from "../../hooks/usePageTitle";

const BORDER = "#E8EDF2";
const INK = "#111827";
const MUTED = "#6B7280";
const PRIMARY = "#2F7D4A";

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

function dayCount(start?: string, end?: string) {
  if (!start || !end) return 1;
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return diff > 0 ? diff : 1;
}

function statusStyle(status?: string) {
  const s = String(status || "").toUpperCase();
  if (s === "APPROVED" || s === "ACKNOWLEDGED") return { bg: "#E9F5EE", text: "#1F5C36" };
  if (s === "REJECTED") return { bg: "#FEE2E2", text: "#B91C1C" };
  return { bg: "#FEF3C7", text: "#92400E" };
}

export default function EmployeeLeavePage() {
  usePageTitle();
  const { profile } = useAuth();
  const notify = useNotification();

  const [leaves, setLeaves] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any>(null);
  const [leaveType, setLeaveType] = useState("Casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [profile?.id, profile?.email]);

  async function loadData() {
    const employees = await employeeService.getAll();
    const me =
      employees.find((e: any) => e.email === profile?.email) ||
      (profile?.id ? await employeeService.getByProfileId(profile.id) : null) ||
      employees.find((e: any) => e.email === "intern@reude.tech") ||
      null;

    setEmployee(me);
    const data = await leaveService.getByEmployeeId(me?.id || "demo-emp-4");
    setLeaves(data || []);
  }

  async function applyLeave() {
    if (!employee) {
      notify.error("Employee profile not found");
      return;
    }
    if (!startDate || !endDate) {
      notify.error("Select dates", "Choose a start and end date.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      notify.error("Invalid dates", "End date cannot be before start date.");
      return;
    }
    try {
      setSaving(true);
      await leaveService.create({
        employee_id: employee.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        reason: reason.trim() || "Not specified",
      });
      notify.success("Leave applied", "Your request has been submitted.");
      setReason("");
      setStartDate("");
      setEndDate("");
      await loadData();
    } catch (error) {
      console.error(error);
      notify.error("Failed to apply leave");
    } finally {
      setSaving(false);
    }
  }

  const pending = leaves.filter((l) => String(l.status || "").toUpperCase() === "PENDING").length;
  const approved = leaves.filter((l) => String(l.status || "").toUpperCase() === "APPROVED").length;
  const usedDays = useMemo(
    () =>
      leaves
        .filter((l) => String(l.status || "").toUpperCase() === "APPROVED")
        .reduce((sum, l) => sum + dayCount(l.start_date, l.end_date), 0),
    [leaves]
  );

  return (
    <div className="mx-auto w-full max-w-[1100px]">
      <header className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: MUTED }}>
          Time off
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: INK }}>
          My Leave
        </h1>
        <p className="mt-1 text-sm" style={{ color: MUTED }}>
          {employee?.full_name || profile?.full_name || "Employee"} · {employee?.designation || "Team member"}
        </p>
      </header>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat label="Pending" value={pending} icon={Clock} accent="#D97706" />
        <Stat label="Approved" value={approved} icon={CheckCircle2} accent={PRIMARY} />
        <Stat label="Days used" value={usedDays} icon={CalendarDays} accent="#2563EB" />
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
        <div className="mb-4 flex items-center gap-2">
          <Plus size={16} style={{ color: PRIMARY }} />
          <h2 className="text-base font-semibold" style={{ color: INK }}>
            Apply for leave
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Type">
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="h-10 w-full rounded-lg border bg-white px-3 text-sm"
              style={{ borderColor: BORDER, color: INK }}
            >
              <option>Casual</option>
              <option>Sick</option>
              <option>Emergency</option>
            </select>
          </Field>
          <Field label="From">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 w-full rounded-lg border px-3 text-sm"
              style={{ borderColor: BORDER, color: INK }}
            />
          </Field>
          <Field label="To">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 w-full rounded-lg border px-3 text-sm"
              style={{ borderColor: BORDER, color: INK }}
            />
          </Field>
          <div className="flex items-end">
            <button
              type="button"
              onClick={applyLeave}
              disabled={saving}
              className="h-10 w-full rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: PRIMARY }}
            >
              {saving ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>

        <Field label="Reason" className="mt-4">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional note for your manager"
            rows={3}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ borderColor: BORDER, color: INK }}
          />
        </Field>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-white" style={{ borderColor: BORDER }}>
        <div className="border-b px-5 py-4" style={{ borderColor: BORDER }}>
          <h2 className="text-base font-semibold" style={{ color: INK }}>
            Request history
          </h2>
        </div>
        {leaves.length === 0 ? (
          <p className="px-5 py-10 text-sm" style={{ color: MUTED }}>
            No leave requests yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ borderColor: BORDER, color: MUTED }}>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-3 py-3">From</th>
                  <th className="px-3 py-3">To</th>
                  <th className="px-3 py-3">Days</th>
                  <th className="px-3 py-3">Reason</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => {
                  const chip = statusStyle(leave.status);
                  return (
                    <tr key={leave.id} className="border-b last:border-0" style={{ borderColor: "#F1F5F9" }}>
                      <td className="px-5 py-3 font-medium" style={{ color: INK }}>
                        {leave.leave_type}
                      </td>
                      <td className="px-3 py-3 tabular-nums" style={{ color: MUTED }}>
                        {formatDate(leave.start_date)}
                      </td>
                      <td className="px-3 py-3 tabular-nums" style={{ color: MUTED }}>
                        {formatDate(leave.end_date)}
                      </td>
                      <td className="px-3 py-3 tabular-nums" style={{ color: INK }}>
                        {dayCount(leave.start_date, leave.end_date)}
                      </td>
                      <td className="max-w-[220px] truncate px-3 py-3" style={{ color: MUTED }}>
                        {leave.reason || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase"
                          style={{ background: chip.bg, color: chip.text }}
                        >
                          {leave.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: typeof Clock;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5" style={{ borderColor: BORDER }}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
          {label}
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${accent}18`, color: accent }}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>
      <p className="text-3xl font-bold tabular-nums" style={{ color: INK }}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: MUTED }}>
        {label}
      </span>
      {children}
    </label>
  );
}
