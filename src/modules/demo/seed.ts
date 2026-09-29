import {
  localCandidateStore,
  localGeneratedDocumentStore,
  localInternAssignmentStore,
  localProfileStore,
  localRequirementStore,
} from "../../lib/offline-store";
const SEEDED_KEY = "recrulyn_demo_seeded_v3";
const EMAILS_KEY = "recrulyn_demo_emails";
const DOCS_KEY = "recrulyn_demo_documents";
const NOTICES_KEY = "recrulyn_demo_notices";
const USERS_KEY = "recrulyn_demo_users";
const EMPLOYEES_KEY = "recrulyn_demo_employees";
const LEAVES_KEY = "recrulyn_demo_leaves";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dateOnly(n: number) {
  return daysAgo(n).slice(0, 10);
}

type DemoCandidate = {
  id: string;
  full_name: string;
  email: string;
  status: string;
  ai_score: number;
  phone: string;
  source: string;
  location: string;
  department: string;
  job_title: string;
  project_title: string;
  supervisor: string;
  manager: string;
  joining_date: string;
  duration: string;
  end_date: string;
  linkedin: string;
  github: string;
  portfolio: string;
  resume_url: string;
  created_at: string;
  job_id?: string;
};

function cand(row: Partial<DemoCandidate> & Pick<DemoCandidate, "id" | "full_name" | "email" | "status">): DemoCandidate {
  return {
    phone: "+91 90000 00000",
    source: "Demo pipeline",
    location: "Chennai",
    department: "Engineering Product Development",
    job_title: "Intern",
    project_title: "RECRULYN workspace",
    supervisor: "Karthik Rao",
    manager: "Meera Sharma",
    joining_date: dateOnly(0),
    duration: "6 Months",
    end_date: daysFromNow(90),
    linkedin: `https://linkedin.com/in/${row.full_name.toLowerCase().replace(/\s+/g, "-")}`,
    github: `https://github.com/${row.full_name.toLowerCase().replace(/\s+/g, "")}`,
    portfolio: `https://portfolio.example.com/${row.full_name.toLowerCase().replace(/\s+/g, "-")}`,
    resume_url: "",
    ai_score: 80,
    created_at: daysAgo(7),
    ...row,
  };
}

