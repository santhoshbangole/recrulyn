import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  Users,
  BarChart3,
  Bot,
  Workflow,
} from "lucide-react";

const solutions = [
  {
    icon: BrainCircuit,
    title: "AI Recruitment",
    description:
      "Screen, rank and shortlist candidates with intelligent AI assistance.",
  },
  {
    icon: FileText,
    title: "Document Intelligence",
    description:
      "Generate offer letters, certificates and HR documents automatically.",
  },
  {
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Digitize approvals, onboarding and repetitive enterprise operations.",
  },
  {
    icon: Users,
    title: "Candidate Management",
    description:
      "Manage every applicant from sourcing to onboarding in one workspace.",
  },
  {
    icon: BarChart3,
    title: "Enterprise Analytics",
    description:
      "Gain actionable insights with real-time dashboards and reports.",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description:
      "Empower teams with an intelligent assistant for everyday operations.",
  },
];

export default function Solutions() {
  return (
    <section
      id="solutions"
      className="bg-gray-50 py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm font-semibold uppercase tracking-[0.3em] text-green-700"
        >
          SOLUTIONS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-5 max-w-4xl text-center text-5xl font-bold text-gray-900"
        >
          Built for modern enterprises.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mt-8 max-w-3xl text-center text-lg leading-8 text-gray-600"
        >
          Everything required to manage people,
          documents and enterprise workflows
          from one intelligent platform.
        </motion.p>

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {solutions.map((item, index) => {

            const Icon = item.icon;

            return (

              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.08,
                }}
                viewport={{ once: true }}
                whileHover={{
                  y: -8,
                }}
                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:border-green-200 hover:shadow-xl"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
                  <Icon
                    className="h-7 w-7 text-green-700"
                  />
                </div>

                <h3 className="mt-6 text-2xl font-bold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-gray-600">
                  {item.description}
                </p>

              </motion.div>

            );
          })}
        </div>

      </div>
    </section>
  );
}