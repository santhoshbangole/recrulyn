import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ReudeyAssistant from "../../components/reudey/ReudeyAssistant";
import { Sidebar } from "./Sidebar";
import Topbar from "./Topbar";

/* ============================================================
   DESIGN TOKENS — "Linen & Iris", same system as Sidebar,
   Topbar, and the AI Recruiter page. This is the third copy of
   this object — a good signal it's time to move it into one
   shared file (e.g. src/styles/tokens.ts) that all four import
   from, so the palette can't quietly drift between components.
============================================================ */

const TOKENS = {
  iris: "#2F7D4A",
  quartz: "#E8F4EC",
  sage: "#AEDFC5",
  sand: "#F6DDB0",
  linen: "#F7F8FA",
};

/* ------------------------------------------------------------
   AmbientShell — the one mesh-gradient canvas behind the whole
   app frame. Sidebar and Topbar sit on top of it as translucent
   glass panels, so the same ambient light bleeds through their
   blur instead of three separate flat backgrounds competing.
   Fixed + -z-10, so it never affects scroll or layout.
------------------------------------------------------------ */
function AmbientShell({ calm }: { calm: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 8% 10%, ${TOKENS.quartz}40 0%, transparent 40%),
            radial-gradient(circle at 92% 6%, ${TOKENS.iris}1f 0%, transparent 46%),
            radial-gradient(circle at 85% 92%, ${TOKENS.sage}38 0%, transparent 44%),
            radial-gradient(circle at 6% 94%, ${TOKENS.sand}40 0%, transparent 42%),
            ${TOKENS.linen}
          `,
        }}
      />

      <motion.div
        aria-hidden
        className="absolute -left-32 -top-28 h-[30rem] w-[30rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${TOKENS.iris}26, transparent 70%)` }}
        animate={calm ? {} : { x: [0, 24, 0], y: [0, 16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[-10rem] top-1/3 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${TOKENS.quartz}70, transparent 70%)` }}
        animate={calm ? {} : { x: [0, -20, 0], y: [0, 20, 0] }}
        transition={{ duration: 23, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-[-9rem] left-1/4 h-[28rem] w-[28rem] rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${TOKENS.sage}55, transparent 70%)` }}
        animate={calm ? {} : { x: [0, 16, 0], y: [0, -14, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      <AmbientShell calm={!!prefersReducedMotion} />

      <Sidebar />

<div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">        <Topbar />

<main className="flex-1 overflow-y-auto overflow-x-hidden">         <div className="mx-auto w-full max-w-[1320px] px-6 pt-3 pb-6">
            <AnimatePresence mode="wait">
              <motion.div
  className="min-w-0 w-full"
  key={location.pathname}
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
>
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <ReudeyAssistant />
    </div>
  );
}