export const DEMO_CANDIDATES: DemoCandidate[] = [
  cand({
    id: "demo-cand-rajesh-kumar",
    full_name: "Rajesh Kumar Balaraman",
    email: "rajesh_balaraman@mymail.sutd.edu.sg",
    phone: "+65 91741984",
    source: "Talent Pipeline upload",
    status: "HIRED",
    ai_score: 92,
    location: "Singapore",
    department: "Engineering Product Development",
    job_title: "AI Inspection Engineer",
    project_title: "CompliqAI Decision Engine Development",
    supervisor: "Rajesh Kumar",
    manager: "Reginald",
    joining_date: "2025-04-01",
    duration: "6 Months",
    end_date: "2025-10-01",
    resume_url: "/generated/rajesh-kumar-evaluation.html",
    created_at: daysAgo(30),
    job_id: "local-req-compliqai",
  }),
  cand({
    id: "demo-cand-ananya",
    full_name: "Ananya Krishnan",
    email: "ananya.krishnan@example.com",
    phone: "+91 98400 11220",
    source: "Campus drive",
    status: "INTERVIEW",
    ai_score: 92,
    location: "Chennai",
    job_title: "Frontend Intern",
    project_title: "RECRULYN talent workspace",
    joining_date: dateOnly(0),
    created_at: daysAgo(4),
  }),
  cand({
    id: "demo-cand-rahul",
    full_name: "Rahul Mehta",
    email: "rahul.mehta@example.com",
    phone: "+91 98840 22110",
    source: "Email automation",
    status: "SCREENING",
    ai_score: 86,
    location: "Bengaluru",
    department: "Information Systems Technology and Design",
    job_title: "Data Analyst Intern",
    project_title: "Recruitment inbox analytics",
    created_at: daysAgo(6),
  }),
  cand({
    id: "demo-cand-priya",
    full_name: "Priya Natarajan",
    email: "priya.natarajan@example.com",
    phone: "+91 90030 44881",
    source: "Referral",
    status: "JOINING",
    ai_score: 88,
    location: "Hyderabad",
    department: "Engineering System Design",
    job_title: "Systems Intern",
    project_title: "Embedded diagnostics",
    supervisor: "Nisha Patel",
    joining_date: dateOnly(5),
    end_date: daysFromNow(3),
    created_at: daysAgo(12),
  }),
  cand({
    id: "demo-cand-david",
    full_name: "David Chen",
    email: "david.chen@example.com",
    phone: "+65 8123 4400",
    source: "LinkedIn",
    status: "INTERVIEW",
    ai_score: 79,
    location: "Singapore",
    department: "Business Operations and Development",
    job_title: "Operations Intern",
    project_title: "Campus hiring tracker",
    created_at: daysAgo(1),
  }),
  cand({
    id: "demo-cand-fatima",
    full_name: "Fatima Noor",
    email: "fatima.noor@example.com",
    phone: "+971 50 123 7788",
    source: "Job board",
    status: "HIRED",
    ai_score: 91,
    location: "Dubai",
    department: "Marketing and Sales Strategy",
    job_title: "Marketing Intern",
    project_title: "Social media launch",
    joining_date: dateOnly(21),
    created_at: daysAgo(21),
  }),
  cand({
    id: "demo-cand-arjun",
    full_name: "Arjun Iyer",
    email: "arjun.iyer@example.com",
    phone: "+91 99400 66771",
    source: "Walk-in",
    status: "REJECTED",
    ai_score: 61,
    location: "Coimbatore",
    department: "Supply Chain and Logistics Operations",
    job_title: "Supply Chain Intern",
    project_title: "Dispatch tracker",
    created_at: daysAgo(9),
  }),
  cand({
    id: "demo-cand-keisha",
    full_name: "Keisha Menon",
    email: "keisha.menon@example.com",
    phone: "+91 98200 33441",
    source: "Campus drive",
    status: "COMPLETED",
    ai_score: 90,
    location: "Pune",
    department: "Talent Acquisition",
    job_title: "HR Operations Intern",
    project_title: "Onboarding playbook",
    joining_date: dateOnly(120),
    end_date: dateOnly(5),
    created_at: daysAgo(130),
  }),
  cand({
    id: "demo-cand-omar",
    full_name: "Omar Siddiqui",
    email: "omar.siddiqui@example.com",
    phone: "+91 97600 22119",
    source: "Employee referral",
    status: "JOINING",
    ai_score: 84,
    location: "Mumbai",
    department: "Information Systems Technology and Design",
    job_title: "Backend Intern",
    project_title: "Email automation APIs",
    joining_date: daysFromNow(4),
    created_at: daysAgo(8),
  }),
  cand({
    id: "demo-cand-mei",
    full_name: "Mei Lin Tan",
    email: "mei.lin.tan@example.com",
    phone: "+65 9001 2288",
    source: "University portal",
    status: "SCREENING",
    ai_score: 83,
    location: "Singapore",
    department: "Engineering Product Development",
    job_title: "ML Intern",
    project_title: "Resume matching models",
    created_at: daysAgo(2),
  }),
];

function fullProfile(candidate: DemoCandidate, extras: Record<string, unknown> = {}) {
  return {
    candidate_id: candidate.id,
    resume_text: `${candidate.full_name}. ${candidate.job_title} at ${candidate.department}. Location ${candidate.location}. Project ${candidate.project_title}.`,
    skills: "Python, SQL, Excel, Communication, Teamwork",
    education: "Bachelor's degree",
    experience: candidate.job_title,
    projects: candidate.project_title,
    certifications: "Demo certification",
    resume_score: candidate.ai_score,
    confidence: Math.max(70, candidate.ai_score - 4),
    career_level: "Intern",
    domain: candidate.department,
    recommended_role: candidate.job_title,
    current_company: "REUDE Technologies",
    current_designation: candidate.job_title,
    total_experience: "0–1 Years",
    career_summary: `${candidate.full_name} is a ${candidate.job_title} candidate for ${candidate.project_title}. Placeholder content for later edit.`,
    strengths: JSON.stringify(["Fast learner", "Collaboration", "Domain fit"]),
    weaknesses: JSON.stringify(["Limited production ownership"]),
    missing_skills: JSON.stringify(["Enterprise process ownership"]),
    interview_ready: candidate.ai_score >= 80,
    ...extras,
  };
}

