import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";

const SOLUTIONS = [
  {
    title: "AI Recruitment",
    desc: "Resume parsing, AI ranking & hiring",
    href: "/solutions/recruitment",
  },
  {
    title: "Employee Management",
    desc: "Complete workforce lifecycle",
    href: "/solutions",
  },
  {
    title: "Document Automation",
    desc: "LOA, NDA, Certificates & LOR",
    href: "/solutions",
  },
  {
    title: "Approval Workflow",
    desc: "Multi-level approval engine",
    href: "/solutions",
  },
  {
    title: "Analytics",
    desc: "Hiring & workforce dashboards",
    href: "/solutions",
  },
  {
    title: "AI Assistant",
    desc: "Enterprise HR Copilot",
    href: "/solutions",
  },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(251,249,244,.96)"
          : "rgba(251,249,244,.75)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(196,199,199,.7)",
      }}
    >
      <nav className="mx-auto flex h-20 max-w-[1140px] items-center justify-between px-6">

        <Link
          to="/"
          className="flex items-center gap-4"
        >
          <img
            src="/Logo-Monogram.png"
            alt="RECRULYN"
            className="h-11 w-11 rounded-lg object-cover shadow-sm"
          />

          <div>
            <h2 className="font-display text-[26px] leading-none text-[#1b1c19]">
              RECRULYN
            </h2>

            <p className="mt-1 text-[12px] tracking-wide text-[#6b7280]">
            AI HR Workspace
            </p>
          </div>
        </Link>
        {/* Desktop Menu */}

<ul className="hidden items-center gap-10 lg:flex">

  <li>
    <Link
      to="/"
      className="text-[15px] font-medium text-[#444748] transition hover:text-black"
    >
      Platform
    </Link>
  </li>

  <li
    className="relative"
    onMouseEnter={() => setSolutionsOpen(true)}
    onMouseLeave={() => setSolutionsOpen(false)}
  >

    <button className="flex items-center gap-1 text-[15px] font-medium text-[#444748] transition hover:text-black">

      Solutions

      <ChevronDown
        size={16}
        className={`transition duration-300 ${
          solutionsOpen ? "rotate-180" : ""
        }`}
      />

    </button>

    <AnimatePresence>

      {solutionsOpen && (

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: .2 }}
          className="
          absolute
          left-1/2
          top-14
          z-50
          w-[460px]
          -translate-x-1/2
          overflow-hidden
          rounded-2xl
          border
          border-[#e5e2dd]
          bg-white
          shadow-[0_30px_80px_rgba(0,0,0,.08)]
          "
        >

          <div className="border-b border-[#ece9e3] bg-[#f8f6f1] px-6 py-5">

            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">
              Enterprise Solutions
            </p>

            <h3 className="mt-2 font-display text-[28px] text-[#1b1c19]">
              Everything HR needs.
            </h3>

          </div>

          <div className="p-3">

            {SOLUTIONS.map((item) => (

              <Link
                key={item.title}
                to={item.href}
                className="
                group
                flex
                items-start
                justify-between
                rounded-xl
                p-4
                transition
                hover:bg-[#f7f5ef]
                "
              >

                <div>

                  <h4 className="font-semibold text-[#1b1c19]">
                    {item.title}
                  </h4>

                  <p className="mt-1 text-[13px] leading-6 text-[#6b7280]">
                    {item.desc}
                  </p>

                </div>

                <ArrowUpRight
                  size={16}
                  className="mt-1 text-[#888] transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />

              </Link>

            ))}

          </div>

        </motion.div>

      )}

    </AnimatePresence>

  </li>

  <li>

    <Link
      to="/solutions"
      className="text-[15px] font-medium text-[#444748] transition hover:text-black"
    >
      Analytics
    </Link>

  </li>

</ul>
        {/* Desktop Buttons */}

        <div className="hidden items-center gap-3 lg:flex">

          <Link
            to="/login"
            className="px-4 py-2 text-[15px] font-medium text-[#444748] transition hover:text-black"
          >
            Login
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-black bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#30312e]"
          >
            Open demo
          </Link>

        </div>

        {/* Mobile Toggle */}

        <button
          onClick={() => setOpen(!open)}
          className="lg:hidden"
        >
          <svg
            width="24"
            height="24"
            fill="none"
          >
            {open ? (
              <path
                d="M5 5L19 19M19 5L5 19"
                stroke="#1b1c19"
                strokeWidth="2"
              />
            ) : (
              <>
                <path
                  d="M3 6H21"
                  stroke="#1b1c19"
                  strokeWidth="2"
                />
                <path
                  d="M3 12H21"
                  stroke="#1b1c19"
                  strokeWidth="2"
                />
                <path
                  d="M3 18H21"
                  stroke="#1b1c19"
                  strokeWidth="2"
                />
              </>
            )}
          </svg>
        </button>

      </nav>

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: .25 }}
            className="border-t border-[#e8e5df] bg-[#fbf9f4] lg:hidden"
          >

            <div className="mx-auto max-w-[1140px] px-6 py-6">

              <div className="flex flex-col">

                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 text-[16px] font-medium"
                >
                  Platform
                </Link>

                <Link
                  to="/solutions"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 text-[16px] font-medium"
                >
                  Solutions
                </Link>

                <Link
                 to="/solutions/recruitment"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 pl-4 text-[15px] text-[#666]"
                >
                  AI Recruitment
                </Link>

                <Link
                  to="/solutions"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 pl-4 text-[15px] text-[#666]"
                >
                  Employee Management
                </Link>

                <Link
                  to="/solutions"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 pl-4 text-[15px] text-[#666]"
                >
                  Document Automation
                </Link>

                <Link
                  to="/solutions"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 pl-4 text-[15px] text-[#666]"
                >
                  Approval Workflow
                </Link>

                <Link
                  to="/solutions"
                  onClick={() => setOpen(false)}
                  className="border-b border-[#ece9e3] py-4 text-[16px] font-medium"
                >
                  Analytics
                </Link>

              </div>

              <div className="mt-8 flex flex-col gap-3">

                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[#d9d7d2] px-5 py-3 text-center font-medium transition hover:bg-[#f5f3ee]"
                >
                  Login
                </Link>

                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-black bg-black px-5 py-3 text-center font-medium text-white transition hover:bg-[#30312e]"
                >
                  Open demo
                </Link>

              </div>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.header>
  );
}