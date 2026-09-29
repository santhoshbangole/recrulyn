import { PageHeader } from "../components/ui/PageHeader";
import { GlassCard } from "../components/ui/GlassCard";
import { useEffect, useState } from "react";
import { candidateService } from "../modules/candidates/services/candidate.service";
import { requirementService } from "../modules/requirements/services/requirement.service";
import { useNotification } from "../components/notification/useNotification";
import { resumeMatchingAIService } from "../modules/resume-intelligence/services/resumeMatchingAI.service";
import { recrulynExtractorService } from "../modules/recrulyn/services/recrulyn-extractor.service";
import { recrulynUploadService } from "../modules/recrulyn/services/recrulyn-upload.service";
import { resumeMatchHistoryService } from "../modules/resume-intelligence/services/resumeMatchHistory.service";
import { useSearchParams } from "react-router-dom";
import { useRef } from "react";
import MatchingResults from "../modules/resume-intelligence/components/MatchingResults";
import html2pdf from "html2pdf.js";
import { DepartmentSelect } from "../components/forms/DepartmentSelect";
import { profileService } from "../modules/recrulyn/services/profile.service";

function resolveJobDescription(jd: any) {
  return String(
    jd?.job_description || jd?.description || jd?.title || ""
  ).trim();
}

function getActiveJobDescription(
  uploadedJDText: string,
  selectedJD: string,
  requirements: any[]
) {
  if (uploadedJDText.trim()) return uploadedJDText.trim();
  if (!selectedJD) return "";
  const jd = requirements.find((r) => r.id === selectedJD);
  return resolveJobDescription(jd);
}

