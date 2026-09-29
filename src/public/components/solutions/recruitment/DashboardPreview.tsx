// src/public/components/solutions/recruitment/DashboardPreview.tsx

import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Briefcase,
  BarChart3,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    icon: Users,
    title: "Candidates",
    value: "2,486",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: UserCheck,
    title: "Shortlisted",
    value: "486",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Briefcase,
    title: "Open Jobs",
    value: "28",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: FileText,
    title: "Offers Sent",
    value: "132",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function DashboardPreview() {
  return (
    <section className="bg-[#fbf9f4] py-28">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            LIVE DASHBOARD
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">
            Everything recruiters
            <br />
            need in one dashboard.
          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">
            Monitor hiring progress, candidate pipeline,
            recruitment analytics and AI insights from
            a single intelligent workspace.
          </p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: .98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: .5 }}
          className="
          overflow-hidden
          rounded-[30px]
          border
          border-[#e6e3dc]
          bg-white
          shadow-[0_35px_80px_rgba(0,0,0,.08)]
          "
        >

          {/* Header */}

          <div className="flex items-center justify-between border-b border-[#ece9e3] bg-[#f8f6f1] px-8 py-6">

            <div>

              <h3 className="font-display text-3xl">
                Recruitment Dashboard
              </h3>

              <p className="mt-2 text-[#666]">
                Real-time hiring overview
              </p>

            </div>

            <div className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
              LIVE
            </div>

          </div>

          {/* Stats */}

          <div className="grid gap-6 border-b border-[#ece9e3] p-8 md:grid-cols-2 xl:grid-cols-4">

            {stats.map((item) => {

              const Icon = item.icon;

              return (

                <div
                  key={item.title}
                  className="rounded-2xl border border-[#ece9e3] p-6"
                >

                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.color}`}>

                    <Icon size={24} />

                  </div>

                  <h4 className="mt-6 text-[15px] text-[#777]">
                    {item.title}
                  </h4>

                  <h3 className="mt-2 text-4xl font-bold text-[#1b1c19]">
                    {item.value}
                  </h3>

                </div>

              );

            })}

          </div>

          {/* Pipeline */}

          <div className="grid gap-8 p-8 lg:grid-cols-[1.2fr_.8fr]">

            <div>

              <h3 className="mb-6 font-display text-3xl">
                Candidate Pipeline
              </h3>

              {[
                ["Applied", "1,284", "bg-blue-500"],
                ["AI Screening", "762", "bg-yellow-500"],
                ["Interview", "318", "bg-orange-500"],
                ["Selected", "106", "bg-green-600"],
              ].map(([stage, count, color]) => (

                <div
                  key={stage}
                  className="mb-5"
                >

                  <div className="mb-2 flex justify-between">

                    <span>{stage}</span>

                    <span className="font-semibold">
                      {count}
                    </span>

                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#ece9e3]">

                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{
                        width:
                          stage === "Applied"
                            ? "100%"
                            : stage === "AI Screening"
                            ? "70%"
                            : stage === "Interview"
                            ? "42%"
                            : "18%",
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

            <div>

              <h3 className="mb-6 font-display text-3xl">
                AI Insights
              </h3>

              <div className="space-y-5">

                {[
                  "96% candidate matching accuracy",
                  "48 resumes processed today",
                  "12 candidates recommended",
                  "5 interviews scheduled",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-4 rounded-xl border border-[#ece9e3] p-5"
                  >

                    <CheckCircle2
                      className="text-green-600"
                      size={22}
                    />

                    <span className="text-[#444748]">
                      {item}
                    </span>

                  </div>

                ))}

                <div className="mt-6 rounded-2xl bg-[#16a34a] p-6 text-white">

                  <BarChart3 size={34} />

                  <h3 className="mt-5 text-2xl font-bold">
                    Hiring Efficiency
                  </h3>

                  <p className="mt-3 leading-7 text-green-100">
                    AI reduced recruitment time by
                    <strong> 72%</strong> this month.
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