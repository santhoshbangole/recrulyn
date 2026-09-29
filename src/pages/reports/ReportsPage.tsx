import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getLocalAssignments,
  getLocalCandidates,
  getLocalDocuments,
  getLocalReportStats,
  isDemoMode,
} from "../../modules/demo/seed";

export default function ReportsPage() {
  const [report, setReport] = useState<any>({});
  const [fromDate, setFromDate] = useState("");
  const [showCandidateMenu, setShowCandidateMenu] = useState(false);
  const [showInternshipMenu, setShowInternshipMenu] = useState(false);
  const [showDocumentMenu, setShowDocumentMenu] = useState(false);
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadReport();
  }, [fromDate, toDate]);

  async function fetchCandidates() {
    if (isDemoMode()) return getLocalCandidates(fromDate, toDate);
    try {
      let query = supabase.from("candidates").select(`full_name,email,phone,status,ai_score,created_at,department,job_title,location`);
      if (fromDate) query = query.gte("created_at", fromDate);
      if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);
      const { data, error } = await query;
      if (error) throw error;
      return data?.length ? data : getLocalCandidates(fromDate, toDate);
    } catch {
      return getLocalCandidates(fromDate, toDate);
    }
  }

  async function downloadCandidateReport() {
    const data = await fetchCandidates();
    const formattedData = (data || []).map((candidate) => ({
      Name: candidate.full_name,
      Email: candidate.email,
      Phone: candidate.phone,
      Status: candidate.status,
      "AI Score": candidate.ai_score,
      "Created Date": candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : "-",
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, `Candidate_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  async function downloadCandidatePdf() {
    const data = await fetchCandidates();
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Candidate Report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    if (fromDate || toDate) doc.text(`Date Range: ${fromDate || "-"} to ${toDate || "-"}`, 14, 32);
    autoTable(doc, {
      startY: 40,
      head: [["Name", "Email", "Phone", "Status", "AI Score"]],
      body: (data || []).map((c: any) => [c.full_name, c.email, c.phone || "-", c.status, c.ai_score ?? "-"]),
    });
    doc.save(`Candidate_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  }

  async function downloadInternshipReport() {
    const assignments = isDemoMode()
      ? getLocalAssignments(fromDate, toDate)
      : await (async () => {
          try {
            let query = supabase.from("intern_assignments").select("*");
            if (fromDate) query = query.gte("created_at", fromDate);
            if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);
            const { data, error } = await query;
            if (error) throw error;
            return data?.length ? data : getLocalAssignments(fromDate, toDate);
          } catch {
            return getLocalAssignments(fromDate, toDate);
          }
        })();
    const candidates = isDemoMode()
      ? getLocalCandidates()
      : await (async () => {
          try {
            const { data } = await supabase.from("candidates").select("id, full_name");
            return data?.length ? data : getLocalCandidates();
          } catch {
            return getLocalCandidates();
          }
        })();
    const formattedData = (assignments || []).map((row: any) => {
      const candidate = candidates?.find((c: any) => c.id === row.candidate_id);
      return {
        Candidate: candidate?.full_name || row.candidate_name || "Unknown",
        Role: row.role_name,
        Department: row.department,
        "Joining Date": row.joining_date,
        "LOA Generated": row.loa_generated ? "Yes" : "No",
        "NDA Generated": row.nda_generated ? "Yes" : "No",
        "NDA Received": row.nda_received ? "Yes" : "No",
        Joined: row.joined ? "Yes" : "No",
        Completed: row.completed ? "Yes" : "No",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Internships");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, `Internship_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  async function downloadDocumentReport() {
    const docs = isDemoMode()
      ? getLocalDocuments(fromDate, toDate)
      : await (async () => {
          try {
            let query = supabase.from("generated_documents").select(`document_type,created_at,status,candidate_id`);
            if (fromDate) query = query.gte("created_at", fromDate);
            if (toDate) query = query.lte("created_at", `${toDate}T23:59:59`);
            const { data, error } = await query;
            if (error) throw error;
            return data?.length ? data : getLocalDocuments(fromDate, toDate);
          } catch {
            return getLocalDocuments(fromDate, toDate);
          }
        })();
    const candidates = getLocalCandidates();
    const formattedData = (docs || []).map((row: any) => {
      const candidate = candidates?.find((c: any) => c.id === row.candidate_id) || row.candidates;
      return {
        Candidate: candidate?.full_name || "Unknown",
        "Document Type": row.document_type,
        Status: row.status || "GENERATED",
        "Created Date": row.created_at ? new Date(row.created_at).toLocaleDateString() : "-",
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documents");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(file, `Document_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  }

  async function loadReport() {
    if (isDemoMode()) {
      setReport(getLocalReportStats(fromDate, toDate));
      return;
    }
    try {
      let candQuery = supabase.from("candidates").select("status,created_at");
      let docQuery = supabase.from("generated_documents").select("document_type,created_at");
      if (fromDate) {
        candQuery = candQuery.gte("created_at", fromDate);
        docQuery = docQuery.gte("created_at", fromDate);
      }
      if (toDate) {
        candQuery = candQuery.lte("created_at", `${toDate}T23:59:59`);
        docQuery = docQuery.lte("created_at", `${toDate}T23:59:59`);
      }
      const [{ data: candidates, error: candError }, { data: documents, error: docError }] = await Promise.all([
        candQuery,
        docQuery,
      ]);
      if (candError) throw candError;
      if (docError) throw docError;
      const docs = documents || [];
      const rows = candidates || [];
      if (!rows.length && !docs.length) {
        setReport(getLocalReportStats(fromDate, toDate));
        return;
      }
      setReport({
        total: rows.length,
        screening: rows.filter((r) => r.status === "SCREENING").length,
        interview: rows.filter((r) => r.status === "INTERVIEW").length,
        joining: rows.filter((r) => r.status === "JOINING").length,
        hired: rows.filter((r) => r.status === "HIRED").length,
        completed: rows.filter((r) => r.status === "COMPLETED").length,
        rejected: rows.filter((r) => r.status === "REJECTED").length,
        loaCount: docs.filter((d) => d.document_type === "LOA").length,
        ndaCount: docs.filter((d) => d.document_type === "NDA").length,
        locCount: docs.filter((d) => d.document_type === "LOC").length,
        lorCount: docs.filter((d) => d.document_type === "LOR").length,
        certificateCount: docs.filter((d) => d.document_type === "COMPLETION_CERTIFICATE" || d.document_type === "CERTIFICATE").length,
      });
    } catch {
      setReport(getLocalReportStats(fromDate, toDate));
    }
  }

  const pipelineStats = [
    { label: "Screening", value: report.screening, color: "#6366f1", bg: "#eef2ff", dot: "#6366f1" },
    { label: "Interview", value: report.interview, color: "#0ea5e9", bg: "#e0f2fe", dot: "#0ea5e9" },
    { label: "Joining", value: report.joining, color: "#f59e0b", bg: "#fef3c7", dot: "#f59e0b" },
    { label: "Hired", value: report.hired, color: "#10b981", bg: "#d1fae5", dot: "#10b981" },
    { label: "Completed", value: report.completed, color: "#3b82f6", bg: "#dbeafe", dot: "#3b82f6" },
    { label: "Rejected", value: report.rejected, color: "#ef4444", bg: "#fee2e2", dot: "#ef4444" },
  ];

  const documentStats = [
    { label: "LOAs", value: report.loaCount, icon: "📋" },
    { label: "NDAs", value: report.ndaCount, icon: "🔏" },
    { label: "LOCs", value: report.locCount, icon: "📝" },
    { label: "LORs", value: report.lorCount, icon: "✉️" },
    { label: "Certificates", value: report.certificateCount, icon: "🏆" },
  ];

  return (
    <div style={{ padding: "28px 32px", minHeight: "100vh", background: "#f8f7f4", fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", gap: "24px", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "13px", fontWeight: 600, letterSpacing: "0.08em", color: "#000000", textTransform: "uppercase", marginBottom: "4px" }}>
            Analytics &amp; Insights
          </p>
          <h1 style={{ fontSize: "34px", fontWeight: 600, color: "#000000", margin: 0, lineHeight: 1.2 }}>HR Reports</h1>
          <p style={{ fontSize: "13px", color: "#000000", marginTop: "4px" }}>
            Export candidate, internship, and document data with date filters.
          </p>
        </div>

        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          {/* Date filters */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "#000000", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "13px", color: "#1a1a1a", background: "transparent", cursor: "pointer" }}
              />
            </div>
            <div style={{ width: "1px", height: "32px", background: "#e5e7eb" }} />
            <div>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "#000000", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: "13px", color: "#1a1a1a", background: "transparent", cursor: "pointer" }}
              />
            </div>
          </div>

          {/* Export buttons */}
          <div style={{ display: "flex", gap: "8px" }}>
            {/* Candidate Report */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowCandidateMenu(!showCandidateMenu); setShowInternshipMenu(false); setShowDocumentMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#4f46e5", e.currentTarget.style.color = "#4f46e5")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db", e.currentTarget.style.color = "#374151")}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                Candidates
                <span style={{ fontSize: "11px", marginLeft: "2px" }}>▼</span>
              </button>
              {showCandidateMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: "176px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                  <button onClick={() => { downloadCandidateReport(); setShowCandidateMenu(false); }} style={dropItemStyle}>
                    <span style={{ fontSize: "14px" }}>📊</span> Download Excel
                  </button>
                  <button onClick={() => { downloadCandidatePdf(); setShowCandidateMenu(false); }} style={dropItemStyle}>
                    <span style={{ fontSize: "14px" }}>📄</span> Download PDF
                  </button>
                </div>
              )}
            </div>

            {/* Internship Report */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowInternshipMenu(!showInternshipMenu); setShowCandidateMenu(false); setShowDocumentMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#0ea5e9", e.currentTarget.style.color = "#0ea5e9")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db", e.currentTarget.style.color = "#374151")}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0ea5e9", display: "inline-block" }} />
                Internships
                <span style={{ fontSize: "11px", marginLeft: "2px" }}>▼</span>
              </button>
              {showInternshipMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: "176px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                  <button onClick={() => { downloadInternshipReport(); setShowInternshipMenu(false); }} style={dropItemStyle}>
                    <span style={{ fontSize: "14px" }}>📊</span> Download Excel
                  </button>
                </div>
              )}
            </div>

            {/* Document Report */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setShowDocumentMenu(!showDocumentMenu); setShowCandidateMenu(false); setShowInternshipMenu(false); }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#fff", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#374151", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#8b5cf6", e.currentTarget.style.color = "#8b5cf6")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#d1d5db", e.currentTarget.style.color = "#374151")}
              >
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#8b5cf6", display: "inline-block" }} />
                Documents
                <span style={{ fontSize: "11px", marginLeft: "2px" }}>▼</span>
              </button>
              {showDocumentMenu && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: "176px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 50, overflow: "hidden" }}>
                  <button onClick={() => { downloadDocumentReport(); setShowDocumentMenu(false); }} style={dropItemStyle}>
                    <span style={{ fontSize: "14px" }}>📊</span> Download Excel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>

        {/* LEFT: Candidate Pipeline */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {/* Section header */}
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>👥</div>
              <div>
                <h2 style={{ fontSize: "19px", fontWeight: 600, color: "#000000", margin: 0 }}>Candidate Pipeline</h2>
                <p style={{ fontSize: "13px", color: "#000000", margin: 0 }}>Status breakdown across all stages</p>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "28px", fontWeight: 600, color: "#000000", lineHeight: 1 }}>{report.total ?? 0}</div>
              <div style={{ fontSize: "12.5px", color: "#000000", marginTop: "2px" }}>total candidates</div>
            </div>
          </div>

          {/* Pipeline grid */}
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {pipelineStats.map((stat) => (
              <div key={stat.label} style={{ background: stat.bg, borderRadius: "10px", padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: stat.dot, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value ?? 0}</div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: stat.color, opacity: 0.8, marginTop: "2px" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Visual pipeline bar */}
          <div style={{ padding: "0 24px 20px" }}>
            <div style={{ height: "6px", borderRadius: "999px", background: "#f3f4f6", overflow: "hidden", display: "flex", gap: "2px" }}>
              {pipelineStats.map((stat) => {
                const pct = report.total > 0 ? ((stat.value ?? 0) / report.total) * 100 : 0;
                return pct > 0 ? (
                  <div key={stat.label} style={{ height: "100%", width: `${pct}%`, background: stat.color, borderRadius: "999px", transition: "width 0.4s ease" }} />
                ) : null;
              })}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
              {pipelineStats.map((stat) => (
                <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: stat.dot }} />
                  <span style={{ fontSize: "12.5px", color: "#000000" }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Document Analytics */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>📁</div>
              <div>
                <h2 style={{ fontSize: "19px", fontWeight: 600, color: "#000000", margin: 0 }}>Document Analytics</h2>
                <p style={{ fontSize: "13px", color: "#000000", margin: 0 }}>Generated document counts</p>
              </div>
            </div>
          </div>
          <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {documentStats.map((doc, i) => {
              const total = (report.loaCount || 0) + (report.ndaCount || 0) + (report.locCount || 0) + (report.lorCount || 0) + (report.certificateCount || 0);
              const pct = total > 0 ? Math.round(((doc.value ?? 0) / total) * 100) : 0;
              const colors = ["#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6"];
              const bgs = ["#eef2ff", "#e0f2fe", "#d1fae5", "#fef3c7", "#f5f3ff"];
              return (
                <div key={doc.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: bgs[i], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>
                    {doc.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{doc.label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: colors[i] }}>{doc.value ?? 0}</span>
                    </div>
                    <div style={{ height: "5px", borderRadius: "999px", background: "#f3f4f6", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: colors[i], borderRadius: "999px", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Export hint ── */}
      <div style={{ marginTop: "16px", padding: "12px 18px", background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "16px" }}>💡</span>
        <p style={{ margin: 0, fontSize: "13.5px", color: "#000000" }}>
          Use the date filters above to scope exports to a specific period. Exports include all records if no dates are selected.
        </p>
      </div>
    </div>
  );
}

const dropItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "10px 14px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  background: "transparent",
  border: "none",
  textAlign: "left",
  cursor: "pointer",
  transition: "background 0.1s",
};