export const DEMO_PROFILES = [
  fullProfile(DEMO_CANDIDATES[0], {
    resume_text:
      "Rajesh Kumar Balaraman. Doctoral researcher, Singapore. PhD Additive Manufacturing and Machine Learning, SUTD. Physics-informed ML, pyrometer melt-pool sensing, surrogate models for density and defects, Python, MATLAB, PyTorch, C++, CFD, ANSYS, Abaqus, SolidWorks, CATIA, UAV research, digital twin, REUDE consultant AI/ML, A*STAR IHPC, Micron data pipelines.",
    skills:
      "Python, PyTorch, MATLAB, Physics-informed ML, Additive manufacturing, Quality sensing, CFD, ANSYS, Abaqus, SolidWorks, CATIA, UAV",
    education:
      "PhD Additive Manufacturing & Machine Learning (SUTD); M.Sc Aerospace (NTU-TUM); B.Eng Aeronautical (Anna University)",
    experience:
      "REUDE Consultant AI/ML; A*STAR IHPC GRA; Micron IT Engineer; NTU ATMRI CFD; SUTD teaching assistant",
    projects:
      "In-situ defect detection; UAV payload ML; nano-satellite modal analysis; blended-wing CFD",
    certifications: "Peer-reviewed ML and AM publications",
    career_level: "PhD researcher",
    domain: "Machine learning + aerospace quality",
    recommended_role: "Machine Learning Engineer",
    current_designation: "Consultant – AI/ML & Computational Modelling",
    total_experience: "5+ years",
    career_summary:
      "AI Recruiter vs Machine Learning Engineer: 92 Highly Recommended. AI Inspection Engineer / CompliqAI: 90. UAV Quality Control Engineer JD: 76 Recommended with QC-process gap.",
    strengths: JSON.stringify([
      "Physics-informed ML and surrogate modelling",
      "In-situ quality sensing and defect risk detection",
      "UAV / aerospace CAD-CAE stack (ANSYS, Abaqus, SolidWorks, CATIA)",
      "Python production data pipelines",
    ]),
    weaknesses: JSON.stringify([
      "No dedicated 3-year Quality Control Engineer title",
      "DGCA / QCI programme ownership not explicit on CV",
    ]),
    missing_skills: JSON.stringify([
      "DGCA/QCI audit programme ownership",
      "ISO/ASTM QC manual authorship",
    ]),
  }),
  ...DEMO_CANDIDATES.slice(1).map((c) => fullProfile(c)),
];

export const DEMO_EMAILS = DEMO_CANDIDATES.map((c, i) => ({
  id: `demo-mail-${i + 1}`,
  sender: c.email,
  subject: `Application — ${c.job_title} | ${c.full_name}`,
  received_at: daysAgo(i + 1),
  has_attachment: true,
  candidate_name: c.full_name,
  candidate_email: c.email,
  candidate_phone: c.phone,
  resume_text: `${c.full_name} — ${c.job_title}, ${c.department}.`,
  body_text: `Sharing my resume for the ${c.job_title} role. Placeholder email body.`,
  attachments: [],
  status: i < 3 ? "NEW" : "PROCESSED",
}));

function demoDoc(
  id: string,
  candidate: DemoCandidate,
  document_type: string,
  days: number,
  approval_status = "APPROVED"
) {
  const isLoa = document_type === "LOA";
  return {
    id,
    candidate_id: candidate.id,
    document_type,
    status: "GENERATED",
    approval_status,
    internship_drive: "Campus Hiring 2026",
    internship_role: candidate.job_title,
    internship_type: "Internship",
    project_title: candidate.project_title,
    department: candidate.department,
    start_date: candidate.joining_date,
    end_date: candidate.end_date,
    work_mode: "Hybrid",
    working_hours: "40 hours / week",
    officer_name: "Reginald",
    officer_designation: "Managing Director",
    officer_email: "reginald@reude.tech",
    officer_phone: "+65 9123 4567",
    created_at: daysAgo(days),
    document_url: isLoa
      ? "/generated/rajesh-kumar-loa.html"
      : candidate.resume_url || "",
    approved_at: approval_status === "APPROVED" ? daysAgo(Math.max(0, days - 1)) : null,
    candidates: {
      full_name: candidate.full_name,
      email: candidate.email,
      phone: candidate.phone,
    },
  };
}

