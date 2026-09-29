import { useState } from "react";
import { Link } from "react-router-dom";

import {
  UploadCloud,
  Sparkles,
  User,
  Star,
  FileText,
  Clipboard,
  Loader2,
  CheckCircle2,
  XCircle,
  Brain,
  MessageSquareText,
  GraduationCap,
  HeartHandshake,
  Gauge,
  Target,
  Award,
  AlertTriangle,
  Mail,
  Phone,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import { useNotification } from "../../components/notification/useNotification";

import { recrulynExtractorService } from "../../modules/recrulyn/services/recrulyn-extractor.service";
import { geminiResumeParserService } from "../../modules/recrulyn/services/geminiResumeParser.service";

/* ------------------------------------------------------------------ */
/* Small presentational helpers (pure UI, no state/logic of their own) */
/* ------------------------------------------------------------------ */

function ScoreRing({
  value,
  label,
  size = 108,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value || 0));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? "#16a34a" : clamped >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#eef0ec"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#1b1c19]">
            {Math.round(clamped)}
            <span className="text-sm font-semibold text-[#8a8a86]">%</span>
          </span>
        </div>
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8a86]">
        {label}
      </p>
    </div>
  );
}

function RatingBar({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const clamped = Math.max(0, Math.min(10, Number(value) || 0));
  const pct = (clamped / 10) * 100;

  return (
    <div className="rounded-xl border border-[#e9e6df] bg-white p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-14px_rgba(20,20,15,0.2)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[#6b6b66]">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#f4f2ea] text-[#3f6b45]">
            {icon}
          </span>
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em]">
            {label}
          </p>
        </div>
        <span className="text-sm font-bold text-[#1b1c19]">
          {clamped}
          <span className="text-[10px] font-medium text-[#a3a39d]">/10</span>
        </span>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#eef0ec]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#3f6b45] to-[#6fae74] transition-all duration-1000 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Panel({
  title,
  icon,
  accent = "neutral",
  className = "",
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: "neutral" | "green" | "red" | "blue";
  className?: string;
  children: React.ReactNode;
}) {
  const accentText =
    accent === "green"
      ? "text-[#3f6b45]"
      : accent === "red"
      ? "text-red-600"
      : accent === "blue"
      ? "text-[#2f5aa8]"
      : "text-[#8a8a86]";

  return (
    <div
      className={`rounded-2xl border border-[#e9e6df] bg-white p-4 shadow-[0_1px_2px_rgba(20,20,15,0.04)] transition-shadow duration-300 hover:shadow-[0_10px_24px_-16px_rgba(20,20,15,0.16)] ${className}`}
    >
      <div
        className={`mb-3 flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] ${accentText}`}
      >
        {icon}
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ResumeDemoPage() {
  const notify = useNotification();

  const [loading, setLoading] = useState(false);

  const [parsed, setParsed] = useState(false);

  const [parsedData, setParsedData] = useState<any>(null);

  const [jdText, setJdText] = useState("");

  const [jdFile, setJdFile] = useState<File | null>(null);

  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleJDUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      const extracted =
        await recrulynExtractorService.extractText(file);

      setJdText(extracted.resumeText);

      setJdFile(file);

      notify.success("Job Description uploaded.");
    } catch (err) {
      console.error(err);

      notify.error("Unable to read Job Description.");
    }
  };

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    setLoading(true);

    try {
      // Currently parse only first resume
      // (Next step we'll parse all resumes & ZIP)

      const file = files[0];

      setResumeFile(file);

      const extracted =
        await recrulynExtractorService.extractText(file);

      const parsed =
        await geminiResumeParserService.parseResume(
          extracted.resumeText,
          jdText
        );

      setParsedData(parsed);

      setParsed(true);

      notify.success(
        `${files.length} file(s) uploaded successfully.`
      );
    } catch (err) {
      console.error(err);

      notify.error("Resume parsing failed.");
    } finally {
      setLoading(false);
    }
  };

  const processingSteps = [
    "Uploading Resume",
    "Reading Document",
    "Extracting Text",
    "AI Resume Parsing",
    "Generating Candidate Profile",
    "Calculating Resume Score",
  ];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gradient-to-b from-[#fbf9f4] via-[#faf8f2] to-[#f6f4ec] pt-20">
        <section className="mx-auto max-w-[1440px] px-6 py-10">
          {/* Compact header */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white/70 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#775a19] backdrop-blur-sm">
              <Sparkles size={12} />
              LIVE AI RECRUITMENT DEMO
            </span>

            <h1 className="mt-4 font-display text-[38px] leading-[1.05] text-[#1b1c19]">
              AI Resume Intelligence{" "}
              <span className="bg-gradient-to-r from-[#3f6b45] via-[#4f8a56] to-[#6fae74] bg-clip-text text-transparent">
                &amp; Candidate Matching
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-xl text-[15px] leading-6 text-[#5c5c58]">
              Upload a Job Description and Resume to
              experience enterprise-grade AI recruitment.
            </p>
          </div>

          {/* Main dashboard: narrow input rail + wide results canvas */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
            {/* LEFT: compact input rail */}
            <div className="space-y-5 rounded-[24px] border border-[#e9e6df] bg-white/90 p-6 shadow-[0_16px_44px_-28px_rgba(20,20,15,0.25)] backdrop-blur-sm xl:sticky xl:top-24 xl:self-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3f6b45] text-xs font-bold text-white">
                    1
                  </span>
                  <h2 className="text-base font-semibold text-[#1b1c19]">
                    Job Description
                  </h2>
                </div>

                <textarea
                  rows={4}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste Job Description here..."
                  className="mt-3 w-full resize-none rounded-xl border border-[#e2ded4] bg-[#fdfcf9] p-3.5 text-[13px] leading-6 text-[#1b1c19] outline-none transition-colors duration-200 placeholder:text-[#a3a39d] focus:border-[#3f6b45] focus:bg-white focus:ring-4 focus:ring-[#3f6b45]/10"
                />

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e9e6df]" />
                  <span className="text-[10px] uppercase tracking-[0.28em] text-[#a3a39d]">
                    OR
                  </span>
                  <div className="h-px flex-1 bg-[#e9e6df]" />
                </div>

                <input
                  id="jd-upload"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  hidden
                  onChange={handleJDUpload}
                />

                <label
                  htmlFor="jd-upload"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#d8d4c8] bg-[#fdfcf9] p-3.5 text-[13px] text-[#5c5c58] transition-all duration-200 hover:border-[#3f6b45] hover:bg-[#f4f2ea] hover:text-[#1b1c19]"
                >
                  <Clipboard size={16} />
                  Upload JD (PDF / DOCX / TXT)
                </label>

                {jdFile && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#dcefdd] bg-[#f2f8f2] p-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <FileText className="text-[#3f6b45]" size={16} />
                    <p className="truncate text-[13px] font-medium text-[#1b1c19]">
                      {jdFile.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-[#e9e6df] pt-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#3f6b45] text-xs font-bold text-white">
                    2
                  </span>
                  <h2 className="text-base font-semibold text-[#1b1c19]">
                    Upload Resume
                  </h2>
                </div>

                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.zip"
                  multiple
                  hidden
                  onChange={handleUpload}
                />

                <label
                  htmlFor="resume-upload"
                  className="group mt-3 flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-[#d8d4c8] bg-[#fdfcf9] py-8 text-center transition-all duration-200 hover:border-[#3f6b45] hover:bg-[#f4f2ea]"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ea] text-[#3f6b45] transition-transform duration-300 group-hover:scale-110">
                    <UploadCloud size={22} />
                  </span>

                  <div>
                    <h3 className="text-[15px] font-semibold text-[#1b1c19]">
                      Upload Resume
                    </h3>

                    <p className="mt-1 text-[12px] text-[#8a8a86]">
                      PDF • DOC • DOCX • ZIP · Single or Bulk
                    </p>
                  </div>
                </label>

                {resumeFile && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#dcefdd] bg-[#f2f8f2] p-3 animate-in fade-in slide-in-from-top-1 duration-300">
                    <FileText className="text-[#3f6b45]" size={16} />
                    <p className="truncate text-[13px] font-semibold text-[#3f6b45]">
                      {resumeFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: results canvas */}
            <div className="rounded-[24px] border border-[#e9e6df] bg-white/60 p-6 shadow-[0_16px_44px_-28px_rgba(20,20,15,0.2)] backdrop-blur-sm">
              {loading ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-[#3f6b45]/10" />
                    <span className="absolute inset-2 animate-pulse rounded-full bg-[#3f6b45]/10" />
                    <Loader2
                      size={38}
                      className="relative animate-spin text-[#3f6b45]"
                    />
                  </div>

                  <h2 className="mt-6 text-2xl font-bold text-[#1b1c19]">
                    AI Processing...
                  </h2>
                  <p className="mt-1 text-sm text-[#8a8a86]">
                    Sit tight — this usually takes a few seconds.
                  </p>

                  <div className="mt-8 grid w-full max-w-xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                    {processingSteps.map((step, i) => (
                      <div
                        key={step}
                        className="flex items-center gap-2"
                        style={{
                          animation: `fadeInStep 0.5s ease ${i * 0.3}s both`,
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-[#3f6b45]"
                        />
                        <span className="text-[13px] text-[#3c3c38]">
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>

                  <style>{`
                    @keyframes fadeInStep {
                      from { opacity: 0; transform: translateY(6px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                  `}</style>
                </div>
              ) : !parsed ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#f4f2ea] to-[#eef0ec]">
                      <Star size={34} className="text-[#c7c4b8]" />
                    </div>

                    <h2 className="mt-6 text-2xl font-bold text-[#1b1c19]">
                      Waiting for Resume
                    </h2>

                    <p className="mx-auto mt-3 max-w-xs text-sm text-[#8a8a86]">
                      Upload a Job Description and Resume
                      to generate AI insights.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Top strip: candidate header + scores + hire recommendation */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr_0.9fr]">
                    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[#3f6b45] to-[#2c4f31] p-5 text-white shadow-[0_16px_36px_-16px_rgba(63,107,69,0.55)]">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
                        <User size={26} />
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-bold">
                          {parsedData?.candidate?.candidateName ||
                            "Unknown"}
                        </h2>

                        <div className="mt-1.5 flex flex-col gap-0.5 text-[12.5px] text-white/80">
                          {parsedData?.candidate?.email && (
                            <span className="flex items-center gap-1.5 truncate">
                              <Mail size={12} />
                              {parsedData.candidate.email}
                            </span>
                          )}
                          {parsedData?.candidate?.phone && (
                            <span className="flex items-center gap-1.5">
                              <Phone size={12} />
                              {parsedData.candidate.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-around rounded-2xl border border-[#e9e6df] bg-[#fdfcf9] px-4 py-3">
                      <ScoreRing
                        value={parsedData?.analysis?.resumeScore ?? 0}
                        label="Resume"
                      />
                      <ScoreRing
                        value={parsedData?.analysis?.jdMatchScore ?? 0}
                        label="JD Match"
                      />
                    </div>

                    <div className="flex flex-col justify-center rounded-2xl border border-[#dcefdd] bg-[#f2f8f2] p-5">
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#3f6b45]">
                        <Award size={14} />
                        <span>Hire Recommendation</span>
                      </div>
                      <h2 className="mt-2 text-xl font-bold text-[#3f6b45]">
                        {parsedData?.analysis?.hireRecommendation || "N/A"}
                      </h2>
                    </div>
                  </div>

                  {/* Middle: skills + summary + interview questions in a 3-col masonry-ish grid */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Panel title="Skills" icon={<Target size={13} />}>
                      <div className="flex flex-wrap gap-1.5">
                        {(parsedData?.analysis?.matchedSkills || []).map(
                          (skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-full bg-[#f4f2ea] px-2.5 py-1 text-[12px] font-medium text-[#3f6b45] transition-transform duration-150 hover:-translate-y-0.5"
                            >
                              <CheckCircle2 size={11} />
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </Panel>

                    <Panel
                      title="Matched Skills"
                      icon={<CheckCircle2 size={13} />}
                      accent="green"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {(parsedData?.candidate?.skills || [])
                          .slice(0, 8)
                          .map((skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-full bg-[#eef6ee] px-2.5 py-1 text-[12px] font-medium text-[#3f6b45] transition-transform duration-150 hover:-translate-y-0.5"
                            >
                              <CheckCircle2 size={11} />
                              {skill}
                            </span>
                          ))}
                      </div>
                    </Panel>

                    <Panel
                      title="Missing Skills"
                      icon={<XCircle size={13} />}
                      accent="red"
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {(parsedData?.analysis?.missingSkills || []).map(
                          (skill: string) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[12px] font-medium text-red-700 transition-transform duration-150 hover:-translate-y-0.5"
                            >
                              <XCircle size={11} />
                              {skill}
                            </span>
                          )
                        )}
                      </div>
                    </Panel>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <Panel
                      title="AI Summary"
                      icon={<Brain size={13} />}
                      className="lg:col-span-1"
                    >
                      <p className="text-[13px] leading-6 text-[#3c3c38]">
                        {parsedData?.analysis?.careerSummary ||
                          "No summary available."}
                      </p>
                    </Panel>

                    <Panel
                      title="Candidate Strengths"
                      icon={<CheckCircle2 size={13} />}
                      accent="green"
                    >
                      <ul className="space-y-1.5">
                        {(parsedData?.analysis?.strengths || []).map(
                          (item: string) => (
                            <li
                              key={item}
                              className="flex items-start gap-1.5"
                            >
                              <CheckCircle2
                                size={14}
                                className="mt-0.5 shrink-0 text-[#3f6b45]"
                              />
                              <span className="text-[13px] leading-5 text-[#3c3c38]">
                                {item}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </Panel>

                    <Panel
                      title="Missing Skills / Weaknesses"
                      icon={<AlertTriangle size={13} />}
                      accent="red"
                    >
                      <ul className="space-y-1.5">
                        {(parsedData?.analysis?.weaknesses || []).map(
                          (item: string) => (
                            <li
                              key={item}
                              className="flex items-start gap-1.5"
                            >
                              <XCircle
                                size={14}
                                className="mt-0.5 shrink-0 text-red-500"
                              />
                              <span className="text-[13px] leading-5 text-[#3c3c38]">
                                {item}
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    </Panel>
                  </div>

                  {/* Ratings row */}
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <RatingBar
                      icon={<Gauge size={14} />}
                      label="Technical"
                      value={parsedData?.analysis?.technicalRating ?? 0}
                    />
                    <RatingBar
                      icon={<MessageSquareText size={14} />}
                      label="Communication"
                      value={parsedData?.analysis?.communicationRating ?? 0}
                    />
                    <RatingBar
                      icon={<GraduationCap size={14} />}
                      label="Learning"
                      value={parsedData?.analysis?.learningPotential ?? 0}
                    />
                    <RatingBar
                      icon={<HeartHandshake size={14} />}
                      label="Culture Fit"
                      value={parsedData?.analysis?.cultureFit ?? 0}
                    />
                  </div>

                  {/* Interview questions: full width, 2-col */}
                  <Panel
                    title="AI Interview Questions"
                    icon={<Sparkles size={13} />}
                    accent="blue"
                  >
                    <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(parsedData?.analysis?.interviewQuestions || []).map(
                        (q: string, idx: number) => (
                          <li
                            key={q}
                            className="flex items-start gap-2 rounded-lg bg-[#f6f8fc] p-2.5"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2f5aa8] text-[10px] font-bold text-white">
                              {idx + 1}
                            </span>
                            <span className="text-[13px] leading-5 text-[#3c3c38]">
                              {q}
                            </span>
                          </li>
                        )
                      )}
                    </ol>
                  </Panel>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= ENTERPRISE CTA ================= */}
        <section className="mt-14 rounded-[36px] bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] px-10 py-16 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <span className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.35em]">
                RECRULYN ENTERPRISE
              </span>

              <h2 className="mt-6 font-display text-[42px] leading-tight">
                This is just the beginning.
              </h2>

              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
                Experience enterprise AI recruitment with
                intelligent resume parsing,
                candidate ranking,
                JD matching,
                automated document generation,
                interview workflows,
                analytics
                and complete HR management.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-green-400">95%</h3>
                <p className="mt-2 text-sm text-slate-300">Faster Screening</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-green-400">AI</h3>
                <p className="mt-2 text-sm text-slate-300">Candidate Ranking</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-green-400">100%</h3>
                <p className="mt-2 text-sm text-slate-300">Automated Workflow</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                <h3 className="text-4xl font-bold text-green-400">ATS</h3>
                <p className="mt-2 text-sm text-slate-300">Enterprise Ready</p>
              </div>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-green-600 px-8 py-4 text-base font-semibold shadow-[0_16px_36px_-16px_rgba(22,163,74,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-700"
              >
                Try Our Workspace
              </Link>

              <Link
                to="/solutions"
                className="rounded-xl border border-white/20 px-8 py-4 text-base transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black"
              >
                Explore More Solutions
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}