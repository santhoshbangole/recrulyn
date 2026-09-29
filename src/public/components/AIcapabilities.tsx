import { motion } from "framer-motion";
import { revealUp, viewportOnce } from "../../lib/motion";

const CAPABILITIES = [
  { label: "Explain a variance", detail: "Cites the exact source rows behind any number." },
  { label: "Draft a reconciliation note", detail: "Written in your team's own terminology, ready to send." },
  { label: "Flag anomalous access", detail: "Compares grants against role baselines automatically." },
  { label: "Forecast exception volume", detail: "Projects next week's review queue from historical load." },
];

export default function AICapabilities() {
  return (
    <section id="ai-capabilities" className="bg-canvas py-24 md:py-32">
      <div className="mx-auto max-w-content px-6 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-teal">
            AI capabilities
          </span>
          <h2 className="font-display font-semibold text-ink text-[32px] md:text-[40px] leading-tight tracking-tight mt-3 max-w-[480px]">
            A copilot that reasons over your ledger, not a generic chatbot.
          </h2>
          <p className="text-slate text-[15px] leading-relaxed mt-5 max-w-[460px]">
            Every answer traces back to the underlying rows in AUREX's ledger —
            so your team can verify, not just trust.
          </p>
        </motion.div>

        <motion.div
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="rounded-lg border border-slate/12 bg-ink shadow-card overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <span className="font-mono text-[11px] text-ink-text-soft">AUREX Copilot</span>
            <span className="font-mono text-[11px] text-teal-soft">● reasoning over 42,102 rows</span>
          </div>
          <div className="p-5 space-y-1">
            {CAPABILITIES.map((c) => (
              <div
                key={c.label}
                className="flex items-start gap-3 py-3 border-t border-white/[0.06] first:border-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-1 shrink-0">
                  <path d="M2 7l3.5 3.5L12 3" stroke="#4FA89D" strokeWidth="1.6" />
                </svg>
                <div>
                  <p className="text-[13.5px] text-ink-text">{c.label}</p>
                  <p className="text-[12.5px] text-ink-text-soft mt-0.5">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}