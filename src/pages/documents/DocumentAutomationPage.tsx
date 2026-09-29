import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileCheck2,
  FileSignature,
  Award,
  ScrollText,
  BadgeCheck,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { documentService } from "../../modules/documents/services/document.service";
import { ndaService } from "../../modules/documents/services/nda.service";
import { loaSettingsService } from "../../modules/documents/services/loa-settings.service";
import { useNotification } from "../../components/notification/useNotification";
import { pickAssignmentFields } from "../../lib/offline-store";

type DocStatus = "idle" | "running" | "done" | "error";

type DocKey = "loa" | "nda" | "certificate" | "lor" | "loc";

type ResultMap = Record<DocKey, { status: DocStatus; url?: string; error?: string }>;

const DEMO_CANDIDATE = {
  id: "demo-candidate",
  full_name: "John Anderson",
  email: "john.anderson@example.com",
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addDaysToDate(isoDate: string, days: number) {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return todayPlus(days);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function buildLoaData(candidate: any) {
  const assignment = pickAssignmentFields(candidate);
  const startDate = assignment.joining_date || todayPlus(7);

  return {
    internship_drive: "Recrulyn Internship Drive 2026",
    internship_role:
      assignment.job_title || candidate.job_title || "Software Engineering Intern",
    internship_type: "Full-time Internship",
    department: assignment.department || "Engineering Product Development",
    start_date: startDate,
    end_date: addDaysToDate(startDate, 90),
    work_mode: "Hybrid",
    working_hours: "9:00 AM – 6:00 PM",
    project_title:
      assignment.project_title || "AI Recruitment Intelligence Platform",
    officer_name: assignment.supervisor || "Rajesh Kumar B",
    officer_designation: "CTO",
    officer_email: "hr@recrulyn.com",
    officer_phone: "+91 00000 00000",
    signature_url: "",
  };
}

function formatLongDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildLorData(candidate: any, loaData: ReturnType<typeof buildLoaData>) {
  return {
    candidate_name: candidate.full_name,
    role_name: loaData.internship_role,
    project_name: loaData.project_title,
    issue_date: formatLongDate(new Date().toISOString()),
    officer_name: loaData.officer_name,
    officer_designation: loaData.officer_designation,
    signature_url: "",
  };
}

function buildLocData(candidate: any, loaData: ReturnType<typeof buildLoaData>) {
  const assignment = pickAssignmentFields(candidate);
  return {
    candidate_name: candidate.full_name,
    role_name: loaData.internship_role,
    department: loaData.department,
    joining_date: formatLongDate(loaData.start_date),
    reporting_manager: assignment.supervisor || loaData.officer_name,
    officer_name: loaData.officer_name,
    officer_designation: loaData.officer_designation,
    signature_url: "",
  };
}

export default function DocumentAutomationPage() {
  const notify = useNotification();
  const [searchParams] = useSearchParams();
  const requestedCandidateId = searchParams.get("candidateId") || "";
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [running, setRunning] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<DocKey[]>([
    "loa",
    "nda",
    "certificate",
  ]);
  const [results, setResults] = useState<ResultMap>({
    loa: { status: "idle" },
    nda: { status: "idle" },
    certificate: { status: "idle" },
    lor: { status: "idle" },
    loc: { status: "idle" },
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await candidateService.getCandidates();
        setCandidates(data || []);
        const preferred = requestedCandidateId && data?.some((c) => c.id === requestedCandidateId)
          ? requestedCandidateId
          : data?.[0]?.id || "";
        if (preferred) setSelectedId(preferred);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  const selected =
    candidates.find((c) => c.id === selectedId) ||
    (selectedId === DEMO_CANDIDATE.id ? DEMO_CANDIDATE : null);

  async function generateOne(key: DocKey) {
    const candidate = selected || DEMO_CANDIDATE;
    const loaData = buildLoaData(candidate);

    setResults((r) => ({ ...r, [key]: { status: "running" } }));

    try {
      if (key === "loa") {
        const requirement = {
          title: loaData.internship_role,
          department: loaData.department,
        };
        const loaUrl = await documentService.generateLOAPdf(
          candidate,
          requirement,
          loaData,
        );
        await documentService.createLOA({
          candidate_id: candidate.id,
          requirement_id: null,
          document_url: loaUrl,
          ...loaData,
          approval_officer: loaData.officer_name,
        });
        setResults((r) => ({ ...r, loa: { status: "done", url: loaUrl } }));
        notify.success("LOA generated", `Letter of Acceptance for ${candidate.full_name}`);
      }

      if (key === "nda") {
        const ndaForm = {
          guardian_name: "Parent / Guardian",
          area: "Tech Park",
          district: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001",
        };
        const ndaUrl = await ndaService.generateNDAPdf(
          candidate,
          { title: loaData.internship_role },
          ndaForm,
        );
        await ndaService.createNDA({
          candidate_id: candidate.id,
          requirement_id: null,
          document_url: ndaUrl,
          guardian_name: ndaForm.guardian_name,
          area: ndaForm.area,
          district: ndaForm.district,
          state: ndaForm.state,
          pincode: ndaForm.pincode,
          internship_role: loaData.internship_role,
        });
        setResults((r) => ({ ...r, nda: { status: "done", url: ndaUrl } }));
        notify.success("NDA generated", `Non-Disclosure Agreement for ${candidate.full_name}`);
      }

      if (key === "certificate") {
        const certUrl = await documentService.generateCertificatePdf({
          candidate_name: candidate.full_name,
          role_name: loaData.internship_role,
          project_name: loaData.project_title,
          start_date: loaData.start_date,
          end_date: loaData.end_date,
          issue_date: new Date().toLocaleDateString(),
          officer_name: loaData.officer_name,
          officer_designation: loaData.officer_designation,
        });
        await documentService.createCertificate({
          candidate_id: candidate.id,
          document_url: certUrl,
          role_name: loaData.internship_role,
          project_name: loaData.project_title,
          start_date: loaData.start_date,
          end_date: loaData.end_date,
          officer_name: loaData.officer_name,
          officer_designation: loaData.officer_designation,
        });
        setResults((r) => ({
          ...r,
          certificate: { status: "done", url: certUrl },
        }));
        notify.success(
          "Certificate generated",
          `Completion Certificate for ${candidate.full_name}`,
        );
      }

      if (key === "lor") {
        const settings = await loaSettingsService.getSettings();
        const lorData = buildLorData(candidate, loaData);
        const lorUrl = await documentService.generateLORPdf({
          ...lorData,
          logo_url: settings.logo_url || "/Logo-Monogram.png",
        });
        await documentService.createLOR({
          candidate_id: candidate.id,
          document_url: lorUrl,
          role_name: lorData.role_name,
          project_name: lorData.project_name,
          officer_name: lorData.officer_name,
          officer_designation: lorData.officer_designation,
        });
        setResults((r) => ({ ...r, lor: { status: "done", url: lorUrl } }));
        notify.success(
          "LOR generated",
          `Letter of Recommendation for ${candidate.full_name}`,
        );
      }

      if (key === "loc") {
        const locData = buildLocData(candidate, loaData);
        const locUrl = await documentService.generateLOCPdf(locData);
        await documentService.createLOC({
          candidate_id: candidate.id,
          document_url: locUrl,
          role_name: locData.role_name,
          department: locData.department,
          joining_date: loaData.start_date,
          reporting_manager: locData.reporting_manager,
          officer_name: locData.officer_name,
          officer_designation: locData.officer_designation,
        });
        setResults((r) => ({ ...r, loc: { status: "done", url: locUrl } }));
        notify.success(
          "LOC generated",
          `Letter of Confirmation for ${candidate.full_name}`,
        );
      }
    } catch (e: any) {
      console.error(e);
      const labels: Record<DocKey, string> = {
        loa: "LOA",
        nda: "NDA",
        certificate: "Certificate",
        lor: "LOR",
        loc: "LOC",
      };
      const label = labels[key];
      setResults((r) => ({
        ...r,
        [key]: { status: "error", error: e?.message || `${label} failed` },
      }));
      notify.error(`${label} generation failed`, e?.message || "Please try again.");
    }
  }

  async function generateSelected() {
    setRunning(true);
    for (const key of selectedDocs) {
      await generateOne(key);
    }
    setRunning(false);
  }

  function toggleDoc(key: DocKey) {
    setSelectedDocs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function StatusIcon({ status }: { status: DocStatus }) {
    if (status === "running")
      return <Loader2 className="animate-spin" size={18} color="#2563eb" />;
    if (status === "done")
      return <CheckCircle2 size={18} color="#16a34a" />;
    if (status === "error")
      return <AlertCircle size={18} color="#dc2626" />;
    return <div className="h-[18px] w-[18px] rounded-full border border-[#d1d5db]" />;
  }

  const cards = [
    { key: "loa" as const, title: "Letter of Acceptance", icon: FileCheck2 },
    { key: "nda" as const, title: "Non-Disclosure Agreement", icon: FileSignature },
    { key: "certificate" as const, title: "Completion Certificate", icon: Award },
    { key: "lor" as const, title: "Letter of Recommendation", icon: ScrollText },
    { key: "loc" as const, title: "Letter of Confirmation", icon: BadgeCheck },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">
          Document Automation
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[#111827]">
          Generate LOA, NDA & Certificate
        </h1>
        <p className="mt-2 text-[15px] text-[#6b7280]">
      Choose which document(s) to generate for the selected candidate —
      only the ones you pick will be created.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-[#374151]">
          Candidate
        </label>

        {loadingList ? (
          <p className="text-sm text-[#6b7280]">Loading candidates…</p>
        ) : (
          <select
            value={selectedId || DEMO_CANDIDATE.id}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 text-sm outline-none focus:border-black"
          >
            {!candidates.length && (
              <option value={DEMO_CANDIDATE.id}>
                Demo — John Anderson (no candidates in DB)
              </option>
            )}
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name}
                {c.email ? ` — ${c.email}` : ""}
              </option>
            ))}
          </select>
        )}

        <label className="mt-5 mb-2 block text-sm font-semibold text-[#374151]">
          Documents to generate
        </label>
        <div className="flex flex-col gap-2">
          {cards.map(({ key, title }) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#374151] cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedDocs.includes(key)}
                onChange={() => toggleDoc(key)}
              />
              {title}
            </label>
          ))}
        </div>

        <button
          onClick={generateSelected}
          disabled={running || selectedDocs.length === 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#222] disabled:opacity-60"
        >
          {running ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Generating…
            </>
          ) : selectedDocs.length === 0 ? (
            <>Select a document above</>
          ) : (
            <>
              Generate selected (
              {selectedDocs.length === 1
                ? cards.find((c) => c.key === selectedDocs[0])?.title
                : `${selectedDocs.length} documents`}
              )
            </>
          )}
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ key, title, icon: Icon }) => {
          const item = results[key];
          return (
            <div
              key={key}
              className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <Icon size={20} color="#111827" />
                <StatusIcon status={item.status} />
              </div>
              <h3 className="text-sm font-semibold text-[#111827]">{title}</h3>
              <p className="mt-1 text-xs text-[#6b7280]">
                {item.status === "idle" && "Not generated yet"}
                {item.status === "running" && "Creating PDF…"}
                {item.status === "done" && "Generated successfully"}
                {item.status === "error" && (item.error || "Failed")}
              </p>
              <button
                onClick={() => generateOne(key)}
                disabled={running || item.status === "running"}
                className="mt-3 w-full rounded-lg border border-[#d1d5db] px-3 py-2 text-xs font-semibold text-[#111827] transition hover:bg-[#f9fafb] disabled:opacity-60"
              >
                {item.status === "running"
                  ? "Generating…"
                  : item.status === "done"
                    ? "Regenerate this document"
                    : `Generate ${title}`}
              </button>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-semibold text-[#2563eb] hover:underline"
                >
                  Open PDF
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}