async function resolveResumeText(candidate: any) {
  if (candidate?.resume_url) {
    const extracted = await recrulynExtractorService.extractText(
      candidate.resume_url
    );
    if (extracted.resumeText?.trim()) {
      return extracted.resumeText.trim();
    }
  }

  try {
    const profile = await profileService.getProfile(candidate.id);
    if (profile?.resume_text?.trim()) {
      return profile.resume_text.trim();
    }

    const fallback = [
      profile?.skills,
      profile?.education,
      profile?.experience,
      profile?.projects,
      profile?.certifications,
      candidate?.job_title,
      candidate?.project_title,
      candidate?.department,
    ]
      .filter(Boolean)
      .join("\n")
      .trim();

    if (fallback) return fallback;
  } catch {
    /* profile may be local-only */
  }

  return "";
}
export default function ResumeIntelligencePage() {
  const [requirements, setRequirements] = useState<any[]>([]);

  const [searchParams] = useSearchParams();
  const requirementId = searchParams.get("requirementId");

  const [selectedJD, setSelectedJD] = useState(
    requirementId ?? ""
  );

const [isMatching, setIsMatching] = useState(false);
const [bulkResults,setBulkResults]=useState<any[]>([]);
const [bulkFiles, setBulkFiles] = useState<File[]>([]);
const [candidates, setCandidates] = useState<any[]>([]);
const [selectedCandidate, setSelectedCandidate] = useState("");
const [showJDModal, setShowJDModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const notify = useNotification();
const [isEditMode, setIsEditMode] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [matchingResult, setMatchingResult] = useState<any>(null);
const [showHistory, setShowHistory] = useState(false);
const [selectedHistory, setSelectedHistory] = useState<string[]>([]);
const resultsRef = useRef<HTMLDivElement>(null);
const reportRef = useRef<HTMLDivElement>(null);
const jdUploadRef = useRef<HTMLInputElement>(null);
const [history, setHistory] = useState<any[]>([]);
const [historySearch, setHistorySearch] = useState("");
const [historyFilter, setHistoryFilter] = useState("All");
const [historySort, setHistorySort] = useState("Newest");
const [showDeleteHistoryModal, setShowDeleteHistoryModal] = useState(false);
const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
const [showHistoryDetails, setShowHistoryDetails] = useState(false);
const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
const [candidateSource, setCandidateSource] = useState<
  "existing" | "single" | "bulk"
>("existing");
const [jdForm, setJDForm] = useState({
  title: "",
  department: "",
  job_description: "",
  vacancies: 1,
  work_mode: "Remote",
  duration: "3 Months",
  employment_type: "Internship",
  location: "",
});
const [uploadedJDFile, setUploadedJDFile] = useState<File | null>(null);
const [uploadedJDText, setUploadedJDText] = useState("");
useEffect(() => {
  async function loadData() {
    try {
      const requirementData =
  await requirementService.getRequirements();

setRequirements(requirementData || []);

if (requirementId) {
  setSelectedJD(requirementId);
}
const candidateData =
  await candidateService.getCandidates();

setCandidates(candidateData || []);
    } catch (err) {
      console.error(err);
    }
  }

  loadData();
}, []);
async function handleSaveJD() {
  try {
  if (isEditMode) {
    await requirementService.updateRequirement(
      selectedJD,
      jdForm
    );
  } else {
    await requirementService.createRequirement({
      ...jdForm,
      status: "OPEN",
    });
  }
const data = await requirementService.getRequirements();

setRequirements(
  (data || []).filter(
    (r) => r.status === "OPEN"
  )
);

    setShowJDModal(false);

    setJDForm({
      title: "",
      department: "",
      job_description: "",
      vacancies: 1,
      work_mode: "Remote",
      duration: "3 Months",
      employment_type: "Internship",
      location: "",
    });

    notify.success("Job Description created successfully.");
  } catch (error) {
    console.error(error);
    notify.error("Failed to create Job Description.");
  }
}
async function handleDeleteJD() {
  try {
    await requirementService.deleteRequirement(selectedJD);

    const data = await requirementService.getRequirements();

    setRequirements(data || []);

    setSelectedJD("");

    setShowDeleteModal(false);

    notify.success("Job Description deleted successfully.");
  } catch (error) {
    console.error(error);
    notify.error("Unable to delete Job Description.");
  }
}
async function handleViewEditJD(edit: boolean) {

  if (!selectedJD) {
    notify.error("Please select a Job Description.");
    return;
  }

  const jd =
    await requirementService.getRequirementById(
      selectedJD
    );

  setJDForm({
    title: jd.title || "",
    department: jd.department || "",
    job_description: jd.job_description || jd.description || "",
    vacancies: jd.vacancies || 1,
    work_mode: jd.work_mode || "Remote",
    duration: jd.duration || "3 Months",
    employment_type: jd.employment_type || "Internship",
    location: jd.location || "",
  });

  setIsEditMode(edit);

  setShowJDModal(true);
}
async function handleDuplicateJD() {
  if (!selectedJD) {
    notify.error("Please select a Job Description.");
    return;
  }

  try {
    const jd = requirements.find((r) => r.id === selectedJD);

    if (!jd) return;

    await requirementService.createRequirement({
      ...jd,
      id: undefined,
      title: `${jd.title} (Copy)`,
      status: "OPEN",
    });

    const data = await requirementService.getRequirements();
    setRequirements(data || []);

    notify.success("Job Description duplicated successfully.");
  } catch (error) {
    console.error(error);
    notify.error("Unable to duplicate Job Description.");
  }
}
async function loadHistory() {
  const data =
    await resumeMatchHistoryService.getHistory();

  setHistory(data);

  setShowHistory(true);
}

async function handleJDFileUpload(
  e: React.ChangeEvent<HTMLInputElement>
) {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const extracted = await recrulynExtractorService.extractText(file);
    if (!extracted.resumeText?.trim()) {
      notify.error("Could not extract text from the uploaded Job Description.");
      return;
    }

    setUploadedJDFile(file);
    setUploadedJDText(extracted.resumeText.trim());
    notify.success(`Job Description uploaded: ${file.name}`);
  } catch (error) {
    console.error(error);
    notify.error("Unable to read Job Description file.");
  } finally {
    e.target.value = "";
  }
}

function clearUploadedJD() {
  setUploadedJDFile(null);
  setUploadedJDText("");
  if (jdUploadRef.current) jdUploadRef.current.value = "";
}

async function handleDeleteHistory(id: string) {
  try {
    await resumeMatchHistoryService.deleteHistory(id);

    setHistory((prev) =>
      prev.filter((item) => item.id !== id)
    );

    notify.success("Matching history deleted successfully.");
  } catch (error) {
    console.error(error);
    notify.error("Failed to delete matching history.");
  }
}
async function handleStartMatching() {
  setIsMatching(true);

  try {
    const jobDescription = getActiveJobDescription(
      uploadedJDText,
      selectedJD,
      requirements
    );

    if (!jobDescription) {
      notify.error("Please select or upload a Job Description.");
      return;
    }

    // ----------------------
    // Existing Candidate
    // ----------------------
    if (candidateSource === "existing") {
      if (!selectedCandidate) {
        notify.error("Please select a candidate.");
        return;
      }

      const candidate = candidates.find(
        (c) => c.id === selectedCandidate
      );

      if (!candidate) {
        notify.error("Candidate not found.");
        return;
      }

      const resumeText = await resolveResumeText(candidate);
      if (!resumeText) {
        notify.error("Could not read resume text for this candidate.");
        return;
      }

      console.log("JD:");
      console.log(jobDescription);

      console.log("Resume:");
      console.log(resumeText);

      const result =
        await resumeMatchingAIService.matchResume(
          jobDescription,
          resumeText
        );

      console.log("AI RESULT:");
      console.log(result);

      setMatchingResult(result);
      setBulkResults([]);

      await resumeMatchHistoryService.save({
        candidate_id: selectedCandidate || null,
        requirement_id: selectedJD,
        overall_match: result.overallMatch,
        skill_match: result.skillMatch,
        experience_match: result.experienceMatch,
        education_match: result.educationMatch,
        recommendation: result.recommendation,
        matched_skills: result.matchedSkills,
        missing_skills: result.missingSkills,
        strengths: result.strengths,
        weaknesses: result.weaknesses,
        interview_questions: result.interviewQuestions,
      });

      if (selectedCandidate) {
        if (selectedJD) {
          await candidateService.assignCandidateToRequirement(
            selectedCandidate,
            selectedJD
          );
        }
        
        await candidateService.updateCandidateScore(
          selectedCandidate,
          result.overallMatch
        );
      }

      notify.success("AI Matching completed successfully.");

      if (requirementId) {
        window.history.replaceState(
          {},
          "",
          "/resume-intelligence"
        );
      }

      return;
    }

    // ----------------------
    // Single Resume
    // ----------------------
    if (candidateSource === "single") {
      if (!selectedFile) {
        notify.error("Please upload a resume.");
        return;
      }

      const extracted =
        await recrulynExtractorService.extractText(selectedFile);

      if (!extracted.resumeText?.trim()) {
        notify.error("Could not extract text from the uploaded resume.");
        return;
      }

      // Best-effort upload (local blob URL if Supabase is down)
      await recrulynUploadService.uploadFile(selectedFile);

      const result =
        await resumeMatchingAIService.matchResume(
          jobDescription,
          extracted.resumeText
        );

      setMatchingResult(result);

      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setBulkResults([]);

      notify.success("AI Matching completed successfully.");

      if (requirementId) {
        await requirementService.updateRequirement(
          requirementId,
          {
            last_resume_upload_at:
              new Date().toISOString(),
          }
        );

        window.history.replaceState(
          {},
          "",
          "/resume-intelligence"
        );
      }

      console.log(result);

      return;
    }
  } catch (error: any) {
    console.error(error);
    notify.error(error?.message || "AI Matching failed. Please try again.");
  } finally {
    setIsMatching(false);
  }
}
async function handleBulkMatching() {
  setIsMatching(true);

  try {
    const jobDescription = getActiveJobDescription(
      uploadedJDText,
      selectedJD,
      requirements
    );

    if (!jobDescription) {
      notify.error("Please select or upload a Job Description.");
      return;
    }

    const results = [];

    for (const file of bulkFiles) {
      const extracted =
        await recrulynExtractorService.extractText(file);

      if (!extracted.resumeText?.trim()) {
        continue;
      }

      await recrulynUploadService.uploadFile(file);

      const ai =
        await resumeMatchingAIService.matchResume(
          jobDescription,
          extracted.resumeText
        );

      console.log("AI Result:", ai);

      results.push({
        name: file.name,
        ...ai,
      });
    }

    results.sort(
      (a, b) => b.overallMatch - a.overallMatch
    );

    setBulkResults(results);

    if (results.length > 0) {
      setMatchingResult(results[0]);

      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    notify.success(
      `${results.length} resumes matched successfully.`
    );

    if (requirementId) {
      window.history.replaceState(
        {},
        "",
        "/resume-intelligence"
      );

      await requirementService.updateRequirement(
        requirementId,
        {
          last_resume_upload_at:
            new Date().toISOString(),
        }
      );
    }
  } catch (error) {
    console.error(error);
    notify.error("Bulk AI Matching failed.");
  } finally {
    setIsMatching(false);
  }
}
  // ---- Presentational helpers (visual only, no logic/state impact) ----
  function ScoreRing({
    value,
    colorHex,
    trackHex = "#E7E5DD",
  }: {
    value: number;
    colorHex: string;
    trackHex?: string;
  }) {
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, value || 0));
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <svg viewBox="0 0 76 76" className="h-[72px] w-[72px] -rotate-90">
        <circle
          cx="38"
          cy="38"
          r={radius}
          strokeWidth="6"
          fill="none"
          stroke={trackHex}
        />
        <circle
          cx="38"
          cy="38"
          r={radius}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          stroke={colorHex}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </svg>
    );
  }

  function KpiScoreCard({
    label,
    value,
    colorHex,
    icon,
  }: {
    label: string;
    value: number;
    colorHex: string;
    icon: string;
  }) {
    return (
      <div className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#E7E5DD] bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-12px_rgba(20,20,25,0.18)]">
        <div
          className="absolute inset-x-0 top-0 h-[3px] opacity-90"
          style={{ background: colorHex }}
        />
        <div className="relative flex h-[72px] w-[72px] items-center justify-center">
          <ScoreRing value={value} colorHex={colorHex} />
          <span
            className="absolute font-mono text-lg font-bold tabular-nums"
            style={{ color: colorHex }}
          >
            {value}%
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="text-sm" aria-hidden>{icon}</span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6B6558]">
            {label}
          </p>
        </div>
      </div>
    );
  }

  function recommendationTone(rec: string) {
    const r = (rec || "").toLowerCase();
    if (r.includes("strong") || r.includes("excellent") || r.includes("recommend")) {
      return { badge: "bg-[#0F6E5B]/10 text-[#0F6E5B] ring-[#0F6E5B]/20", label: "Strong Fit", dot: "bg-[#0F6E5B]" };
    }
    if (r.includes("not") || r.includes("reject") || r.includes("poor")) {
      return { badge: "bg-[#B3261E]/10 text-[#B3261E] ring-[#B3261E]/20", label: "Not a Fit", dot: "bg-[#B3261E]" };
    }
    return { badge: "bg-[#9A5B13]/10 text-[#9A5B13] ring-[#9A5B13]/20", label: "Needs Review", dot: "bg-[#9A5B13]" };
  }

  // Small helper for consistent section eyebrow labels
  function SectionEyebrow({ index, children }: { index: string; children: React.ReactNode }) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#3730A3] font-mono text-[10px] font-bold text-white">
          {index}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6558]">
          {children}
        </span>
      </div>
    );
  }
  const handleExportPdf = async () => {
  if (!reportRef.current) return;

  const candidateName =
    selectedHistoryItem?.candidate_name ||
    selectedHistoryItem?.candidate ||
    "Candidate";

  const options = {
  margin: 0.4,
  filename: `${candidateName.replace(/\s+/g, "_")}_AI_Match_Report.pdf`,
  image: {
    type: "jpeg",
    quality: 1,
  },
  html2canvas: {
    scale: 2,
    useCORS: true,
  },
  jsPDF: {
    unit: "in",
    format: "a4",
    orientation: "portrait",
  },
} as const;
  await html2pdf()
    .set(options)
    .from(reportRef.current)
    .save();
};

  const hasJobDescription = Boolean(
    getActiveJobDescription(uploadedJDText, selectedJD, requirements)
  );

  return (
    <div className="space-y-6 pb-10 [font-family:'Inter',system-ui,sans-serif]">

      <PageHeader
  eyebrow="AI Recruitment"
  title="Resume Intelligence"
  description="Match resumes against Job Descriptions using AI."
  actions={
  <div className="flex flex-wrap gap-3">

    <button
  onClick={loadHistory}
  className="inline-flex items-center gap-2 rounded-xl border border-[#DEDACE] bg-white px-4 py-3 text-sm font-medium text-[#1C1B18] shadow-sm transition-all duration-200 hover:border-[#3730A3]/40 hover:shadow-md active:scale-[0.98]"
>
  <span aria-hidden>🕘</span>
  AI Matching History
</button>

    <button
      onClick={() => {
        setIsEditMode(false);

        setJDForm({
          title: "",
          department: "",
          job_description: "",
          vacancies: 1,
          work_mode: "Remote",
          duration: "3 Months",
          employment_type: "Internship",
          location: "",
        });

        setShowJDModal(true);
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-[#1C1B18] px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#3730A3] active:scale-[0.98]"
    >
      <span aria-hidden>+</span>
      Add Job Description
    </button>

  </div>
}
/>

      <div className="grid gap-5 lg:grid-cols-2">
      <GlassCard className="relative overflow-hidden p-6">
  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#3730A3]" />
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div>
      <SectionEyebrow index="1">Job Description</SectionEyebrow>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#1C1B18]">
        Choose or draft a role
      </h2>

      <p className="mt-1 text-sm text-[#6B6558]">
        Select an existing Job Description, upload a file, or create a new one.
      </p>
    </div>

    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0F6E5B]/10 px-3 py-1 text-xs font-semibold text-[#0F6E5B] ring-1 ring-inset ring-[#0F6E5B]/20">
      <span className="h-1.5 w-1.5 rounded-full bg-[#0F6E5B]" />
      Active
    </span>
  </div>

  <div className="mt-5">
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6B6558]">
      Select Job Description
    </label>

   <select
  value={selectedJD}
  disabled={!!requirementId}
  onChange={(e) => setSelectedJD(e.target.value)}
  className="w-full rounded-xl border border-[#DEDACE] bg-white p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
>
  <option value="">Select Job Description</option>

  {requirements.map((jd) => (
    <option key={jd.id} value={jd.id}>
      {jd.title}
    </option>
  ))}
</select>

    {uploadedJDFile && (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#3730A3]/20 bg-[#3730A3]/[0.04] px-3 py-2.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3730A3]">
            Uploaded JD
          </p>
          <p className="truncate text-sm font-medium text-[#1C1B18]">
            {uploadedJDFile.name}
          </p>
        </div>
        <button
          type="button"
          onClick={clearUploadedJD}
          className="shrink-0 rounded-lg border border-[#DEDACE] px-3 py-1.5 text-xs font-medium text-[#6B6558] transition-colors hover:bg-white"
        >
          Clear
        </button>
      </div>
    )}
  </div>

  <input
    ref={jdUploadRef}
    type="file"
    accept=".pdf,.doc,.docx,.txt"
    hidden
    onChange={handleJDFileUpload}
  />

  <div className="mt-5 flex flex-wrap gap-2.5 border-t border-[#EDEAE0] pt-5">
  <button
  type="button"
  onClick={() => jdUploadRef.current?.click()}
  className="inline-flex items-center gap-1.5 rounded-xl border border-[#3730A3]/25 bg-[#3730A3]/5 px-4 py-2 text-sm font-medium text-[#3730A3] transition-colors hover:border-[#3730A3]/40 hover:bg-[#3730A3]/10"
>
  <span aria-hidden>📤</span>
  Upload
</button>

  <button
  onClick={() => handleViewEditJD(false)}
  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DEDACE] px-4 py-2 text-sm font-medium text-[#1C1B18] transition-colors hover:border-[#3730A3]/30 hover:bg-[#3730A3]/5"
>
  <span aria-hidden>👁️</span>
  View
</button>

   <button
  onClick={() => handleViewEditJD(true)}
  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DEDACE] px-4 py-2 text-sm font-medium text-[#1C1B18] transition-colors hover:border-[#3730A3]/30 hover:bg-[#3730A3]/5"
>
  <span aria-hidden>✏️</span>
  Edit
</button>

    <button
  onClick={handleDuplicateJD}
  className="inline-flex items-center gap-1.5 rounded-xl border border-[#DEDACE] px-4 py-2 text-sm font-medium text-[#1C1B18] transition-colors hover:border-[#3730A3]/30 hover:bg-[#3730A3]/5"
>
  <span aria-hidden>📄</span>
  Duplicate
</button>

   <button
  onClick={() => {
    if (!selectedJD) {
      notify.error("Please select a Job Description.");
      return;
    }

    setShowDeleteModal(true);
  }}
  className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-[#B3261E]/25 px-4 py-2 text-sm font-medium text-[#B3261E] transition-colors hover:bg-[#B3261E]/5"
>
  <span aria-hidden>🗑️</span>
  Delete
</button>
  </div>
</GlassCard>

     <GlassCard className="relative overflow-hidden p-6">
  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#9A5B13]" />
  <div className="w-full">
    <SectionEyebrow index="2">Candidate Selection</SectionEyebrow>
    <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#1C1B18]">
      Bring in the candidates
    </h2>

    <p className="mt-1 text-sm text-[#6B6558]">
      Select existing candidates or upload resumes.
    </p>

    <div className="mt-5 inline-flex w-full rounded-xl border border-[#DEDACE] bg-[#F7F5EF] p-1">

  <button
onClick={() => {
  setCandidateSource("existing");
  setMatchingResult(null);
  setBulkResults([]);
}}    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      candidateSource === "existing"
        ? "bg-white text-[#3730A3] shadow-sm"
        : "text-[#6B6558] hover:text-[#1C1B18]"
    }`}
  >
    Existing
  </button>

  <button
 onClick={() => {
  setCandidateSource("single");
  setMatchingResult(null);
  setBulkResults([]);
}}
    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      candidateSource === "single"
        ? "bg-white text-[#3730A3] shadow-sm"
        : "text-[#6B6558] hover:text-[#1C1B18]"
    }`}
  >
    Single Upload
  </button>

  <button
   onClick={() => {
  setCandidateSource("bulk");
  setMatchingResult(null);
}}
    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
      candidateSource === "bulk"
        ? "bg-white text-[#3730A3] shadow-sm"
        : "text-[#6B6558] hover:text-[#1C1B18]"
    }`}
  >
    Bulk Upload
  </button>

</div>
  </div>

<div className="mt-5 rounded-xl border border-[#EDEAE0] bg-[#FBFAF6] p-5">

  {candidateSource === "existing" && (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6B6558]">
        Existing Candidates
      </label>

   <select
  value={selectedCandidate}
  onChange={(e) => setSelectedCandidate(e.target.value)}
  className="w-full rounded-xl border border-[#DEDACE] bg-white p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15 disabled:cursor-not-allowed disabled:bg-gray-100"
>
        <option value="">Select Candidate</option>

        {candidates.map((candidate) => (
          <option
            key={candidate.id}
            value={candidate.id}
          >
            {candidate.full_name}
          </option>
        ))}
      </select>
    </div>
  )}

  {candidateSource === "single" && (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6B6558]">
        Upload Resume
      </label>

     <input
  type="file"
  accept=".pdf,.doc,.docx"
  onChange={(e) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  }}
  className="w-full cursor-pointer rounded-xl border border-dashed border-[#DEDACE] bg-white p-3 text-sm text-[#1C1B18] shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#3730A3]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#3730A3] hover:border-[#3730A3]/40"
/>

{selectedFile && (
  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#0F6E5B]/10 p-3 text-sm text-[#0F6E5B]">
    <span aria-hidden>✓</span>
    Selected: <strong>{selectedFile.name}</strong>
  </div>
)}
    </div>
  )}

  {candidateSource === "bulk" && (
   <div>

<label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[#6B6558]">
Bulk Resume Upload
</label>

<input
type="file"
multiple
accept=".pdf,.doc,.docx"
onChange={(e)=>{

const files=Array.from(e.target.files || []);

setBulkFiles(files);

}}
className="w-full cursor-pointer rounded-xl border border-dashed border-[#DEDACE] bg-white p-3 text-sm text-[#1C1B18] shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#3730A3]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#3730A3] hover:border-[#3730A3]/40"
/>

<p className="mt-3 text-sm font-medium text-[#6B6558]">

{bulkFiles.length} Resume(s) Selected

</p>

</div>
  )}

</div>
</GlassCard>
      </div>

    <GlassCard className="relative overflow-hidden border-[#3730A3]/15 bg-gradient-to-r from-[#3730A3]/[0.04] to-transparent p-6">
  <div className="absolute inset-x-0 top-0 h-[3px] bg-[#3730A3]" />
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <SectionEyebrow index="3">AI Resume Matching</SectionEyebrow>
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#1C1B18]">
        Run the match
      </h2>

      <p className="text-sm text-[#6B6558]">
        Compare resumes against the selected or uploaded Job Description.
      </p>
    </div>

    <div className="flex flex-wrap gap-3">
      <button
  onClick={handleBulkMatching}
  disabled={
    isMatching ||
    !hasJobDescription ||
    bulkFiles.length === 0
  }
  className="inline-flex items-center gap-2 rounded-xl border border-[#DEDACE] bg-white px-4 py-2.5 text-sm font-medium text-[#1C1B18] transition-colors hover:border-[#3730A3]/30 hover:bg-[#3730A3]/5 disabled:cursor-not-allowed disabled:opacity-50"
>
  <span aria-hidden>
  {isMatching ? "⏳" : "⚡"}
</span>

{isMatching ? "Matching..." : "Match All Resumes"}
</button>

  <button
  onClick={handleStartMatching}
  disabled={
    isMatching ||
    !hasJobDescription ||
    (candidateSource === "existing" && !selectedCandidate) ||
    (candidateSource === "single" && !selectedFile)
  }
  className="inline-flex items-center gap-2 rounded-xl bg-[#3730A3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2D2683] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
>
  <span aria-hidden>
    {isMatching ? "⏳" : "✨"}
  </span>

  {isMatching ? "Matching..." : "Start AI Matching"}
</button>
    </div>

  </div>
</GlassCard>

<MatchingResults
  resultsRef={resultsRef}
  matchingResult={matchingResult}
  notify={notify}
  exportPdf={handleExportPdf}
>
 

  <div className="mt-5">

  {matchingResult ? (
  <div className="space-y-5">

    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

      <KpiScoreCard
        label="Overall Match"
        value={matchingResult.overallMatch}
        colorHex="#3730A3"
        icon="🎯"
      />

      <KpiScoreCard
        label="Skills"
        value={matchingResult.skillMatch}
        colorHex="#0F6E5B"
        icon="🛠️"
      />

      <KpiScoreCard
        label="Experience"
        value={matchingResult.experienceMatch}
        colorHex="#9A5B13"
        icon="💼"
      />

      <KpiScoreCard
        label="Education"
        value={matchingResult.educationMatch}
        colorHex="#1D5DBF"
        icon="🎓"
      />

    </div>

      <div className="rounded-2xl border border-[#3730A3]/15 bg-[#3730A3]/[0.03] p-5">
  <div className="flex flex-wrap items-center justify-between gap-3">
    <h3 className="text-sm font-semibold tracking-tight text-[#1C1B18]">
      AI Recommendation
    </h3>

    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${recommendationTone(matchingResult.recommendation).badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${recommendationTone(matchingResult.recommendation).dot}`} />
      {recommendationTone(matchingResult.recommendation).label}
    </span>
  </div>

  <p className="mt-2 text-sm leading-relaxed text-[#6B6558]">
    {matchingResult.recommendation}
  </p>
