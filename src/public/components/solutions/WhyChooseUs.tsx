import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  "AI-powered recruitment automation",
  "Enterprise-grade security",
  "Multi-tenant architecture",
  "Document automation",
  "Approval workflows",
  "Advanced workforce analytics",
  "Scalable cloud infrastructure",
  "Role-based access control",
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#fbf9f4] py-28">
      <div className="mx-auto grid max-w-[1140px] gap-20 px-6 lg:grid-cols-2">

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            WHY RECRULYN
          </p>

          <h2 className="mt-5 font-display text-[50px] leading-tight text-[#1b1c19] md:text-[64px]">
            Built for
            <br />
            people teams.
          </h2>

          <p className="mt-8 text-[18px] leading-9 text-[#444748]">
            Recrulyn is the desk HR actually uses: campus and lateral hiring,
            intern paperwork, leave, and manager approvals in one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="grid gap-4"
        >

          {benefits.map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 border border-[#c4c7c7] bg-white px-6 py-5"
            >
              <div className="flex h-9 w-9 items-center justify-center border border-[#775a19] bg-[#fbf9f4]">
                <Check
                  size={18}
                  className="text-[#775a19]"
                />
              </div>

              <span className="text-[17px] text-[#1b1c19]">
                {item}
              </span>
            </div>
          ))}

        </motion.div>

      </div>
    </section>
  );
}