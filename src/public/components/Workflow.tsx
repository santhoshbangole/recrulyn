import { motion } from "framer-motion";
import { revealUp, revealContainer, viewportOnce } from "../../lib/motion";

const STEPS = [
  {
    time: "Day 1",
    title: "Connect your systems",
    body: "Native connectors pull from your ERP, CRM, and identity provider — read-only until you're ready.",
  },
  {
    time: "Day 3",
    title: "AUREX builds the ledger",
    body: "Records are matched and reconciled automatically; exceptions surface in a review queue, not your inbox.",
  },
  {
    time: "Week 2",
    title: "Automate the repeat work",
    body: "Turn your team's manual steps into workflows they can see, edit, and hand off.",
  },
  {
    time: "Week 4",
    title: "Go live on one ledger",
    body: "Finance, ops, and security work from the same numbers — no more end-of-month reconciliation.",
  },
];

export default function Workflow() {
  return (
    <section id="workflow" className="bg-ink py-24 md:py-32 border-t border-white/8">
      <div className="mx-auto max-w-content px-6">
        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-[600px] mb-16"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold">
            How it works
          </span>
          <h2 className="font-display font-semibold text-ink-text text-[32px] md:text-[42px] leading-tight tracking-tight mt-3">
            From scattered systems to one ledger, in four weeks.
          </h2>
        </motion.div>

        <motion.div
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="relative grid md:grid-cols-4 gap-8 md:gap-6"
        >
          <div className="hidden md:block absolute top-[9px] left-0 right-0 h-px bg-white/10" aria-hidden />
          {STEPS.map((step) => (
            <motion.div key={step.title} variants={revealUp} className="relative">
              <div className="flex items-center gap-3 md:block">
                <span className="w-[9px] h-[9px] rounded-full bg-gold shrink-0 relative z-10" />
                <span className="font-mono text-[11px] text-gold md:mt-3 block">{step.time}</span>
              </div>
              <h3 className="font-display text-[17px] text-ink-text mt-3 mb-2">{step.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-ink-text-soft">{step.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}