</div>

<div className="grid gap-4 lg:grid-cols-2">

  <div className="rounded-2xl border border-[#EDEAE0] p-4">

    <h3 className="mb-3 text-sm font-semibold tracking-tight text-[#1C1B18]">
      Matched Skills
    </h3>

    <div className="flex flex-wrap gap-2">

      {matchingResult.matchedSkills.map((skill:any)=>(
        <span
          key={skill}
          className="rounded-full bg-[#0F6E5B]/10 px-2.5 py-1 text-xs font-medium text-[#0F6E5B] ring-1 ring-inset ring-[#0F6E5B]/20"
        >
          {skill}
        </span>
      ))}

    </div>

  </div>

  <div className="rounded-2xl border border-[#EDEAE0] p-4">

    <h3 className="mb-3 text-sm font-semibold tracking-tight text-[#1C1B18]">
      Missing Skills
    </h3>

    <div className="flex flex-wrap gap-2">

      {matchingResult.missingSkills.map((skill:any)=>(
        <span
          key={skill}
          className="rounded-full bg-[#B3261E]/10 px-2.5 py-1 text-xs font-medium text-[#B3261E] ring-1 ring-inset ring-[#B3261E]/20"
        >
          {skill}
        </span>
      ))}

    </div>

  </div>

</div>

