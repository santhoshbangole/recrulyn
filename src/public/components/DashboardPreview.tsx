import { motion } from "framer-motion";

export default function DashboardPreview() {
  return (
    <section className="bg-white py-28">

      <div className="mx-auto max-w-7xl px-6">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold uppercase tracking-[0.35em] text-green-700"
        >
          PRODUCT EXPERIENCE
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-5 max-w-4xl text-center text-5xl font-bold text-gray-900"
        >
          Everything you need.
          <span className="block">
            One intelligent workspace.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-gray-600"
        >
          A single platform where recruitment,
          AI, documents, workflows and analytics
          work together seamlessly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-20 overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-2xl"
        >

          <img
            src="/dashboard-preview.png"
            alt="Dashboard"
            className="w-full"
          />

        </motion.div>

      </div>

    </section>
  );
}