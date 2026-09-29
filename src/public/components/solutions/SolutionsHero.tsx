import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function SolutionsHero() {
  return (
    <section className="border-b border-[#d9d7d2] bg-[#fbf9f4] pt-40 pb-24">
      <div className="mx-auto max-w-[1140px] px-6">

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]"
        >
          Enterprise Solutions
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-5xl font-display text-[54px] leading-[1.08] text-[#1b1c19] md:text-[78px]"
        >
          One platform.
          <br />
          Every HR solution.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 max-w-2xl text-[20px] leading-9 text-[#444748]"
        >
          Discover AI-powered recruitment, employee management,
          document automation, approvals, analytics and enterprise
          workflow solutions designed to simplify every stage of
          your workforce lifecycle.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap gap-0"
        >
          <button className="border border-black bg-black px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition hover:bg-[#2f2f2f]">
            Explore Solutions
          </button>

          <button className="flex items-center gap-2 border border-l-0 border-[#c4c7c7] bg-white px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] transition hover:bg-[#f5f3ee]">
            Book Demo
            <ArrowRight size={16} />
          </button>
        </motion.div>

      </div>
    </section>
  );
}