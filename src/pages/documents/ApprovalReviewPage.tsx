import { useEffect, useState, type JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ShieldCheck,
  Inbox,
  Loader2,
  ListChecks,
  Download,
  RotateCcw,
  Send,
  Lock,
  Upload,
  X,
  Edit3,
  Pen,
  ArrowUpRight,
  Search,
  Bell,
  Settings,
  ZoomIn,
  ZoomOut,
  BookmarkPlus,
} from "lucide-react";
import { useNotification } from "../../components/notification/useNotification";
import { approvalService } from "../../modules/documents/services/approval.service";
import { documentService } from "../../modules/documents/services/document.service";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { isDemoMode } from "../../modules/demo/seed";
import { useAuth } from "../../app/providers/AuthProvider";

// ── helpers ───────────────────────────────────────────────────────────────────

function getStatusColor(status: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "approved") return "emerald";
  if (s === "rejected") return "rose";
  return "amber";
}

const STATUS_MAP: Record<
  string,
  { dot: string; chip: string; icon: JSX.Element; label: string }
> = {
  emerald: {
    dot: "bg-emerald-500",
    chip: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    icon: <CheckCircle size={11} strokeWidth={2.5} />,
    label: "Approved",
  },
  rose: {
    dot: "bg-rose-500",
    chip: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
    icon: <XCircle size={11} strokeWidth={2.5} />,
    label: "Rejected",
  },
  amber: {
    dot: "bg-amber-500",
    chip: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    icon: <Clock size={11} strokeWidth={2.5} />,
    label: "Awaiting approval",
  },
};

