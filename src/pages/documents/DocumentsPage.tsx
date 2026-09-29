import { useEffect, useState, useMemo, useRef } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  PieChart as PieChartIcon,
  Activity as ActivityIcon,
  Folder,
  ChevronLeft,
  Plus,
  Trash2,
  Building2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNotification } from "../../components/notification/useNotification";
import { documentService } from "../../modules/documents/services/document.service";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { partnerService, type PartnerOrganization, type PartnerOrgType } from "../../modules/partners/services/partner.service";

function docTypeLabel(type: string) {
  switch (type) {
    case "LOA": return "Letter of Acceptance";
    case "NDA": return "Non-Disclosure Agreement";
    case "LOR": return "Letter of Recommendation";
    case "LOC": return "Letter of Confirmation";
    case "COMPLETION_CERTIFICATE": return "Certificate of Completion";
    case "RESUME": return "Resume";
    case "ID_PROOF": return "ID Proof";
    case "ADDRESS_PROOF": return "Address Proof";
    case "PHOTO": return "Photo";
    case "OTHER": return "Other";
    case "ATTACHMENT": return "Email Attachment";
    default: return type || "Document";
  }
}

function docState(doc: any): "PENDING" | "APPROVED" | "REJECTED" {
  if (doc.document_type === "NDA") return doc.is_signed ? "APPROVED" : "PENDING";
  if (doc.approval_status === "APPROVED") return "APPROVED";
  if (doc.approval_status === "REJECTED") return "REJECTED";
  return "PENDING";
}

function relativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const TYPE_COLOR: Record<string, { dot: string; bg: string; text: string }> = {
  LOA:                    { dot: "#10b981", bg: "#d1fae5", text: "#065f46" },
  NDA:                    { dot: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
  COMPLETION_CERTIFICATE: { dot: "#22c55e", bg: "#dcfce7", text: "#14532d" },
  LOR:                    { dot: "#3b82f6", bg: "#dbeafe", text: "#1e3a8a" },
  LOC:                    { dot: "#06b6d4", bg: "#cffafe", text: "#164e63" },
  RESUME:                 { dot: "#8b5cf6", bg: "#ede9fe", text: "#4c1d95" },
  ID_PROOF:               { dot: "#b45309", bg: "#fdf4e3", text: "#92400e" },
  ADDRESS_PROOF:          { dot: "#0f8b8d", bg: "#e7f7f7", text: "#0b6b6d" },
  PHOTO:                  { dot: "#be123c", bg: "#fceaee", text: "#9f1239" },
  OTHER:                  { dot: "#64748b", bg: "#f1f5f9", text: "#334155" },
  ATTACHMENT:             { dot: "#0f8b8d", bg: "#e7f7f7", text: "#0b6b6d" },
};

function getTypeColor(type: string) {
  return TYPE_COLOR[type] ?? { dot: "#9ca3af", bg: "#f3f4f6", text: "#374151" };
}

const DOC_CATEGORIES = [
  ["RESUME", "Resume"],
  ["ID_PROOF", "ID Proof"],
  ["ADDRESS_PROOF", "Address Proof"],
  ["PHOTO", "Photo"],
  ["OTHER", "Other"],
  ["LOA", "LOA"],
  ["NDA", "NDA"],
  ["LOR", "LOR"],
  ["LOC", "LOC"],
  ["COMPLETION_CERTIFICATE", "Certificate"],
] as const;

const ORG_TYPES: { id: PartnerOrgType; label: string }[] = [
  { id: "UNIVERSITY", label: "University" },
  { id: "INDUSTRY", label: "Industry" },
  { id: "INSTITUTE", label: "Institute" },
];

const selectStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e8e5df",
  borderRadius: "8px",
  padding: "7px 10px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#000",
  background: "#fff",
  fontFamily: "inherit",
};

/* ── Shared text styles ── */
const SECTION_TITLE: React.CSSProperties = { fontSize: "16px", fontWeight: 700, color: "#000000" };

const META_VALUE: React.CSSProperties = { fontSize: "14px", fontWeight: 700, color: "#000000" };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [filterType, setFilterType] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [openOrgId, setOpenOrgId] = useState<string | null>(null);
  const [partners, setPartners] = useState<PartnerOrganization[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [savingPartner, setSavingPartner] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    name: "",
    org_type: "UNIVERSITY" as PartnerOrgType,
    location: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    notes: "",
  });
  const detailGridRef = useRef<HTMLDivElement>(null);
