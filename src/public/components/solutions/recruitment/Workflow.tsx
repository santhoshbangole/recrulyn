// src/public/components/solutions/recruitment/Workflow.tsx

import { motion } from "framer-motion";
import {
  UploadCloud,
  BrainCircuit,
  UserCheck,
  FileSignature,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Resume",
    description:
      "Upload PDF or DOCX resumes individually or in bulk.",
  },
  {
    icon: BrainCircuit,
    title: "AI Analysis",
    description:
      "AI extracts candidate details, skills and experience automatically.",
  },
  {
    icon: UserCheck,
    title: "Shortlist",
    description:
      "Candidates are ranked based on AI match score and job requirements.",
  },
  {
    icon: FileSignature,
    title: "Hire",
    description:
      "Generate offer letters and start onboarding with one click.",
  },
];

export default function Workflow() {
  return (
    <section className="border-y border-[#e8e5df] bg-white py-28">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            RECRUITMENT WORKFLOW
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">
            From resume upload
            <br />
            to hiring in minutes.
          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">
            RECRULYN automates every stage of recruitment,
            helping HR teams hire the right talent faster.
          </p>

        </motion.div>

        <div className="grid gap-8 lg:grid-cols-4">

          {steps.map((step, index) => {

            const Icon = step.icon;

            return (

              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * .12,
                  duration: .5,
                }}
                className="relative"
              >

                <div className="rounded-2xl border border-[#e5e2dd] bg-[#fbf9f4] p-8 h-full">

                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-xl bg-green-600 text-white">
                    <Icon size={30} />
                  </div>

                  <span className="font-mono text-xs text-green-700">
                    STEP {index + 1}
                  </span>

                  <h3 className="mt-4 font-display text-[28px] leading-tight text-[#1b1c19]">
                    {step.title}
                  </h3>

                  <p className="mt-5 text-[16px] leading-8 text-[#555]">
                    {step.description}
                  </p>

                </div>

                {index !== steps.length - 1 && (
                  <div className="absolute -right-6 top-1/2 hidden lg:block">
                    <ArrowRight
                      size={28}
                      className="text-green-600"
                    />
                  </div>
                )}

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}