const rajesh = DEMO_CANDIDATES[0];
const priya = DEMO_CANDIDATES[3];
const fatima = DEMO_CANDIDATES[5];
const keisha = DEMO_CANDIDATES[7];
const omar = DEMO_CANDIDATES[8];

export const DEMO_DOCUMENTS = [
  demoDoc("demo-doc-rajesh-loa", rajesh, "LOA", 20),
  demoDoc("demo-doc-rajesh-nda", rajesh, "NDA", 19),
  demoDoc("demo-doc-rajesh-loc", rajesh, "LOC", 5),
  demoDoc("demo-doc-rajesh-lor", rajesh, "LOR", 4),
  demoDoc("demo-doc-rajesh-cert", rajesh, "COMPLETION_CERTIFICATE", 2),
  demoDoc("demo-doc-priya-loa", priya, "LOA", 2, "PENDING_APPROVAL"),
  demoDoc("demo-doc-fatima-nda", fatima, "NDA", 8),
  demoDoc("demo-doc-keisha-loc", keisha, "LOC", 10),
  demoDoc("demo-doc-keisha-lor", keisha, "LOR", 6),
  demoDoc("demo-doc-keisha-cert", keisha, "COMPLETION_CERTIFICATE", 3),
  demoDoc("demo-doc-omar-loa", omar, "LOA", 1, "PENDING_APPROVAL"),
];

export const DEMO_NOTICES = [
  { id: "n-rajesh", title: "Rajesh Kumar Balaraman — LOA, NDA, LOC, LOR and certificate approved", time: "Just now" },
  { id: "n1", title: "3 leave requests waiting for HR review", time: "12 min ago" },
  { id: "n2", title: "LOA for Priya Natarajan needs management approval", time: "1 hr ago" },
  { id: "n3", title: "New internship applications arrived in HR inbox", time: "Today" },
  { id: "n4", title: "Omar Siddiqui joining pack is ready for review", time: "Today" },
];

export const DEMO_REQUIREMENTS = [
  {
    id: "local-req-compliqai",
    title: "AI Inspection Engineer",
    department: "Engineering Product Development",
    description: "CompliqAI Decision Engine Development.",
    job_description:
      "AI Inspection Engineer for CompliqAI Decision Engine Development. Required: Python, PyTorch, physics-informed ML, quality sensing, defect detection.",
    vacancies: 1,
    work_mode: "Hybrid",
    duration: "6 Months",
    employment_type: "Full Time",
    location: "Chennai / Hybrid",
    status: "OPEN",
    created_at: daysAgo(20),
    _local: true,
  },
  {
    id: "local-req-frontend",
    title: "Frontend Intern",
    department: "Engineering Product Development",
    description: "RECRULYN talent workspace UI.",
    job_description: "React, TypeScript, hiring dashboards.",
    vacancies: 2,
    work_mode: "Hybrid",
    duration: "6 Months",
    employment_type: "Internship",
    location: "Chennai",
    status: "OPEN",
    created_at: daysAgo(12),
    _local: true,
  },
  {
    id: "local-req-data",
    title: "Data Analyst Intern",
    department: "Information Systems Technology and Design",
    description: "Inbox and pipeline analytics.",
    job_description: "SQL, Python, Power BI.",
    vacancies: 1,
    work_mode: "Remote",
    duration: "6 Months",
    employment_type: "Internship",
    location: "Bengaluru",
    status: "OPEN",
    created_at: daysAgo(9),
    _local: true,
  },
  {
    id: "local-req-ops",
    title: "Operations Intern",
    department: "Business Operations and Development",
    description: "Campus hiring operations.",
    job_description: "Excel, coordination, onboarding.",
    vacancies: 1,
    work_mode: "Onsite",
    duration: "3 Months",
    employment_type: "Internship",
    location: "Singapore",
    status: "OPEN",
    created_at: daysAgo(6),
    _local: true,
  },
  {
    id: "local-req-mkt",
    title: "Marketing Intern",
    department: "Marketing and Sales Strategy",
    description: "Campaign and social launch.",
    job_description: "SEO, SEM, analytics.",
    vacancies: 1,
    work_mode: "Hybrid",
    duration: "6 Months",
    employment_type: "Internship",
    location: "Dubai",
    status: "OPEN",
    created_at: daysAgo(15),
    _local: true,
  },
  {
    id: "local-req-backend",
    title: "Backend Intern",
    department: "Information Systems Technology and Design",
    description: "Email automation APIs.",
    job_description: "Node.js, REST, IMAP/SMTP.",
    vacancies: 1,
    work_mode: "Hybrid",
    duration: "6 Months",
    employment_type: "Internship",
    location: "Mumbai",
    status: "OPEN",
    created_at: daysAgo(4),
    _local: true,
  },
];