function StatusChip({ status }: { status: string }) {
  const { chip, icon, label } = STATUS_MAP[getStatusColor(status)];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[14px] font-semibold tracking-wide ${chip}`}
    >
      {icon}
      {label}
    </span>
  );
}

function SummaryRow({
  label,
  value,
  accent,
  children,
}: {
  label: string;
  value?: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  if (!value && !children) return null;
  return (
    <div className="grid grid-cols-[100px_1fr] items-start gap-2 border-b border-slate-50 py-2.5 last:border-0">
      <span className="pt-0.5 text-[13px] font-semibold uppercase tracking-wider text-black">
        {label}
      </span>
      {children ? (
        children
      ) : (
        <span
          className={`text-right text-sm font-semibold leading-relaxed ${
            accent ? "text-emerald-700" : "text-black"
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function ApprovalsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [remarks, setRemarks] = useState("");
  const [sigTab, setSigTab] = useState<"upload" | "draw">("upload");
  const [zoom, setZoom] = useState(125);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
const notification = useNotification();  const pendingCount = documents.filter(
    (d) => getStatusColor(d.approval_status ?? "pending") === "amber"
  ).length;
  const approvedCount = documents.filter(
    (d) => getStatusColor(d.approval_status ?? "pending") === "emerald"
  ).length;
  const rejectedCount = documents.filter(
    (d) => getStatusColor(d.approval_status ?? "pending") === "rose"
  ).length;
const selected =
  documents.find((d) => d.id === selectedId) ?? null;
  const filteredDocuments = documents.filter((d) => {
    if (!query.trim()) return true;
    const haystack = `${d.document_type ?? ""} ${d.candidate_name ?? ""} ${d.id ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  function handleSignatureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSignatureFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setSignaturePreview(url);
    } else {
      setSignaturePreview(null);
    }
  }

  function handleRemoveSignature() {
    setSignatureFile(null);
    setSignaturePreview(null);
  }

  async function handleApprove(documentId: string) {
    try {
      if (!signatureFile) {
       notification.warning(
  "Signature Required",
  "Please upload your signature first."
);
        return;
      }
      setProcessingId(documentId);

      const document = await approvalService.getDocumentById(documentId);
      if (!document) {
        notification.error("Approval Failed", "Document not found.");
        return;
      }

      if (isDemoMode()) {
        const signatureUrl = URL.createObjectURL(signatureFile);
        await approvalService.approveDocument(documentId, signatureUrl);
        await approvalService.updateDocumentUrl(
          documentId,
          document.document_url || "/generated/rajesh-kumar-loa.html"
        );
        notification.success("Document Approved", "Document approved and signed successfully.");
        const data = await approvalService.getPendingLOAs();
        setDocuments(data);
        setSelectedId(data[0]?.id ?? null);
        return;
      }

      const signatureUrl = await approvalService.uploadSignature(signatureFile);
      const candidate = await candidateService.getCandidateById(document.candidate_id);
      if (!candidate) {
        notification.error("Approval Failed", "Candidate not found.");
        return;
      }
      const requirement = {
        title: document.internship_role,
        department: document.department,
      };
      const signedPdfUrl = await documentService.generateLOAPdf(
        candidate,
        requirement,
        {
          internship_drive: document.internship_drive,
          internship_role: document.internship_role,
          internship_type: document.internship_type,
          department: document.department,
          start_date: document.start_date,
          end_date: document.end_date,
          work_mode: document.work_mode,
          working_hours: document.working_hours,
          project_title: document.project_title,
          officer_name: document.officer_name,
          officer_designation: document.officer_designation,
          officer_email: document.officer_email,
          officer_phone: document.officer_phone,
          signature_url: signatureUrl,
        }
      );
      await approvalService.approveDocument(documentId, signatureUrl);
      await approvalService.updateDocumentUrl(documentId, signedPdfUrl);
     notification.success(
  "Document Approved",
  "Document approved and signed successfully."
);
const data = await approvalService.getPendingLOAs();

setDocuments(data);

const latest = data.find(
  (d: any) => d.id === documentId
);

if (latest) {
  setSelectedId(latest.id);
}
    } catch (error) {
      console.error(error);
     notification.error(
  "Approval Failed",
  "Unable to approve the document."
);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(documentId: string) {
    try {
      setProcessingId(documentId);
      await approvalService.rejectDocument(documentId);
      notification.success(
  "Document Rejected",
  "The document has been rejected."
);
     const data = await approvalService.getPendingLOAs();
setDocuments(data);
    } catch (error) {
      console.error(error);
      notification.error(
  "Rejection Failed",
  "Unable to reject the document."
);
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    async function loadDocuments() {
      try {
       const data = await approvalService.getPendingLOAs();
setDocuments(data);
        if (data.length > 0) setSelectedId(data[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadDocuments();
  }, []);

  // ── loading ──
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] font-sans">
        <div className="flex flex-col items-center gap-3">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}>
            <Loader2 size={20} className="text-emerald-700" />
          </motion.div>
          <p className="text-sm font-medium text-black">Loading approval queue…</p>
        </div>
      </div>
    );
  }

  // ── empty state ──
  if (documents.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4] font-sans">
        <div className="flex items-center gap-2.5 border-b border-[#e8e5df] bg-white px-8 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="text-base font-bold text-black">Document Approvals</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8e5df] bg-white"
          >
            <Inbox size={24} className="text-black" />
          </motion.div>
          <div className="text-center">
            <p className="text-base font-bold text-black">Queue is clear</p>
            <p className="mt-1 text-sm text-black">All documents reviewed. Nothing pending.</p>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = processingId === selected?.id;
  const initials = (user?.full_name || user?.name || "Admin User")
    .split(" ")
    .map((s: string) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // ── main view ──
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8f7f4] font-sans">
      {/* ══ TOP HEADER ══ */}
      <header className="flex h-14 flex-shrink-0 items-center gap-4 border-b border-[#e8e5df] bg-white px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-800">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="text-[18px] font-bold text-black">Document Approvals</span>
        </div>

        <div className="mx-2 flex max-w-md flex-1 items-center gap-2 rounded-lg border border-[#e8e5df] bg-[#f9f8f6] px-3 py-1.5">
          <Search size={13} className="flex-shrink-0 text-black" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, IDs, or candidates…"
            className="w-full bg-transparent text-sm text-black placeholder:text-black outline-none"
          />
        </div>

        <div className="ml-auto flex items-center gap-4">
          <button className="relative text-black hover:text-black">
            <Bell size={16} />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
          <button className="text-black hover:text-black">
            <Settings size={16} />
          </button>
          <div className="flex items-center gap-2 border-l border-[#e8e5df] pl-4">
            <div className="text-right leading-tight">
              <p className="text-[14px] font-bold text-black">{user?.full_name || user?.name || "Admin User"}</p>
              <p className="text-[13px] text-black">{user?.role || "Operations Lead"}</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-800 text-[14px] font-bold text-white">
              {initials || "AU"}
            </div>
          </div>
        </div>
      </header>

      {/* ══ BODY: 3-column layout ══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── COL 1: Queue ── */}
        <aside className="flex w-64 flex-shrink-0 flex-col overflow-hidden border-r border-[#e8e5df] bg-white">
          <div className="flex items-center gap-2 border-b border-[#f3f0ea] px-4 py-3.5">
            <ListChecks size={13} className="text-black" />
            <span className="text-[13px] font-bold uppercase tracking-wider text-black">Queue</span>
            <span className="ml-auto rounded-full bg-[#f3f0ea] px-2 py-0.5 text-[13px] font-bold text-black">
              {filteredDocuments.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredDocuments.map((doc) => {
              const isActive = doc.id === selectedId;
              const { dot } = STATUS_MAP[getStatusColor(doc.approval_status ?? "pending")];
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className={`flex w-full items-start gap-3 border-b border-[#f9f8f6] px-4 py-3 text-left transition-colors ${
                    isActive ? "border-l-[3px] border-l-emerald-700 bg-[#f3f0ea] pl-[13px]" : "border-l-[3px] border-l-transparent"
                  } hover:bg-[#f9f8f6]`}
                >
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#e8e5df] ${
                      isActive ? "bg-white text-emerald-700" : "bg-[#f9f8f6] text-black"
                    }`}
                  >
                    <FileText size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-bold ${isActive ? "text-black" : "text-black"}`}
                      >
                        {doc.document_type ?? "Document"}
                      </span>
                      <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
                    </div>
                    <p className="mt-0.5 truncate text-[14px] text-black">{doc.candidate_name ?? "—"}</p>
                    <p className="mt-0.5 text-[13px] text-black">
                      {doc.created_at
                        ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#f3f0ea] p-3">
            <div className="flex gap-2 text-center">
              <div className="flex-1 rounded-lg bg-amber-50 py-1.5">
                <p className="text-base font-extrabold text-amber-800">{pendingCount}</p>
                <p className="text-[12px] font-semibold text-amber-700">Pending</p>
              </div>
              <div className="flex-1 rounded-lg bg-emerald-50 py-1.5">
                <p className="text-base font-extrabold text-emerald-800">{approvedCount}</p>
                <p className="text-[12px] font-semibold text-emerald-700">Approved</p>
              </div>
              <div className="flex-1 rounded-lg bg-rose-50 py-1.5">
                <p className="text-base font-extrabold text-rose-800">{rejectedCount}</p>
                <p className="text-[12px] font-semibold text-rose-700">Rejected</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── COL 2: Document viewer ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-[#e8e5df] bg-white px-6 py-2.5"
            >
              <FileText size={14} className="text-black" />
              <span className="text-[16px] font-bold text-black">
                {selected.document_type ? `${selected.document_type}.pdf` : "Document.pdf"}
              </span>
              <StatusChip status={selected.approval_status ?? "pending"} />

              <div className="ml-auto flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-lg border border-[#e8e5df] px-1.5 py-1">
                  <button
                    onClick={() => setZoom((z) => Math.max(50, z - 25))}
                    className="rounded p-1 text-black hover:bg-[#f3f0ea] hover:text-black"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <span className="w-10 text-center text-[14px] font-semibold text-black">{zoom}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(200, z + 25))}
                    className="rounded p-1 text-black hover:bg-[#f3f0ea] hover:text-black"
                  >
                    <ZoomIn size={12} />
                  </button>
                </div>

                {selected?.document_url && (
                  <a
                    href={selected.document_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e5df] bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-[#f9f8f6]"
                  >
                    <ArrowUpRight size={11} />
                    Open
                  </a>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e5df] bg-white px-3 py-1.5 text-[14px] font-semibold text-black hover:bg-[#f9f8f6]"
                >
                  <Download size={11} />
                  Download
                </motion.button>
              </div>
            </motion.div>
          )}

          <div className="flex-1 overflow-y-auto bg-[#eeece6] p-6">
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div
  key={`${selected.id}-${selected.document_url}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="mx-auto h-full max-w-3xl"
                  style={{ transform: `scale(${zoom / 125})`, transformOrigin: "top center" }}
                >
                  {selected.document_url ? (
                    <iframe
                      src={selected.document_url}
                      title="Document Preview"
                      className="h-full min-h-[640px] w-full rounded-xl border border-[#e8e5df] bg-white shadow-sm"
                    />
                  ) : (
                    <div className="flex h-full min-h-[500px] items-center justify-center rounded-xl border-2 border-dashed border-[#e8e5df] bg-white">
                      <div className="text-center">
                        <FileText size={32} className="mx-auto text-slate-200" />
                        <p className="mt-3 text-sm font-semibold text-black">No PDF available</p>
                        <p className="mt-1 text-[14px] text-black">Document URL not provided</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Action bar ── */}
          <div className="flex flex-shrink-0 items-center justify-between border-t border-[#e8e5df] bg-white px-6 py-3.5">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => selected && handleReject(selected.id)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e5df] bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity disabled:opacity-50"
            >
              {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
              Request changes
            </motion.button>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e5df] bg-white px-4 py-2 text-sm font-semibold text-black">
                <BookmarkPlus size={13} />
                Save for later
              </button>
              <div className="hidden items-center gap-1.5 text-[13px] text-black sm:flex">
                <Lock size={9} />
                Secure &amp; legally binding
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selected && handleApprove(selected.id)}
                disabled={isProcessing || !signatureFile}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-white transition-colors ${
                  isProcessing || !signatureFile ? "cursor-not-allowed bg-slate-300" : "cursor-pointer bg-emerald-800 hover:bg-emerald-900"
                }`}
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                Approve &amp; forward to HR
              </motion.button>
            </div>
          </div>
        </main>

        {/* ── COL 3: Summary / signature / remarks ── */}
        <aside className="flex w-80 flex-shrink-0 flex-col overflow-y-auto border-l border-[#e8e5df] bg-white">
          {/* Approval summary */}
          <section className="border-b border-[#f3f0ea] px-5 py-5">
            <div className="mb-3.5 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f3f0ea]">
                <ListChecks size={12} className="text-black" />
              </div>
              <span className="text-[13px] font-extrabold uppercase tracking-wider text-black">
                Approval summary
              </span>
            </div>

            <div>
              <SummaryRow label="Document" value={selected?.document_type} />
              <SummaryRow label="Role" value={selected?.internship_role} />
              <SummaryRow label="Department" value={selected?.department} />
              <SummaryRow label="Requested by" value="HR Team" />
              <SummaryRow label="Candidate" value={selected?.candidate_name} accent />
              <SummaryRow
                label="Submitted"
                value={
                  selected?.created_at
                    ? new Date(selected.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : undefined
                }
              />
              <SummaryRow
                label="Due date"
                value={
                  selected?.end_date
                    ? new Date(selected.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : undefined
                }
              />
              <SummaryRow label="Priority">
                <span className="inline-flex w-fit items-center justify-self-end gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[14px] font-semibold text-amber-700">
                  <Clock size={9} strokeWidth={2.5} />
                  Medium
                </span>
              </SummaryRow>
            </div>

            {selected?.description && (
              <div className="mt-3 rounded-lg bg-[#f9f8f6] p-3">
                <p className="mb-1.5 text-[13px] font-bold uppercase tracking-wider text-black">Description</p>
                <p className="text-sm leading-relaxed text-black">{selected.description}</p>
              </div>
            )}
          </section>

          {/* Signature */}
          <section className="border-b border-[#f3f0ea] px-5 py-4">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f3f0ea]">
                <Edit3 size={12} className="text-black" />
              </div>
              <span className="text-[13px] font-extrabold uppercase tracking-wider text-black">
                Your signature
              </span>
            </div>
            <p className="mb-3.5 mt-0.5 text-[14px] text-black">Required to approve this document</p>

            <div className="mb-3.5 flex rounded-lg border border-[#e8e5df] bg-[#f9f8f6] p-0.5">
              {(["upload", "draw"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSigTab(tab)}
                  className={`flex-1 rounded-md py-1.5 text-[14px] font-bold transition-all ${
                    sigTab === tab ? "bg-white text-black shadow-sm" : "text-black"
                  }`}
                >
                  {tab === "upload" ? "Upload" : "Draw"}
                </button>
              ))}
            </div>

            {sigTab === "upload" && (
              <div className="flex flex-col gap-2.5">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#c4b89a] bg-[#fdf9f4] px-4 py-5 text-center transition-colors hover:bg-[#fbf4e9]">
                  <input type="file" accept="image/*" hidden onChange={handleSignatureChange} />
                  <Upload size={16} className="text-black" />
                  <div>
                    <p className="text-[14px] font-bold text-black">Click to upload signature</p>
                    <p className="mt-0.5 text-[13px] text-black">PNG, JPG or JPEG · Max 2 MB</p>
                  </div>
                </label>

                <AnimatePresence>
                  {signaturePreview && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative rounded-lg border border-[#e8e5df] bg-white p-3"
                    >
                      <button
                        onClick={handleRemoveSignature}
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-black hover:bg-slate-200"
                      >
                        <X size={9} />
                      </button>
                      <img src={signaturePreview} alt="Signature preview" className="h-14 w-full object-contain" />
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-emerald-600">
                          <CheckCircle size={11} strokeWidth={2.5} />
                          Signature ready
                        </span>
                        <button onClick={handleRemoveSignature} className="text-[14px] font-semibold text-rose-500">
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!signatureFile && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                    <AlertCircle size={11} className="mt-0.5 flex-shrink-0 text-amber-600" />
                    <p className="text-[14px] font-medium leading-relaxed text-amber-800">
                      A signature is required to approve this document.
                    </p>
                  </div>
                )}
              </div>
            )}

            {sigTab === "draw" && (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#e8e5df] bg-[#f9f8f6] px-4 py-7 text-center">
                <Pen size={16} className="text-black" />
                <p className="text-[14px] font-bold text-black">Drawing pad coming soon</p>
                <p className="text-[13px] text-black">Use the Upload tab for now</p>
              </div>
            )}
          </section>

          {/* Remarks */}
          <section className="px-5 py-5">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[13px] font-extrabold uppercase tracking-wider text-black">Remarks</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[12px] font-bold uppercase tracking-wider text-black">
                Optional
              </span>
            </div>
            <p className="mb-2.5 mt-0.5 text-[14px] text-black">Notes for this approval</p>
            <textarea
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={500}
              placeholder="Enter remarks…"
              className="w-full resize-none rounded-lg border border-[#e8e5df] bg-[#f9f8f6] px-3.5 py-3 text-sm font-medium text-black outline-none transition-colors focus:border-emerald-700 focus:bg-white"
            />
            <p className="mt-1.5 text-right text-[13px] text-black">{remarks.length} / 500</p>
          </section>
        </aside>
      </div>
    </div>
  );
}