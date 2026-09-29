// src/public/components/solutions/recruitment/CandidateMatching.tsx

import { motion } from "framer-motion";
import {
  Trophy,
  Star,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const candidates = [
  {
    name: "John Anderson",
    role: "Senior React Developer",
    score: 96,
    status: "Highly Recommended",
  },
  {
    name: "Sophia Williams",
    role: "Frontend Engineer",
    score: 91,
    status: "Recommended",
  },
  {
    name: "David Miller",
    role: "Software Engineer",
    score: 87,
    status: "Good Match",
  },
];

export default function CandidateMatching() {
  return (
    <section className="bg-[#fbf9f4] py-28">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            AI MATCHING ENGINE
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">

            Find the best candidate
            <br />
            instantly.

          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">

            Our AI compares every resume against
            your job requirements and ranks the
            most suitable candidates automatically.

          </p>

        </motion.div>

        <div className="space-y-6">

          {candidates.map((candidate, index) => (

            <motion.div
              key={candidate.name}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                delay: index * .12,
                duration: .5,
              }}
              className="
              group
              rounded-2xl
              border
              border-[#e6e3dc]
              bg-white
              p-7
              transition-all
              duration-300
              hover:border-green-500
              hover:shadow-xl
              "
            >

              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div className="flex items-center gap-3">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">

                      {candidate.name.charAt(0)}

                    </div>

                    <div>

                      <h3 className="font-display text-2xl text-[#1b1c19]">
                        {candidate.name}
                      </h3>

                      <p className="mt-1 text-[#666]">
                        {candidate.role}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-6">

                  <div className="rounded-xl bg-[#f8f6f1] px-5 py-4 text-center">

                    <p className="text-xs uppercase tracking-wider text-[#777]">
                      Match Score
                    </p>

                    <h4 className="mt-2 text-3xl font-bold text-green-600">
                      {candidate.score}%
                    </h4>

                  </div>

                  <div className="rounded-xl bg-green-50 px-5 py-4">

                    <div className="flex items-center gap-2">

                      <CheckCircle2
                        size={18}
                        className="text-green-600"
                      />

                      <span className="font-semibold text-green-700">
                        {candidate.status}
                      </span>

                    </div>

                  </div>

                  <button
                    className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#d8d5cf]
                    px-5
                    py-4
                    transition
                    hover:bg-black
                    hover:text-white
                    "
                  >

                    View Profile

                    <ArrowUpRight size={18} />

                  </button>

                </div>

              </div>

            </motion.div>

          ))}

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .4 }}
          className="
          mt-16
          rounded-3xl
          border
          border-[#e6e3dc]
          bg-white
          p-10
          "
        >

          <div className="grid gap-8 md:grid-cols-3">

            <div className="text-center">

              <Trophy
                className="mx-auto text-green-600"
                size={38}
              />

              <h3 className="mt-4 text-5xl font-bold">
                95%
              </h3>

              <p className="mt-2 text-[#666]">
                AI Accuracy
              </p>

            </div>

            <div className="text-center">

              <Star
                className="mx-auto text-green-600"
                size={38}
              />

              <h3 className="mt-4 text-5xl font-bold">
                10×
              </h3>

              <p className="mt-2 text-[#666]">
                Faster Hiring
              </p>

            </div>

            <div className="text-center">

              <CheckCircle2
                className="mx-auto text-green-600"
                size={38}
              />

              <h3 className="mt-4 text-5xl font-bold">
                50K+
              </h3>

              <p className="mt-2 text-[#666]">
                Resumes Processed
              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}