export const DEMO_USER_PROFILES = [
  {
    id: "demo-user-hr",
    email: "hr@reude.tech",
    full_name: "Meera Sharma",
    role_name: "HR",
    title: "HR Business Partner",
    is_active: true,
    department: "Talent Acquisition",
  },
  {
    id: "demo-user-admin",
    email: "admin@reude.tech",
    full_name: "Arun Prakash",
    role_name: "ADMIN",
    title: "People Systems Admin",
    is_active: true,
    department: "Information Systems Technology and Design",
  },
  {
    id: "demo-user-management",
    email: "mgmt@reude.tech",
    full_name: "Kavitha Rao",
    role_name: "MANAGEMENT",
    title: "Head of People",
    is_active: true,
    department: "Business Operations and Development",
  },
  {
    id: "demo-user-employee",
    email: "intern@reude.tech",
    full_name: "Siddharth Nair",
    role_name: "EMPLOYEE",
    title: "Software Intern",
    is_active: true,
    department: "Engineering Product Development",
  },
  {
    id: "demo-user-hr2",
    email: "nisha.patel@reude.tech",
    full_name: "Nisha Patel",
    role_name: "HR",
    title: "Campus Recruiter",
    is_active: true,
    department: "Talent Acquisition",
  },
  {
    id: "demo-user-eng1",
    email: "karthik.rao@reude.tech",
    full_name: "Karthik Rao",
    role_name: "EMPLOYEE",
    title: "Engineering Manager",
    is_active: true,
    department: "Engineering Product Development",
  },
  {
    id: "demo-user-eng2",
    email: "reginald@reude.tech",
    full_name: "Reginald",
    role_name: "MANAGEMENT",
    title: "Delivery Lead",
    is_active: true,
    department: "Engineering Product Development",
  },
  {
    id: "demo-user-ops",
    email: "aisha.khan@reude.tech",
    full_name: "Aisha Khan",
    role_name: "EMPLOYEE",
    title: "People Operations",
    is_active: true,
    department: "Business Operations and Development",
  },
  {
    id: "demo-user-fin",
    email: "vivek.shah@reude.tech",
    full_name: "Vivek Shah",
    role_name: "EMPLOYEE",
    title: "Finance Associate",
    is_active: true,
    department: "Business Operations and Development",
  },
  {
    id: "demo-user-intern2",
    email: "leah.gomez@reude.tech",
    full_name: "Leah Gomez",
    role_name: "EMPLOYEE",
    title: "Design Intern",
    is_active: true,
    department: "Marketing and Sales Strategy",
  },
];

export const DEMO_EMPLOYEES = DEMO_USER_PROFILES.map((user, i) => ({
  id: `demo-emp-${i + 1}`,
  profile_id: user.id,
  employee_code: `EMP-2026-${String(i + 1).padStart(3, "0")}`,
  full_name: user.full_name,
  email: user.email,
  phone: `+91 98${String(10000000 + i).slice(0, 8)}`,
  department: user.department,
  designation: user.title,
  reporting_manager: i < 3 ? "Kavitha Rao" : "Meera Sharma",
  joining_date: dateOnly(200 - i * 12),
  employment_type: user.title.toLowerCase().includes("intern") ? "Internship" : "Full Time",
  created_at: daysAgo(40 - i),
}));

export const DEMO_LEAVE_REQUESTS = [
  {
    id: "demo-leave-1",
    employee_id: "demo-emp-4",
    leave_type: "Casual",
    start_date: daysFromNow(12),
    end_date: daysFromNow(13),
    reason: "Family visit",
    status: "PENDING",
    applied_at: daysAgo(1),
  },
  {
    id: "demo-leave-2",
    employee_id: "demo-emp-4",
    leave_type: "Sick",
    start_date: dateOnly(18),
    end_date: dateOnly(17),
    reason: "Recovery day",
    status: "APPROVED",
    applied_at: daysAgo(20),
  },
  {
    id: "demo-leave-3",
    employee_id: "demo-emp-4",
    leave_type: "Casual",
    start_date: dateOnly(45),
    end_date: dateOnly(44),
    reason: "Personal errand",
    status: "APPROVED",
    applied_at: daysAgo(48),
  },
];

