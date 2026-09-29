import { motion } from "framer-motion";

const stats = [
  {
    value: "10x",
    label: "FASTER HIRING",
    desc: "AI-powered candidate matching and automated workflows.",
  },
  {
    value: "98%",
    label: "MATCH ACCURACY",
    desc: "Precision resume parsing and intelligent candidate ranking.",
  },
  {
    value: "50K+",
    label: "CANDIDATES",
    desc: "Profiles processed through the RECRULYN platform.",
  },
  {
    value: "24/7",
    label: "AI COPILOT",
    desc: "Automated HR assistance and workflow execution.",
  },
];

export default function Stats() {
  return (
    <section className="py-32 px-8 bg-[#fbf9f4] border-y border-[#c4c7c7]/30">

      <div className="max-w-[1440px] mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-display text-6xl text-[#1b1c19]">
            Enterprise scale.
            <br />
            <span className="italic text-[#775a19]">
              Human simplicity.
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 border border-[#c4c7c7]">

          {stats.map((item, index) => (

            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .1 }}
              viewport={{ once: true }}
              className="border border-[#c4c7c7] p-12 bg-white hover:bg-[#f5f3ee] transition-all duration-500"
            >

              <h3 className="font-display text-6xl text-[#1b1c19]">
                {item.value}
              </h3>

              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">
                {item.label}
              </p>

              <p className="mt-6 text-lg leading-8 text-[#444748]">
                {item.desc}
              </p>

            </motion.div>

          ))}

        </div>

      </div>

    </section>
  );
}