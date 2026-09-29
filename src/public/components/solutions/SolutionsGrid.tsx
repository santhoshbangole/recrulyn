import {
  Bot,
  UserSearch,
  Users,
  FileText,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

import SolutionCard from "./SolutionCard";

const solutions = [
  {
    title: "AI Recruitment",
    description:
      "Automate hiring with AI resume parsing, candidate ranking, interview scheduling and offer generation.",
    href: "/solutions/recruitment",
    icon: <UserSearch size={22} />,
  },
  {
    title: "Employee Management",
    description:
      "Manage employees, departments, attendance and complete workforce lifecycle.",
    href: "/solutions",
    icon: <Users size={22} />,
  },
  {
    title: "Document Automation",
    description:
      "Generate LOA, NDA, Certificates, LOR, LOC and digitally signed documents.",
    href: "/solutions",
    icon: <FileText size={22} />,
  },
  {
    title: "Approval Workflow",
    description:
      "Simplify leave approvals, onboarding approvals and document approval workflows.",
    href: "/solutions",
    icon: <CheckCircle2 size={22} />,
  },
  {
    title: "Analytics",
    description:
      "Real-time hiring analytics, workforce insights and enterprise dashboards.",
    href: "/solutions",
    icon: <BarChart3 size={22} />,
  },
  {
    title: "AI Assistant",
    description:
      "Your intelligent HR copilot for recruitment, documents and employee support.",
    href: "/solutions",
    icon: <Bot size={22} />,
  },
];
export default function SolutionsGrid() {
  return (
    <section className="bg-[#fbf9f4] py-24">
      <div className="mx-auto max-w-[1140px] px-6">

        <div className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            OUR SOLUTIONS
          </p>

          <h2 className="mt-4 font-display text-[46px] leading-tight text-[#1b1c19] md:text-[60px]">
            Everything your organization
            <br />
            needs in one platform.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.title}
              title={solution.title}
              description={solution.description}
              href={solution.href}
              icon={solution.icon}
            />
          ))}
        </div>

      </div>
    </section>
  );
}