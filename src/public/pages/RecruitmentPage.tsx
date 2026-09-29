import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  UploadCloud,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Star,
  BrainCircuit,
  FileSearch,
  Users,
  CalendarCheck,
  BadgeCheck,
  UserCheck,
  FileSignature,
  ShieldCheck,
  Lock,
  Fingerprint,
  Cloud,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const FEATURES = [
  {
    icon: BrainCircuit,
    title: "AI Resume Parsing",
    description:
      "Extract candidate details, education, skills and experience automatically.",
  },
  {
    icon: FileSearch,
    title: "Smart Candidate Ranking",
    description:
      "AI scores every applicant based on your job description.",
  },
  {
    icon: Users,
    title: "Talent Pipeline",
    description:
      "Track candidates from application to onboarding.",
  },
  {
    icon: CalendarCheck,
    title: "Interview Automation",
    description:
      "Schedule interviews and reminders automatically.",
  },
  {
    icon: BadgeCheck,
    title: "Offer Generation",
    description:
      "Generate offer letters and onboarding documents instantly.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description:
      "Receive intelligent hiring suggestions.",
  },
];

export default function RecruitmentPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <Navbar />

      <main className="bg-[#fbf9f4] pt-20">
        <section className="relative overflow-hidden border-b border-[#e8e5df] py-32">

  <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-60" />

  <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-100 blur-3xl opacity-60" />

  <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">

    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .7 }}
    >

      <span className="inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-5 py-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">

        <Sparkles size={14} />

        AI Recruitment

      </span>

      <h1 className="mt-8 font-display text-[68px] leading-none text-[#1b1c19]">

        Hire the right
        <br />

        people with
        <br />

        AI.

      </h1>

      <p className="mt-8 max-w-xl text-[20px] leading-9 text-[#555]">

        Parse resumes, rank candidates,
        automate interviews and recruit
        faster using enterprise AI.

      </p>

      <div className="mt-10 flex gap-4">

        <Link
  to="/resume-demo"
  className="flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-white hover:bg-[#333]"
>
  Try Now
  <ArrowRight size={18} />
</Link>

        <Link
          to="/solutions"
          className="rounded-xl border border-[#ddd] bg-white px-8 py-4 hover:bg-[#f5f5f5]"
        >

          Explore Platform

        </Link>

      </div>

    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: .7 }}
    >

      <div className="rounded-[28px] border border-[#e6e3dc] bg-white shadow-[0_30px_80px_rgba(0,0,0,.08)]">

        <div className="border-b bg-[#f8f6f1] p-6">

          <div className="flex items-center justify-between">

            <h3 className="font-display text-3xl">
              Resume Intelligence
            </h3>

            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
              LIVE
            </span>

          </div>

        </div>

        <div className="space-y-5 p-8">

          <div className="rounded-2xl border-2 border-dashed border-[#ddd] p-10 text-center">

            <UploadCloud
              size={42}
              className="mx-auto text-green-600"
            />

            <p className="mt-4 font-semibold">
              Upload Resume.pdf
            </p>

          </div>

          <div className="grid gap-4">

            <div className="flex items-center gap-4 rounded-xl border p-4">
              <User className="text-green-600" />
              <span>John Anderson</span>
            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">
              <Mail className="text-green-600" />
              <span>john@email.com</span>
            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">
              <Phone className="text-green-600" />
              <span>+91 9876543210</span>
            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">
              <GraduationCap className="text-green-600" />
              <span>B.Tech Information Technology</span>
            </div>

            <div className="flex items-center gap-4 rounded-xl border p-4">
              <Briefcase className="text-green-600" />
              <span>4 Years Experience</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-green-50 p-5">

              <div>

                <p className="text-sm text-[#666]">
                  AI Match Score
                </p>

                <h2 className="text-3xl font-bold text-green-700">
                  96%
                </h2>

              </div>

              <Star
                size={34}
                className="text-green-600"
              />

            </div>

          </div>

        </div>

      </div>

    </motion.div>

  </div>

</section>
{/* ================= FEATURES ================= */}

<section className="bg-white py-28">

  <div className="mx-auto max-w-[1200px] px-6">

    <div className="mx-auto mb-16 max-w-3xl text-center">

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        WHY RECRULYN
      </span>

      <h2 className="mt-5 font-display text-[56px] leading-tight text-[#1b1c19]">
        AI-powered recruitment
        <br />
        for modern HR teams.
      </h2>

      <p className="mt-6 text-[18px] leading-8 text-[#555]">
        Automate every hiring stage from resume screening
        to onboarding with intelligent workflows.
      </p>

    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

      {FEATURES.map((feature, index) => {

        const Icon = feature.icon;

        return (

          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: index * .08,
            }}
            className="group rounded-2xl border border-[#e5e2dd] bg-[#fbf9f4] p-8 transition-all hover:-translate-y-2 hover:border-green-500 hover:bg-white"
          >

            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 text-white">

              <Icon size={28} />

            </div>

            <h3 className="font-display text-[28px]">
              {feature.title}
            </h3>

            <p className="mt-5 leading-8 text-[#555]">
              {feature.description}
            </p>

          </motion.div>

        );

      })}

    </div>

  </div>

