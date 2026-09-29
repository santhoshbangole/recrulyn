import {
  Mail,
  FileText,
  UserPlus,
  RefreshCw,
  Send,
  Inbox as InboxIcon,
  Paperclip,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  FileSignature,
  Award,
  XCircle,
  Bell,
  Eye,
  Save,
  Download,
  ChevronRight,
  Zap,
  Settings as SettingsIcon,
  Layers,
  CalendarClock,
  PenLine,
  Loader2,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../components/notification";
import { emailTemplates } from "../../modules/email/data/email-templates";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { emailService, extractRoleFromSubject } from "../../modules/email/services/email.service";
import { emailAutomationService } from "../../modules/email/services/email-automation.service";
import type { EmailMessage } from "../../modules/email/services/email.service";
import { classifyAttachment } from "../../modules/documents/utils/attachmentKind";
import { emailHistoryService } from "../../modules/email/services/email.history";
import { emailDraftService } from "../../modules/email/services/email-draft.service";

/* ─────────────────────────────────────────────────────────────────────
   DESIGN SYSTEM — "SIGNAL"
   RECRULYN · AI Correspondence Engine

   This page is the candidate-correspondence layer of RECRULYN: every
   email, template, and import is one node in an automated pipeline.
   The UI leans into that — a connected "signal rail" instead of a
   plain tab list, a live engine bar instead of a spinner-only state,
   and a preview that visibly stays in sync with what's being composed.

   Palette (light neutral base, indigo + teal + emerald as the only
   accent families — no warm/feminine tones, no dark surfaces):
     canvas        #F5F7FB   cool, near-white workspace background
     card          #FFFFFF   surface
     sunken        #EEF2F8   recessed wells, table heads, rails
     border        #DEE4EE   default separators
     border-strong #C7D0E0   hover / focus-adjacent borders
     ink           #0E1526   primary text — near-navy, high contrast
     ink-2         #44506B   secondary text — still ≥7:1 on white
     ink-3         #7C879E   tertiary — timestamps, icon-only labels
     indigo        #4338CA   primary action / AI accent
     teal          #0F8B8D   live / sync / automation accent
     emerald       #047857   success, imported, completed
     amber         #B45309   pending, attention (status semantics only)
     rose          #BE123C   decline, error (status semantics only)

   Type:
     Display  Manrope  — brand, section titles, numerals
     Body/UI  Inter    — everything functional
     Mono     JetBrains Mono — counts, timestamps, status codes
────────────────────────────────────────────────────────────────────── */

const INK = { primary: "#0E1526", secondary: "#44506B", tertiary: "#7C879E" };

const SURFACE = {
  canvas: "#F5F7FB",
  card: "#FFFFFF",
  sunken: "#EEF2F8",
  border: "#DEE4EE",
  borderStrong: "#C7D0E0",
};

const ACCENT = {
  indigo: "#4338CA",
  indigoDeep: "#312E81",
  indigoTint: "#EEF1FE",
  indigoBorder: "#C7CFFB",
  teal: "#0F8B8D",
  tealDeep: "#0B6B6D",
  tealTint: "#E7F7F7",
  tealBorder: "#BCE6E6",
  emerald: "#047857",
  emeraldTint: "#E7F8EF",
  emeraldBorder: "#A9E8C7",
  amber: "#B45309",
  amberTint: "#FDF4E3",
  amberBorder: "#F6D9A6",
  rose: "#BE123C",
  roseTint: "#FCEAEE",
  roseBorder: "#F4BBC9",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.rq-root {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0E1526;
  font-size: 14.5px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}
.rq-display { font-family: 'Manrope', system-ui, sans-serif; }
.rq-mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: #94A3B8; }

@keyframes rq-float-a {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-18px) rotate(1.5deg); }
}
@keyframes rq-float-b {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(14px) rotate(-2deg); }
}
@keyframes rq-pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.85; }
}
.rq-float-a { animation: rq-float-a 19s ease-in-out infinite; }
.rq-float-b { animation: rq-float-b 23s ease-in-out infinite; }
.rq-pulse-glow { animation: rq-pulse-glow 4.2s ease-in-out infinite; }

