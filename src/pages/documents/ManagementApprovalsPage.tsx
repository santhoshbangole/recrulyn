import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

import { motion } from "framer-motion";
import { approvalService, normalizeApprovalFilter } from "../../modules/documents/services/approval.service";
import { useAuth } from "../../app/providers/AuthProvider";

export default function ManagementApprovalsPage() {
  const navigate = useNavigate();
  useAuth();

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    async function load() {
      try {
        const data = await approvalService.getManagementLOAs();
        setDocuments(data);
        const dashboardStats = await approvalService.getApprovalStats();
        setStats(dashboardStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      (doc.internship_role || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.officer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (doc.candidates?.full_name || doc.candidate_name || "").toLowerCase().includes(search.toLowerCase());
    const normalized = normalizeApprovalFilter(doc.approval_status);
    const matchesFilter = filter === "All" || normalized === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const filterTabs = ["All", "pending", "approved", "rejected"];

  const statusStyles: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
    approved: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0", label: "Approved", dot: "#10B981" },
    rejected: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", label: "Rejected", dot: "#EF4444" },
    pending:  { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", label: "Pending", dot: "#F59E0B" },
  };

  function getStatusStyle(status: string) {
    return statusStyles[normalizeApprovalFilter(status)] ?? statusStyles.pending;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes mgmtFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mgmtSpin {
          to { transform: rotate(360deg); }
        }
        .mgmt-search-input:focus {
          border-color: #4F7C5F !important;
          box-shadow: 0 0 0 3px rgba(79,124,95,0.12);
        }
        .mgmt-filter-tab {
          transition: background 0.15s ease, color 0.15s ease;
        }
        .mgmt-row {
          transition: background 0.15s ease;
        }
        .mgmt-review-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }
        .mgmt-review-btn:hover {
          background: #416a4f !important;
          box-shadow: 0 6px 16px rgba(79,124,95,0.32);
        }
        .mgmt-scroll-hint {
          animation: mgmtFadeIn 0.35s ease both;
        }
      `}</style>

      {/* ══ TOP HEADER ══ */}
      <header
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #ECE9E2",
          padding: "0 40px",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px", flexWrap: "wrap", gap: 12 }}>
          {/* Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "13px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "10px",
                background: "linear-gradient(145deg, #5C8E6D, #4F7C5F)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(79,124,95,0.3)",
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={17} color="#fff" strokeWidth={2.2} />
            </div>
            <div>
              <p style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4F7C5F", margin: 0 }}>
                Management Portal
              </p>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#14181A", margin: 0, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
                Document Approvals
              </h1>
            </div>
          </div>

          {/* Stat counters */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[
              { label: "Pending", count: stats.pending, bg: "#FFFBEB", text: "#B45309", border: "#FDE68A", icon: <Clock size={13} color="#D97706" strokeWidth={2.3} /> },
              { label: "Approved", count: stats.approved, bg: "#ECFDF5", text: "#047857", border: "#A7F3D0", icon: <CheckCircle size={13} color="#059669" strokeWidth={2.3} /> },
              { label: "Rejected", count: stats.rejected, bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", icon: <XCircle size={13} color="#EF4444" strokeWidth={2.3} /> },
            ].map(({ label, count, bg, text, border, icon }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  background: bg,
                  border: `1px solid ${border}`,
                  borderRadius: "10px",
                  padding: "7px 13px",
                }}
              >
                {icon}
                <span style={{ fontSize: "18px", fontWeight: 800, color: text, lineHeight: 1 }}>{count}</span>
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: text, opacity: 0.8 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ══ BODY ══ */}
      <div style={{ padding: "28px 40px 48px", maxWidth: "1400px", margin: "0 auto" }}>

        {/* ── Search + Filter row ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "220px", maxWidth: "400px" }}>
            <Search size={16} color="#9CA3AF" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              className="mgmt-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role or officer…"
              style={{
                width: "100%",
                borderRadius: "10px",
                border: "1.5px solid #E5E1D8",
                background: "#fff",
                padding: "10px 14px 10px 38px",
                fontSize: "14.5px",
                color: "#14181A",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "#fff", border: "1.5px solid #E5E1D8", borderRadius: "10px", padding: "3px" }}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                className="mgmt-filter-tab"
                onClick={() => setFilter(tab)}
                style={{
                  borderRadius: "7px", border: "none", padding: "7px 15px",
                  fontSize: "13.5px", fontWeight: 700, cursor: "pointer",
                  background: filter === tab ? "#4F7C5F" : "transparent",
                  color: filter === tab ? "#fff" : "#6B7280",
                  textTransform: tab === "All" ? "none" : "capitalize",
                }}
              >
                {tab === "All" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ marginLeft: "auto", fontSize: "13.5px", color: "#6B7280", fontWeight: 500 }}>
            {filtered.length} document{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #ECE9E2", padding: "70px 40px", textAlign: "center" }}>
            <div
              style={{
                width: 34,
                height: 34,
                margin: "0 auto 16px",
                borderRadius: "50%",
                border: "3px solid #E5E1D8",
                borderTopColor: "#4F7C5F",
                animation: "mgmtSpin 0.8s linear infinite",
              }}
            />
            <p style={{ color: "#6B7280", fontSize: "14.5px", fontWeight: 500 }}>Loading approvals…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #ECE9E2", padding: "70px 40px", textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                background: "#F5F3EE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <FileText size={24} color="#9CA3AF" strokeWidth={1.8} />
            </div>
            <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#14181A", margin: "0 0 6px" }}>No approvals found</h2>
            <p style={{ fontSize: "14.5px", color: "#6B7280", margin: 0 }}>No documents match your current filter.</p>
          </div>
        ) : (
          /* ── Table-style list ── */
          <div style={{ background: "#ffffff", borderRadius: "16px", border: "1px solid #ECE9E2", overflow: "hidden", boxShadow: "0 1px 3px rgba(20,24,26,0.04)" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 120px", gap: "0", padding: "12px 24px", borderBottom: "1px solid #ECE9E2", background: "#FAFAF8" }}>
              {["Candidate", "Role", "Department", "Document", "Status", ""].map((col) => (
                <span key={col} style={{ fontSize: "11.5px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9CA3AF" }}>{col}</span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((doc, index) => {
              const st = getStatusStyle(doc.approval_status);
              return (
                <motion.div
                  key={doc.id}
                  className="mgmt-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr 1fr 1fr 1fr 120px", gap: "0", padding: "15px 24px", borderBottom: index < filtered.length - 1 ? "1px solid #F3F1EB" : "none", alignItems: "center", cursor: "default", background: "#ffffff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#FAFAF8")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
                >
                  {/* Candidate */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#F5F3EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={16} color="#6B7280" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: "14.5px", fontWeight: 700, color: "#14181A", margin: 0 }}>
                        {doc.candidates?.full_name || "Candidate"}
                      </p>
                      <p style={{ fontSize: "12.5px", color: "#9CA3AF", margin: "2px 0 0" }}>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151" }}>{doc.internship_role || "—"}</span>

                  {/* Department */}
                  <span style={{ fontSize: "13.5px", color: "#6B7280" }}>{doc.department || "—"}</span>

                  {/* Document */}
                  <span style={{ fontSize: "13.5px", color: "#6B7280" }}>{doc.document_type || "—"}</span>

                  {/* Status */}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: st.bg, color: st.text, border: `1px solid ${st.border}`, borderRadius: "999px", padding: "4.5px 12px", fontSize: "12.5px", fontWeight: 700, width: "fit-content" }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                    {st.label}
                  </span>

                  {/* Action */}
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <motion.button
                      className="mgmt-review-btn"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate(`/app/approval-review/${doc.id}`)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "5px", borderRadius: "9px", border: "none", background: "#4F7C5F", padding: "8px 15px", fontSize: "13.5px", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 2px 6px rgba(79,124,95,0.22)" }}
                    >
                      Review
                      <ChevronRight size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}