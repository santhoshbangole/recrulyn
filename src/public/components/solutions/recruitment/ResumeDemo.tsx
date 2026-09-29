// src/public/components/solutions/recruitment/ResumeDemo.tsx

import { motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Star,
} from "lucide-react";

export default function ResumeDemo() {
  return (
    <section className="border-y border-[#e8e5df] bg-white py-28">

      <div className="mx-auto grid max-w-[1200px] items-center gap-16 px-6 lg:grid-cols-2">

        {/* LEFT */}

        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            LIVE AI DEMO
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">

            Upload a resume.
            <br />
            Let AI do the rest.

          </h2>

          <p className="mt-7 text-[18px] leading-8 text-[#555]">

            Instantly extract candidate information,
            identify skills, calculate AI match score
            and prepare candidates for recruitment.

          </p>

          <div className="mt-10 space-y-5">

            {[
              "PDF & DOCX Support",
              "OCR for scanned resumes",
              "Automatic Skill Extraction",
              "Experience Calculation",
              "AI Match Score",
            ].map((item) => (

              <div
                key={item}
                className="flex items-center gap-4"
              >

                <div className="h-2.5 w-2.5 rounded-full bg-green-600" />

                <span className="text-[17px] text-[#444748]">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </motion.div>

        {/* RIGHT */}

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
        >

          <div className="overflow-hidden rounded-[28px] border border-[#e6e3dc] bg-white shadow-[0_25px_70px_rgba(0,0,0,.08)]">

            {/* HEADER */}

            <div className="border-b border-[#ece9e3] bg-[#f8f6f1] p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-display text-[28px]">
                    Resume Intelligence
                  </h3>

                  <p className="mt-1 text-sm text-[#666]">
                    AI Candidate Extraction
                  </p>

                </div>

                <div className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                  LIVE
                </div>

              </div>

            </div>

            {/* BODY */}

            <div className="space-y-6 p-8">

              {/* Upload */}

              <div className="rounded-2xl border-2 border-dashed border-[#d8d5cf] bg-[#fafafa] p-8 text-center">

                <UploadCloud
                  size={42}
                  className="mx-auto text-green-600"
                />

                <p className="mt-5 font-semibold">
                  Drag & Drop Resume.pdf
                </p>

                <p className="mt-2 text-sm text-[#777]">
                  PDF • DOCX • DOC
                </p>

              </div>

              {/* Progress */}

              <div>

                <div className="mb-2 flex justify-between text-sm">

                  <span>AI Processing</span>

                  <span>100%</span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#ece9e3]">

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-green-600"
                  />

                </div>

              </div>

              {/* Extracted Data */}

              <div className="grid gap-4">

                <div className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-4">
                  <User size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-[#777]">Candidate</p>
                    <h4 className="font-semibold">
                      John Anderson
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-4">
                  <Mail size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-[#777]">Email</p>
                    <h4 className="font-semibold">
                      john@email.com
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-4">
                  <Phone size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-[#777]">Phone</p>
                    <h4 className="font-semibold">
                      +91 98765 43210
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-4">
                  <GraduationCap size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-[#777]">Education</p>
                    <h4 className="font-semibold">
                      B.Tech Information Technology
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-4">
                  <Briefcase size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-[#777]">Experience</p>
                    <h4 className="font-semibold">
                      4 Years
                    </h4>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-5">

                  <div className="flex items-center gap-3">

                    <Star className="text-green-600" />

                    <div>

                      <p className="text-xs text-[#666]">
                        AI Match Score
                      </p>

                      <h4 className="text-xl font-bold text-green-700">
                        96%
                      </h4>

                    </div>

                  </div>

                  <FileText
                    size={28}
                    className="text-green-600"
                  />

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}