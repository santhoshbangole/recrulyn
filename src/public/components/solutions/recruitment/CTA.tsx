// src/public/components/solutions/recruitment/CTA.tsx

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function CTA() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a] py-32 text-white">

      {/* Background */}

      <div className="absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-green-500/20 blur-[120px]" />

      <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-emerald-400/20 blur-[120px]" />

      <div className="relative mx-auto max-w-[1000px] px-6 text-center">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
        >

          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/30 bg-green-500/10 px-5 py-2">

            <Sparkles
              size={15}
              className="text-green-400"
            />

            <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-green-300">
              Ready to Transform Hiring?
            </span>

          </div>

          <h2 className="mt-8 font-display text-[64px] leading-tight">

            Start hiring with
            <br />

            <span className="text-green-400">
              Enterprise AI
            </span>

          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-[20px] leading-9 text-slate-300">

            Automate resume screening, identify the best
            candidates, accelerate recruitment and deliver
            a world-class hiring experience using
            RECRULYN.

          </p>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-5">

            <Link
              to="/login"
              className="
              group
              flex
              items-center
              gap-3
              rounded-xl
              bg-green-600
              px-8
              py-4
              text-lg
              font-semibold
              transition
              hover:bg-green-700
              "
            >

              Enter Workspace

              <ArrowRight
                size={20}
                className="transition group-hover:translate-x-1"
              />

            </Link>

            <Link
              to="/solutions"
              className="
              rounded-xl
              border
              border-slate-600
              px-8
              py-4
              text-lg
              transition
              hover:border-white
              hover:bg-white
              hover:text-black
              "
            >
              Explore Solutions
            </Link>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">

            <div>

              <h3 className="text-5xl font-bold text-green-400">
                95%
              </h3>

              <p className="mt-3 text-slate-400">
                AI Matching Accuracy
              </p>

            </div>

            <div>

              <h3 className="text-5xl font-bold text-green-400">
                10×
              </h3>

              <p className="mt-3 text-slate-400">
                Faster Recruitment
              </p>

            </div>

            <div>

              <h3 className="text-5xl font-bold text-green-400">
                24/7
              </h3>

              <p className="mt-3 text-slate-400">
                AI Recruitment Assistant
              </p>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}