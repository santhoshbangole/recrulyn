// src/public/components/solutions/recruitment/Hero.tsx

import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[#e7e4dc] bg-[#fbf9f4] pt-32 pb-24">

      <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-green-100 blur-3xl opacity-50" />
      <div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-emerald-100 blur-3xl opacity-50" />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">

        {/* Left */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
        >

          <span className="inline-flex items-center gap-2 rounded-full border border-[#d8d5cf] bg-white px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-[#775a19]">

            <Sparkles size={14} />

            AI Recruitment Platform

          </span>

          <h1 className="mt-8 font-display text-[62px] leading-[1.05] text-[#1b1c19]">

            Hire the right
            <br />
            talent faster
            <br />
            with AI.

          </h1>

          <p className="mt-8 max-w-xl text-[20px] leading-9 text-[#555]">

            Automate resume screening, rank candidates,
            schedule interviews and streamline hiring
            with enterprise-grade artificial intelligence.

          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-black px-8 py-4 text-white transition hover:bg-[#30312e]"
            >
              Enter Workspace

              <ArrowRight size={18} />
            </Link>

            <Link
              to="/solutions"
              className="rounded-xl border border-[#d8d5cf] bg-white px-8 py-4 transition hover:bg-[#f5f3ee]"
            >
              Explore Solutions
            </Link>

          </div>

          <div className="mt-12 flex flex-col gap-4">

            {[
              "AI Resume Parsing",
              "Smart Candidate Ranking",
              "Automated Hiring Workflow",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-3"
              >

                <CheckCircle2
                  size={20}
                  className="text-green-600"
                />

                <span className="text-[17px] text-[#444748]">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </motion.div>

        {/* Right */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .7 }}
        >

          <div className="overflow-hidden rounded-[28px] border border-[#e5e2dd] bg-white shadow-[0_30px_80px_rgba(0,0,0,.08)]">

            <div className="border-b border-[#ece9e3] bg-[#f8f6f1] px-6 py-5">

              <div className="flex items-center justify-between">

                <h3 className="font-display text-2xl">
                  AI Candidate Analysis
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  LIVE
                </span>

              </div>

            </div>

            <div className="space-y-6 p-8">

              <div className="rounded-xl border border-dashed border-[#cfd3d4] bg-[#fafafa] p-8 text-center">

                <p className="font-medium">
                  📄 Upload Resume.pdf
                </p>

              </div>

              <div>

                <div className="mb-2 flex justify-between">

                  <span>Parsing Resume</span>

                  <span>100%</span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#ece9e3]">

                  <div className="h-full w-full rounded-full bg-green-600" />

                </div>

              </div>

              <div className="grid gap-4">

                <div className="rounded-xl border border-[#ece9e3] p-4">
                  <strong>Name</strong>

                  <p className="mt-1 text-[#666]">
                    John Anderson
                  </p>
                </div>

                <div className="rounded-xl border border-[#ece9e3] p-4">
                  <strong>Skills</strong>

                  <p className="mt-1 text-[#666]">
                    React • Python • FastAPI • PostgreSQL
                  </p>
                </div>

                <div className="rounded-xl border border-[#ece9e3] p-4">
                  <strong>AI Match Score</strong>

                  <p className="mt-1 text-2xl font-bold text-green-600">
                    96%
                  </p>
                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}