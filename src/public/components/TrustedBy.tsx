import { motion } from "framer-motion";

const companies = [
  "Campus hiring",
  "Internships",
  "HR ops",
  "People analytics",
  "Onboarding",
];

export default function TrustedBy() {
  return (
    <section className="border-y border-[#c4c7c7]/30 bg-[#f5f3ee]/40 py-24">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-16 px-10">

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#444748]/70"
        >
          Built for HR, TA, and people leaders
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-16 md:gap-28 opacity-60 grayscale"
        >
          {companies.map((company) => (
            <span
              key={company}
              className="cursor-default font-display text-3xl italic tracking-tight transition-all duration-300 hover:opacity-100 hover:text-black"
            >
              {company}
            </span>
          ))}
        </motion.div>

      </div>
    </section>
  );
}