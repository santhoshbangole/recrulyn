import { Link } from "react-router-dom";

const product = [
  { label: "AI Recruitment", href: "/solutions/recruitment" },
  { label: "Resume Intelligence", href: "/resume-demo" },
  { label: "Documents & LOA", href: "/solutions" },
  { label: "Leave & Approvals", href: "/solutions" },
];

const company = [
  { label: "Platform", href: "/" },
  { label: "Solutions", href: "/solutions" },
  { label: "Open demo", href: "/login" },
  { label: "Sign in", href: "/login" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[#c4c7c7] bg-[#fbf9f4]">
      <div className="mx-auto max-w-[1440px] px-8 py-24">
        <div className="grid gap-20 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <h2 className="font-display text-5xl text-[#1b1c19]">RECRULYN</h2>
            <p className="mt-8 max-w-md text-lg leading-8 text-[#444748]">
              Recrulyn is the AI HR workspace for talent acquisition and people
              operations. Screen candidates, issue HR documents, manage leave,
              and brief leadership from one desk.
            </p>
            <div className="mt-10 flex gap-4">
              <Link to="/" className="border border-[#c4c7c7] px-5 py-3 hover:bg-[#f5f3ee]">
                Home
              </Link>
              <Link to="/login" className="border border-[#c4c7c7] px-5 py-3 hover:bg-[#f5f3ee]">
                Demo login
              </Link>
              <a href="mailto:hr@reude.tech" className="border border-[#c4c7c7] px-5 py-3 hover:bg-[#f5f3ee]">
                Email HR
              </a>
            </div>
          </div>

          <div>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">
              Product
            </p>
            <div className="space-y-5">
              {product.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block text-lg text-[#444748] hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.3em] text-[#775a19]">
              Company
            </p>
            <div className="space-y-5">
              {company.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="block text-lg text-[#444748] hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display text-3xl leading-tight text-[#1b1c19]">
              Walk the full
              <br />
              HR hiring loop.
            </p>
            <Link
              to="/login"
              className="mt-10 inline-block border border-black bg-black px-10 py-5 font-mono text-xs uppercase tracking-[0.25em] text-white transition hover:bg-[#30312e]"
            >
              Start demo
            </Link>
          </div>
        </div>

        <div className="mt-20 flex flex-col justify-between gap-4 border-t border-[#c4c7c7] pt-8 md:flex-row">
          <p className="text-[#444748]">© 2026 RECRULYN. All rights reserved.</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#775a19]">
            AI HR Workspace · Demo
          </p>
        </div>
      </div>
    </footer>
  );
}
