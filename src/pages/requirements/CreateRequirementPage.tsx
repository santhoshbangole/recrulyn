import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { GlassCard } from "../../components/ui/GlassCard";
import { PageHeader } from "../../components/ui/PageHeader";
import { useNotification } from "../../components/notification/useNotification";
import { requirementService } from "../../modules/requirements/services/requirement.service";
import { DepartmentSelect } from "../../components/forms/DepartmentSelect";
import { recrulynExtractorService } from "../../modules/recrulyn/services/recrulyn-extractor.service";

export default function CreateRequirementPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const notify = useNotification();
  const jdUploadRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    department: "",
    description: "",
    vacancies: 1,
    work_mode: "Remote",
    duration: "3 Months",
    employment_type: "Internship",
    location: "",
  });

  async function handleJDUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setExtracting(true);
      const extracted = await recrulynExtractorService.extractText(file);
      if (!extracted.resumeText?.trim()) {
        notify.error("Could not extract text from this Job Description file.");
        return;
      }

      const text = extracted.resumeText.trim();
      setJdFile(file);
      setForm((prev) => ({
        ...prev,
        description: text,
        title:
          prev.title.trim() ||
          file.name.replace(/\.(pdf|docx?|txt)$/i, "").replace(/[_-]+/g, " "),
      }));
      notify.success("Job Description uploaded", file.name);
    } catch (error) {
      console.error(error);
      notify.error("Unable to read Job Description file.");
    } finally {
      setExtracting(false);
      e.target.value = "";
    }
  }

  function clearJDFile() {
    setJdFile(null);
    if (jdUploadRef.current) jdUploadRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await requirementService.createRequirement({
        ...form,
        job_description: form.description,
        jd_file_name: jdFile?.name || null,
        created_by: profile?.id,
        created_by_name: profile?.full_name,
        created_by_role: profile?.role_name,
      });
      notify.success("Requirement created", `${form.title} is now an open role.`);
      navigate("/app/requirements");
    } catch (error: any) {
      console.error(error);
      notify.error("Could not create requirement", error?.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-[#E8EDF2] bg-white p-3 text-sm";

  return (
    <div className="space-y-8 p-2">
      <PageHeader
        eyebrow="Hiring Requirements"
        title="Create Requirement"
        description="Open a role with department, work mode, and hiring details."
      />

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Job title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                placeholder="Frontend Intern"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Department</label>
              <DepartmentSelect
                value={form.department}
                onChange={(department) => setForm({ ...form, department })}
                className={fieldClass}
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium">Job description</label>
              <button
                type="button"
                onClick={() => jdUploadRef.current?.click()}
                disabled={extracting}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F5C36]/25 bg-[#1F5C36]/5 px-3 py-1.5 text-xs font-semibold text-[#1F5C36] disabled:opacity-60"
              >
                <Upload size={14} />
                {extracting ? "Reading file..." : "Upload PDF"}
              </button>
            </div>
            <input
              ref={jdUploadRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              hidden
              onChange={handleJDUpload}
            />
            {jdFile && (
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#1F5C36]/20 bg-[#1F5C36]/[0.04] px-3 py-2.5">
                <p className="truncate text-sm font-medium text-[#1C1B18]">
                  {jdFile.name}
                </p>
                <button
                  type="button"
                  onClick={clearJDFile}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E8EDF2] bg-white px-2 py-1 text-xs text-[#6B6558]"
                >
                  <X size={12} />
                  Clear file
                </button>
              </div>
            )}
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={6}
              className={fieldClass}
              placeholder="Upload a PDF/DOCX/TXT job description, or type the role scope, skills, and outcomes..."
            />
            <p className="mt-1.5 text-xs text-[#6B7280]">
              Upload a JD file to fill this field automatically. The extracted text is used for AI matching.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Vacancies</label>
              <input
                type="number"
                min={1}
                value={form.vacancies}
                onChange={(e) => setForm({ ...form, vacancies: Number(e.target.value) })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Work mode</label>
              <select
                value={form.work_mode}
                onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                className={fieldClass}
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Duration</label>
              <input
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Employment type</label>
              <select
                value={form.employment_type}
                onChange={(e) => setForm({ ...form, employment_type: e.target.value })}
                className={fieldClass}
              >
                <option>Internship</option>
                <option>Full Time</option>
                <option>Contract</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={fieldClass}
              placeholder="Chennai / Remote"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/app/requirements")}
              className="flex items-center gap-2 rounded-xl border border-[#E8EDF2] bg-white px-5 py-3 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-[#1F5C36] px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
            >
              <Save size={16} />
              {loading ? "Creating..." : "Create Requirement"}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