@keyframes rq-shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.rq-skeleton {
  background: linear-gradient(90deg, #EEF1F6 25%, #F6F8FA 50%, #EEF1F6 75%);
  background-size: 400px 100%;
  animation: rq-shimmer 1.4s ease-in-out infinite;
  border-radius: 6px;
}
`;

/* ── Ambient background — restrained: two soft glows + a faint grid ── */
const AmbientBg = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: SURFACE.canvas }}>
    <div
      className="rq-float-a rq-pulse-glow absolute"
      style={{
        top: "-160px", left: "-100px",
        width: "560px", height: "560px",
        borderRadius: "50%",
        background: "radial-gradient(circle at center, rgba(67,56,202,0.10) 0%, transparent 70%)",
        filter: "blur(46px)",
      }}
    />
    <div
      className="rq-float-b rq-pulse-glow absolute"
      style={{
        top: "32%", right: "-150px",
        width: "480px", height: "480px",
        borderRadius: "50%",
        background: "radial-gradient(circle at center, rgba(15,139,141,0.09) 0%, transparent 70%)",
        filter: "blur(52px)",
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        backgroundImage:
          "linear-gradient(rgba(67,56,202,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(67,56,202,0.035) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    />
  </div>
);

/* ── Engine bar — a slim top-of-canvas indicator that the pipeline is
      actively working (sync, import, initial load). Communicates
      "the system is doing something" without a blocking spinner. ── */
const EngineBar = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", overflow: "hidden", zIndex: 6 }}
      >
        <motion.div
          style={{
            position: "absolute", top: 0, bottom: 0, width: "42%",
            background: `linear-gradient(90deg, transparent, ${ACCENT.indigo}, ${ACCENT.teal}, transparent)`,
          }}
          animate={{ left: ["-42%", "100%"] }}
          transition={{ repeat: Infinity, duration: 1.15, ease: "easeInOut" }}
        />
      </motion.div>
    )}
  </AnimatePresence>
);

/* ── Primitives ──────────────────────────────────────────────────────── */
const Card = ({ children, className = "", style = {}, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    {...rest}
    style={{
      background: SURFACE.card,
      border: `1px solid ${SURFACE.border}`,
      borderRadius: "14px",
      boxShadow: "0 1px 3px rgba(14,21,38,0.06), 0 1px 2px rgba(14,21,38,0.04)",
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

const Divider = () => <div style={{ height: "1px", background: SURFACE.border }} />;

type TagColor = "indigo" | "teal" | "emerald" | "amber" | "rose" | "slate";

const Tag = ({ children, color = "indigo" }: { children: React.ReactNode; color?: TagColor }) => {
  const map: Record<TagColor, { bg: string; color: string; border: string }> = {
    indigo: { bg: ACCENT.indigoTint, color: ACCENT.indigoDeep, border: ACCENT.indigoBorder },
    teal: { bg: ACCENT.tealTint, color: ACCENT.tealDeep, border: ACCENT.tealBorder },
    emerald: { bg: ACCENT.emeraldTint, color: "#065F46", border: ACCENT.emeraldBorder },
    amber: { bg: ACCENT.amberTint, color: ACCENT.amber, border: ACCENT.amberBorder },
    rose: { bg: ACCENT.roseTint, color: ACCENT.rose, border: ACCENT.roseBorder },
    slate: { bg: SURFACE.sunken, color: INK.secondary, border: SURFACE.border },
  };
  const s = map[color];
  return (
    <span
      className="rq-mono inline-flex items-center gap-1"
      style={{
        background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 600,
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
};


/* ── Spinner — used inline inside buttons to show the pipeline working ── */
const Spinner = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <motion.span
    style={{ display: "inline-flex", flexShrink: 0 }}
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
  >
    <Loader2 size={size} color={color} />
  </motion.span>
);

/* ── Buttons ─────────────────────────────────────────────────────────── */
type BtnExtra = { icon?: any; loading?: boolean };

const BtnPrimary = ({ children, icon: Icon, loading, disabled, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & BtnExtra) => (
  <motion.button
    whileHover={!disabled && !loading ? { scale: 1.015, y: -1 } : undefined}
    whileTap={!disabled && !loading ? { scale: 0.975 } : undefined}
    disabled={disabled || loading}
    {...(rest as any)}
    className={className}
    style={{
      display: "inline-flex", alignItems: "center", gap: "7px",
      padding: "9px 18px", borderRadius: "9px", border: "none",
      background: `linear-gradient(135deg, ${ACCENT.indigo} 0%, ${ACCENT.indigoDeep} 100%)`,
      color: "#fff", fontSize: "13.5px", fontWeight: 600,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      boxShadow: "0 1px 3px rgba(67,56,202,0.35), 0 4px 14px rgba(67,56,202,0.22)",
      letterSpacing: "0.01em", fontFamily: "Inter, sans-serif",
      opacity: disabled ? 0.5 : 1,
    }}
  >
    {loading ? <Spinner /> : Icon ? <Icon size={14} /> : null}
    {children}
  </motion.button>
);

const BtnSecondary = ({ children, icon: Icon, loading, disabled, className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & BtnExtra) => (
  <motion.button
    whileHover={!disabled && !loading ? { scale: 1.01, y: -0.5 } : undefined}
    whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
    disabled={disabled || loading}
    {...(rest as any)}
    className={className}
    style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "8px 16px", borderRadius: "9px",
      border: `1px solid ${SURFACE.border}`, background: SURFACE.card,
      color: INK.secondary, fontSize: "13.5px", fontWeight: 600,
      cursor: disabled || loading ? "not-allowed" : "pointer",
      boxShadow: "0 1px 2px rgba(14,21,38,0.04)",
      letterSpacing: "0.01em", fontFamily: "Inter, sans-serif",
      opacity: disabled ? 0.55 : 1,
    }}
  >
    {loading ? <Spinner size={13} color={ACCENT.indigo} /> : Icon ? <Icon size={13} /> : null}
    {children}
  </motion.button>
);

const BtnGhost = ({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <motion.button
    whileHover={{ background: SURFACE.sunken }}
    whileTap={{ scale: 0.97 }}
    {...(rest as any)}
    style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "6px 12px", borderRadius: "7px", border: "none",
      background: "transparent", color: ACCENT.indigoDeep,
      fontSize: "13px", fontWeight: 600, cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    }}
  >
    {children}
  </motion.button>
);

/* ── Form atoms ──────────────────────────────────────────────────────── */
const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: "11.5px", fontWeight: 700, color: INK.tertiary, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 13px", borderRadius: "9px",
  border: `1px solid ${SURFACE.border}`, background: "#FAFBFC",
  fontSize: "14px", fontWeight: 500, color: INK.primary,
  outline: "none", fontFamily: "Inter, sans-serif",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

const focusRing = (e: any) => { e.target.style.borderColor = ACCENT.indigo; e.target.style.boxShadow = `0 0 0 3px ${ACCENT.indigoTint}`; };
const blurRing = (e: any) => { e.target.style.borderColor = SURFACE.border; e.target.style.boxShadow = "none"; };

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{ ...inputStyle, ...props.style }}
    onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
    onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
  />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    style={{
      ...inputStyle, appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2344506B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: "36px", cursor: "pointer",
      ...props.style,
    }}
    onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
    onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    style={{ ...inputStyle, resize: "none", lineHeight: "1.65", ...props.style }}
    onFocus={(e) => { focusRing(e); props.onFocus?.(e); }}
    onBlur={(e) => { blurRing(e); props.onBlur?.(e); }}
  />
);

/* ── Nav / workflow stages ───────────────────────────────────────────── */
type TabKey = "compose" | "templates" | "inbox" | "schedule" | "settings";

const NAV: { key: TabKey; label: string; icon: any; desc: string }[] = [
  { key: "compose", label: "Compose", icon: PenLine, desc: "Write & send" },
  { key: "templates", label: "Templates", icon: Layers, desc: "Email library" },
  { key: "inbox", label: "Inbox", icon: InboxIcon, desc: "Manage mail" },
  { key: "schedule", label: "Drafts", icon: CalendarClock, desc: "Saved drafts" },
  { key: "settings", label: "Settings", icon: SettingsIcon, desc: "Preferences" },
];

/* Sidebar doubles as the workflow's signal rail: stages are connected
   by a track, the active stage glows, and the highlight glides between
   stages with spring physics — a deliberate stand-in for "the pipeline
   moving" rather than a decorative line. */
const Sidebar = ({
  active,
  onChange,
  pendingCount,
  importedCount,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  pendingCount: number;
  importedCount: number;
}) => (
  <aside style={{
    width: "224px", flexShrink: 0, display: "flex", flexDirection: "column",
    background: SURFACE.card, borderRight: `1px solid ${SURFACE.border}`, height: "100%",
  }}>
    {/* Brand */}
    <div style={{ padding: "20px 20px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
          background: `linear-gradient(135deg, ${ACCENT.indigo}, ${ACCENT.teal})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 3px 10px rgba(67,56,202,0.32)",
        }}>
          <Mail size={16} color="white" />
        </div>
        <div>
          <div className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary, lineHeight: 1.15 }}>RECRULYN</div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: INK.tertiary, letterSpacing: "0.05em" }}>AI CORRESPONDENCE</div>
        </div>
      </div>
    </div>

    <Divider />

    {/* Nav items — connected as workflow stages */}
    <nav style={{ padding: "14px 10px", flex: 1, overflowY: "auto" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: INK.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px", marginBottom: "10px" }}>
        Workflow
      </div>

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: "23px", top: "16px", bottom: "16px", width: "2px", background: SURFACE.sunken, borderRadius: "2px" }} />
        {NAV.map((item) => {
          const isActive = active === item.key;
          return (
            <motion.button
              key={item.key}
              onClick={() => onChange(item.key)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 10px", borderRadius: "9px", border: "none", cursor: "pointer",
                background: "transparent",
                color: isActive ? ACCENT.indigoDeep : INK.secondary,
                marginBottom: "3px", textAlign: "left", position: "relative", zIndex: 1,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  style={{
                    position: "absolute", inset: 0, borderRadius: "9px",
                    background: ACCENT.indigoTint, border: `1px solid ${ACCENT.indigoBorder}`,
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span style={{
                position: "relative", zIndex: 1, width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                background: isActive ? ACCENT.indigo : SURFACE.borderStrong,
                boxShadow: isActive ? `0 0 0 3px ${ACCENT.indigoTint}` : "none",
                transition: "all 0.2s",
              }} />
              <item.icon size={15} style={{ position: "relative", zIndex: 1, flexShrink: 0, color: isActive ? ACCENT.indigo : INK.tertiary }} />
              <span style={{ position: "relative", zIndex: 1, fontSize: "13.5px", fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              {item.key === "inbox" && pendingCount > 0 && (
                <span style={{
                  position: "relative", zIndex: 1, marginLeft: "auto",
                  background: ACCENT.indigo, color: "white",
                  fontSize: "10.5px", fontWeight: 700, borderRadius: "6px",
                  padding: "1px 6px", fontFamily: "JetBrains Mono, monospace",
                }}>
                  {pendingCount}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Status summary */}
      <div style={{ marginTop: "22px", marginBottom: "8px" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: INK.tertiary, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 12px", marginBottom: "8px" }}>
          Status
        </div>
        <div style={{ padding: "0 2px", display: "flex", flexDirection: "column", gap: "5px" }}>
          {[
            { label: "Imported", value: importedCount, dot: ACCENT.emerald },
            { label: "Pending", value: pendingCount, dot: ACCENT.amber },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: "8px", background: SURFACE.sunken }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                <span style={{ fontSize: "12.5px", fontWeight: 600, color: INK.secondary }}>{s.label}</span>
              </div>
              <span className="rq-mono" style={{ fontSize: "12.5px", fontWeight: 700, color: INK.primary }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>

    {/* Footer — sender identity, doubles as a shortcut to Settings */}
    <button
      onClick={() => onChange("settings")}
      style={{ padding: "13px 14px", borderTop: `1px solid ${SURFACE.border}`, background: "transparent", border: "none", cursor: "pointer", textAlign: "left", width: "100%" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{ width: "29px", height: "29px", borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT.indigo}, ${ACCENT.teal})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "white", fontSize: "11px", fontWeight: 700 }}>HR</span>
        </div>
        <div>
          <div style={{ fontSize: "12.5px", fontWeight: 700, color: INK.primary }}>HR Team</div>
          <div style={{ fontSize: "11px", color: INK.tertiary }}>hr@reude.tech</div>
        </div>
      </div>
    </button>
  </aside>
);

/* ── Section header ──────────────────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, subtitle, action }: { icon: any; title: string; subtitle?: string; action?: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: ACCENT.indigoTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={17} color={ACCENT.indigo} />
      </div>
      <div>
        <h2 className="rq-display" style={{ fontSize: "17px", fontWeight: 800, color: INK.primary, lineHeight: 1.2 }}>{title}</h2>
        {subtitle && <p style={{ fontSize: "12.5px", color: INK.secondary, marginTop: "2px" }}>{subtitle}</p>}
      </div>
    </div>
    {action}
  </div>
);

/* ── Field wrapper ───────────────────────────────────────────────────── */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <Label>{label}</Label>
    {children}
  </div>
);

/* ── Template metadata ───────────────────────────────────────────────── */
const TEMPLATE_META: Record<string, { icon: any; color: string; bg: string; desc: string }> = {
  welcome: { icon: UserPlus, color: ACCENT.indigo, bg: ACCENT.indigoTint, desc: "Sent after candidate registration" },
  loa: { icon: FileSignature, color: ACCENT.teal, bg: ACCENT.tealTint, desc: "Internship Acceptance Letter" },
  nda: { icon: FileText, color: ACCENT.emerald, bg: ACCENT.emeraldTint, desc: "NDA for candidate signature" },
  reminder: { icon: Bell, color: ACCENT.amber, bg: ACCENT.amberTint, desc: "Follow-up for pending actions" },
  completion: { icon: Award, color: ACCENT.tealDeep, bg: ACCENT.tealTint, desc: "Internship completion email" },
  rejection: { icon: XCircle, color: ACCENT.rose, bg: ACCENT.roseTint, desc: "Politely decline an application" },
};

const TEMPLATE_CARDS = [
  { key: "welcome", title: "Welcome Email" },
  { key: "loa", title: "LOA Email" },
  { key: "nda", title: "NDA Email" },
  { key: "reminder", title: "Reminder Email" },
  { key: "completion", title: "Completion Certificate" },
  { key: "rejection", title: "Rejection Email" },
];

/* ── Main component ──────────────────────────────────────────────────── */
export default function EmailAutomationPage() {
  /* ──── All original business logic — untouched. Loading flags below
     are purely view-layer additions wrapped around the same calls, so
     buttons can show the engine working instead of going silent. ──── */
 const {
  success,
  error,
  warning,
} = useNotification();
  const navigate = useNavigate();
  async function testEmail() {
    setTestingEmail(true);
    try {
      const response = await emailAutomationService.sendTestEmail();
      console.log(response);
      success(
  "Success",
  "Edge Function reached successfully."
);
    } catch (err) {
      console.error(err);
      error(
  "Failed",
  "Failed to call send-email."
);
    } finally {
      setTestingEmail(false);
    }
  }

  async function sendEmail() {
    setSending(true);
    try {
      const processedSubject = replaceTemplatePlaceholders(subject, templateValues);
      const processedBody = replaceTemplatePlaceholders(body, templateValues);
      await emailAutomationService.sendEmail({
        to, cc, bcc,
        subject: processedSubject,
html: `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15pt;color:#000;line-height:1.5;">
  ${processedBody
    .replace(
      "Congratulations!",
      '<span style="color:#008000;font-weight:bold;">Congratulations!</span>'
    ) .replace(
    "Earliest joining date:",
    "<strong>Earliest joining date:</strong>"
  )
  .replace(
    "Internship Duration:",
    "<strong>Internship Duration:</strong>"
  )
  .replace(
    "University Supervisor Name [If any]:",
    "<strong>University Supervisor Name [If any]:</strong>"
  )
  .replace(
    "Project Title [If any]:",
    "<strong>Project Title [If any]:</strong>"
  )
  .replace(
    "Willing to work as a team with another intern: Yes/No",
    "<strong>Willing to work as a team with another intern:</strong> Yes/No"
  )
    .trim()
    .split(/\n\s*\n/)
    .map(
      (p) =>
        `<p style="margin:0 0 14px 0;">${p.replace(/\n/g, "<br/>")}</p>`
    )
    .join("")}
</div>

<br><br>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:650px;font-family:Arial,Helvetica,sans-serif;">

  <tr>
    <td colspan="2" style="border-top:3px solid #BDBDBD;padding-top:18px;"></td>
  </tr>

  <tr>
    <td valign="top" style="font-size:30px;font-weight:700;color:#111;">
      HR
    </td>

    <td align="right">
      <img
        src="${window.location.origin}/Logo-Monogram.png"
        alt="RECRULYN"
        style="height:68px;display:block;border:0;"
      />
    </td>
  </tr>

  <tr>
    <td></td>

    <td style="padding-top:16px;font-size:16px;line-height:1.9;">

      <div>
        <span style="color:#F97316;font-weight:bold;">E:</span>
        hr@reude.tech
      </div>

      <div>
        <span style="color:#F97316;font-weight:bold;">P:</span>
        ${senderPhone}
      </div>

      <div>
        <span style="color:#F97316;font-weight:bold;">W:</span>
        <a
          href="https://www.reude.tech"
          style="color:#2563EB;text-decoration:none;"
        >
          www.reude.tech
        </a>
      </div>

      <div style="margin-top:10px;">
        <a href="https://www.linkedin.com/company/reude-technologies">
          <img
            src="https://cdn-icons-png.flaticon.com/512/174/174857.png"
            width="28"
            height="28"
            style="border:0;"
          />
        </a>
      </div>

    </td>
  </tr>

  <tr>
    <td colspan="2" style="padding-top:18px;border-top:3px solid #BDBDBD;"></td>
  </tr>

  <tr>
    <td colspan="2"
        style="font-size:13px;color:#666;line-height:1.7;padding-top:10px;">
      The content of this email is confidential and intended only for the recipient specified in this message. It is strictly forbidden to share any part of this message with any third party without written consent of the sender. If you received this message by mistake, please notify the sender and delete it immediately.
    </td>
  </tr>

</table>
`,        attachments: attachmentUrl ? [{ filename: attachment?.name, url: attachmentUrl }] : [],
      });
      await emailHistoryService.createHistory({
        sent_by: null, to_email: to, cc, bcc,
        subject: processedSubject, body: processedBody,
        attachment_url: attachmentUrl, status: "SENT",
      });
      success(
  "Success",
  "Email sent successfully."
);
    } catch (err) {
      console.error(err);
      error(
  "Failed",
  "Failed to send email."
);
    } finally {
      setSending(false);
    }
  }

  async function sendBulkEmail() {
    if (selectedCandidates.length === 0) { warning(
  "No Candidates Selected",
  "Please select at least one candidate."
);
      return; }
    setSendingBulk(true);
    try {
      let successCount = 0;
      for (const candidate of selectedCandidates) {
        const values = { ...templateValues, candidateName: candidate.full_name, candidateEmail: candidate.email };
        const bulkSubject = replaceTemplatePlaceholders(subject, values);
        const bulkBody = replaceTemplatePlaceholders(body, values);
        try {
          await emailAutomationService.sendEmail({
            to: candidate.email, cc, bcc, subject: bulkSubject,
            html: `<div>${bulkBody.replace(/\n/g, "<br/>")}</div><br/><p><strong>HR</strong></p><p>E: hr@reude.tech</p><p>P: ${senderPhone}</p><p>W: www.reude.tech</p>`,
            attachments: attachmentUrl ? [{ filename: attachment?.name, url: attachmentUrl }] : [],
          });
          await emailHistoryService.createHistory({
            sent_by: null, to_email: candidate.email, cc, bcc,
            subject: bulkSubject, body: bulkBody, attachment_url: attachmentUrl, status: "SENT",
          });
         successCount++;
        } catch (error) { console.error(error); }
      }
     success(
  "Success",
  `${successCount} email(s) sent successfully.`
);
    } finally {
      setSendingBulk(false);
    }
  }

  async function saveDraft() {
    setSavingDraft(true);
    try {
      await emailDraftService.saveDraft({ to_email: to, cc, bcc, subject, body, attachment_url: attachmentUrl, created_by: null });
     success(
  "Success",
  "Draft saved successfully."
);
      const draftData = await emailDraftService.getDrafts();
      setDrafts(draftData);
    } catch (err) {
  console.error(err);

  error(
    "Failed",
    "Failed to save draft."
  );
}
    finally { setSavingDraft(false); }
  }

  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [senderPhone, setSenderPhone] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [selectedCandidates, setSelectedCandidates] = useState<any[]>([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [lastSync, setLastSync] = useState("Never");
  const [drafts, setDrafts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("compose");
  const [inboxQuery, setInboxQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  /* View-layer only — drive button/engine loading states, no business logic */
  const [syncing, setSyncing] = useState(false);
  const [importingAll, setImportingAll] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [openingEmail, setOpeningEmail] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);
  const [preparingDocs, setPreparingDocs] = useState(false);
  const emailCache = useRef(new Map<string, EmailMessage>());
  const hydrateQueue = useRef<EmailMessage | null>(null);
  const hydrating = useRef(false);
  const [sending, setSending] = useState(false);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const attachmentCount = emails.filter((e) => e.hasAttachment).length;
  const resumeCount = emails.filter((e) => e.subject.toLowerCase().includes("resume")).length;
  const interviewCount = emails.filter((e) => e.subject.toLowerCase().includes("interview")).length;
  const offerCount = emails.filter((e) => e.subject.toLowerCase().includes("offer")).length;
  const pendingCount = emails.filter((e) => e.status !== "IMPORTED").length;
  const importedCount = emails.filter((e) => e.status === "IMPORTED").length;

  const loadInbox = async () => {
    try {
      const data = await emailService.getInbox();
      const merged = data.map((email) => emailCache.current.get(email.id) || email);
      setEmails(merged);
      setLastSync(new Date().toLocaleTimeString());
    } catch (error) { console.error("LOAD INBOX ERROR:", error); }
  };

  const hydrateSelected = async (email: EmailMessage) => {
    if (email.attachments?.length || email.resumeUrl) return;
    if (hydrating.current) {
      hydrateQueue.current = email;
      return;
    }
    hydrating.current = true;
    setOpeningEmail(true);
    try {
      const opened = await emailService.openEmail(email);
      emailCache.current.set(opened.id, opened);
      setSelectedEmail((current) => (current?.id === opened.id ? opened : current));
      setEmails((current) => current.map((item) => (item.id === opened.id ? opened : item)));
    } catch (err) {
      console.error(err);
    } finally {
      hydrating.current = false;
      setOpeningEmail(false);
      const next = hydrateQueue.current;
      hydrateQueue.current = null;
      if (next && next.id !== email.id) {
        hydrateSelected(next);
      }
    }
  };

  const openInboxEmail = (email: EmailMessage) => {
    const cached = emailCache.current.get(email.id) || email;
    setSelectedEmail(cached);
    hydrateSelected(cached);
  };

  const saveSelectedAttachments = async () => {
    if (!selectedEmail) return;
    setSavingDocs(true);
    try {
      let email = emailCache.current.get(selectedEmail.id) || selectedEmail;
      if (!email.attachments?.length && !email.resumeUrl) {
        email = await emailService.openEmail(email);
        emailCache.current.set(email.id, email);
        setSelectedEmail(email);
      }
      const result = await emailService.saveAttachmentsToDocuments(email);
      success(
        "Saved to candidate folder",
        `${result.count} file${result.count === 1 ? "" : "s"} saved under ${result.candidate.full_name || "the candidate"}.`
      );
    } catch (err) {
      error(
        "Save failed",
        err instanceof Error ? err.message : "Could not save attachments."
      );
    } finally {
      setSavingDocs(false);
    }
  };

  const prepareDocumentsFromEmail = async () => {
    if (!selectedEmail) return;
    setPreparingDocs(true);
    try {
      const candidate = await emailService.importCandidate(selectedEmail.id);
      await loadInbox();
      success("Ready for documents", `${candidate.full_name} is ready for LOA, NDA and other letters.`);
      navigate(`/app/document-automation?candidateId=${candidate.id}`);
    } catch (err) {
      error(
        "Prepare failed",
        err instanceof Error ? err.message : "Could not prepare documents from this email."
      );
    } finally {
      setPreparingDocs(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await loadInbox();
      const candidateData = await candidateService.getCandidates();
      setCandidates(candidateData || []);
      const draftData = await emailDraftService.getDrafts();
      setDrafts(draftData);
      setLoading(false);
    }
    loadData();
    const timer = setInterval(() => {
      loadInbox();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const replaceTemplatePlaceholders = (text: string, values: Record<string, string>) => {
    let output = text;
    Object.entries(values).forEach(([key, value]) => {
      output = output.replace(new RegExp(`{{\\s*${key}\\s*}}`, "gi"), value ?? "");
    });
    return output;
  };

  const templateValues = {
    candidateName: selectedCandidate?.full_name || "Candidate",
    candidateEmail: selectedCandidate?.email || "",
    candidatePhone: selectedCandidate?.phone || "",
    hrName: "HR", companyName: "Recrulyn Technologies", contactNumber: senderPhone,
    position: "", department: "", joiningDate: "", interviewDate: "", interviewTime: "", meetingLink: "",
  };

  // Every email here already passed the "is this a candidate application?"
  // check inside emailService.getInbox(), so this list is only ever
  // resumes-in-hand, job-related mail. The role dropdown lets HR narrow
  // that down further to applicants for one particular opening.
  const roleOptions = useMemo(() => {
    const roles = new Set<string>();
    emails.forEach((e) => {
      const role = extractRoleFromSubject(e.subject);
      if (role) roles.add(role);
    });
    return Array.from(roles).sort((a, b) => a.localeCompare(b));
  }, [emails]);

  const filteredEmails = emails.filter((e) => {
    const matchesQuery =
      !inboxQuery ||
      e.subject.toLowerCase().includes(inboxQuery.toLowerCase()) ||
      e.sender.toLowerCase().includes(inboxQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || extractRoleFromSubject(e.subject) === roleFilter;
    return matchesQuery && matchesRole;
  });

  const applyTemplateByKey = (key: string) => {
    setSelectedTemplate(key);
    const template = emailTemplates.find((t) => t.id === key);
    if (!template) { setActiveTab("compose"); return; }
    setSubject(template.subject);
    setBody(template.body);
    setActiveTab("compose");
  };

  const loadDraft = (draft: any) => {
    setTo(draft?.to_email || ""); setCc(draft?.cc || ""); setBcc(draft?.bcc || "");
    setSubject(draft?.subject || ""); setBody(draft?.body || ""); setAttachmentUrl(draft?.attachment_url || "");
    setActiveTab("compose");
  };

  const engineActive = loading || syncing || importingAll;

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="rq-root" style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <style>{FONTS}</style>
      <AmbientBg />

      {/* Top Bar */}
      <header style={{
        height: "52px", flexShrink: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${SURFACE.border}`, position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: INK.tertiary, letterSpacing: "0.05em" }}>
            RECRULYN TECHNOLOGIES
          </span>
          <span style={{ width: 1, height: 16, background: SURFACE.border }} />
          <span style={{ fontSize: "13px", fontWeight: 700, color: INK.secondary }}>AI Correspondence Engine</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search size={14} color={INK.tertiary} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              value={inboxQuery}
              onChange={(e) => setInboxQuery(e.target.value)}
              placeholder="Search inbox…"
              style={{
                width: "220px", padding: "7px 12px 7px 32px", borderRadius: "8px",
                border: `1px solid ${SURFACE.border}`, background: "#FAFBFC",
                fontSize: "13px", fontWeight: 500, color: INK.primary, outline: "none",
                fontFamily: "Inter, sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = ACCENT.indigo; e.target.style.boxShadow = `0 0 0 3px ${ACCENT.indigoTint}`; }}
              onBlur={(e) => { e.target.style.borderColor = SURFACE.border; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {activeTab === "inbox" && roleOptions.length > 0 && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              title="Show only applicants for a particular role"
              style={{
                padding: "7px 10px", borderRadius: "8px",
                border: `1px solid ${SURFACE.border}`, background: "#FAFBFC",
                fontSize: "13px", fontWeight: 500, color: INK.primary, outline: "none",
                fontFamily: "Inter, sans-serif", maxWidth: "200px",
              }}
            >
              <option value="ALL">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          )}

          <BtnSecondary
            icon={syncing ? undefined : RefreshCw}
            loading={syncing}
            onClick={async () => {
              setSyncing(true);
              try { await emailService.syncInbox(); await loadInbox();success(
  "Success",
  "Inbox synced successfully."
); }
              catch (err) { console.error(err); error(
  "Failed",
  err instanceof Error ? err.message : "Inbox sync failed."
); }
              finally { setSyncing(false); }
            }}
          >
            {syncing ? "Syncing…" : "Sync"}
          </BtnSecondary>

          <BtnSecondary
            icon={importingAll ? undefined : Download}
            loading={importingAll}
            onClick={async () => {
              setImportingAll(true);
              try {
                let imported = 0;
                const emailsToImport = emails.filter((e) => e.status !== "IMPORTED");
                for (const email of emailsToImport) {
                  try { await emailService.importCandidate(email.id); imported++; } catch {}
                }
                await loadInbox();
              success(
  "Success",
  `${imported} candidate(s) imported successfully.`
);
              } finally {
                setImportingAll(false);
              }
            }}
          >
            {importingAll ? "Importing…" : "Import All"}
          </BtnSecondary>

          <BtnPrimary icon={Plus} onClick={() => setActiveTab("compose")}>
            Compose
          </BtnPrimary>

          {/* Sync time — live indicator */}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
            <motion.span
              style={{ width: 6, height: 6, borderRadius: "50%", background: ACCENT.teal, display: "inline-block" }}
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span className="rq-mono" style={{ fontSize: "11px", color: INK.tertiary }}>Synced {lastSync}</span>
          </span>
        </div>
      </header>

      {/* Body: Sidebar + Content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar active={activeTab} onChange={setActiveTab} pendingCount={pendingCount} importedCount={importedCount} />

        {/* Main content */}
        <main style={{ flex: 1, overflow: "hidden", padding: "20px", display: "flex", flexDirection: "column", position: "relative" }}>
          <EngineBar active={engineActive} />
          <AnimatePresence mode="wait">

            {/* ═══════════════ COMPOSE ═══════════════ */}
            {activeTab === "compose" && (
              <motion.div
                key="compose"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 22px 380px", gap: "0px", overflow: "hidden" }}
              >
                {/* Compose panel */}
                <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden", marginRight: "10px" }}>
                  {/* Composer header */}
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <PenLine size={16} color={ACCENT.indigo} />
                      <span className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary }}>New Email</span>
                      {selectedTemplate && (
                        <Tag color="indigo">
                          <Sparkles size={10} /> {selectedTemplate}
                        </Tag>
                      )}
                    </div>
                    {/* Bulk / Single toggle */}
                    <div style={{ display: "flex", background: SURFACE.sunken, borderRadius: "8px", padding: "3px", gap: "2px" }}>
                      {["Single", "Bulk"].map((m) => {
                        const active = (m === "Single") === !bulkMode;
                        return (
                          <button
                            key={m}
                            onClick={() => setBulkMode(m === "Bulk")}
                            style={{
                              padding: "5px 14px", borderRadius: "6px", border: "none", cursor: "pointer",
                              background: active ? "#FFFFFF" : "transparent",
                              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                              color: active ? INK.primary : INK.secondary,
                              fontSize: "12.5px", fontWeight: 700,
                              fontFamily: "Inter, sans-serif",
                              transition: "all 0.15s",
                            }}
                          >
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Form body */}
                  <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      {/* Candidate selector */}
                      <AnimatePresence mode="wait">
                        {!bulkMode ? (
                          <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Field label="Candidate">
                              <Select
                                onChange={(e) => {
                                  const candidate = candidates.find((c) => c.id === e.target.value);
                                  setSelectedCandidate(candidate);
                                  if (!candidate) return;
                                  setTo(candidate.email || "");
                                }}
                              >
                                <option value="">Select a candidate…</option>
                                {candidates.map((c) => (
                                  <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                              </Select>
                            </Field>
                          </motion.div>
                        ) : (
                          <motion.div key="bulk" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                              <Label>Select Recipients</Label>
                              <div style={{ display: "flex", gap: "6px" }}>
                                <BtnGhost onClick={() => setSelectedCandidates(candidates)}>Select all</BtnGhost>
                                <BtnGhost onClick={() => setSelectedCandidates([])}>Clear</BtnGhost>
                              </div>
                            </div>
                            <div style={{
                              maxHeight: "130px", overflowY: "auto", borderRadius: "9px",
                              border: `1px solid ${SURFACE.border}`, background: "#FAFBFC",
                            }}>
                              {candidates.map((candidate) => {
                                const checked = !!selectedCandidates.find((c) => c.id === candidate.id);
                                return (
                                  <label
                                    key={candidate.id}
                                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #F3F4F6" }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedCandidates([...selectedCandidates, candidate]);
                                        else setSelectedCandidates(selectedCandidates.filter((c) => c.id !== candidate.id));
                                      }}
                                      style={{ accentColor: ACCENT.indigo }}
                                    />
                                    <span style={{ fontSize: "13.5px", fontWeight: 600, color: INK.primary }}>{candidate.full_name}</span>
                                    <span style={{ fontSize: "12px", color: INK.tertiary, marginLeft: "auto" }}>{candidate.email}</span>
                                  </label>
                                );
                              })}
                            </div>
                            <div style={{ marginTop: "6px", fontSize: "12px", color: INK.secondary }}>
                              <span style={{ fontWeight: 700, color: INK.primary }}>{selectedCandidates.length}</span> candidate(s) selected
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Field label="To">
                        <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" />
                      </Field>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                        <Field label="CC">
                          <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="ceo@reude.tech" />
                        </Field>
                        <Field label="BCC">
                          <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="hr@reude.tech" />
                        </Field>
                      </div>

                      <Field label="Template">
                        <Select
                          value={selectedTemplate}
                          onChange={(e) => {
                            const id = e.target.value;
                            setSelectedTemplate(id);
                            const template = emailTemplates.find((t) => t.id === id);
                            if (!template) return;
                            setSubject(template.subject);
                            setBody(template.body);
                          }}
                        >
                          <option value="">No template</option>
                          {emailTemplates.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="Subject">
                        <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter subject line…" />
                      </Field>

                      <Field label="Message">
                        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} placeholder="Write your message…" />
                      </Field>

                      {/* Attachments */}
                      <div>
                        <Label>Attachments</Label>
                        <div style={{
                          border: "1px dashed #D1D5DB", borderRadius: "9px",
                          background: "#F9FAFB", padding: "12px 14px",
                          display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center",
                        }}>
                          <BtnSecondary
                            icon={uploadingAttachment ? undefined : Paperclip}
                            loading={uploadingAttachment}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {uploadingAttachment ? "Uploading…" : "Attach File"}
                          </BtnSecondary>
                          <BtnSecondary icon={FileText}>LOA</BtnSecondary>
                          <BtnSecondary icon={FileSignature}>NDA</BtnSecondary>
                          {attachment && (
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              background: ACCENT.indigoTint, color: ACCENT.indigoDeep, border: `1px solid ${ACCENT.indigoBorder}`,
                              borderRadius: "7px", padding: "4px 10px", fontSize: "12.5px", fontWeight: 600,
                            }}>
                              <Paperclip size={12} /> {attachment.name}
                            </span>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: "none" }}
                            onChange={async (e) => {
                              if (!e.target.files?.length) return;
                              const file = e.target.files[0];
                              setAttachment(file);
                              setUploadingAttachment(true);
                              try {
                                const url = await emailAutomationService.uploadAttachment(file);
                                setAttachmentUrl(url);
                                success(
  "Success",
  "Attachment uploaded successfully."
  );
                              } catch (err) {
                                console.error(err);
                                error(
                                  "Failed",
                                  "Attachment upload failed."
                                );
                              }

                              finally { setUploadingAttachment(false); }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div style={{ padding: "12px 20px", borderTop: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <BtnSecondary icon={savingDraft ? undefined : Save} loading={savingDraft} onClick={saveDraft}>
                        {savingDraft ? "Saving…" : "Save Draft"}
                      </BtnSecondary>
                      <BtnSecondary icon={Eye} onClick={() => setPreviewOpen(true)}>Preview</BtnSecondary>
                    </div>
                    {!bulkMode ? (
                      <BtnPrimary icon={sending ? undefined : Send} loading={sending} onClick={sendEmail}>
                        {sending ? "Sending…" : "Send Email"}
                      </BtnPrimary>
                    ) : (
                      <BtnPrimary icon={sendingBulk ? undefined : Send} loading={sendingBulk} onClick={sendBulkEmail}>
                        {sendingBulk ? "Sending…" : `Send to ${selectedCandidates.length} Recipients`}
                      </BtnPrimary>
                    )}
                  </div>
                </Card>

                {/* Connector — a live signal between what's composed and what's previewed */}
                <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                  <div style={{ width: "2px", height: "100%", background: `linear-gradient(${ACCENT.indigo}30, ${ACCENT.teal}30)`, borderRadius: "2px" }} />
                  <motion.div
                    style={{ position: "absolute", width: "7px", height: "7px", borderRadius: "50%", background: ACCENT.teal, boxShadow: `0 0 8px ${ACCENT.teal}` }}
                    animate={{ top: ["6%", "94%", "6%"] }}
                    transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
                  />
                </div>

                {/* Right panel: Preview + Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden", marginLeft: "10px" }}>
                  {/* Live preview */}
                  <Card style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", gap: "8px" }}>
                      <Eye size={14} color={ACCENT.indigo} />
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: INK.primary }}>Live Preview</span>
                      <span style={{
                        marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: "4px",
                        fontSize: "10.5px", fontWeight: 700, background: ACCENT.emeraldTint, color: "#065F46",
                        border: `1px solid ${ACCENT.emeraldBorder}`, borderRadius: "5px", padding: "2px 7px",
                      }}>
                        <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} style={{ display: "inline-flex" }}>
                          <Activity size={10} />
                        </motion.span>
                        LIVE
                      </span>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "14px" }}>
                      <div style={{
                        border: `1px solid ${SURFACE.border}`, borderRadius: "9px", overflow: "hidden",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                      }}>
                        {/* Email chrome */}
                        <div style={{ height: "3px", background: `linear-gradient(90deg, ${ACCENT.indigo}, ${ACCENT.teal})` }} />
                        <div style={{ background: SURFACE.sunken, padding: "12px 14px", borderBottom: `1px solid ${SURFACE.border}` }}>
                          <div style={{ fontSize: "12px", color: INK.secondary, marginBottom: "3px" }}>
                            <span style={{ fontWeight: 700, color: INK.primary }}>To:</span> {to || "—"}
                          </div>
                          <div style={{ fontSize: "12px", color: INK.secondary }}>
                            <span style={{ fontWeight: 700, color: INK.primary }}>Subject:</span>{" "}
                            {replaceTemplatePlaceholders(subject, templateValues) || "—"}
                          </div>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedTemplate || "custom"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22 }}
                            style={{ padding: "14px", background: SURFACE.card }}
                          >
                            <p style={{ fontSize: "13.5px", color: INK.primary, lineHeight: "1.7", whiteSpace: "pre-wrap", margin: 0 }}>
                              {replaceTemplatePlaceholders(body, templateValues) || "Your message will appear here as you type…"}
                            </p>
                            <div className="rq-mono" style={{ marginTop: "16px", paddingTop: "12px", borderTop: `1px dashed ${SURFACE.border}`, fontSize: "11.5px", color: INK.secondary }}>
                              <div style={{ fontWeight: 700, color: INK.primary }}>HR Team</div>
                              <div>E: hr@reude.tech</div>
                              <div>P: {senderPhone || "—"}</div>
                              <div>W: www.reude.tech</div>
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  </Card>

                  {/* Stats */}
                  <Card style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: INK.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Inbox Summary</div>
                    {[
                      { label: "With Attachments", value: attachmentCount, icon: Paperclip, color: ACCENT.amber },
                      { label: "Resumes", value: resumeCount, icon: FileText, color: ACCENT.indigo },
                      { label: "Interview Threads", value: interviewCount, icon: Clock, color: ACCENT.tealDeep },
                      { label: "Offer Threads", value: offerCount, icon: Award, color: ACCENT.emerald },
                    ].map((s) => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F3F4F6" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <s.icon size={13} color={s.color} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: INK.secondary }}>{s.label}</span>
                        </div>
                        <span className="rq-mono" style={{ fontSize: "15px", fontWeight: 800, color: INK.primary }}>{s.value}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ═══════════════ TEMPLATES ═══════════════ */}
            {activeTab === "templates" && (
              <motion.div
                key="templates"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <SectionHeader icon={Layers} title="Email Templates" subtitle="Click any template to apply it in the composer" />
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
                  overflowY: "auto", paddingRight: "2px",
                }}>
                  {TEMPLATE_CARDS.map(({ key, title }, i) => {
                    const meta = TEMPLATE_META[key];
                    const Icon = meta.icon;
                    return (
                      <motion.button
                        key={key}
                        onClick={() => applyTemplateByKey(key)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.05 }}
                        whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          textAlign: "left", padding: "20px", borderRadius: "12px",
                          border: `1px solid ${SURFACE.border}`, background: SURFACE.card, cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                          <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Icon size={18} color={meta.color} />
                          </div>
                          <ChevronRight size={15} color={INK.tertiary} />
                        </div>
                        <div style={{ fontSize: "14.5px", fontWeight: 700, color: INK.primary, marginBottom: "5px" }}>{title}</div>
                        <div style={{ fontSize: "12.5px", color: INK.secondary, lineHeight: 1.5 }}>{meta.desc}</div>
                        <div style={{ marginTop: "12px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "4px",
                            fontSize: "12px", fontWeight: 700, color: meta.color,
                          }}>
                            Use template →
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ═══════════════ INBOX ═══════════════ */}
            {activeTab === "inbox" && (
              <motion.div
                key="inbox"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                <SectionHeader
                  icon={InboxIcon}
                  title="Inbox"
                  subtitle={`${filteredEmails.length} emails · ${importedCount} imported · ${pendingCount} pending`}
                />
                <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "minmax(280px, 38%) 1fr", gap: "14px" }}>
                  <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <div style={{ overflowY: "auto", flex: 1 }}>
                      {loading ? (
                        [...Array(8)].map((_, i) => (
                          <div key={i} style={{ padding: "12px 14px", borderBottom: `1px solid ${SURFACE.border}` }}>
                            <div className="rq-skeleton" style={{ height: "14px", width: "70%" }} />
                          </div>
                        ))
                      ) : filteredEmails.length === 0 ? (
                        <div style={{ padding: "48px 16px", textAlign: "center" }}>
                          <InboxIcon size={28} color={SURFACE.borderStrong} style={{ margin: "0 auto 10px", display: "block" }} />
                          <p style={{ color: INK.secondary, fontSize: "14px", fontWeight: 600 }}>No emails found</p>
                        </div>
                      ) : (
                        filteredEmails.map((email) => {
                          const active = selectedEmail?.id === email.id;
                          return (
                            <button
                              key={email.id}
                              type="button"
                              onClick={() => openInboxEmail(email)}
                              style={{
                                display: "block", width: "100%", textAlign: "left",
                                padding: "12px 14px", border: "none", cursor: "pointer",
                                borderBottom: `1px solid ${SURFACE.border}`,
                                background: active ? ACCENT.indigoTint : "transparent",
                                borderLeft: active ? `3px solid ${ACCENT.indigo}` : "3px solid transparent",
                                fontFamily: "Inter, sans-serif",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: INK.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {email.sender}
                                </span>
                                <span className="rq-mono" style={{ fontSize: "11px", color: INK.tertiary, flexShrink: 0 }}>
                                  {email.receivedAt ? new Date(email.receivedAt).toLocaleDateString() : ""}
                                </span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                {email.hasAttachment || email.attachments?.length ? <Paperclip size={12} color={ACCENT.amber} /> : null}
                                <span style={{ fontSize: "12.5px", color: INK.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {email.subject}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </Card>

                  <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    {!selectedEmail ? (
                      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: INK.tertiary }}>
                        <Mail size={28} color={SURFACE.borderStrong} />
                        <p style={{ fontSize: "14px", fontWeight: 600, marginTop: "10px" }}>Select a message to preview</p>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: "16px 18px", borderBottom: `1px solid ${SURFACE.border}` }}>
                          <div style={{ fontSize: "17px", fontWeight: 800, color: INK.primary, lineHeight: 1.35 }}>{selectedEmail.subject}</div>
                          <div style={{ marginTop: "8px", fontSize: "13px", color: INK.secondary }}>
                            <strong style={{ color: INK.primary }}>{selectedEmail.sender}</strong>
                            <span> · {selectedEmail.receivedAt}</span>
                          </div>
                          <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <BtnSecondary icon={savingDocs ? undefined : Save} loading={savingDocs} onClick={saveSelectedAttachments}>
                              {savingDocs ? "Saving…" : "Save to Documents"}
                            </BtnSecondary>
                            <BtnPrimary icon={preparingDocs ? undefined : FileSignature} loading={preparingDocs} onClick={prepareDocumentsFromEmail}>
                              {preparingDocs ? "Preparing…" : "Prepare LOA / NDA"}
                            </BtnPrimary>
                            <BtnSecondary
                              icon={selectedEmail.status === "IMPORTED" ? CheckCircle2 : Download}
                              loading={importingId === selectedEmail.id}
                              disabled={selectedEmail.status === "IMPORTED"}
                              onClick={async () => {
                                setImportingId(selectedEmail.id);
                                try {
                                  await emailService.importCandidate(selectedEmail.id);
                                  await loadInbox();
                                  success("Success", "Candidate imported successfully.");
                                } catch (err) {
                                  error("Import Failed", err instanceof Error ? err.message : "Failed to import candidate.");
                                } finally {
                                  setImportingId(null);
                                }
                              }}
                            >
                              {selectedEmail.status === "IMPORTED" ? "Imported" : "Import"}
                            </BtnSecondary>
                          </div>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
                          {openingEmail && !selectedEmail.attachments?.length ? (
                            <p style={{ fontSize: "12.5px", color: INK.tertiary, marginTop: 0 }}>Looking up files in the background…</p>
                          ) : null}
                          <p style={{ fontSize: "14px", color: INK.primary, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: "0 0 18px" }}>
                            {selectedEmail.bodyText || selectedEmail.resumeText || "No message body is stored for this email yet."}
                          </p>
                          <div style={{ fontSize: "11px", fontWeight: 700, color: INK.tertiary, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
                            Attachments
                          </div>
                          {(selectedEmail.attachments?.length || selectedEmail.resumeUrl) ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {(selectedEmail.attachments?.length
                                ? selectedEmail.attachments
                                : [{ filename: "Resume.pdf", url: selectedEmail.resumeUrl || "", kind: "RESUME" as const }]
                              ).map((file) => {
                                const kind = file.kind || classifyAttachment(file.filename, file.contentType);
                                const kindLabel =
                                  kind === "ID_PROOF" ? "ID proof" :
                                  kind === "ADDRESS_PROOF" ? "Address proof" :
                                  kind === "PHOTO" ? "Photo" :
                                  kind === "RESUME" ? "Resume" : "Other";
                                return (
                                <a
                                  key={file.url + file.filename}
                                  href={file.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "10px 12px", borderRadius: "9px",
                                    border: `1px solid ${SURFACE.border}`,
                                    color: ACCENT.indigo, fontWeight: 700, fontSize: "13.5px",
                                    textDecoration: "none", background: SURFACE.sunken,
                                  }}
                                >
                                  <Paperclip size={14} />
                                  <span style={{ flex: 1 }}>{file.filename}</span>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: INK.tertiary }}>{kindLabel}</span>
                                </a>
                                );
                              })}
                            </div>
                          ) : (
                            <p style={{ color: INK.secondary, fontSize: "13px" }}>
                              {selectedEmail.resumeText
                                ? "No original file yet. Save to Documents will keep the extracted resume text for LOA / NDA."
                                : "No attachments on this message."}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </Card>
                </div>
              </motion.div>
            )}

            {/* ═══════════════ DRAFTS & SCHEDULE ═══════════════ */}
            {activeTab === "schedule" && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}
              >
                <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    <Save size={15} color={ACCENT.indigo} />
                    <span className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary }}>Saved Drafts</span>
                    <Tag color="slate">{drafts.length} total</Tag>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {drafts.length === 0 ? (
                      <div style={{ padding: "60px 20px", textAlign: "center" }}>
                        <Save size={28} color={SURFACE.borderStrong} style={{ margin: "0 auto 10px", display: "block" }} />
                        <p style={{ color: INK.secondary, fontSize: "14px", fontWeight: 600, margin: 0 }}>No drafts saved yet</p>
                        <p style={{ color: INK.tertiary, fontSize: "12.5px", marginTop: "4px" }}>Write an email and save it to resume later</p>
                      </div>
                    ) : (
                      drafts.map((draft, i) => (
                        <motion.div
                          key={draft.id ?? i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 }}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            padding: "14px 20px", borderBottom: "1px solid #F3F4F6", gap: "16px",
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "14px", fontWeight: 700, color: INK.primary, marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {draft.subject || "(no subject)"}
                            </p>
                            <p style={{ fontSize: "12.5px", color: INK.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              To: {draft.to_email || "—"}
                            </p>
                          </div>
                          <BtnSecondary icon={ChevronRight} onClick={() => loadDraft(draft)}>
                            Reopen
                          </BtnSecondary>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Card>

                <Card style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "16px 18px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    <CalendarClock size={15} color={ACCENT.indigo} />
                    <span className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary }}>Scheduled Sends</span>
                  </div>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                    <div style={{
                      border: "1px dashed #D1D5DB", borderRadius: "12px",
                      padding: "28px 20px", textAlign: "center",
                    }}>
                      <CalendarClock size={28} color={SURFACE.borderStrong} style={{ margin: "0 auto 10px", display: "block" }} />
                      <p style={{ fontSize: "13.5px", fontWeight: 700, color: INK.secondary, margin: 0 }}>Scheduling coming soon</p>
                      <p style={{ fontSize: "12.5px", color: INK.tertiary, marginTop: "6px", lineHeight: 1.5 }}>
                        Save a draft and reopen it when you're ready to send.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ═══════════════ SETTINGS ═══════════════ */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}
              >
                <Card style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    <FileSignature size={15} color={ACCENT.indigo} />
                    <span className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary }}>Email Signature</span>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
                    <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <Field label="HR Contact Number">
                        <Input
                          value={senderPhone}
                          onChange={(e) => setSenderPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </Field>
                      <div>
                        <Label>Signature Preview</Label>
                        <div style={{
                          border: `1px solid ${SURFACE.border}`, borderRadius: "9px", padding: "16px",
                          background: SURFACE.sunken,
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", paddingBottom: "10px", borderBottom: `1px solid ${SURFACE.border}` }}>
                            <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `linear-gradient(135deg, ${ACCENT.indigo}, ${ACCENT.teal})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ color: "white", fontSize: "12px", fontWeight: 700 }}>HR</span>
                            </div>
                            <div>
                              <div style={{ fontSize: "14px", fontWeight: 700, color: INK.primary }}>HR Team</div>
                              <div style={{ fontSize: "12px", color: INK.secondary }}>Recrulyn Technologies</div>
                            </div>
                          </div>
                          <div className="rq-mono" style={{ fontSize: "12px", color: INK.secondary, display: "flex", flexDirection: "column", gap: "3px" }}>
                            <div>hr@reude.tech</div>
                            <div>{senderPhone || "+91 xxxxxxxxxx"}</div>
                            <div>www.reude.tech</div>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: "13px", color: INK.secondary, lineHeight: 1.6 }}>
                        This signature is automatically appended to every email sent from the platform — both single and bulk sends.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "16px 18px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", gap: "10px" }}>
                    <Zap size={15} color={ACCENT.indigo} />
                    <span className="rq-display" style={{ fontSize: "15.5px", fontWeight: 800, color: INK.primary }}>Connection Test</span>
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <p style={{ fontSize: "13.5px", color: INK.secondary, lineHeight: 1.6 }}>
                      Send a test message through the email edge function to verify the delivery pipeline is working correctly.
                    </p>
                    <BtnSecondary icon={testingEmail ? undefined : Zap} loading={testingEmail} onClick={testEmail}>
                      {testingEmail ? "Sending test…" : "Send Test Email"}
                    </BtnSecondary>
                    <div style={{ padding: "12px", borderRadius: "9px", background: ACCENT.emeraldTint, border: `1px solid ${ACCENT.emeraldBorder}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "4px" }}>
                        <CheckCircle2 size={14} color={ACCENT.emerald} />
                        <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#065F46" }}>Email Service</span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#047857", margin: 0 }}>Delivery pipeline is configured</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(14,21,38,0.45)",
              backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 100, padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: "580px", background: SURFACE.card,
                borderRadius: "16px", border: `1px solid ${SURFACE.border}`, overflow: "hidden",
                boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              }}
            >
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${SURFACE.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                  <Eye size={16} color={ACCENT.indigo} />
                  <span style={{ fontSize: "15px", fontWeight: 700, color: INK.primary }}>Email Preview</span>
                </div>
                <button
                  onClick={() => setPreviewOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: INK.secondary, fontSize: "20px", lineHeight: 1, padding: "0 2px" }}
                >×</button>
              </div>
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                <div style={{ height: "3px", background: `linear-gradient(90deg, ${ACCENT.indigo}, ${ACCENT.teal})` }} />
                <div style={{ background: SURFACE.sunken, padding: "14px 20px", borderBottom: `1px solid ${SURFACE.border}` }}>
                  <div style={{ fontSize: "13px", color: INK.secondary, marginBottom: "4px" }}>
                    <strong style={{ color: INK.primary }}>To:</strong> {to || "—"}
                  </div>
                  <div style={{ fontSize: "13px", color: INK.secondary }}>
                    <strong style={{ color: INK.primary }}>Subject:</strong> {replaceTemplatePlaceholders(subject, templateValues) || "—"}
                  </div>
                </div>
                <div style={{ padding: "20px" }}>
                  <p style={{ fontSize: "14px", color: INK.primary, lineHeight: "1.75", whiteSpace: "pre-wrap", margin: 0 }}>
                    {replaceTemplatePlaceholders(body, templateValues) || "No content yet."}
                  </p>
                 <div
  style={{
    marginTop: "30px",
    borderTop: "3px solid #BDBDBD",
    paddingTop: "18px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
    }}
  >
    <div
      style={{
        fontSize: "34px",
        fontWeight: 700,
        color: "#111",
      }}
    >
      HR
    </div>

    <img
      src="/Logo-Monogram.png"
      alt="RECRULYN"
      style={{ height: "48px", borderRadius: "8px" }}
    />
  </div>

  <div
    style={{
      marginTop: "18px",
      lineHeight: 2,
      fontSize: "15px",
    }}
  >
    <div><strong style={{ color: "#F97316" }}>E:</strong> hr@reude.tech</div>
    <div><strong style={{ color: "#F97316" }}>P:</strong> {senderPhone}</div>
    <div>
      <strong style={{ color: "#F97316" }}>W:</strong>{" "}
      <a href="https://www.reude.tech">www.reude.tech</a>
    </div>
  </div>

  <div
    style={{
      marginTop: "18px",
      paddingTop: "12px",
      borderTop: "2px solid #B5B5B5",
      fontSize: "12px",
      color: "#666",
      lineHeight: 1.7,
    }}
  >
    The content of this email is confidential and intended only for the recipient specified in this message...
  </div>
</div>
                </div>
              </div>
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${SURFACE.border}`, display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <BtnSecondary onClick={() => setPreviewOpen(false)}>Close</BtnSecondary>
                <BtnPrimary icon={sending ? undefined : Send} loading={sending} onClick={() => { setPreviewOpen(false); sendEmail(); }}>
                  {sending ? "Sending…" : "Send Now"}
                </BtnPrimary>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}