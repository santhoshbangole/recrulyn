import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="border-t border-[#c4c7c7] bg-[#fbf9f4] py-24">
      <div className="mx-auto max-w-[1140px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="border border-[#c4c7c7] bg-white px-14 py-20"
        >

          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            Ready for the HR demo?
          </p>

          <h2 className="max-w-4xl font-display text-[46px] leading-[1.15] text-[#1b1c19] md:text-[64px]">
            Run hiring like a people team,
            <br />
            not a mailbox.
          </h2>

          <p className="mt-8 max-w-2xl text-[18px] leading-8 text-[#444748]">
            Screen campus and lateral talent, generate offer letters and NDAs,
            track leave, and keep managers in the approval loop—without
            leaving Recrulyn.
          </p>

          <div className="mt-12 flex flex-wrap gap-0">

            <Link to="/login" className="border border-black bg-black px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition hover:bg-[#2b2b2b]">
              Enter HR demo
            </Link>

            <Link to="/solutions/recruitment" className="flex items-center gap-2 border border-l-0 border-[#c4c7c7] bg-[#fbf9f4] px-10 py-4 font-mono text-[11px] uppercase tracking-[0.3em] transition hover:bg-[#f5f3ee]">
              See hiring flow
              <ArrowRight size={15} />
            </Link>

          </div>

        </motion.div>

        <div className="mt-12 grid gap-0 border border-[#c4c7c7] md:grid-cols-3">

          {[
            {
              value: "10×",
              title: "Faster Hiring",
            },
            {
              value: "99.9%",
              title: "Platform Availability",
            },
            {
              value: "24/7",
              title: "AI Workforce Assistant",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="border border-[#c4c7c7] bg-[#f5f3ee] px-10 py-10"
            >

              <h3 className="font-display text-[42px] text-[#1b1c19]">
                {item.value}
              </h3>

              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#775a19]">
                {item.title}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}