</section>

{/* ================= RESUME DEMO ================= */}

<section className="border-y border-[#ece9e3] bg-[#fbf9f4] py-28">

  <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">

    <div>

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        LIVE DEMO
      </span>

      <h2 className="mt-5 font-display text-[56px] leading-tight">

        Upload.
        <br />

        Parse.
        <br />

        Hire.

      </h2>

      <p className="mt-8 text-[18px] leading-8 text-[#555]">

        AI automatically extracts candidate details,
        calculates match score and prepares hiring
        recommendations within seconds.

      </p>

      <div className="mt-10 space-y-5">

        {[
          "PDF & DOCX Support",
          "OCR Resume Reading",
          "Skill Extraction",
          "Experience Detection",
          "AI Candidate Scoring",
        ].map((item) => (

          <div
            key={item}
            className="flex items-center gap-3"
          >

            <CheckCircle2
              size={20}
              className="text-green-600"
            />

            <span>{item}</span>

          </div>

        ))}

      </div>

    </div>

    <div className="rounded-[28px] border border-[#e5e2dd] bg-white p-8 shadow-xl">

      <div className="mb-8 rounded-2xl border-2 border-dashed border-[#ddd] p-10 text-center">

        <UploadCloud
          size={42}
          className="mx-auto text-green-600"
        />

        <h3 className="mt-5 font-semibold">
          Candidate_Resume.pdf
        </h3>

      </div>

      <div className="space-y-4">

        <div className="flex justify-between">

          <span>Parsing Resume</span>

          <span>100%</span>

        </div>

        <div className="h-2 rounded-full bg-[#ece9e3]">

          <div className="h-full w-full rounded-full bg-green-600" />

        </div>

      </div>

      <div className="mt-8 space-y-4">

        {[
          "Personal Information Extracted",
          "Skills Identified",
          "Experience Calculated",
          "Education Verified",
          "AI Match Score Generated",
        ].map((item) => (

          <div
            key={item}
            className="flex items-center gap-3 rounded-xl border p-4"
          >

            <CheckCircle2
              className="text-green-600"
              size={20}
            />

            <span>{item}</span>

          </div>

        ))}

      </div>

    </div>

  </div>

</section>

{/* ================= CANDIDATE MATCHING ================= */}

<section className="bg-white py-28">

  <div className="mx-auto max-w-[1200px] px-6">

    <div className="mx-auto mb-16 max-w-3xl text-center">

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        AI MATCHING
      </span>

      <h2 className="mt-5 font-display text-[56px] leading-tight">

        AI ranks every
        <br />
        candidate instantly.

      </h2>

    </div>

    <div className="space-y-6">

      {[
        ["John Anderson", "Senior React Developer", "96%"],
        ["Sophia Williams", "Frontend Engineer", "91%"],
        ["David Miller", "Software Engineer", "87%"],
      ].map((candidate) => (

        <div
          key={candidate[0]}
          className="flex flex-col justify-between gap-8 rounded-2xl border border-[#e5e2dd] bg-[#fbf9f4] p-8 lg:flex-row lg:items-center"
        >

          <div>

            <h3 className="font-display text-3xl">
              {candidate[0]}
            </h3>

            <p className="mt-2 text-[#666]">
              {candidate[1]}
            </p>

          </div>

          <div className="rounded-xl bg-green-600 px-8 py-5 text-center text-white">

            <p className="text-xs uppercase">
              Match Score
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {candidate[2]}
            </h2>

          </div>

        </div>

      ))}

    </div>

  </div>

</section>
{/* ================= WORKFLOW ================= */}

<section className="border-y border-[#ece9e3] bg-[#fbf9f4] py-28">

  <div className="mx-auto max-w-[1200px] px-6">

    <div className="mx-auto mb-16 max-w-3xl text-center">

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        WORKFLOW
      </span>

      <h2 className="mt-5 font-display text-[56px] leading-tight">
        From Resume
        <br />
        to Hiring.
      </h2>

    </div>

    <div className="grid gap-8 lg:grid-cols-4">

      {[
        {
          icon: UploadCloud,
          title: "Upload",
          desc: "Upload PDF & DOCX resumes.",
        },
        {
          icon: BrainCircuit,
          title: "AI Analysis",
          desc: "Extract skills and experience.",
        },
        {
          icon: UserCheck,
          title: "Shortlist",
          desc: "AI ranks the best candidates.",
        },
        {
          icon: FileSignature,
          title: "Hire",
          desc: "Generate Offer & Onboard.",
        },
      ].map((step) => {

        const Icon = step.icon;

        return (

          <div
            key={step.title}
            className="rounded-2xl border border-[#e5e2dd] bg-white p-8"
          >

            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-green-600 text-white">

              <Icon size={28} />

            </div>

            <h3 className="font-display text-[28px]">
              {step.title}
            </h3>

            <p className="mt-5 leading-8 text-[#555]">
              {step.desc}
            </p>

          </div>

        );

      })}

    </div>

  </div>

