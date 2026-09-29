import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "Recruit",
    description: "Collect candidates through AI-powered sourcing.",
  },
  {
    title: "Screen",
    description: "Automatically rank and filter resumes.",
  },
  {
    title: "Interview",
    description: "Schedule interviews with smart workflows.",
  },
  {
    title: "Offer",
    description: "Generate LOA and offer documents instantly.",
  },
  {
    title: "Onboard",
    description: "Complete employee onboarding digitally.",
  },
  {
    title: "Manage",
    description: "Track employees, leave and analytics.",
  },
];

export default function Workflow() {
  return (
    <section className="border-y border-[#d9d7d2] bg-white py-24">
      <div className="mx-auto max-w-[1140px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            WORKFLOW
          </p>

          <h2 className="mt-4 font-display text-[48px] leading-tight text-[#1b1c19] md:text-[62px]">
            From hiring
            <br />
            to workforce management.
          </h2>
        </motion.div>

        <div className="grid gap-5 lg:grid-cols-6">

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="relative border border-[#c4c7c7] bg-[#fbf9f4] p-6"
            >

              <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#c4c7c7] bg-white font-mono text-lg">
                {index + 1}
              </div>

              <h3 className="font-display text-[28px] text-[#1b1c19]">
                {step.title}
              </h3>

              <p className="mt-4 text-[15px] leading-7 text-[#444748]">
                {step.description}
              </p>

              {index !== steps.length - 1 && (
                <ArrowRight
                  size={18}
                  className="absolute -right-3 top-10 hidden bg-[#fbf9f4] text-[#775a19] lg:block"
                />
              )}

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}