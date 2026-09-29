import { motion } from "framer-motion";
import {
  UserSearch,
  Badge,
  FileText,
  CheckCircle2,
  Bot,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: UserSearch,
    title: "Recruitment",
    desc: "AI-powered resume parsing, candidate ranking and hiring workflows.",
  },
  {
    icon: Badge,
    title: "Employee Management",
    desc: "Centralized employee profiles, departments and workforce records.",
  },
  {
    icon: FileText,
    title: "Documents",
    desc: "Generate LOA, NDA, certificates and manage secure documents.",
  },
  {
    icon: CheckCircle2,
    title: "Approvals",
    desc: "Leave approvals and multi-level workflow automation.",
  },
  {
    icon: Bot,
    title: "AI Automation",
    desc: "Automate repetitive HR tasks using intelligent AI assistants.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    desc: "Real-time dashboards for recruitment and HR insights.",
  },
];

export default function Platform() {
  return (
    <section
      id="platform"
      className="bg-[#fbf9f4] py-28"
    >
      <div className="mx-auto max-w-[1140px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 max-w-3xl border-l-2 border-black pl-8"
        >
          <h2 className="font-display text-5xl leading-tight text-[#1b1c19] md:text-6xl">
            Everything HR needs.
            <br />
            One intelligent platform.
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#444748]">
            Recrulyn centralizes talent screening, onboarding letters,
            employee records, leave, and hiring analytics for HR and
            people managers.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true }}
                className="group flex min-h-[190px] flex-col border border-[#c4c7c7] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#775a19] hover:bg-[#f8f6f1]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center border border-[#c4c7c7] transition-all group-hover:bg-black group-hover:text-white">
                  <Icon size={20} />
                </div>

                <h3 className="mb-2 font-display text-[30px] leading-tight text-[#1b1c19]">
                  {item.title}
                </h3>

                <p className="text-[15px] leading-7 text-[#444748]">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
}