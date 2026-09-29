// src/public/components/solutions/recruitment/Features.tsx

import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileSearch,
  Users,
  CalendarCheck,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI Resume Parsing",
    description:
      "Extract candidate details, education, skills, certifications and experience within seconds.",
  },
  {
    icon: FileSearch,
    title: "Smart Candidate Ranking",
    description:
      "Automatically score every candidate against your job description using AI.",
  },
  {
    icon: Users,
    title: "Talent Pipeline",
    description:
      "Track applicants through sourcing, screening, interviews and final hiring.",
  },
  {
    icon: CalendarCheck,
    title: "Interview Automation",
    description:
      "Schedule interviews automatically with reminders and recruiter notifications.",
  },
  {
    icon: BadgeCheck,
    title: "Offer Management",
    description:
      "Generate offer letters and onboarding documents with one click.",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description:
      "Receive intelligent hiring suggestions based on skills, experience and company needs.",
  },
];

export default function Features() {
  return (
    <section className="bg-[#fbf9f4] py-28">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            WHY RECRULYN
          </span>

          <h2 className="mt-5 font-display text-[52px] leading-tight text-[#1b1c19]">
            AI-powered recruitment
            <br />
            built for modern hiring.
          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">
            Everything from resume parsing to candidate selection,
            interview scheduling and offer generation in one intelligent platform.
          </p>

        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => {

            const Icon = feature.icon;

            return (

              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.5,
                }}
                className="
                group
                rounded-2xl
                border
                border-[#e5e2dd]
                bg-white
                p-8
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-green-500
                hover:shadow-xl
                "
              >

                <div
                  className="
                  mb-8
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#f5f3ee]
                  text-[#16a34a]
                  transition
                  group-hover:bg-green-600
                  group-hover:text-white
                  "
                >
                  <Icon size={28} />
                </div>

                <h3 className="font-display text-[28px] leading-tight text-[#1b1c19]">
                  {feature.title}
                </h3>

                <p className="mt-5 text-[16px] leading-8 text-[#555]">
                  {feature.description}
                </p>

              </motion.div>

            );
          })}

        </div>

      </div>

    </section>
  );
}
