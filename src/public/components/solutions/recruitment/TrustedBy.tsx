// src/public/components/solutions/recruitment/TrustedBy.tsx

import { motion } from "framer-motion";

const companies = [
  "Microsoft",
  "Google",
  "Amazon",
  "Infosys",
  "TCS",
  "Accenture",
];

export default function TrustedBy() {
  return (
    <section className="border-y border-[#e8e5df] bg-white py-16">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
        >

          <p className="mb-10 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            Trusted Recruitment Platform
          </p>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">

            {companies.map((company) => (
              <div
                key={company}
                className="
                flex
                h-24
                items-center
                justify-center
                rounded-xl
                border
                border-[#e7e4dc]
                bg-[#fbf9f4]
                text-lg
                font-semibold
                text-[#555]
                transition
                hover:border-green-500
                hover:bg-white
                "
              >
                {company}
              </div>
            ))}

          </div>

        </motion.div>

      </div>

    </section>
  );
}