</section>

{/* ================= DASHBOARD ================= */}

<section className="bg-white py-28">

  <div className="mx-auto max-w-[1200px] px-6">

    <div className="mx-auto mb-16 max-w-3xl text-center">

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        DASHBOARD
      </span>

      <h2 className="mt-5 font-display text-[56px] leading-tight">
        One dashboard.
        <br />
        Complete recruitment.
      </h2>

    </div>

    <div className="rounded-[28px] border border-[#e5e2dd] bg-[#fbf9f4] p-10">

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        {[
          ["Candidates", "2,486"],
          ["Shortlisted", "486"],
          ["Interviews", "142"],
          ["Offers", "58"],
        ].map((item) => (

          <div
            key={item[0]}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >

            <p className="text-[#666]">
              {item[0]}
            </p>

            <h2 className="mt-3 text-5xl font-bold">
              {item[1]}
            </h2>

          </div>

        ))}

      </div>

    </div>

  </div>

</section>

{/* ================= SECURITY ================= */}

<section className="border-y border-[#ece9e3] bg-[#fbf9f4] py-28">

  <div className="mx-auto max-w-[1200px] px-6">

    <div className="mx-auto mb-16 max-w-3xl text-center">

      <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
        SECURITY
      </span>

      <h2 className="mt-5 font-display text-[56px]">
        Enterprise Grade
        <br />
        Security.
      </h2>

    </div>

    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

            {[
        {
          title: "AES-256 Encryption",
          icon: ShieldCheck,
        },
        {
          title: "Role Based Access",
          icon: Lock,
        },
        {
          title: "Audit Logs",
          icon: Fingerprint,
        },
        {
          title: "Cloud Infrastructure",
          icon: Cloud,
        },
      ].map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="rounded-2xl border border-[#e5e2dd] bg-white p-8"
          >

            <Icon
              size={34}
              className="text-green-600"
            />

                        <h3 className="mt-6 text-xl font-semibold">
              {item.title}
            </h3>

          </div>

        );

      })}

    </div>

  </div>

</section>

{/* ================= FAQ ================= */}

<section className="bg-white py-28">

  <div className="mx-auto max-w-[900px] px-6">

    <h2 className="mb-12 text-center font-display text-[56px]">
      Frequently Asked Questions
    </h2>

    {[
      [
        "How does AI resume parsing work?",
        "AI automatically extracts candidate information from resumes.",
      ],
      [
        "Can I upload multiple resumes?",
        "Yes. Bulk upload is fully supported.",
      ],
      [
        "Is candidate data secure?",
        "Yes. Enterprise-grade encryption protects all data.",
      ],
    ].map((faq, index) => (

      <div
        key={faq[0]}
        className="mb-5 overflow-hidden rounded-2xl border border-[#e5e2dd]"
      >

        <button
          onClick={() =>
            setOpenFaq(openFaq === index ? null : index)
          }
          className="flex w-full items-center justify-between bg-white px-8 py-6"
        >

          <span className="text-xl font-semibold">
            {faq[0]}
          </span>

          <ChevronDown
            className={`transition ${
              openFaq === index ? "rotate-180" : ""
            }`}
          />

        </button>

        <AnimatePresence>

          {openFaq === index && (

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
            >

              <div className="border-t bg-[#fbf9f4] px-8 py-6">

                <p className="leading-8 text-[#555]">
                  {faq[1]}
                </p>

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </div>

    ))}

  </div>

</section>

{/* ================= CTA ================= */}

<section className="bg-[#0f172a] py-32 text-center text-white">

  <div className="mx-auto max-w-[900px] px-6">

    <h2 className="font-display text-[64px] leading-tight">

      Ready to recruit
      <br />
      with AI?

    </h2>

    <p className="mx-auto mt-8 max-w-2xl text-[20px] leading-9 text-slate-300">

      Join organizations using RECRULYN
      to automate hiring and recruit better talent.

    </p>

    <div className="mt-12 flex flex-wrap justify-center gap-5">

    <Link
  to="/resume-demo"
  className="flex items-center gap-3 rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold hover:bg-green-700"
>
  Try Now
  <ArrowRight size={20} />
</Link>

      <Link
        to="/solutions"
        className="rounded-xl border border-slate-600 px-8 py-4 hover:bg-white hover:text-black"
      >

        Explore More

      </Link>

    </div>

  </div>

</section>

      </main>

      <Footer />
    </>
  );
}