export function isDemoMode() {
  try {
    return Boolean(JSON.parse(localStorage.getItem("recrulyn_demo_session") || "null")?.user);
  } catch {
    return false;
  }
}

function upsertById(existing: any[], incoming: any[]) {
  const map = new Map(existing.map((row) => [row.id, row]));
  for (const row of incoming) map.set(row.id, { ...map.get(row.id), ...row });
  return Array.from(map.values());
}

export function seedDemoWorkspace() {
  const demoIds = new Set(DEMO_CANDIDATES.map((c) => c.id));
  const existing = localCandidateStore.list();
  const extras = existing.filter(
    (c) =>
      !demoIds.has(c.id) &&
      !DEMO_CANDIDATES.some((d) => d.email.toLowerCase() === String(c.email || "").toLowerCase())
  );
  const seededCandidates = DEMO_CANDIDATES.map((c) => ({
    ...c,
    job_id: c.job_id || "local-req-frontend",
    updated_at: new Date().toISOString(),
    _local: true,
    _demo: true,
  }));
  localCandidateStore.save([...seededCandidates, ...extras]);

  for (const profile of DEMO_PROFILES) {
    localProfileStore.upsert(profile);
  }

  for (const c of DEMO_CANDIDATES) {
    localInternAssignmentStore.upsert({
      id: `demo-assign-${c.id}`,
      candidate_id: c.id,
      candidate_name: c.full_name,
      role_name: c.job_title,
      job_title: c.job_title,
      department: c.department,
      project_name: c.project_title,
      joining_date: c.joining_date,
      duration: c.duration,
      end_date: c.end_date,
      reporting_manager: c.manager,
      supervisor: c.supervisor,
      loa_generated: ["JOINING", "HIRED", "COMPLETED"].includes(c.status),
      nda_generated: ["JOINING", "HIRED", "COMPLETED"].includes(c.status),
      nda_received: ["HIRED", "COMPLETED"].includes(c.status),
      certificate_generated: c.status === "COMPLETED" || c.id === "demo-cand-rajesh-kumar",
      joined: ["HIRED", "COMPLETED"].includes(c.status),
      completed: c.status === "COMPLETED",
    });
  }

  const reqs = localRequirementStore.list();
  localRequirementStore.save(upsertById(reqs, DEMO_REQUIREMENTS));

  localStorage.setItem(EMAILS_KEY, JSON.stringify(DEMO_EMAILS));
  localStorage.setItem(DOCS_KEY, JSON.stringify(DEMO_DOCUMENTS));
  localStorage.setItem(NOTICES_KEY, JSON.stringify(DEMO_NOTICES));
  localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USER_PROFILES));
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(DEMO_EMPLOYEES));
  localStorage.setItem(LEAVES_KEY, JSON.stringify(DEMO_LEAVE_REQUESTS));
  localStorage.setItem(SEEDED_KEY, "1");

  const existingDocs = localGeneratedDocumentStore.list();
  localGeneratedDocumentStore.save(upsertById(existingDocs, DEMO_DOCUMENTS));
}

export function getDemoEmails() {
  try {
    const raw = localStorage.getItem(EMAILS_KEY);
    return raw ? JSON.parse(raw) : DEMO_EMAILS;
  } catch {
    return DEMO_EMAILS;
  }
}

export function getDemoDocuments() {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    const stored = raw ? JSON.parse(raw) : DEMO_DOCUMENTS;
    return stored.length ? stored : DEMO_DOCUMENTS;
  } catch {
    return DEMO_DOCUMENTS;
  }
}

export function getDemoNotices() {
  try {
    const raw = localStorage.getItem(NOTICES_KEY);
    return raw ? JSON.parse(raw) : DEMO_NOTICES;
  } catch {
    return DEMO_NOTICES;
  }
}

