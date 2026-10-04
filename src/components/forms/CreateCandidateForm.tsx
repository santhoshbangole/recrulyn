import { useEffect, useRef, useState } from "react";
import { requirementService } from "../../modules/requirements/services/requirement.service";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { DepartmentSelect } from "../../components/forms/DepartmentSelect";
import { recrulynUploadService } from "../../modules/recrulyn/services/recrulyn-upload.service";
import { profileService } from "../../modules/recrulyn/services/profile.service";
import { recrulynExtractorService } from "../../modules/recrulyn/services/recrulyn-extractor.service";
import { geminiResumeParserService } from "../../modules/recrulyn/services/geminiResumeParser.service";
import { useNotification } from "../../components/notification/useNotification";
type Priority = "medium" | "high" | "critical";
type Mode = "none" | "manual" | "single" | "multiple";
export default function CreateCandidateForm({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("none");
  const notify = useNotification();
  // Manual form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [appliedRole, setAppliedRole] = useState("");
  const [requirementId, setRequirementId] = useState("");
  const [source, setSource] = useState("Manual");
  const [experience, setExperience] = useState("Fresher");
  const [priority, setPriority] = useState<Priority>("medium");
  const [expectedJoining, setExpectedJoining] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [manager, setManager] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [uploading, setUploading] = useState(false);

  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    async function loadRequirements() {
      const data = await requirementService.getRequirements();
      setRequirements(data || []);
    }
    loadRequirements();
  }, []);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    try {
      setLoading(true);
      await candidateService.createCandidate({
        full_name: fullName,
        email,
        phone,
        source: source || "Manual",
        job_id: requirementId || undefined,
        job_title: jobTitle || appliedRole,
        project_title: projectTitle,
        department,
        supervisor,
        manager,
        joining_date: expectedJoining,
      });
      notify.success(
        "Candidate Created",
        "Candidate has been added successfully.",
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setAppliedRole("");
      setRequirementId("");
      setSource("Manual");
      setExperience("Fresher");
      setPriority("medium");
      setExpectedJoining("");
      setNotes("");
      setProjectTitle("");
      setJobTitle("");
      setDepartment("");
      setSupervisor("");
      setManager("");
      window.location.reload();
    } catch (error) {
      console.error(error);
      notify.error("Failed to create candidate");
    } finally {
      setLoading(false);
    }
  }
  function getBestResumeUrl(
    text: string,
    type: "linkedin" | "portfolio",
  ): string {
    const urls = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];

    const cleaned = urls
      .map((url) => url.replace(/[),.;]+$/, ""))
      .filter((url) => {
        const lower = url.toLowerCase();

        if (type === "linkedin") {
          return lower.includes("linkedin.com/");
        }

        return (
          !lower.includes("linkedin.com/") &&
          !lower.includes("github.com/") &&
          (lower.includes(".netlify.app") ||
            lower.includes(".vercel.app") ||
            lower.includes(".github.io") ||
            (!lower.includes("facebook.com/") &&
              !lower.includes("instagram.com/") &&
              !lower.includes("twitter.com/") &&
              !lower.includes("x.com/")))
        );
      });

    return cleaned.sort((a, b) => b.length - a.length)[0] || "";
  }
  async function handleSingleUpload() {
    if (uploading) return;
    if (!selectedFile) {
      notify.warning("Please select a resume.");
      return;
    }

    try {
      setUploading(true);

      // Parse locally first (works even when Supabase storage is down)
      const extracted =
        await recrulynExtractorService.extractText(selectedFile);

      const parsed = await geminiResumeParserService.parseResume(
        extracted.resumeText,
      );

      console.log("GEMINI:", parsed);
      const resumeEmail =
        parsed?.candidate?.email ||
        extracted.resumeText.match(
          /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
        )?.[0] ||
        "";

      // Prefer complete URLs found directly in the resume text.
      const resumeLinkedIn = getBestResumeUrl(extracted.resumeText, "linkedin");

      const resumePortfolio = getBestResumeUrl(
        extracted.resumeText,
        "portfolio",
      );

      if (resumeLinkedIn) {
        parsed.candidate.linkedin = resumeLinkedIn;
      }

      if (resumePortfolio) {
        parsed.candidate.portfolio = resumePortfolio;
      }

      console.log("FINAL RESUME LINKS:", {
        linkedin: parsed.candidate.linkedin,
        portfolio: parsed.candidate.portfolio,
      });

      if (!parsed?.candidate?.candidateName) {
        parsed.candidate = {
          ...(parsed.candidate || {}),
          candidateName: selectedFile.name
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " "),
        };
      }

      // Upload resume (falls back to local blob URL offline)
      const resumeUrl = await recrulynUploadService.uploadFile(selectedFile);

      // Create candidate using extracted details
      const candidate = await candidateService.createCandidate({
        full_name: parsed.candidate.candidateName,
        email: resumeEmail || `candidate-${Date.now()}@temp.reude`,
        phone: parsed.candidate.phone || "",
        source: "Resume Upload",
        job_id: requirementId || undefined,
        job_title: jobTitle || appliedRole,
        linkedin: parsed.candidate.linkedin || "",
        github: parsed.candidate.github || "",
        portfolio: parsed.candidate.portfolio || "",
      });

      await candidateService.attachExistingResume(
        candidate.id,
        resumeUrl,
        selectedFile.name,
      );

      await profileService.createProfile({
        candidate_id: candidate.id,
        resume_text: extracted.resumeText,
        skills: JSON.stringify(parsed.candidate.skills),
        education: JSON.stringify(parsed.candidate.education),
        experience: JSON.stringify(parsed.candidate.experience),
        projects: JSON.stringify(parsed.candidate.projects),
        certifications: JSON.stringify(parsed.candidate.certifications),
      });

      // parseResume() already computed career level, domain, recommended
      // role, current company/designation, experience, and a career
      // summary — persist it now, or the AI Insights tab has nothing to
      // show for these fields until (if ever) something else writes them.
      await profileService.updateProfileEnrichment(
        candidate.id,
        parsed.analysis,
      );

      notify.success("Candidate created successfully.");
      setSelectedFile(null);

      if (singleFileInputRef.current) {
        singleFileInputRef.current.value = "";
      }

      onClose?.();
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message ?? "Failed to process resume.");
    } finally {
      setUploading(false);
    }
  }
  async function handleBulkUpload() {
    if (selectedFiles.length === 0) {
      notify.warning("Please select one or more resumes.");
      return;
    }

    try {
      setUploading(true);

      for (const file of selectedFiles) {
        const extracted = await recrulynExtractorService.extractText(file);
        console.log(
          "EXTRACTED RESUME TEXT:",
          extracted.resumeText?.substring(0, 1000),
        );
        console.log("EXTRACTED RESUME LENGTH:", extracted.resumeText?.length);

        if (!extracted.resumeText.trim()) {
          console.log("Skipping empty resume:", file.name);
          continue;
        }

        const resumeUrl = await recrulynUploadService.uploadFile(file);

        const parsed = await geminiResumeParserService.parseResume(
          extracted.resumeText,
        );

        const resumeEmail =
          parsed?.candidate?.email ||
          extracted.resumeText.match(
            /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
          )?.[0] ||
          "";

        let candidate;

        try {
          candidate = await candidateService.createCandidate({
            full_name: parsed.candidate.candidateName,
            email: resumeEmail || `candidate-${Date.now()}@temp.reude`,
            phone: parsed.candidate.phone || "",
            source: "Bulk Resume Upload",
            job_id: requirementId || undefined,
            job_title: jobTitle || appliedRole,

            linkedin: parsed.candidate.linkedin || "",
            github: parsed.candidate.github || "",
            portfolio: parsed.candidate.portfolio || "",
          });
        } catch (err: any) {
          if (err.message?.includes("Candidate already exists")) {
            console.log("Skipping duplicate:", parsed.candidate.email);
            continue;
          }

          throw err;
        }

        await candidateService.attachExistingResume(
          candidate.id,
          resumeUrl,
          file.name,
        );

        await profileService.createProfile({
          candidate_id: candidate.id,
          resume_text: extracted.resumeText,
          skills: JSON.stringify(parsed.candidate.skills),
          education: JSON.stringify(parsed.candidate.education),
          experience: JSON.stringify(parsed.candidate.experience),
          projects: JSON.stringify(parsed.candidate.projects),
          certifications: JSON.stringify(parsed.candidate.certifications),
        });

        await profileService.updateProfileEnrichment(
          candidate.id,
          parsed.analysis,
        );
      }

      notify.success("Bulk upload completed successfully.");
      setSelectedFiles([]);

      if (bulkFileInputRef.current) {
        bulkFileInputRef.current.value = "";
      }

      onClose?.();

      window.location.reload();
    } catch (err) {
      console.error(err);
      notify.error("Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  }
  const priorityConfig: Record<Priority, { label: string; active: string }> = {
    medium: {
      label: "Medium",
      active: "bg-emerald-50 border-emerald-600 text-emerald-900",
    },
    high: {
      label: "High",
      active: "bg-amber-50 border-amber-500 text-amber-900",
    },
    critical: {
      label: "Critical",
      active: "bg-red-50 border-red-400 text-red-900",
    },
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        background: "#EEEBE3",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Topbar ── */}
      <div
        className="flex items-center justify-between px-7 sticky top-0 z-10"
        style={{
          height: 56,
          background: "#EEEBE3",
          borderBottom: "1px solid #D8D3C8",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center text-white font-bold text-sm rounded-lg flex-shrink-0"
            style={{
              width: 32,
              height: 32,
              background: "#1F3D2B",
              fontSize: 13,
              letterSpacing: "0.5px",
            }}
          >
            R
          </div>
          <span style={{ fontSize: 13, color: "#3A3530", fontWeight: 500 }}>
            RECRULYN &nbsp;
            <span style={{ color: "#7A7367", fontWeight: 400 }}>/</span>&nbsp;
            Add Candidate
          </span>
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="flex items-center gap-1.5 rounded-md transition-colors"
          style={{
            padding: "5px 12px",
            fontSize: 12,
            color: "#5A5650",
            border: "1px solid #C8C3B8",
            background: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#E4E0D8";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "none";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          Close
        </button>
      </div>

      {/* ── MODE SELECTOR ── */}
      {mode === "none" && (
        <div className="px-7 py-10">
          <div
            className="flex items-center gap-1.5 mb-2"
            style={{
              fontSize: 10,
              letterSpacing: "1.5px",
              color: "#1F7A52",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#1F7A52",
                display: "inline-block",
              }}
            />
            Candidate Management
          </div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: "#1A1815",
              lineHeight: 1.2,
              marginBottom: 6,
            }}
          >
            Add Candidate
          </h1>
          <p style={{ fontSize: 13, color: "#7A7367", marginBottom: 32 }}>
            Choose how you want to add candidates to the pipeline.
          </p>

          <div
            className="grid gap-3.5"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            {[
              {
                key: "manual",
                icon: <UserPlusIcon />,
                title: "Manual Entry",
                desc: "Enter candidate details directly into the pipeline.",
              },
              {
                key: "single",
                icon: <FileUpIcon />,
                title: "Single Resume",
                desc: "Upload one resume and create one candidate profile.",
              },
              {
                key: "multiple",
                icon: <FilesIcon />,
                title: "Bulk Upload",
                desc: "Upload multiple resumes and create candidates in bulk.",
              },
            ].map(({ key, icon, title, desc }) => (
              <ModeCard
                key={key}
                icon={icon}
                title={title}
                desc={desc}
                onClick={() => setMode(key as Mode)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── MANUAL FORM ── */}
      {mode === "manual" && (
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <BackNav label="Manual Entry" onBack={() => setMode("none")} />

          <div className="px-7 py-5 flex flex-col gap-4 flex-1">
            {/* Basic Info */}

            <FormSection
              icon={<UserIcon />}
              title="Basic Information"
              meta="Personal details"
            >
              <div
                className="grid gap-3.5"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <Field label="Full Name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    style={inputStyle}
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@email.com"
                    required
                    style={inputStyle}
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 XXXXX XXXXX"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Location">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Chennai, Tamil Nadu"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </FormSection>

            {/* Professional Info */}
            <FormSection
              icon={<BriefcaseIcon />}
              title="Professional Information"
              meta="Recruitment details"
            >
              <div
                className="grid gap-3.5"
                style={{ gridTemplateColumns: "1fr 1fr" }}
              >
                <Field label="Job Title">
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => {
                      setJobTitle(e.target.value);
                      setAppliedRole(e.target.value);
                    }}
                    placeholder="Software Engineer Intern"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Project Title">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="RECRULYN workspace"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Department">
                  <DepartmentSelect
                    value={department}
                    onChange={setDepartment}
                    style={selectStyle}
                  />
                </Field>
                <Field label="Assign Requirement">
                  <select
                    value={requirementId}
                    onChange={(e) => setRequirementId(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="">Select requirement</option>
                    {requirements.map((req: any) => (
                      <option key={req.id} value={req.id}>
                        {req.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Supervisor">
                  <input
                    type="text"
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    placeholder="Supervisor name"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Manager">
                  <input
                    type="text"
                    value={manager}
                    onChange={(e) => setManager(e.target.value)}
                    placeholder="Reporting manager"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Candidate Source">
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    style={selectStyle}
                  >
                    {[
                      "Manual",
                      "LinkedIn",
                      "Naukri",
                      "Referral",
                      "Career Page",
                      "Campus Drive",
                      "Walk-In",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Experience">
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    style={selectStyle}
                  >
                    {[
                      "Fresher",
                      "0–1 Years",
                      "1–3 Years",
                      "3–5 Years",
                      "5+ Years",
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </FormSection>

            {/* Recruitment Details */}
            <FormSection
              icon={<PipelineIcon />}
              title="Recruitment Details"
              meta="Pipeline information"
            >
              <div className="flex flex-col gap-3.5">
                <div
                  className="grid gap-3.5"
                  style={{ gridTemplateColumns: "1fr 1fr" }}
                >
                  <Field label="Priority">
                    <div className="flex gap-2">
                      {(["medium", "high", "critical"] as Priority[]).map(
                        (p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className="flex-1 rounded-md text-center transition-all"
                            style={{
                              padding: "8px 4px",
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.6px",
                              border:
                                priority === p
                                  ? p === "medium"
                                    ? "1px solid #1F7A52"
                                    : p === "high"
                                      ? "1px solid #D4920A"
                                      : "1px solid #C94040"
                                  : "1px solid #D8D3C8",
                              background:
                                priority === p
                                  ? p === "medium"
                                    ? "#EBF5EF"
                                    : p === "high"
                                      ? "#FFF7E6"
                                      : "#FEF0EF"
                                  : "#F6F3EC",
                              color:
                                priority === p
                                  ? p === "medium"
                                    ? "#1F3D2B"
                                    : p === "high"
                                      ? "#7A5200"
                                      : "#7A1F1F"
                                  : "#7A7367",
                              cursor: "pointer",
                            }}
                          >
                            {priorityConfig[p].label}
                          </button>
                        ),
                      )}
                    </div>
                  </Field>
                  <Field label="Joining Date">
                    <input
                      type="date"
                      value={expectedJoining}
                      onChange={(e) => setExpectedJoining(e.target.value)}
                      style={inputStyle}
                    />
                  </Field>
                </div>
                <Field label="Notes">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional context, observations, or instructions..."
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: 80,
                      lineHeight: 1.5,
                    }}
                  />
                </Field>
              </div>
            </FormSection>
          </div>

          <FormFooter
            info="Assignment details are saved with the candidate profile."
            onCancel={() => setMode("none")}
            submitLabel={loading ? "Creating..." : "Create Candidate"}
            onSubmit={handleSubmit}
          />
        </form>
      )}

      {/* ── SINGLE UPLOAD ── */}
      {mode === "single" && (
        <div className="flex flex-col flex-1">
          <BackNav
            label="Single Resume Upload"
            onBack={() => setMode("none")}
          />

          <div className="px-7 py-5 flex flex-col gap-4 flex-1">
            <FormSection
              icon={<FileUpIcon />}
              title="Upload Resume"
              meta="Creates one candidate profile"
            >
              <UploadZone
                multiple={false}
                fileInputRef={singleFileInputRef}
                onFilesSelected={(files) => {
                  setSelectedFile(files[0] ?? null);
                }}
              />

              {selectedFile && (
                <div
                  style={{
                    marginTop: 18,
                    background: "#FFFFFF",
                    border: "1px solid #DDD6C8",
                    borderRadius: 10,
                    padding: "12px 14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>📄</span>

                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#3A3530",
                        }}
                      >
                        {selectedFile.name}
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#8D877A",
                        }}
                      >
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);

                      if (singleFileInputRef.current)
                        singleFileInputRef.current.value = "";
                    }}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#C94040",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </FormSection>
          </div>

          <FormFooter
            info="AI will extract candidate details from the uploaded resume automatically."
            onCancel={() => setMode("none")}
            submitLabel={uploading ? "Uploading..." : "Upload & Create"}
            submitDisabled={uploading}
            onSubmit={handleSingleUpload}
          />
        </div>
      )}

      {/* ── BULK UPLOAD ── */}
      {mode === "multiple" && (
        <div className="flex flex-col flex-1">
          <BackNav label="Bulk Resume Upload" onBack={() => setMode("none")} />

          <div className="px-7 py-5 flex flex-col gap-4 flex-1">
            <Field label="Assign Requirement">
              <select
                value={requirementId}
                onChange={(e) => setRequirementId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select requirement</option>
                {requirements.map((req: any) => (
                  <option key={req.id} value={req.id}>
                    {req.title}
                  </option>
                ))}
              </select>
            </Field>
            <FormSection
              icon={<FilesIcon />}
              title="Bulk Upload"
              meta="Creates multiple candidate profiles"
            >
              <UploadZone
                multiple={true}
                fileInputRef={bulkFileInputRef}
                onFilesSelected={(files) => {
                  setSelectedFiles((prev) => {
                    const merged = [...prev];

                    files.forEach((file) => {
                      const exists = merged.some(
                        (f) => f.name === file.name && f.size === file.size,
                      );

                      if (!exists) {
                        merged.push(file);
                      }
                    });

                    return merged;
                  });
                }}
              />

              {selectedFiles.length > 0 && (
                <div
                  style={{
                    marginTop: 18,
                    background: "#fff",
                    border: "1px solid #DDD6C8",
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#3A3530",
                      }}
                    >
                      📁 {selectedFiles.length} Resume(s) Selected
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles([]);

                        if (bulkFileInputRef.current)
                          bulkFileInputRef.current.value = "";
                      }}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#C94040",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove All
                    </button>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      maxHeight: 170,
                      overflowY: "auto",
                      fontSize: 13,
                      color: "#666",
                    }}
                  >
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom:
                            index !== selectedFiles.length - 1
                              ? "1px solid #F1ECE3"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            color: "#555",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          📄
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {file.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedFiles.filter(
                              (_, i) => i !== index,
                            );

                            setSelectedFiles(updated);

                            if (
                              updated.length === 0 &&
                              bulkFileInputRef.current
                            ) {
                              bulkFileInputRef.current.value = "";
                            }
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "#C94040",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormSection>
          </div>

          <FormFooter
            info="AI will parse every uploaded resume and create candidate profiles automatically."
            onCancel={() => setMode("none")}
            submitLabel={
              uploading
                ? "Uploading..."
                : `Upload ${selectedFiles.length || ""} Resume${selectedFiles.length > 1 ? "s" : ""}`
            }
            submitDisabled={uploading}
            onSubmit={handleBulkUpload}
          />
        </div>
      )}
    </div>
  );
}

// ── Shared styles ──────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#F6F3EC",
  border: "1px solid #D8D3C8",
  borderRadius: 7,
  padding: "9px 12px",
  fontSize: 13,
  color: "#1A1815",
  fontFamily: "inherit",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A8479' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  paddingRight: 32,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function ModeCard({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl transition-all relative overflow-hidden"
      style={{
        background: "#fff",
        border: "1px solid #D8D3C8",
        borderTop: "3px solid transparent",
        padding: "22px 20px",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#1F7A52";
        (e.currentTarget as HTMLButtonElement).style.boxShadow =
          "0 4px 16px rgba(31,122,82,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#D8D3C8";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      <div
        className="flex items-center justify-center rounded-lg mb-3.5"
        style={{
          width: 36,
          height: 36,
          background: "#EBF5EF",
          color: "#1F7A52",
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#1A1815",
          marginBottom: 6,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 12, color: "#8A8479", lineHeight: 1.5 }}>{desc}</p>
      <span
        className="absolute top-4 right-4"
        style={{ color: "#C0BAB0", fontSize: 14 }}
      >
        ↗
      </span>
    </button>
  );
}

function BackNav({ label, onBack }: { label: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2.5 px-7 pt-3.5">
      <button
        onClick={onBack}
        className="flex items-center gap-1"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 12,
          color: "#7A7367",
          fontFamily: "inherit",
          padding: 0,
        }}
      >
        ← Back
      </button>
      <span style={{ fontSize: 12, color: "#B0AA9E" }}>
        / <span style={{ color: "#3A3530", fontWeight: 500 }}>{label}</span>
      </span>
    </div>
  );
}

function FormSection({
  icon,
  title,
  meta,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid #D8D3C8" }}
    >
      <div
        className="flex items-center gap-2 px-5 py-3.5"
        style={{ borderBottom: "1px solid #EDE9E2" }}
      >
        <span style={{ color: "#1F7A52" }}>{icon}</span>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1A1815" }}>
          {title}
        </h2>
        <span className="ml-auto" style={{ fontSize: 11, color: "#9A9490" }}>
          {meta}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        className="block mb-1.5"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#5A5650",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {label}
        {required && <span style={{ color: "#1F7A52", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function FormFooter({
  info,
  onCancel,
  submitLabel,
  submitDisabled,
  onSubmit,
}: {
  info: string;
  onCancel: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-7 py-3.5 sticky bottom-0"
      style={{
        background: "#fff",
        borderTop: "1px solid #D8D3C8",
      }}
    >
      <div className="flex items-center gap-2">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#1F7A52"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>

        <p
          style={{
            fontSize: 12,
            color: "#7A7367",
          }}
        >
          {info}
        </p>
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: "none",
            border: "1px solid #C8C3B8",
            borderRadius: 7,
            padding: "8px 18px",
            fontSize: 13,
            color: "#5A5650",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={submitDisabled}
          onClick={onSubmit}
          style={{
            background: "#1F3D2B",
            border: "none",
            borderRadius: 7,
            padding: "8px 22px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            cursor: submitDisabled ? "not-allowed" : "pointer",
            opacity: submitDisabled ? 0.6 : 1,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          + {submitLabel}
        </button>
      </div>
    </div>
  );
}

function UploadZone({
  multiple,
  onFilesSelected,
  fileInputRef,
}: {
  multiple: boolean;
  onFilesSelected: (files: File[]) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [, setFileNames] = useState<string[]>([]);

  return (
    <div
      className="rounded-xl text-center cursor-pointer transition-all"
      style={{
        border: "2px dashed #C8C3B8",
        padding: "40px 20px",
        background: "#F6F3EC",
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#B0AA9E"
        strokeWidth="1.5"
        style={{ margin: "0 auto 10px" }}
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>

      <h3
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "#3A3530",
          marginBottom: 4,
        }}
      >
        {multiple
          ? "Drop resumes here or click to browse"
          : "Drop resume here or click to browse"}
      </h3>

      <p
        style={{
          fontSize: 12,
          color: "#9A9490",
        }}
      >
        PDF, DOC or DOCX
      </p>

      <p
        style={{
          fontSize: 11,
          color: "#B0AA9E",
          marginTop: 8,
        }}
      >
        .pdf · .doc · .docx
        {multiple ? " · up to 50 files" : " · max 10 MB"}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept=".pdf,.doc,.docx"
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);

          setFileNames(files.map((f) => f.name));

          onFilesSelected(files);
        }}
      />
    </div>
  );
}
// ── Inline icons ───────────────────────────────────────────────────────────────
const iconProps = {
  width: 15,
  height: 15,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
};

function UserPlusIcon() {
  return (
    <svg {...iconProps}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}
function FileUpIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}
function FilesIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 2H5a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function PipelineIcon() {
  return (
    <svg {...iconProps}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
