import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  User,
  Mail,
  Type,
  FileText,
  Eye,
  Copy,
  Check,
  X,
} from "lucide-react";
import { supabase } from "../../services/supabase/client";
import { useNotification } from "../../components/notification/useNotification";
export default function EmailTemplatesPage() {
  const [templates, setTemplates] =
    useState<any[]>([]);

  const [_selectedTemplate, setSelectedTemplate] =
    useState<any>(null);

  const [subject, setSubject] =
    useState("");
const [candidate, setCandidate] =
  useState<any>(null);

const [candidates, setCandidates] =
  useState<any[]>([]);
  const [content, setContent] =
    useState("");
const notify = useNotification();
  // --- UI-only state (added for redesign; does not touch existing logic) ---
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
  loadTemplates();
  loadCandidates();
}, []);

  async function loadTemplates() {
    const { data } =
      await supabase
        .from("recrulyn_email_templates")
        .select("*")
        .order("template_name");

    setTemplates(data || []);
  }

  function handleTemplateChange(
    templateId: string
  ) {
    const template =
      templates.find(
        (t) => t.id === templateId
      );

    if (!template) return;

    setSelectedTemplate(template);

    setSubject(
      template.subject || ""
    );

    let generated =
  template.content || "";

if (candidate) {
  generated =
    generated
      .replaceAll(
        "{{candidate_name}}",
        candidate.candidate_name || ""
      )
      .replaceAll(
        "{{email}}",
        candidate.email || ""
      )
      .replaceAll(
        "{{phone}}",
        candidate.phone || ""
      )
      .replaceAll(
        "{{skills}}",
        candidate.skills || ""
      )
      .replaceAll(
        "{{education}}",
        candidate.education || ""
      );
}

setContent(generated);
  }

  function copyContent() {
    navigator.clipboard.writeText(
      `Subject: ${subject}\n\n${content}`
    );

   notify.success(
  "Copied",
  "Email copied to clipboard."
);

    // UI-only feedback, does not alter existing behavior above
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  async function loadCandidates() {
  const { data, error } =
    await supabase
      .from("recrulyn_resume_index")
      .select("*")
      .order("candidate_name");

  if (error) {
    console.error(error);
    return;
  }

  setCandidates(data || []);
}

  return (
    <div className="min-h-screen bg-[#F6F6FB] px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-signal-violet transition-colors hover:text-signal-violet/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Candidates
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Email Templates
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Send personalized emails to candidates using our templates.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
          className="mt-7 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm"
        >
          {/* Select Candidate */}
          <FieldRow
            icon={<User className="h-[18px] w-[18px]" />}
            title="Select Candidate"
            description="Choose the candidate you want to email"
          >
            <select
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-colors focus:border-signal-violet focus:ring-2 focus:ring-signal-violet/15"
              onChange={(e) => {
                const selected =
                  candidates.find(
                    (c) =>
                      c.id ===
                      e.target.value
                  );

                setCandidate(selected);
              }}
            >
              <option>
                Select Candidate
              </option>

              {candidates.map(
                (candidate) => (
                  <option
                    key={candidate.id}
                    value={candidate.id}
                  >
                    {candidate.candidate_name}
                  </option>
                )
              )}
            </select>
          </FieldRow>

          {/* Select Template */}
          <FieldRow
            icon={<Mail className="h-[18px] w-[18px]" />}
            title="Select Template"
            description="Choose from your email templates"
          >
            <select
              onChange={(e) =>
                handleTemplateChange(
                  e.target.value
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-colors focus:border-signal-violet focus:ring-2 focus:ring-signal-violet/15"
            >
              <option>
                Select Template
              </option>

              {templates.map(
                (template) => (
                  <option
                    key={template.id}
                    value={template.id}
                  >
                    {template.template_name}
                  </option>
                )
              )}
            </select>
          </FieldRow>

          {/* Subject */}
          <FieldRow
            icon={<Type className="h-[18px] w-[18px]" />}
            title="Subject"
            description="Add a subject for your email"
          >
            <input
              value={subject}
              onChange={(e) =>
                setSubject(
                  e.target.value
                )
              }
              placeholder="Enter email subject"
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-signal-violet focus:ring-2 focus:ring-signal-violet/15"
            />
          </FieldRow>

          {/* Email Content */}
          <FieldRow
            icon={<FileText className="h-[18px] w-[18px]" />}
            title="Email Content"
            description="Edit your email content"
            last
          >
            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              placeholder="Type your email content here..."
              className="h-[420px] w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-signal-violet focus:ring-2 focus:ring-signal-violet/15"
            />
          </FieldRow>
        </motion.div>

        {/* Action bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="mt-5 flex items-center justify-between"
        >
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-signal-violet shadow-sm transition-all hover:border-signal-violet/40 hover:shadow"
          >
            <Eye className="h-4 w-4" />
            Preview Email
          </button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={copyContent}
            className="inline-flex items-center gap-2 rounded-xl bg-signal-violet px-5 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-signal-violet/90"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Email
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>

      {/* Preview modal (UI-only addition, reads existing subject/content state) */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-semibold text-slate-900">
                  Email Preview
                </h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Subject
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {subject || "—"}
                </p>

                <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Content
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {content || "—"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Presentational-only helper component for the redesigned layout.
 * Mirrors the reference's icon + title/description + control row pattern.
 * Does not contain any business logic, state, or service calls.
 */
function FieldRow({
  icon,
  title,
  description,
  children,
  last,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-4 px-6 py-6 sm:flex-row sm:items-start sm:gap-8 ${
        last ? "" : "border-b border-slate-100"
      }`}
    >
      <div className="flex w-full shrink-0 items-start gap-3 sm:w-64">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-violet/10 text-signal-violet">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}