<div className="grid gap-4 lg:grid-cols-2">

  <div className="rounded-2xl border border-[#EDEAE0] p-4">

    <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[#1C1B18]">
      <span aria-hidden>💪</span>
      Strengths
    </h3>

    <ul className="mt-3 space-y-2">

      {matchingResult.strengths.map((item:any)=>(
        <li key={item} className="flex gap-2 text-sm text-[#6B6558]">
          <span className="mt-0.5 text-[#0F6E5B]" aria-hidden>✓</span>
          <span>{item}</span>
        </li>
      ))}

    </ul>

  </div>

  <div className="rounded-2xl border border-[#EDEAE0] p-4">

    <h3 className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-[#1C1B18]">
      <span aria-hidden>⚠️</span>
      Weaknesses
    </h3>

    <ul className="mt-3 space-y-2">

      {matchingResult.weaknesses.map((item:any)=>(
        <li key={item} className="flex gap-2 text-sm text-[#6B6558]">
          <span className="mt-0.5 text-[#9A5B13]" aria-hidden>•</span>
          <span>{item}</span>
        </li>
      ))}

    </ul>

  </div>

</div>
<div className="rounded-2xl border border-[#EDEAE0] p-4">

  <h3 className="text-sm font-semibold tracking-tight text-[#1C1B18]">
    Suggested Interview Questions
  </h3>

  <div className="mt-3 space-y-2">

    {matchingResult.interviewQuestions.map((q: any, index: number) => (

      <div
        key={index}
        className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
          index === 0
            ? "bg-[#0F6E5B]/5"
            : index === 1
            ? "bg-[#9A5B13]/5"
            : "hover:bg-[#F7F5EF]"
        }`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3730A3]/10 font-mono text-xs font-semibold text-[#3730A3]">
          {index + 1}
        </span>

        <p className="text-sm leading-relaxed text-[#1C1B18]">
          {q}
        </p>

      </div>

    ))}

  </div>

</div>

<div>
  <div className="rounded-2xl border border-[#EDEAE0] p-4">

<div className="flex items-center justify-between">

<h3 className="text-sm font-semibold tracking-tight text-[#1C1B18]">
Candidate Rankings
</h3>

<p className="text-xs text-[#6B6558]">
AI ranked candidates for this Job Description
</p>

</div>

</div>

<div className="mt-3 overflow-x-auto rounded-xl border border-[#EDEAE0]">

<table className="w-full text-sm">

<thead className="bg-[#F7F5EF]">

<tr className="border-b border-[#EDEAE0] text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B6558]">

<th className="py-2.5 px-3">Rank</th>

<th className="px-3">Candidate</th>

<th className="px-3">Overall</th>

<th className="px-3">Skills</th>

<th className="px-3">Experience</th>

<th className="px-3">Education</th>
<th className="px-3">Recommendation</th>
<th className="px-3">Status</th>

<th className="px-3"></th>

</tr>

</thead>

<tbody>

<tr className="border-b border-[#F1EFE7] transition-colors hover:bg-[#F7F5EF]">

<td className="py-2.5 px-3 text-base">
  {matchingResult.overallMatch >= 80
    ? "🥇"
    : matchingResult.overallMatch >= 60
    ? "🥈"
    : "🥉"}
</td>

<td className="px-3 font-medium text-[#1C1B18]">
  {candidateSource === "existing"
    ? candidates.find((c) => c.id === selectedCandidate)?.full_name || "Candidate"
    : selectedFile?.name || "Uploaded Resume"}
</td>

<td className="px-3">
<span
  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
    matchingResult.overallMatch >= 80
      ? "bg-[#0F6E5B]/10 text-[#0F6E5B]"
      : matchingResult.overallMatch >= 60
      ? "bg-[#9A5B13]/10 text-[#9A5B13]"
      : "bg-[#B3261E]/10 text-[#B3261E]"
  }`}
>
  {matchingResult.overallMatch}%
</span>
</td>

<td
  className={`px-3 font-medium ${
    matchingResult.skillMatch >= 80
      ? "text-[#0F6E5B]"
      : matchingResult.skillMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {matchingResult.skillMatch}%
</td>

<td
  className={`px-3 font-medium ${
    matchingResult.experienceMatch >= 80
      ? "text-[#0F6E5B]"
      : matchingResult.experienceMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {matchingResult.experienceMatch}%
</td>

<td
  className={`px-3 font-medium ${
    matchingResult.educationMatch >= 80
      ? "text-[#0F6E5B]"
      : matchingResult.educationMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {matchingResult.educationMatch}%
</td>
<td className="px-3">

<span
  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
    matchingResult.overallMatch >= 80
      ? "bg-[#0F6E5B]/10 text-[#0F6E5B]"
      : matchingResult.overallMatch >= 60
      ? "bg-[#9A5B13]/10 text-[#9A5B13]"
      : "bg-[#B3261E]/10 text-[#B3261E]"
  }`}
>
  {matchingResult.overallMatch >= 80
    ? "Recommended"
    : matchingResult.overallMatch >= 60
    ? "Review"
    : "Not Recommended"}
</span>

</td>

<td className="px-3">

<button className="rounded-lg border border-[#DEDACE] px-2.5 py-1 text-xs font-medium text-[#1C1B18] transition-colors hover:bg-[#3730A3]/5">

View

</button>

</td>

</tr>

</tbody>

</table>

</div>

{bulkResults.length>0 && (

<div className="mt-5">

<h3 className="text-sm font-semibold tracking-tight text-[#1C1B18]">

Bulk AI Ranking

</h3>

<div className="mt-3 overflow-auto rounded-xl border border-[#EDEAE0]">

<table className="w-full text-sm">

<thead className="bg-[#F7F5EF]">

<tr className="border-b border-[#EDEAE0] text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B6558]">

<th className="py-2.5 px-3">Rank</th>

<th className="px-3">Resume</th>

<th className="px-3">Score</th>

<th className="px-3">Skills</th>

<th className="px-3">Experience</th>

<th className="px-3">Education</th>

</tr>

</thead>

<tbody>

{bulkResults.map((candidate,index)=>(

<tr key={index} className="border-b border-[#F1EFE7] transition-colors hover:bg-[#F7F5EF]">

<td className="py-2 px-3 font-medium text-[#1C1B18]">
  {index === 0 ? "🥇" : `#${index + 1}`}
</td>
<td className="px-3 text-[#1C1B18]">{candidate.name}</td>

<td className="px-3">
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      candidate.overallMatch >= 80
        ? "bg-[#0F6E5B]/10 text-[#0F6E5B]"
        : candidate.overallMatch >= 60
        ? "bg-[#9A5B13]/10 text-[#9A5B13]"
        : "bg-[#B3261E]/10 text-[#B3261E]"
    }`}
  >
    {candidate.overallMatch}%
  </span>
</td>

<td
  className={`px-3 font-medium ${
    candidate.skillMatch >= 80
      ? "text-[#0F6E5B]"
      : candidate.skillMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {candidate.skillMatch}%
</td>

<td
  className={`px-3 font-medium ${
    candidate.experienceMatch >= 80
      ? "text-[#0F6E5B]"
      : candidate.experienceMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {candidate.experienceMatch}%
</td>

<td
  className={`px-3 font-medium ${
    candidate.educationMatch >= 80
      ? "text-[#0F6E5B]"
      : candidate.educationMatch >= 60
      ? "text-[#9A5B13]"
      : "text-[#B3261E]"
  }`}
>
  {candidate.educationMatch}%
</td>
<td className="px-3">
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
      candidate.overallMatch >= 80
        ? "bg-[#0F6E5B]/10 text-[#0F6E5B]"
        : candidate.overallMatch >= 60
        ? "bg-[#9A5B13]/10 text-[#9A5B13]"
        : "bg-[#B3261E]/10 text-[#B3261E]"
    }`}
  >
    {candidate.overallMatch >= 80
      ? "Recommended"
      : candidate.overallMatch >= 60
      ? "Review"
      : "Not Recommended"}
  </span>
</td>
</tr>

))}

</tbody>

</table>

</div>

</div>

)}
</div>

    </div>

) : (
  <div className="rounded-2xl border border-dashed border-[#DEDACE] bg-[#FBFAF6] p-10 text-center">

    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3730A3]/10 text-xl">
      📊
    </div>

    <h3 className="text-base font-semibold tracking-tight text-[#1C1B18]">
      No Matching Results Yet
    </h3>

    <p className="mx-auto mt-2 max-w-md text-sm text-[#6B6558]">
      Select a Job Description and upload resumes to generate AI-powered candidate rankings.
    </p>

  </div>
)}
  </div>

 </MatchingResults>

{showJDModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/50 p-4 backdrop-blur-sm">
   <div className="w-full max-w-3xl rounded-2xl bg-white p-8 shadow-2xl">

  <div className="mb-6 flex items-center justify-between border-b border-[#EDEAE0] pb-5">

    <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
      {isEditMode ? "Edit Job Description" : "Add Job Description"}
    </h2>

    <button
      onClick={() => setShowJDModal(false)}
      className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6B6558] transition-colors hover:bg-[#F7F5EF]"
    >
      ×
    </button>

  </div>

      <div className="grid gap-5 md:grid-cols-2">

        <input
          placeholder="Job Title"
          value={jdForm.title}
          onChange={(e) =>
            setJDForm({
              ...jdForm,
              title: e.target.value,
            })
          }
          className="rounded-xl border border-[#DEDACE] p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
        />

        <DepartmentSelect
          value={jdForm.department}
          onChange={(department) =>
            setJDForm({
              ...jdForm,
              department,
            })
          }
          className="rounded-xl border border-[#DEDACE] p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
        />

        <input
          placeholder="Vacancies"
          type="number"
          value={jdForm.vacancies}
          onChange={(e) =>
            setJDForm({
              ...jdForm,
              vacancies: Number(e.target.value),
            })
          }
          className="rounded-xl border border-[#DEDACE] p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
        />

        <select
          value={jdForm.work_mode}
          onChange={(e) =>
            setJDForm({
              ...jdForm,
              work_mode: e.target.value,
            })
          }
          className="rounded-xl border border-[#DEDACE] p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
        >
          <option>Remote</option>
          <option>Hybrid</option>
          <option>Onsite</option>
        </select>

      </div>

      <textarea
        rows={6}
        placeholder="Job Description"
        value={jdForm.job_description}
        onChange={(e) =>
          setJDForm({
            ...jdForm,
            job_description: e.target.value,
          })
        }
        className="mt-5 w-full rounded-xl border border-[#DEDACE] p-3 text-sm text-[#1C1B18] shadow-sm transition-colors focus:border-[#3730A3] focus:outline-none focus:ring-2 focus:ring-[#3730A3]/15"
      />

      <div className="mt-6 flex justify-end gap-3 border-t border-[#EDEAE0] pt-5">

        <button
          onClick={() => setShowJDModal(false)}
          className="rounded-xl border border-[#DEDACE] px-5 py-3 text-sm font-medium text-[#1C1B18] transition-colors hover:bg-[#F7F5EF]"
        >
          Cancel
        </button>

      <button
  onClick={handleSaveJD}
  className="rounded-xl bg-[#3730A3] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2D2683] active:scale-[0.98]"
>
  Save Job Description
</button>
      </div>

    </div>
  </div>
)}
{showHistory && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/50 p-4 backdrop-blur-sm">

    <div className="w-full max-w-6xl rounded-2xl bg-white p-8 shadow-2xl">

      <div className="mb-6 flex items-center justify-between border-b border-[#EDEAE0] pb-5">

        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1C1B18]">
            AI Matching History
          </h2>
          <p className="mt-1 text-sm text-[#6B6558]">
            Previous AI matches across all Job Descriptions.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(false)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#6B6558] transition-colors hover:bg-[#F7F5EF]"
        >
          ×
        </button>

      </div>
        <div className="mb-5">
 <input
  type="text"
  placeholder="Search candidate or job description..."
  value={historySearch}
  onChange={(e) => setHistorySearch(e.target.value)}
  className="w-full rounded-xl border border-[#DEDACE] p-3 text-sm focus:border-[#3730A3] focus:outline-none"
/>
</div>
<div className="mt-3 flex flex-wrap items-center gap-2">
  {["All", "Recommended", "Review", "Not Recommended"].map((filter) => (
    <button
      key={filter}
      onClick={() => setHistoryFilter(filter)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        historyFilter === filter
          ? "bg-[#3730A3] text-white"
          : "border border-[#DEDACE] bg-white text-[#1C1B18]"
      }`}
    >
      {filter}
    </button>
  ))}

  <button
  onClick={() => {
    setHistorySearch("");
    setHistoryFilter("All");
  }}
  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
>
  Clear Filters
</button>

<div className="mt-4 flex items-center gap-3">
  <span className="text-sm font-medium text-[#1C1B18]">
    Sort By:
  </span>

  <select
    value={historySort}
    onChange={(e) => setHistorySort(e.target.value)}
    className="rounded-lg border border-[#DEDACE] px-3 py-2 text-sm focus:border-[#3730A3] focus:outline-none"
  >
    <option>Newest</option>
    <option>Oldest</option>
    <option>Highest Match</option>
    <option>Lowest Match</option>
  </select>
</div>

<button
  onClick={() => {
    if (selectedHistory.length === 0) {
      notify.error("Please select at least one history record.");
      return;
    }

    setShowDeleteHistoryModal(true);
  }}
  className="ml-auto rounded-lg bg-[#B3261E] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#991F19]"
>
  Delete Selected ({selectedHistory.length})
</button>
</div>
      <div className="max-h-[60vh] overflow-auto rounded-xl border border-[#EDEAE0]">

        <table className="w-full text-sm">

          <thead className="sticky top-0 bg-[#F7F5EF]/95 backdrop-blur">

            <tr className="border-b border-[#EDEAE0] text-left text-[11px] font-semibold uppercase tracking-wide text-[#6B6558]">
<th className="w-12 px-4">
  <input
    type="checkbox"
    checked={
      history.length > 0 &&
      selectedHistory.length === history.length
    }
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedHistory(history.map((item) => item.id));
      } else {
        setSelectedHistory([]);
      }
    }}
  />
</th>
<th className="py-3 px-4">
  Candidate
</th>
              <th className="py-3 px-4">
                Match %
              </th>

              <th className="px-4">
                Skills
              </th>

              <th className="px-4">
                Experience
              </th>

              <th className="px-4">
                Education
              </th>
<th className="px-4">
  Job Description
</th>
              <th className="px-4">
                Recommendation
              </th>

              <th className="px-4">
                Date
              </th>
<th className="px-4 text-center">
  Actions
</th>
            </tr>

          </thead>

          <tbody>

            {history
  .filter((item) => {
  const candidateName =
    candidates.find((c) => c.id === item.candidate_id)
      ?.full_name || "";

  const jdTitle =
    requirements.find((r) => r.id === item.requirement_id)
      ?.title || "";

  const matchesSearch =
    candidateName
      .toLowerCase()
      .includes(historySearch.toLowerCase()) ||
    jdTitle
      .toLowerCase()
      .includes(historySearch.toLowerCase());

  const recommendation =
    item.overall_match >= 80
      ? "Recommended"
      : item.overall_match >= 60
      ? "Review"
      : "Not Recommended";

  const matchesFilter =
    historyFilter === "All" ||
    recommendation === historyFilter;

  return matchesSearch && matchesFilter;
})
.sort((a, b) => {
  switch (historySort) {
    case "Highest Match":
      return b.overall_match - a.overall_match;

    case "Lowest Match":
      return a.overall_match - b.overall_match;

    case "Oldest":
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );

    default: // Newest
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
  }
})
  .map((item) => (

              <tr
                key={item.id}
                className="border-b border-[#F1EFE7] transition-colors hover:bg-[#F7F5EF]"
              >
              <td className="px-4">
  <input
    type="checkbox"
    checked={selectedHistory.includes(item.id)}
    onChange={(e) => {
      if (e.target.checked) {
        setSelectedHistory((prev) => [...prev, item.id]);
      } else {
        setSelectedHistory((prev) =>
          prev.filter((id) => id !== item.id)
        );
      }
    }}
  />
</td>
                <td className="py-4 px-4 font-medium text-[#1C1B18]">
  {candidates.find((c) => c.id === item.candidate_id)?.full_name || "Uploaded Resume"}
</td>

                <td className="py-4 px-4">
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
      item.overall_match >= 80
        ? "bg-[#0F6E5B]/10 text-[#0F6E5B]"
        : item.overall_match >= 60
        ? "bg-[#9A5B13]/10 text-[#9A5B13]"
        : "bg-[#B3261E]/10 text-[#B3261E]"
    }`}
  >
    {item.overall_match}%
  </span>
</td>

                <td className="px-4 text-[#1C1B18]">
                  {item.skill_match}%
                </td>

                <td className="px-4 text-[#1C1B18]">
                  {item.experience_match}%
                </td>

                <td className="px-4 text-[#1C1B18]">
                  {item.education_match}%
                </td>
<td className="px-4 text-[#1C1B18]">
  {requirements.find((r) => r.id === item.requirement_id)?.title || "-"}
</td>
                <td className="px-4 text-[#1C1B18]">
                  {item.recommendation}
                </td>

                <td className="px-4 text-[#6B6558]">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
<td className="px-4 text-center">
  <div className="flex justify-center gap-2">

    <button
      onClick={() => {
        setSelectedHistoryItem(item);
        setShowHistoryDetails(true);
      }}
      className="rounded-lg border border-[#3730A3]/20 bg-[#3730A3]/5 px-3 py-1 text-xs font-medium text-[#3730A3] transition hover:bg-[#3730A3]/10"
    >
      👁 View
    </button>

    <button
      onClick={() => {
        setSelectedHistoryId(item.id);
        setShowDeleteHistoryModal(true);
      }}
      className="rounded-lg border border-[#B3261E]/20 bg-[#B3261E]/5 px-3 py-1 text-xs font-medium text-[#B3261E] transition hover:bg-[#B3261E]/10"
    >
      🗑 Delete
    </button>

  </div>
</td>
              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  </div>
)}
{showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1B18]/50 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B3261E]/10 text-2xl text-[#B3261E]">
        ⚠️
      </div>

      <h2 className="mt-4 text-xl font-bold tracking-tight text-[#1C1B18]">
        Delete Job Description
      </h2>

      <p className="mt-3 text-sm leading-relaxed text-[#6B6558]">
        Are you sure you want to delete this Job Description?
        <br />
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => setShowDeleteModal(false)}
          className="rounded-xl border border-[#DEDACE] px-5 py-2 text-sm font-medium text-[#1C1B18] transition-colors hover:bg-[#F7F5EF]"
        >
          Cancel
        </button>

        <button
          onClick={handleDeleteJD}
          className="rounded-xl bg-[#B3261E] px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#96201A] active:scale-[0.98]"
        >
          Delete
        </button>

      </div>

    </div>
  </div>
)}
{showDeleteHistoryModal && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

      <h2 className="text-xl font-bold text-[#1C1B18]">
        Delete Matching History
      </h2>

      <p className="mt-3 text-sm text-[#6B6558]">
        Are you sure you want to delete this matching history?
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">

        <button
          onClick={() => {
            setShowDeleteHistoryModal(false);
            setSelectedHistoryId(null);
          }}
          className="rounded-xl border border-[#D8D4C8] px-4 py-2 text-sm font-medium"
        >
          Cancel
        </button>

      <button
  onClick={async () => {
    try {

      if (selectedHistory.length > 0) {

        await resumeMatchHistoryService.deleteManyHistory(selectedHistory);

        setHistory((prev) =>
          prev.filter(
            (item) => !selectedHistory.includes(item.id)
          )
        );

        setSelectedHistory([]);

      } else if (selectedHistoryId) {

        await handleDeleteHistory(selectedHistoryId);

      }

      setShowDeleteHistoryModal(false);
      setSelectedHistoryId(null);

      notify.success("History deleted successfully.");

    } catch (error) {
      console.error(error);
      notify.error("Failed to delete history.");
    }
  }}
  className="rounded-xl bg-[#B3261E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#991F19]"
>
  Delete
</button>

      </div>

    </div>
  </div>
)}
{showHistoryDetails && selectedHistoryItem && (
  <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div
      ref={reportRef}
      className="w-full max-w-4xl rounded-2xl bg-white p-8 shadow-2xl"
    >
      <div className="mb-6 flex items-center justify-between border-b border-[#EDEAE0] pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C1B18]">
            AI Matching Report
          </h2>

          <p className="mt-1 text-sm text-[#6B6558]">
            Saved AI matching result
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="rounded-lg bg-[#3730A3] px-4 py-2 text-sm font-medium text-white hover:bg-[#2E258A]"
          >
            📄 Export PDF
          </button>

          <button
            onClick={() => {
              setShowHistoryDetails(false);
              setSelectedHistoryItem(null);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-[#F7F5EF]"
          >
            ×
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <p className="text-xs text-[#6B6558]">Overall Match</p>
          <h3 className="mt-1 text-3xl font-bold text-[#3730A3]">
            {selectedHistoryItem.overall_match}%
          </h3>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-[#6B6558]">Recommendation</p>
          <h3 className="mt-1 text-lg font-semibold">
            {selectedHistoryItem.recommendation}
          </h3>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-[#6B6558]">Skill Match</p>
          <h3 className="mt-1 text-xl font-semibold">
            {selectedHistoryItem.skill_match}%
          </h3>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-[#6B6558]">Experience Match</p>
          <h3 className="mt-1 text-xl font-semibold">
            {selectedHistoryItem.experience_match}%
          </h3>
        </div>

        <div className="rounded-xl border p-4">
          <p className="text-xs text-[#6B6558]">Education Match</p>
          <h3 className="mt-1 text-xl font-semibold">
            {selectedHistoryItem.education_match}%
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#1C1B18]">
            ✅ Matched Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {(selectedHistoryItem.matched_skills || []).map(
              (skill: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>

        <div className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold text-[#1C1B18]">
            ❌ Missing Skills
          </h3>

          <div className="flex flex-wrap gap-2">
            {(selectedHistoryItem.missing_skills || []).map(
              (skill: string, index: number) => (
                <span
                  key={index}
                  className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700"
                >
                  {skill}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#1C1B18]">
          💪 Strengths
        </h3>

        <ul className="space-y-2">
          {(selectedHistoryItem.strengths || []).map(
            (strength: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-[#444]"
              >
                <span className="mt-1 text-green-600">✔</span>
                {strength}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h3 className="mb-3 text-sm font-semibold text-[#1C1B18]">
          ⚠ Weaknesses
        </h3>

        <ul className="space-y-2">
          {(selectedHistoryItem.weaknesses || []).map(
            (item: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-[#444]"
              >
                <span className="mt-1 text-amber-500">•</span>
                {item}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="mt-6 rounded-xl border p-4">
        <h3 className="mb-4 text-sm font-semibold text-[#1C1B18]">
          🎤 Suggested Interview Questions
        </h3>

        <div className="space-y-3">
          {selectedHistoryItem.interview_questions?.length ? (
            selectedHistoryItem.interview_questions.map(
              (question: string, index: number) => (
                <div
                  key={index}
                  className="rounded-lg border border-[#EDEAE0] bg-[#FAF9F6] p-3"
                >
                  <span className="mr-2 font-semibold text-[#3730A3]">
                    Q{index + 1}.
                  </span>

                  <span className="text-sm text-[#444]">
                    {question}
                  </span>
                </div>
              )
            )
          ) : (
            <p className="text-sm text-[#8A8477]">
              No interview questions were saved for this report.
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}