export function getDemoUserProfiles() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const stored = raw ? JSON.parse(raw) : DEMO_USER_PROFILES;
    return stored.length ? stored : DEMO_USER_PROFILES;
  } catch {
    return DEMO_USER_PROFILES;
  }
}

export function saveDemoUserProfiles(users: any[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function updateDemoDocument(id: string, patch: Record<string, unknown>) {
  const docs = getDemoDocuments().map((doc: any) =>
    doc.id === id ? { ...doc, ...patch } : doc
  );
  localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  const existing = localGeneratedDocumentStore.list();
  localGeneratedDocumentStore.save(
    existing.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))
  );
  return docs.find((doc: any) => doc.id === id) || null;
}

export function getDemoEmployees() {
  try {
    const raw = localStorage.getItem(EMPLOYEES_KEY);
    const stored = raw ? JSON.parse(raw) : DEMO_EMPLOYEES;
    return stored.length ? stored : DEMO_EMPLOYEES;
  } catch {
    return DEMO_EMPLOYEES;
  }
}

export function getDemoLeaveRequests(employeeId?: string) {
  let rows = DEMO_LEAVE_REQUESTS;
  try {
    const raw = localStorage.getItem(LEAVES_KEY);
    const stored = raw ? JSON.parse(raw) : DEMO_LEAVE_REQUESTS;
    rows = stored.length ? stored : DEMO_LEAVE_REQUESTS;
  } catch {
    rows = DEMO_LEAVE_REQUESTS;
  }
  if (!employeeId) return rows;
  return rows.filter((row) => row.employee_id === employeeId);
}

export function addDemoLeaveRequest(payload: Record<string, unknown>) {
  const rows = getDemoLeaveRequests();
  const row = {
    status: "PENDING",
    applied_at: new Date().toISOString(),
    ...payload,
    id: String(payload.id || `demo-leave-${Date.now()}`),
  };
  const next = [row, ...rows];
  localStorage.setItem(LEAVES_KEY, JSON.stringify(next));
  return row;
}

function inDateRange(iso: string | undefined, fromDate?: string, toDate?: string) {
  if (!iso) return true;
  const t = new Date(iso).getTime();
  if (fromDate && t < new Date(fromDate).getTime()) return false;
  if (toDate && t > new Date(`${toDate}T23:59:59`).getTime()) return false;
  return true;
}

export function getLocalCandidates(fromDate?: string, toDate?: string) {
  const rows = localCandidateStore.list().length ? localCandidateStore.list() : DEMO_CANDIDATES;
  return rows.filter((row) => inDateRange(row.created_at, fromDate, toDate));
}

export function getLocalAssignments(fromDate?: string, toDate?: string) {
  const rows = localInternAssignmentStore.list();
  return rows.filter((row) => inDateRange(row.updated_at || row.joining_date, fromDate, toDate));
}

export function getLocalDocuments(fromDate?: string, toDate?: string) {
  const docs = [...getDemoDocuments(), ...localGeneratedDocumentStore.list()];
  const map = new Map<string, any>();
  for (const doc of docs) if (doc?.id) map.set(doc.id, doc);
  return Array.from(map.values()).filter((row) => inDateRange(row.created_at, fromDate, toDate));
}

function isCertificateType(type: string) {
  return type === "COMPLETION_CERTIFICATE" || type === "CERTIFICATE";
}

export function getLocalReportStats(fromDate?: string, toDate?: string) {
  const rows = getLocalCandidates(fromDate, toDate);
  const docs = getLocalDocuments(fromDate, toDate);
  return {
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
    certificateCount: docs.filter((d) => isCertificateType(d.document_type)).length,
  };
}

export function getDemoDashboardMetrics() {
  const candidates = getLocalCandidates();
  const count = candidates.length || DEMO_CANDIDATES.length;
  return {
    open_roles: DEMO_REQUIREMENTS.filter((r) => r.status === "OPEN").length,
    open_roles_series: [2, 3, 4, 5, 5, 6],
    active_candidates: count,
    active_candidates_series: [4, 6, 8, 9, 11, count],
    avg_time_to_hire_days: 11,
    avg_time_to_hire_series: [16, 14, 13, 12, 11, 11],
    offers_pending: candidates.filter((c) => c.status === "JOINING" || c.status === "SELECTED").length,
    offers_pending_series: [1, 1, 2, 2, 2, 2],
  };
}
