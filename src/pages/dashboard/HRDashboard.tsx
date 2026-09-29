import { useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import {
  Users,
  UserCheck,
  Clock,
  FileText,
  Activity,
  ChevronRight,
  CalendarClock,
  CalendarCheck2,
  History,
} from "lucide-react";
import { getDashboardMetrics } from "../../modules/dashboard/services/dashboard.service";
import { employeeService } from "../../modules/employees/services/employee.service";
import { supabase } from "../../services/supabase/client";
import { leaveService } from "../../modules/leave/services/leave.service";
import {
  getDemoDashboardMetrics,
  getDemoDocuments,
  getDemoEmployees,
  getLocalCandidates,
  isDemoMode,
} from "../../modules/demo/seed";
import { useAuth } from "../../app/providers/AuthProvider";

/* ─── Types ─────────────────────────────────────────────────────── */
type CandidateStats = {
  total: number;
  new: number;
  screening: number;
  interview: number;
  joining: number;
  hired: number;
  completed: number;
  rejected: number;
  onHold: number;
};

/* ─── Design tokens ─────────────────────────────────────────────── */
/* Enterprise SaaS palette — calm neutrals, single confident green primary */
const PAGE_BG = "#FAFBFC";
const CARD_BG = "#FFFFFF";
const BORDER = "#E8EDF2";
const INK = "#000000";
const INK_SOFT = "#1F2937";
const PRIMARY_DARK = "#1F5C36";
const MUTED_BG = "#F6F8FA";

const T = {
  primary: {
    bg: "bg-[#E9F5EE]",
    text: "text-[#1F5C36]",
    dot: "bg-[#2F7D4A]",
    bar: "bg-[#2F7D4A]",
  },
  teal: {
    bg: "bg-[#E7F3F3]",
    text: "text-[#166B6B]",
    dot: "bg-[#1F8C8C]",
    bar: "bg-[#1F8C8C]",
  },
  emerald: {
    bg: "bg-[#EAF7EF]",
    text: "text-[#1F7A4D]",
    dot: "bg-[#3FA76A]",
    bar: "bg-[#3FA76A]",
  },
  amber: {
    bg: "bg-[#FEF3E2]",
    text: "text-[#B7791F]",
    dot: "bg-[#F59E0B]",
    bar: "bg-[#F59E0B]",
  },
  red: {
    bg: "bg-[#FDECEC]",
    text: "text-[#C0392B]",
    dot: "bg-[#EF4444]",
    bar: "bg-[#EF4444]",
  },
  slate: {
    bg: "bg-[#F1F3F5]",
    text: "text-[#4B5563]",
    dot: "bg-[#C7CDD3]",
    bar: "bg-[#C7CDD3]",
  },
} as const;
type Token = keyof typeof T;
type IconType = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

/* ─── Helpers ───────────────────────────────────────────────────── */
function statusToken(status?: string): Token {
  const s = (status || "").toUpperCase();
  if (s.includes("REJECT")) return "red";
  if (s.includes("HOLD") || s.includes("PEND")) return "amber";
  if (
    s.includes("HIRE") ||
    s.includes("COMPLETE") ||
    s.includes("OPEN") ||
    s.includes("APPROV")
  )
    return "emerald";
  if (s.includes("INTERVIEW") || s.includes("SCREEN") || s.includes("REVIEW"))
    return "primary";
  if (s.includes("JOIN")) return "teal";
  return "slate";
}

function initialsOf(name?: string) {
  return (
    name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "—"
  );
}

function HeroKpi({
  icon: _Icon,
  label,
  value,
  token,
  sub,
  trend,
  delay = 0,
}: {
  icon: IconType;
  label: string;
  value: number;
  token: Token;
  sub?: string;
  trend?: string;
  delay?: number;
  emphasized?: boolean;
}) {
  const c = T[token];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay }}
      className="flex items-center gap-3 px-5 py-4 first:pl-0 last:pr-0"
    >
      <span className={clsx("h-1.5 w-1.5 shrink-0 rounded-full", c.dot)} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <p
            className="font-semibold leading-none tracking-tight"
            style={{
              color: "#1F2937",
              fontSize: 24,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {value.toLocaleString()}
          </p>
          {trend && (
            <span
              className="text-[11px] font-semibold"
              style={{ color: "#1F7A4D" }}
            >
              {trend}
            </span>
          )}
        </div>
        <p
          className="mt-1 text-[12.5px] font-medium truncate"
          style={{ color: INK }}
        >
          {label}{" "}
          <span style={{ color: INK_SOFT, fontWeight: 400 }}>· {sub}</span>
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Compact KPI ────────────────────────────────────────────────── */

/* ─── Panel ──────────────────────────────────────────────────────── */
function Panel({
  title,
  icon: Icon,
  iconClass,
  action,
  children,
  className,
}: {
  title: string;
  icon?: IconType;
  iconClass?: string;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        "flex flex-col rounded-[18px] bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04),0_4px_16px_rgba(17,24,39,0.05)]",
        className,
      )}
      style={{ border: `1px solid ${BORDER}` }}
    >
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2.5">
          {Icon && (
            <Icon
              size={20}
              strokeWidth={1.8}
              className={iconClass || "text-[#000000]"}
            />
          )}
          <span className="text-[20px] font-extrabold" style={{ color: INK }}>
            {title}
          </span>
        </div>
        {action && (
          <button
            className="flex items-center gap-0.5 text-[14px] font-bold transition-colors hover:opacity-70"
            style={{ color: PRIMARY_DARK }}
          >
            {action} <ChevronRight size={13} strokeWidth={2.5} />
          </button>
        )}
      </div>
      <div className="flex-1 p-6">{children}</div>
    </motion.div>
  );
}

