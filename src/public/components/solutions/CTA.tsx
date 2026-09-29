import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="border-t border-[#d9d7d2] bg-white py-28">
      <div className="mx-auto max-w-[1140px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border border-[#c4c7c7] bg-[#fbf9f4] p-16"
        >

          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            START YOUR TRANSFORMATION
          </p>

          <h2 className="mt-6 max-w-4xl font-display text-[52px] leading-[1.1] text-[#1b1c19] md:text-[72px]">
            Ready to transform
            <br />
            your workforce?
          </h2>

          <p className="mt-8 max-w-2xl text-[18px] leading-9 text-[#444748]">
            Experience AI-powered recruitment, document automation,
            employee management and enterprise analytics through one
            intelligent workforce platform.
          </p>

          <div className="mt-14 flex flex-wrap gap-0">

            <a
              href="/login"
              className="border border-black bg-black px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition hover:bg-[#2f2f2f]"
            >
              Get Started
            </a>

            <a
              href="/solutions"
              className="flex items-center gap-2 border border-l-0 border-[#c4c7c7] bg-white px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] transition hover:bg-[#f5f3ee]"
            >
              Talk to Sales
              <ArrowRight size={15} />
            </a>

          </div>

        </motion.div>

      </div>
    </section>
  );
}