const notify = useNotification();
  useEffect(() => { loadDocuments(); }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docs, orgs, people] = await Promise.all([
        documentService.getDocuments(),
        partnerService.list(),
        candidateService.getCandidates(),
      ]);
      setDocuments(docs || []);
      setPartners(orgs || []);
      setCandidates(people || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  function docOrgId(doc: any) {
    return doc.partner_org_id || doc.candidates?.partner_org_id || null;
  }

  const loaCount         = documents.filter((d) => d.document_type === "LOA").length;
  const ndaCount         = documents.filter((d) => d.document_type === "NDA").length;
  const certificateCount = documents.filter((d) => d.document_type === "COMPLETION_CERTIFICATE").length;
  const lorCount         = documents.filter((d) => d.document_type === "LOR").length;
  const locCount         = documents.filter((d) => d.document_type === "LOC").length;
  const resumeCount      = documents.filter((d) => d.document_type === "RESUME").length;

  function jumpToGrid(status: "ALL" | "PENDING" | "APPROVED" | "REJECTED") {
    setStatusFilter(status);
    detailGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const visibleDocuments = useMemo(() => {
    return documents
      .filter((doc) => filterType === "ALL" || doc.document_type === filterType)
      .filter((doc) => statusFilter === "ALL" || docState(doc) === statusFilter)
      .filter((doc) => {
        const haystack = `${doc.candidates?.full_name || ""} ${doc.internship_role || ""} ${doc.project_title || ""} ${doc.document_type || ""}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      });
  }, [documents, filterType, statusFilter, searchTerm]);

  const partnerFolders = useMemo(() => {
    return partners.map((org) => {
      const docs = visibleDocuments.filter((doc) => docOrgId(doc) === org.id);
      const assignedIds = new Set(
        candidates.filter((c) => c.partner_org_id === org.id).map((c) => c.id)
      );
      docs.forEach((doc) => {
        if (doc.candidate_id) assignedIds.add(doc.candidate_id);
      });
      return { ...org, docs, candidateCount: assignedIds.size };
    });
  }, [partners, visibleDocuments, candidates]);

  const candidateFolders = useMemo(() => {
    const orgId = openOrgId === "unassigned" ? null : openOrgId;
    const map = new Map<string, { id: string; name: string; email: string; docs: any[] }>();

    if (openOrgId) {
      candidates
        .filter((c) => (c.partner_org_id || null) === orgId)
        .forEach((c) => {
          map.set(c.id, {
            id: c.id,
            name: c.full_name || "Unnamed candidate",
            email: c.email || "",
            docs: [],
          });
        });
    }

    visibleDocuments
      .filter((doc) => (openOrgId ? (docOrgId(doc) || null) === orgId : true))
      .forEach((doc) => {
        const id = doc.candidate_id || "unassigned";
        const name = doc.candidates?.full_name || "Unassigned files";
        const email = doc.candidates?.email || "";
        if (!map.has(id)) map.set(id, { id, name, email, docs: [] });
        map.get(id)!.docs.push(doc);
      });

    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [visibleDocuments, candidates, openOrgId]);

  const openFolder = candidateFolders.find((folder) => folder.id === openFolderId) || null;
  const openOrg =
    openOrgId && openOrgId !== "unassigned"
      ? partners.find((org) => org.id === openOrgId) || null
      : null;
  const unassignedCount = useMemo(() => {
    const people = candidates.filter((c) => !c.partner_org_id).length;
    const docs = visibleDocuments.filter((doc) => !docOrgId(doc)).length;
    return { people, docs };
  }, [candidates, visibleDocuments]);

  async function handleCreatePartner(event: React.FormEvent) {
    event.preventDefault();
    if (!partnerForm.name.trim()) {
      notify.warning("Folder name required", "Enter the university, industry, or institute name.");
      return;
    }
    try {
      setSavingPartner(true);
      await partnerService.create({
        name: partnerForm.name.trim(),
        org_type: partnerForm.org_type,
        location: partnerForm.location.trim() || undefined,
        contact_name: partnerForm.contact_name.trim() || undefined,
        contact_email: partnerForm.contact_email.trim() || undefined,
        contact_phone: partnerForm.contact_phone.trim() || undefined,
        notes: partnerForm.notes.trim() || undefined,
      });
      setPartnerForm({
        name: "",
        org_type: "UNIVERSITY",
        location: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        notes: "",
      });
      setShowPartnerForm(false);
      notify.success("Partner folder created");
      await loadDocuments();
    } catch (error: any) {
      notify.error("Could not create folder", error?.message || "Please try again.");
    } finally {
      setSavingPartner(false);
    }
  }

  async function handleDeletePartner(orgId: string, orgName: string) {
    if (!confirm(`Delete the "${orgName}" folder? Candidates and files will move to Unassigned.`)) return;
    try {
      await partnerService.remove(orgId);
      if (openOrgId === orgId) {
        setOpenOrgId(null);
        setOpenFolderId(null);
      }
      notify.success("Folder deleted");
      await loadDocuments();
    } catch (error: any) {
      notify.error("Could not delete folder", error?.message || "Please try again.");
    }
  }

  async function handleChangeCategory(docId: string, documentType: string) {
    try {
      await documentService.updateDocument(docId, { document_type: documentType });
      await loadDocuments();
    } catch {
      notify.error("Update failed", "Could not change the document category.");
    }
  }

  async function handleReassignCandidate(doc: any, candidateId: string) {
    try {
      const person = candidates.find((c) => c.id === candidateId);
      await documentService.updateDocument(doc.id, {
        candidate_id: candidateId || null,
        partner_org_id: person?.partner_org_id || null,
      });
      notify.success("Document reassigned");
      await loadDocuments();
    } catch {
      notify.error("Move failed", "Could not reassign this document.");
    }
  }

  async function handleMoveDocToOrg(doc: any, partnerOrgId: string) {
    const nextOrgId = partnerOrgId || null;
    try {
      await documentService.updateDocument(doc.id, { partner_org_id: nextOrgId });
      if (doc.candidate_id) {
        await candidateService.assignPartnerOrg(doc.candidate_id, nextOrgId);
        await documentService.assignCandidateDocumentsToOrg(doc.candidate_id, nextOrgId);
      }
      notify.success(nextOrgId ? "Moved to partner folder" : "Moved to Unassigned");
      await loadDocuments();
    } catch {
      notify.error("Move failed", "Could not move this document.");
    }
  }

  async function handleAssignCandidateFolder(candidateId: string, partnerOrgId: string) {
    if (!candidateId || candidateId === "unassigned") return;
    const nextOrgId = partnerOrgId || null;
    try {
      await candidateService.assignPartnerOrg(candidateId, nextOrgId);
      await documentService.assignCandidateDocumentsToOrg(candidateId, nextOrgId);
      setOpenOrgId(nextOrgId || "unassigned");
      notify.success("Candidate folder moved");
      await loadDocuments();
    } catch {
      notify.error("Move failed", "Could not assign this candidate folder.");
    }
  }

  async function handleDeleteDoc(doc: any) {
    const label = doc.internship_role || docTypeLabel(doc.document_type);
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try {
      await documentService.deleteDocument(doc.id);
      notify.success("Document deleted");
      await loadDocuments();
    } catch {
      notify.error("Delete failed", "Could not delete this document.");
    }
  }

  const byStatus = useMemo(() => {
    const sorted = [...documents].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    return {
      PENDING:  sorted.filter((d) => docState(d) === "PENDING"),
      APPROVED: sorted.filter((d) => docState(d) === "APPROVED"),
      REJECTED: sorted.filter((d) => docState(d) === "REJECTED"),
    };
  }, [documents]);

  const distribution = useMemo(() => {
    const total = documents.length || 1;
    const named = [
      { label: "LOA",         count: loaCount,         color: "#10b981" },
      { label: "NDA",         count: ndaCount,         color: "#f59e0b" },
      { label: "Certificate", count: certificateCount, color: "#22c55e" },
      { label: "LOR",         count: lorCount,         color: "#3b82f6" },
      { label: "LOC",         count: locCount,         color: "#06b6d4" },
      { label: "Resume",      count: resumeCount,      color: "#8b5cf6" },
    ];
    const namedSum = named.reduce((sum, n) => sum + n.count, 0);
    const others = Math.max(documents.length - namedSum, 0);
    return [...named, { label: "Others", count: others, color: "#374151" }]
      .filter((n) => n.count > 0)
      .map((n) => ({ ...n, pct: Math.round((n.count / total) * 100) }));
  }, [documents, loaCount, ndaCount, certificateCount, lorCount, locCount, resumeCount]);

  const donutGradient = useMemo(() => {
    let acc = 0;
    const stops = distribution.map((d) => {
      const start = acc; acc += d.pct;
      return `${d.color} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }, [distribution]);

  const recentActivity = useMemo(() => {
    const events: { date: string; text: string; color: string }[] = [];
    documents.forEach((doc) => {
      const name  = doc.candidates?.full_name || "a candidate";
      const label = docTypeLabel(doc.document_type);
      if (doc.created_at)  events.push({ date: doc.created_at,  text: `${label} for ${name} was generated`, color: "#8b5cf6" });
      if (doc.approved_at) events.push({ date: doc.approved_at, text: `${label} for ${name} was approved`,  color: "#10b981" });
      if (doc.signed_at)   events.push({ date: doc.signed_at,   text: `${label} for ${name} was signed`,    color: "#10b981" });
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);
  }, [documents]);

  const S = {
    page:   { minHeight: "100vh", background: "#ffffff", fontFamily: "Inter, system-ui, sans-serif" } as React.CSSProperties,
    header: { background: "#fff", borderBottom: "1px solid #e8e5df", padding: "0 36px" } as React.CSSProperties,
    body:   { padding: "24px 36px", display: "flex", flexDirection: "column", gap: "20px" } as React.CSSProperties,
    card:   { background: "#fff", borderRadius: "12px", border: "1px solid #e8e5df" } as React.CSSProperties,
  };

  if (loading) {
    return (
      <div style={{ ...S.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "16px", color: "#000000" }}>Loading documents…</p>
      </div>
    );
  }

  return (
    <div style={S.page}>

      {/* ══ HEADER ══ */}
      <header style={S.header}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "#4f7c5f", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileText size={14} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: "#000000", margin: 0 }}>
                Document Center
              </p>
              {/* ↑ Page title — bigger + black */}
              <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#000000", margin: 0, lineHeight: 1.1 }}>Documents</h1>
            </div>
          </div>

          {/* Type count pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {[
              { label: "Total",  count: documents.length, dot: "#6b7280" },
              { label: "LOA",    count: loaCount,         dot: "#10b981" },
              { label: "NDA",    count: ndaCount,         dot: "#f59e0b" },
              { label: "Cert",   count: certificateCount, dot: "#22c55e" },
              { label: "LOR",    count: lorCount,         dot: "#3b82f6" },
              { label: "LOC",    count: locCount,         dot: "#06b6d4" },
              { label: "Resume", count: resumeCount,      dot: "#8b5cf6" },
              { label: "ID",     count: documents.filter((d) => d.document_type === "ID_PROOF").length, dot: "#b45309" },
              { label: "Photo",  count: documents.filter((d) => d.document_type === "PHOTO").length, dot: "#be123c" },
            ].map(({ label, count, dot }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#f9f8f6", border: "1px solid #e8e5df", borderRadius: "8px", padding: "5px 10px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: dot, flexShrink: 0 }} />
                {/* ↑ Pill label — black */}
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#000000" }}>{label}</span>
                <span style={{ fontSize: "16px", fontWeight: 900, color: "#000000" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div style={S.body as React.CSSProperties}>

        {/* ══ ROW 1: Toolbar ══ */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "360px" }}>
            <Search size={13} color="#000000" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by candidate…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", borderRadius: "8px", border: "1px solid #e8e5df", background: "#fff", padding: "8px 12px 8px 34px", fontSize: "15px", color: "#000000", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#4f7c5f")}
              onBlur={e  => (e.target.style.borderColor = "#e8e5df")}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#fff", border: "1px solid #e8e5df", borderRadius: "8px", padding: "7px 12px" }}>
            <FileText size={13} color="#000000" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "15px", fontWeight: 500, color: "#000000", background: "transparent", fontFamily: "inherit", cursor: "pointer" }}
            >
              <option value="ALL">All Types</option>
              <option value="LOA">LOA</option>
              <option value="NDA">NDA</option>
              <option value="LOC">LOC</option>
              <option value="LOR">LOR</option>
              <option value="COMPLETION_CERTIFICATE">Certificate</option>
              <option value="RESUME">Resume</option>
              <option value="ID_PROOF">ID Proof</option>
              <option value="ADDRESS_PROOF">Address Proof</option>
              <option value="PHOTO">Photo</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "3px", background: "#fff", border: "1px solid #e8e5df", borderRadius: "8px", padding: "3px" }}>
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  borderRadius: "6px", border: "none", padding: "5px 12px",
                  fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  background: statusFilter === s ? "#4f7c5f" : "transparent",
                  color: statusFilter === s ? "#fff" : "#000000",
                }}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span style={{ marginLeft: "auto", fontSize: "15px", fontWeight: 600, color: "#000000", opacity: 0.7 }}>
            {visibleDocuments.length} of {documents.length}
          </span>
        </div>

        {/* ══ ROW 2: Status columns + Distribution + Activity ══ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: "16px", alignItems: "start" }}>

          {/* Status columns × 3 */}
          {([
            { key: "PENDING"  as const, label: "Pending",  icon: Clock3,       bg: "#fef3c7", text: "#92400e", border: "#fde68a", dot: "#f59e0b" },
            { key: "APPROVED" as const, label: "Approved", icon: CheckCircle2, bg: "#d1fae5", text: "#065f46", border: "#a7f3d0", dot: "#10b981" },
            { key: "REJECTED" as const, label: "Rejected", icon: XCircle,      bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", dot: "#ef4444" },
          ]).map((col) => (
            <div key={col.key} style={{ ...S.card, overflow: "hidden" }}>
              {/* Column header */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderBottom: "1px solid #f3f0ea", background: "#fafaf9" }}>
                <col.icon size={14} color={col.dot} />
                {/* ↑ Column title — black, larger */}
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#000000" }}>{col.label}</span>
                <span style={{ marginLeft: "auto", background: col.bg, color: col.text, border: `1px solid ${col.border}`, borderRadius: "999px", padding: "1px 8px", fontSize: "13px", fontWeight: 700 }}>
                  {byStatus[col.key].length}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {byStatus[col.key].length === 0 ? (
                  <p style={{ textAlign: "center", padding: "16px 0", fontSize: "14px", color: "#000000" }}>Nothing here yet.</p>
                ) : (
                  byStatus[col.key].slice(0, 4).map((doc: any) => {
                    const tc = getTypeColor(doc.document_type);
                    return (
                      <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: "8px", borderRadius: "7px", border: "1px solid #f3f0ea", padding: "8px 10px", background: "#fafaf9" }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: tc.dot, flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          {/* ↑ Doc type — black, larger */}
                          <p style={{ fontSize: "14px", fontWeight: 600, color: "#000000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.document_type}
                          </p>
                          <p style={{ fontSize: "12px", color: "#000000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.candidates?.full_name || "—"}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {byStatus[col.key].length > 0 && (
                <button
                  onClick={() => jumpToGrid(col.key)}
                  style={{ width: "100%", padding: "10px", background: "transparent", border: "none", borderTop: "1px solid #f3f0ea", fontSize: "13px", fontWeight: 700, color: "#4f7c5f", cursor: "pointer" }}
                >
                  View all ({byStatus[col.key].length})
                </button>
              )}
            </div>
          ))}

          {/* Donut chart */}
          <div style={{ ...S.card, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
              <PieChartIcon size={14} color="#4f7c5f" />
              {/* ↑ Section title — black, larger */}
              <span style={{ ...SECTION_TITLE }}>Distribution</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "90px", height: "90px", borderRadius: "50%", background: donutGradient, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "18px", fontWeight: 900, color: "#000000" }}>{documents.length}</span>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px" }}>
                {distribution.map((d) => (
                  <div key={d.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                    {/* ↑ Legend label — black */}
                    <span style={{ fontSize: "14px", fontWeight: 600, color: "#000000", flex: 1 }}>{d.label}</span>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "#000000" }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity feed */}
          <div style={{ ...S.card, padding: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
              <ActivityIcon size={14} color="#4f7c5f" />
              {/* ↑ Section title — black, larger */}
              <span style={{ ...SECTION_TITLE }}>Recent Activity</span>
            </div>

            {recentActivity.length === 0 ? (
              <p style={{ fontSize: "14px", color: "#000000" }}>No activity yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {recentActivity.map((event, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: event.color, flexShrink: 0, marginTop: "5px" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* ↑ Activity text — black */}
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#000000", margin: 0, lineHeight: 1.4 }}>{event.text}</p>
                      <p style={{ fontSize: "12px", color: "#000000", margin: "2px 0 0" }}>{relativeTime(event.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ══ ROW 3: Partner / candidate folders / files ══ */}
        <div ref={detailGridRef}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
            <div>
              {openFolder ? (
                <>
                  <button
                    onClick={() => setOpenFolderId(null)}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "10px", border: "none", background: "transparent", color: "#4f7c5f", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
                  >
                    <ChevronLeft size={16} /> {openOrg?.name || (openOrgId === "unassigned" ? "Unassigned" : "Partner folders")}
                  </button>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#000", margin: 0 }}>{openFolder.name}</h2>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
                    {openFolder.email || "No email"} · {openFolder.docs.length} document{openFolder.docs.length === 1 ? "" : "s"}
                  </p>
                </>
              ) : openOrgId ? (
                <>
                  <button
                    onClick={() => { setOpenOrgId(null); setOpenFolderId(null); }}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "10px", border: "none", background: "transparent", color: "#4f7c5f", fontWeight: 700, cursor: "pointer", fontSize: "14px" }}
                  >
                    <ChevronLeft size={16} /> All partner folders
                  </button>
                  <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#000", margin: 0 }}>
                    {openOrg?.name || "Unassigned"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
                    {openOrg
                      ? `${ORG_TYPES.find((t) => t.id === openOrg.org_type)?.label || openOrg.org_type}${openOrg.location ? ` · ${openOrg.location}` : ""}`
                      : "Candidates and files not yet assigned to a university, industry, or institute."}
                  </p>
                </>
              ) : (
                <>
                  <h2 style={{ fontSize: "18px", fontWeight: 800, color: "#000", margin: 0 }}>Partner folders</h2>
                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
                    Create university, industry, or institute folders, then move candidate files into them. Change category, delete, or reassign any file.
                  </p>
                </>
              )}
            </div>
            {!openFolder && (
              <button
                type="button"
                onClick={() => setShowPartnerForm((v) => !v)}
                style={{ display: "inline-flex", alignItems: "center", gap: "6px", border: "none", background: "#4f7c5f", color: "#fff", borderRadius: "9px", padding: "9px 14px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
              >
                <Plus size={15} /> New partner folder
              </button>
            )}
          </div>

          {openFolder && openFolder.id !== "unassigned" && (
            <div style={{ ...S.card, padding: "12px 14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Move this candidate to</span>
              <select
                value={candidates.find((c) => c.id === openFolder.id)?.partner_org_id || ""}
                onChange={(e) => handleAssignCandidateFolder(openFolder.id, e.target.value)}
                style={{ ...selectStyle, width: "min(320px, 100%)" }}
              >
                <option value="">Unassigned</option>
                {partners.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({ORG_TYPES.find((t) => t.id === org.org_type)?.label || org.org_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          {showPartnerForm && !openFolder && (
            <form onSubmit={handleCreatePartner} style={{ ...S.card, padding: "16px", marginBottom: "14px" }}>
              <p style={{ fontSize: "14px", fontWeight: 800, color: "#000", margin: "0 0 12px" }}>Create university, industry, or institute</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
                <input
                  required
                  placeholder="Name (e.g. Saveetha University)"
                  value={partnerForm.name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, name: e.target.value }))}
                  style={selectStyle}
                />
                <select
                  value={partnerForm.org_type}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, org_type: e.target.value as PartnerOrgType }))}
                  style={selectStyle}
                >
                  {ORG_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Location"
                  value={partnerForm.location}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, location: e.target.value }))}
                  style={selectStyle}
                />
                <input
                  placeholder="Contact name"
                  value={partnerForm.contact_name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, contact_name: e.target.value }))}
                  style={selectStyle}
                />
                <input
                  placeholder="Contact email"
                  value={partnerForm.contact_email}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, contact_email: e.target.value }))}
                  style={selectStyle}
                />
                <input
                  placeholder="Contact phone"
                  value={partnerForm.contact_phone}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, contact_phone: e.target.value }))}
                  style={selectStyle}
                />
              </div>
              <textarea
                placeholder="Notes"
                value={partnerForm.notes}
                onChange={(e) => setPartnerForm((f) => ({ ...f, notes: e.target.value }))}
                style={{ ...selectStyle, marginTop: "10px", minHeight: "64px", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                <button type="submit" disabled={savingPartner} style={{ border: "none", background: "#4f7c5f", color: "#fff", borderRadius: "8px", padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
                  {savingPartner ? "Saving…" : "Create folder"}
                </button>
                <button type="button" onClick={() => setShowPartnerForm(false)} style={{ border: "1px solid #e8e5df", background: "#fff", borderRadius: "8px", padding: "8px 14px", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          )}


          {openFolder ? (
            (openFolder.docs || []).length === 0 ? (
            <div style={{ ...S.card, padding: "48px", textAlign: "center" }}>
              <FileText size={32} color="#e5e7eb" style={{ margin: "0 auto 12px" }} />
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#000000", margin: 0 }}>No files in this candidate folder yet.</p>
            </div>
            ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
              {(openFolder?.docs || []).map((doc, i) => {
                const tc = getTypeColor(doc.document_type);
                const state = docState(doc);
                const stateStyle = state === "APPROVED"
                  ? { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" }
                  : state === "REJECTED"
                  ? { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" }
                  : { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };

                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(i * 0.03, 0.25) }}
                    whileHover={{ y: -2 }}
                    style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e5df", overflow: "hidden", display: "flex", flexDirection: "column" }}
                  >
                    <div style={{ height: "3px", background: tc.dot }} />

                    <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FileText size={14} color={tc.dot} />
                          </div>
                          <div>
                            {/* ↑ Doc type tag — black, larger */}
                            <p style={{ fontSize: "16px", fontWeight: 900, color: "#000000", margin: 0 }}>{docTypeLabel(doc.document_type)}</p>
                            <p style={{ fontSize: "13px", color: "#000000", margin: "2px 0 0" }}>{doc.internship_role || doc.document_type}</p>
                          </div>
                        </div>
                        <span style={{ background: stateStyle.bg, color: stateStyle.text, border: `1px solid ${stateStyle.border}`, borderRadius: "999px", padding: "2px 9px", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                          {state}
                        </span>
                      </div>

                      {/* Meta grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {[
                          { label: "Candidate", value: doc.candidates?.full_name || "—" },
                          {
                            label: doc.document_type === "NDA" ? "Signature" : "Approval",
                            value: doc.document_type === "NDA"
                              ? (doc.is_signed ? "Signed" : "Unsigned")
                              : (doc.approval_status || "Pending"),
                          },
                          {
                            label: "Created",
                            value: doc.created_at
                              ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                              : "—",
                          },
                          {
                            label: doc.document_type === "NDA" ? "Signed" : "Approved",
                            value: doc.document_type === "NDA"
                              ? (doc.signed_at  ? new Date(doc.signed_at).toLocaleDateString()  : "—")
                              : (doc.approved_at ? new Date(doc.approved_at).toLocaleDateString() : "—"),
                          },
                        ].map(({ label, value }) => (
                          <div key={label}>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#000000", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6 }}>{label}</p>
                            {/* ↑ Meta value — black, larger */}
                            <p style={{ ...META_VALUE, margin: "3px 0 0" }}>{value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Status tag */}
                      <div style={{ background: "#f9f8f6", borderRadius: "7px", padding: "7px 10px", fontSize: "13px", fontWeight: 700, color: "#000000" }}>
                        {doc.status || "GENERATED"}
                      </div>

                      <div style={{ display: "grid", gap: "8px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Category
                          <select
                            value={doc.document_type || "OTHER"}
                            onChange={(e) => handleChangeCategory(doc.id, e.target.value)}
                            style={{ ...selectStyle, marginTop: "4px" }}
                          >
                            {DOC_CATEGORIES.map(([id, label]) => (
                              <option key={id} value={id}>{label}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Reassign to candidate
                          <select
                            value={doc.candidate_id || ""}
                            onChange={(e) => handleReassignCandidate(doc, e.target.value)}
                            style={{ ...selectStyle, marginTop: "4px" }}
                          >
                            <option value="">Unassigned files</option>
                            {candidates.map((c) => (
                              <option key={c.id} value={c.id}>{c.full_name || c.email || c.id}</option>
                            ))}
                          </select>
                        </label>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          Move to partner folder
                          <select
                            value={docOrgId(doc) || ""}
                            onChange={(e) => handleMoveDocToOrg(doc, e.target.value)}
                            style={{ ...selectStyle, marginTop: "4px" }}
                          >
                            <option value="">Unassigned</option>
                            {partners.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name} ({ORG_TYPES.find((t) => t.id === org.org_type)?.label || org.org_type})
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc)}
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px", border: "1px solid #fecaca", background: "#fff1f2", color: "#991b1b", borderRadius: "8px", padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontSize: "13px" }}
                        >
                          <Trash2 size={13} /> Delete document
                        </button>
                      </div>

                      {/* NDA sign button */}
                      {doc.document_type === "NDA" && !doc.is_signed && (
                        <button
                          onClick={async () => {
                            if (!confirm("Have you received the signed NDA from the candidate?")) return;
                            try {
                              await documentService.markNDASigned(doc.id);
                              await loadDocuments();
                            } catch (error) {
  console.error(error);

  notify.error(
    "Update Failed",
    "Failed to update NDA status."
  );
}
                          }}
                          style={{ borderRadius: "8px", border: "none", background: "#10b981", padding: "8px 14px", fontSize: "14px", fontWeight: 700, color: "#fff", cursor: "pointer", transition: "opacity 0.15s" }}
                        >
                          Mark Signed
                        </button>
                      )}
                    </div>

                    {/* Action row */}
                    <div
  style={{
    display: "flex",
    borderTop: "1px solid #f3f0ea",
  }}
>
               <button
  onClick={() => {
    if (doc.document_url) window.open(doc.document_url, "_blank");
  }}
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#000000",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRight: "1px solid #f3f0ea",
  }}
>
  <Eye size={13} /> Preview
</button>

<a
  href={doc.document_url}
  target="_blank"
  rel="noreferrer"
  download
  style={{
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#4f7c5f",
    background: "transparent",
    textDecoration: "none",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
>
  <Download size={13} /> Download
</a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )
          ) : openOrgId ? (
            candidateFolders.length === 0 ? (
              <div style={{ ...S.card, padding: "48px", textAlign: "center" }}>
                <Folder size={32} color="#e5e7eb" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#000000", margin: 0 }}>No candidate folders here yet.</p>
                <p style={{ fontSize: "13px", color: "#6b7280", margin: "8px 0 0" }}>Reassign a document or move a candidate into this partner folder.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
                {candidateFolders.map((folder) => {
                  const counts = {
                    resume: folder.docs.filter((d) => d.document_type === "RESUME").length,
                    id: folder.docs.filter((d) => d.document_type === "ID_PROOF").length,
                    address: folder.docs.filter((d) => d.document_type === "ADDRESS_PROOF").length,
                    photo: folder.docs.filter((d) => d.document_type === "PHOTO").length,
                    loa: folder.docs.filter((d) => d.document_type === "LOA").length,
                    nda: folder.docs.filter((d) => d.document_type === "NDA").length,
                  };
                  return (
                    <button
                      key={folder.id}
                      type="button"
                      onClick={() => setOpenFolderId(folder.id)}
                      style={{
                        textAlign: "left", background: "#fff", borderRadius: "12px", border: "1px solid #e8e5df",
                        padding: "16px", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#eef7f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Folder size={18} color="#4f7c5f" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "15px", fontWeight: 800, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.name}</p>
                          <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{folder.email || `${folder.docs.length} files`}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: "12px", color: "#44506b", margin: 0, lineHeight: 1.6 }}>
                        {counts.resume ? `${counts.resume} resume · ` : ""}
                        {counts.id ? `${counts.id} ID · ` : ""}
                        {counts.address ? `${counts.address} address · ` : ""}
                        {counts.photo ? `${counts.photo} photo · ` : ""}
                        {counts.loa ? `${counts.loa} LOA · ` : ""}
                        {counts.nda ? `${counts.nda} NDA` : ""}
                        {!counts.resume && !counts.id && !counts.address && !counts.photo && !counts.loa && !counts.nda
                          ? `${folder.docs.length} documents`
                          : ""}
                      </p>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
              <button
                type="button"
                onClick={() => setOpenOrgId("unassigned")}
                style={{
                  textAlign: "left", background: "#fff", borderRadius: "12px", border: "1px dashed #d1d5db",
                  padding: "16px", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Folder size={18} color="#6b7280" />
                  </div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 800, color: "#000", margin: 0 }}>Unassigned</p>
                    <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>Not yet in a partner folder</p>
                  </div>
                </div>
                <p style={{ fontSize: "12px", color: "#44506b", margin: 0 }}>
                  {unassignedCount.people} candidate{unassignedCount.people === 1 ? "" : "s"} · {unassignedCount.docs} file{unassignedCount.docs === 1 ? "" : "s"}
                </p>
              </button>
              {partnerFolders.map((org) => (
                <div
                  key={org.id}
                  style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e8e5df", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenOrgId(org.id)}
                    style={{ textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: "inherit" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#eef7f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={18} color="#4f7c5f" />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "15px", fontWeight: 800, color: "#000", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{org.name}</p>
                        <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0" }}>
                          {ORG_TYPES.find((t) => t.id === org.org_type)?.label || org.org_type}
                          {org.location ? ` · ${org.location}` : ""}
                        </p>
                      </div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#44506b", margin: 0 }}>
                      {org.candidateCount} candidate{org.candidateCount === 1 ? "" : "s"} · {org.docs.length} file{org.docs.length === 1 ? "" : "s"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePartner(org.id, org.name)}
                    style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: "5px", border: "none", background: "transparent", color: "#991b1b", fontWeight: 700, cursor: "pointer", fontSize: "12px", padding: 0 }}
                  >
                    <Trash2 size={12} /> Delete folder
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}