/* ─── Pipeline bar ───────────────────────────────────────────────── */
function RecruitmentPipeline({ stats }: { stats: CandidateStats }) {
  const stages = [
    { label: "New", value: stats.new },
    { label: "Screening", value: stats.screening },
    { label: "Interview", value: stats.interview },
    { label: "Completed", value: stats.completed },
    { label: "Joining", value: stats.joining },
    { label: "Hired", value: stats.hired },
  ];
  return (
    <div className="grid grid-cols-6 gap-4">
      {stages.map((stage, index) => (
        <motion.div
          key={stage.label}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="relative rounded-2xl p-5 text-center"
          style={{ border: `1px solid ${BORDER}`, background: MUTED_BG }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              margin: "0 auto",
              borderRadius: "50%",
              background: "#EAF7EF",
              color: PRIMARY_DARK,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 19,
            }}
          >
            {stage.value}
          </div>

          <div
            style={{
              marginTop: 14,
              fontWeight: 700,
              fontSize: 14,
              color: INK,
            }}
          >
            {stage.label}
          </div>

          {index < stages.length - 1 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                right: "-18px",
                transform: "translateY(-50%)",
                fontSize: 18,
                color: "#C7CDD3",
              }}
            >
              →
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

/* 

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Circle size={18} strokeWidth={1.2} style={{ color: BORDER }} className="mb-2" />
      <p className="text-[14px] font-semibold" style={{ color: INK }}>{label}</p>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function HRDashboard() {
  const { profile } = useAuth();
  const [allCandidates, setAllCandidates] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    open_roles: 0,
    active_candidates: 0,
    offers_pending: 0,
  });
  const [, setEmployeeCount] = useState(0);

  const [, setNdaPendingCount] = useState(0);
  const [, setPendingLeaves] = useState(0);
  const [, setOpenRequirements] = useState(0);
  const [candidateStats, setCandidateStats] = useState({
    total: 0,
    new: 0,
    screening: 0,
    interview: 0,
    joining: 0,
    hired: 0,
    completed: 0,
    rejected: 0,
    onHold: 0,
  });
  const [internCount, setInternCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [, setUserName] = useState("User");
  const [pendingCount, setPendingCount] = useState(0);
  const [, setCertificatePendingCount] = useState(0);
  const [, setJoiningThisWeekCount] = useState(0);
  const [, setEndingSoonCount] = useState(0);
  const [upcomingJoining, setUpcomingJoining] = useState<any[]>([]);
  const [internshipEnding, setInternshipEnding] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [, setRecentCandidates] = useState<any[]>([]);
  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    if (isDemoMode()) {
      const data = getDemoDashboardMetrics();
      const candidates = getLocalCandidates();
      const docs = getDemoDocuments();
      setMetrics(data);
      setOpenRequirements(data.open_roles);
      setEmployeeCount(getDemoEmployees().length);
      setPendingLeaves(3);
      setNdaPendingCount(
        docs.filter(
          (d: any) => d.document_type === "NDA" && d.approval_status !== "APPROVED",
        ).length || 1,
      );
      setDocumentCount(docs.length);
      setPendingCount(
        docs.filter((d: any) => d.approval_status === "PENDING_APPROVAL").length,
      );
      setInternCount(
        candidates.filter((c) =>
          ["HIRED", "JOINING", "COMPLETED"].includes(c.status),
        ).length,
      );
      setCertificatePendingCount(1);
      setJoiningThisWeekCount(
        candidates.filter((c) => c.status === "JOINING").length,
      );
      setEndingSoonCount(1);
      setAllCandidates(candidates);
      setRecentCandidates(candidates.slice(0, 10));
      setCandidateStats({
        total: candidates.length,
        new: candidates.filter((r) => r.status === "NEW").length,
        screening: candidates.filter((r) => r.status === "SCREENING").length,
        interview: candidates.filter((r) => r.status === "INTERVIEW").length,
        joining: candidates.filter((r) => r.status === "JOINING").length,
        hired: candidates.filter((r) => r.status === "HIRED").length,
        completed: candidates.filter((r) => r.status === "COMPLETED").length,
        rejected: candidates.filter((r) => r.status === "REJECTED").length,
        onHold: candidates.filter((r) => r.status === "ON_HOLD").length,
      });
      setRecentActivities([
        {
          action: "Campus shortlist imported",
          created_at: new Date().toISOString(),
          performed_by_name: "Meera Sharma",
        },
        {
          action: "LOA generated",
          created_at: new Date().toISOString(),
          performed_by_name: "Meera Sharma",
        },
        {
          action: "Interview scheduled",
          created_at: new Date().toISOString(),
          performed_by_name: "Kavitha Rao",
        },
      ]);
      setUserName(profile?.full_name || "Meera Sharma");
      return;
    }

    try {
      const data = await getDashboardMetrics();
      const employees = await employeeService.getAll();
      setEmployeeCount(employees?.length || 0);
      const leaves = await leaveService.getAll();
      setPendingLeaves(leaves.length);
      setMetrics(data);
      setOpenRequirements(data.open_roles || 0);

      const { data: ndaPending } = await supabase
        .from("intern_assignments")
        .select("*")
        .eq("nda_generated", true)
        .eq("nda_received", false);
      setNdaPendingCount(ndaPending?.length || 0);

      const { data: documents } = await supabase
        .from("generated_documents")
        .select("id");

      setDocumentCount(documents?.length || 0);
      const { data: pending } = await supabase
        .from("generated_documents")
        .select("id")
        .eq("approval_status", "PENDING_APPROVAL");

      setPendingCount(pending?.length || 0);

      const todayDate = new Date().toISOString().split("T")[0];

      const { data: loaDocs } = await supabase
        .from("generated_documents")
        .select(
          `
    candidate_id,
    start_date,
    end_date,
    candidates(full_name)
  `,
        )
        .eq("document_type", "LOA")
        .gte("start_date", todayDate)
        .order("start_date", { ascending: true });

      setUpcomingJoining(loaDocs || []);

      const { data: endingDocs } = await supabase
        .from("generated_documents")
        .select(
          `
    candidate_id,
    end_date,
    candidates(full_name)
  `,
        )
        .eq("document_type", "LOA")
        .gte("end_date", todayDate)
        .order("end_date", { ascending: true });

      setInternshipEnding(endingDocs || []);

      setJoiningThisWeekCount(loaDocs?.length || 0);
      setEndingSoonCount(endingDocs?.length || 0);
      const { data: hiredCandidates } = await supabase
        .from("candidates")
        .select("id")
        .eq("status", "HIRED");

      setInternCount(hiredCandidates?.length || 0);
      const { data: certificatePending } = await supabase
        .from("intern_assignments")
        .select("*")
        .eq("completed", true)
        .eq("certificate_generated", false);

      setCertificatePendingCount(certificatePending?.length || 0);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUserName(
          user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "User",
        );
      }

      
      const { data: resumes } = await supabase
        .from("candidates")
        .select("status");
      const rows = resumes || [];
      setCandidateStats({
        total: rows.length,
        new: rows.filter((r) => r.status === "NEW").length,
        screening: rows.filter((r) => r.status === "SCREENING").length,
        interview: rows.filter((r) => r.status === "INTERVIEW").length,
        joining: rows.filter((r) => r.status === "JOINING").length,
        hired: rows.filter((r) => r.status === "HIRED").length,
        completed: rows.filter((r) => r.status === "COMPLETED").length,
        rejected: rows.filter((r) => r.status === "REJECTED").length,
        onHold: rows.filter((r) => r.status === "ON_HOLD").length,
      });

      const { data: candidates } = await supabase
        .from("candidates")
        .select(
          `
    id,
    full_name,
    status,
    ai_score,
    created_at
  `,
        )
        .order("created_at", { ascending: false });

      setAllCandidates(candidates || []);
      setRecentCandidates((candidates || []).slice(0, 5));
      const { data: activities } = await supabase
        .from("candidate_activity_logs")
        .select(
          `
    candidate_id,
    action,
    created_at,
    performed_by_name
  `,
        )
        .order("created_at", { ascending: false })
        .limit(5);

      setRecentActivities(activities || []);

      const { data: joiningAssignments } = await supabase
        .from("intern_assignments")
        .select("*")
        .eq("status", "JOINING")
        .order("joining_date", { ascending: true })
        .limit(5);

      if (joiningAssignments) {
        const candidateIds = joiningAssignments.map((j) => j.candidate_id);

        await supabase
  .from("candidates")
  .select("id, full_name")
  .in("id", candidateIds);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div
      className="relative h-full antialiased"
      style={{
        background: PAGE_BG,
        fontFamily: "'Inter', 'DM Sans', system-ui, sans-serif",
      }}
    >
      <main className="relative z-10 w-full px-8 pt-8 pb-10 lg:px-10">
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p
              className="text-[34px] font-bold leading-tight tracking-tight"
              style={{
                color: INK,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              Recrulyn&rsquo;s{" "}
              <span style={{ color: "orangered" }}>HR Intelligence</span>{" "}
            </p>
          </div>
          <p
            className="max-w-xl text-[19px] font-semibold leading-relaxed"
            style={{
              color: INK,
              fontFamily: "'Quicksand', sans-serif",
            }}
          >
            Welcome Back!! Good to see you again.
          </p>
        </div>

        {/* ── Row 1: KPI stat strip ────────────────────────────────── */}
        <div
          className="grid grid-cols-2 divide-x xl:grid-cols-4 xl:divide-x"
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 16,
            background: CARD_BG,
            borderColor: BORDER,
          }}
        >
          <div className="xl:border-r" style={{ borderColor: BORDER }}>
            <HeroKpi
              icon={Users}
              label="Candidates"
              value={metrics.active_candidates}
              token="primary"
              sub="Total Candidates"
            />
          </div>

          <div className="xl:border-r" style={{ borderColor: BORDER }}>
            <HeroKpi
              icon={UserCheck}
              label="Interns"
              value={internCount}
              token="teal"
              sub="Active Interns"
            />
          </div>

          <div className="xl:border-r" style={{ borderColor: BORDER }}>
            <HeroKpi
              icon={FileText}
              label="Documents"
              value={documentCount}
              token="emerald"
              sub="LOA • NDA • Certificate"
            />
          </div>

          <div>
            <HeroKpi
              icon={Clock}
              label="Pending"
              value={pendingCount}
              token="amber"
              sub="Actions Pending"
            />
          </div>
        </div>

        {/* ── Row 2: Recruitment Pipeline (full width) ─────────────── */}
        <div className="mt-5">
          <Panel
            title="Recruitment Pipeline"
            icon={Activity}
            iconClass="text-[#2F7D4A]"
          >
            <p
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: INK,
                marginBottom: 20,
              }}
            >
              Candidate journey across the hiring lifecycle
            </p>

            <RecruitmentPipeline stats={candidateStats} />
          </Panel>
        </div>

        {/* ── Row 3: Upcoming Joining + Internship Ending side by side ── */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Panel
            title="Upcoming Joining"
            icon={CalendarClock}
            iconClass="text-[#1F8C8C]"
          >
            <div className="flex flex-col gap-3">
              {upcomingJoining.length === 0 ? (
                <div className="py-6 text-center text-sm" style={{ color: INK }}>
  No upcoming joining.
</div>
              ) : (
                <div className="space-y-3">
                  {upcomingJoining.slice(0, 5).map((item: any) => (
                    <motion.div
                      key={item.candidate_id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-2xl p-4"
                      style={{
                        border: `1px solid ${BORDER}`,
                        background: MUTED_BG,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 14,
                          color: INK,
                        }}
                      >
                        {item.candidates?.full_name}
                      </div>

                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          color: INK_SOFT,
                        }}
                      >
                        Joining Date
                      </div>

                      <div
                        style={{
                          color: "#1F5C36",
                          fontWeight: 700,
                          fontSize: 14,
                          marginTop: 3,
                        }}
                      >
                        {new Date(item.start_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Internship Ending"
            icon={CalendarCheck2}
            iconClass="text-[#EF4444]"
          >
            {internshipEnding.length === 0 ? (
              <div className="py-6 text-center text-sm" style={{ color: INK }}>
  No upcoming internship completion.
</div>
            ) : (
              <div className="space-y-3">
                {internshipEnding.slice(0, 5).map((item: any) => (
                  <motion.div
                    key={item.candidate_id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl p-4"
                    style={{
                      border: `1px solid ${BORDER}`,
                      background: MUTED_BG,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: INK,
                      }}
                    >
                      {item.candidates?.full_name}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: "0.03em",
                        textTransform: "uppercase",
                        color: INK_SOFT,
                      }}
                    >
                      Completion Date
                    </div>

                    <div
                      style={{
                        color: "#C0392B",
                        fontWeight: 700,
                        fontSize: 14,
                        marginTop: 3,
                      }}
                    >
                      {new Date(item.end_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Row 4: Recent Activity (full width) ──────────────────── */}
        <div className="mt-5">
          <Panel
            title="Recent Recruitment Activity"
            icon={History}
            iconClass="text-[#4B5563]"
          >
            {recentActivities.length === 0 ? (
              <div className="py-6 text-center text-sm" style={{ color: INK }}>
  No recent activity.
</div>
            ) : (
              <div className="divide-y" style={{ borderColor: BORDER }}>
                {recentActivities.map((activity: any, idx: number) => {
                  const candidate = allCandidates.find(
                    (c) => c.id === activity.candidate_id,
                  );
                  const tk =
                    T[
                      statusToken(
                        activity.action === "STATUS_CHANGE"
                          ? activity.new_status
                          : activity.action,
                      )
                    ];
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <span
                        className={clsx(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                          tk.bg,
                          tk.text,
                        )}
                      >
                        {initialsOf(candidate?.full_name)}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="truncate"
                            style={{
                              fontWeight: 700,
                              fontSize: 14,
                              color: INK,
                            }}
                          >
                            {candidate?.full_name || "Unknown Candidate"}
                          </span>
                          <span
                            className={clsx(
                              "shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold",
                              tk.bg,
                              tk.text,
                            )}
                          >
                            {activity.action === "STATUS_CHANGE"
                              ? activity.new_status
                              : activity.action}
                          </span>
                        </div>
                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 12.5,
                            color: INK_SOFT,
                          }}
                        >
                          by{" "}
                          <strong style={{ color: INK }}>
                            {activity.performed_by_name || "System"}
                          </strong>
                        </div>
                      </div>

                      <span
                        className="shrink-0 text-[11.5px] font-medium"
                        style={{ color: INK_SOFT }}
                      >
                        {new Date(activity.created_at).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="mt-8 flex items-center justify-center gap-3 pt-2">
          <span
            className="text-[11px]"
            style={{ color: INK_SOFT, opacity: 0.7 }}
          >
            2026
          </span>
          <span style={{ color: BORDER }}>·</span>
          <span
            className="text-[11px]"
            style={{ color: INK_SOFT, opacity: 0.7 }}
          >
            Recrulyn Technologies
          </span>
          <span style={{ color: BORDER }}>·</span>
          <span
            className="text-[11px]"
            style={{ color: INK_SOFT, opacity: 0.7 }}
          >
            All rights reserved
          </span>
        </div>
      </main>
    </div>
  );
}
