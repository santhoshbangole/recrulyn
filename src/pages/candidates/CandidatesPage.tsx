import { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Sparkles,
  Plus,
  Brain,
  FileText,
  X,
  Clock,
  AlertCircle,
  Upload,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
  FileSignature,
  Search,
  Briefcase,
  Award,
  UserCheck,
  History as HistoryIcon,
  LayoutGrid,
  ChevronRight,
  Zap,
  TrendingUp,
  CheckCircle2,
  Circle,
  BadgeCheck,
  Building2,
  Timer,
  Target,
  Layers,
  Star,
  Pencil,
  Trash2,
  CheckSquare,
  Square,
  Share2,
  Send,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../app/providers/AuthProvider";
import { requirementService } from "../../modules/requirements/services/requirement.service";
import { officerService } from "../../modules/officers/services/officer.service";
import CreateCandidateForm from "../../components/forms/CreateCandidateForm";
import { geminiResumeParserService } from "../../modules/recrulyn/services/geminiResumeParser.service";
import { resumeMatchingAIService } from "../../modules/resume-intelligence/services/resumeMatchingAI.service";
import { DepartmentSelect } from "../../components/forms/DepartmentSelect";
import { documentService } from "../../modules/documents/services/document.service";
import { candidateService } from "../../modules/candidates/services/candidate.service";
import { activityLogService } from "../../modules/candidates/services/activity-log.service";
import { employeeService } from "../../modules/employees/services/employee.service";
import { emailAutomationService } from "../../modules/email/services/email-automation.service";
import { emailHistoryService } from "../../modules/email/services/email.history";
import { ndaService } from "../../modules/documents/services/nda.service";
import { supabase } from "../../services/supabase/client";
import { profileService } from "../../modules/recrulyn/services/profile.service";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { TbWorld } from "react-icons/tb";

import { useNotification } from "../../components/notification/useNotification";
import {
  isUuid,
  localCandidateStore,
  localInternAssignmentStore,
} from "../../lib/offline-store";

// ─── Theme tokens (Control-tower palette: deep forest ink + brass signal accent) ──
const C = {
  pageBg: "#F5F5F1",
  surface: "#FFFFFF",
  surfaceEl: "#F0EFE9",
  surfacePr: "#E7EEE7",

  ink: "#1B211D",
  inkMid: "#1B211D",
  inkSoft: "#454E48",
  inkMute: "#6F786F",

  indigo: "#1E4A38",
  indigoHov: "#153629",
  indigoPale: "#E5EDE6",
  indigoMid: "#BFD3C4",

  aiBlue: "#8A6A2F",
  aiBlueP: "#F4EDDD",

  emerald: "#2F8B5A",
  emeraldP: "#E6F3EA",
  emeraldB: "#C7E3D0",
  amber: "#B4791C",
  amberP: "#FBF0DD",
  amberB: "#EED8AC",
  red: "#B4443B",
  redP: "#FBEBE8",
  redB: "#EFC9C2",
  purple: "#6B5B8C",
  purpleP: "#EEEAF4",
  cyan: "#1C7A8C",
  cyanP: "#E3F1F3",
  cyanB: "#B8DEE4",

  blue: "#2A4E8C",
  blueP: "#E9EEF8",
  blueB: "#C4D2EC",

  border: "#E2E0D6",
  borderMid: "#D0CCBC",
  shadow: "rgba(27,33,29,0.06)",
  shadowMd: "rgba(27,33,29,0.12)",

  ink900: "#12160F",
};

const GRAD_INDIGO = `linear-gradient(135deg, #1E4A38 0%, #2F8B5A 100%)`;
const GRAD_AI = `linear-gradient(135deg, #A87B23 0%, #C99A3F 100%)`;
const GRAD_PAGE = `#F5F5F1`;
const GRAD_ROSTER = `linear-gradient(165deg, #16241C 0%, #1E4A38 62%, #2F8B5A 130%)`;

// ─── Global Styles ────────────────────────────────────────────────────────────
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; }

.rd-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: ${GRAD_PAGE};
  min-height: 100vh;
}

.rd-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }

@keyframes floatA { 0%,100%{transform:translate(0,0) scale(1);opacity:.08} 50%{transform:translate(12px,-18px) scale(1.05);opacity:.13} }
@keyframes floatB { 0%,100%{transform:translate(0,0);opacity:.06} 60%{transform:translate(-8px,14px);opacity:.10} }
@keyframes aiPulse { 0%,100%{opacity:.75;transform:scale(1)} 50%{opacity:1;transform:scale(1.02)} }
@keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
@keyframes shimmer { 0%{background-position:-300% center} 100%{background-position:300% center} }
@keyframes ringDraw { 0%{stroke-dashoffset:220} 100%{stroke-dashoffset:0} }
@keyframes fadeUp { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes gradientShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
@keyframes dots { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
@keyframes skelSweep { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
@keyframes popIn { 0%{opacity:0;transform:scale(.96)} 100%{opacity:1;transform:scale(1)} }
@keyframes underlineIn { 0%{transform:scaleX(0)} 100%{transform:scaleX(1)} }
@keyframes rosterGleam { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

.rd-ambient-a,.rd-ambient-b {
  position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
}
.rd-ambient-a {
  width: 560px; height: 560px; top: -200px; right: -180px;
  background: radial-gradient(circle, rgba(30,74,56,0.06) 0%, transparent 60%);
  animation: floatA 12s ease-in-out infinite;
}
.rd-ambient-b {
  width: 420px; height: 420px; bottom: -120px; left: -100px;
  background: radial-gradient(circle, rgba(168,123,35,0.05) 0%, transparent 60%);
  animation: floatB 16s ease-in-out infinite;
}

/* ── Command bar ── */
.rd-cmdbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 32px; height: 68px;
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${C.border};
  position: sticky; top: 0; z-index: 40;
}
.rd-brand {
  display: flex; align-items: center; gap: 12px;
}
.rd-brand-mark {
  width: 38px; height: 38px; border-radius: 10px;
  background: #0a0a0a;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0,0,0,0.18);
}
.rd-brand-mark img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}
.rd-brand-name {
  font-size: 19px; font-weight: 800; color: ${C.ink};
  letter-spacing: -0.02em;
  font-family: 'Inter', sans-serif;
}
.rd-brand-sub {
  font-size: 11px; font-weight: 600; color: ${C.indigo};
  margin-left: 5px; padding: 4px 10px;
  background: ${C.indigoPale}; border-radius: 6px;
  border: 1px solid ${C.indigoMid};
  letter-spacing: .06em; text-transform: uppercase;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.rd-cmd-right { display: flex; align-items: center; gap: 12px; }
.rd-ai-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px;
  background: ${GRAD_AI}; color: #2B1D06;
  font-size: 12.5px; font-weight: 700;
  box-shadow: 0 3px 10px rgba(168,123,35,0.18);
  animation: aiPulse 3s ease-in-out infinite;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: .03em; text-transform: uppercase;
}

/* ── Page shell ── */
.rd-page { padding: 24px 32px 28px; position: relative; z-index: 1; max-width: 1680px; margin: 0 auto; }

/* ── Page header ── */
.rd-phdr {
  display: flex; align-items: flex-end; justify-content: space-between;
  margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
}
.rd-phdr-eye {
  font-size: 12px; font-weight: 700; letter-spacing: .12em;
  text-transform: uppercase; color: ${C.indigo}; margin-bottom: 6px;
  display: flex; align-items: center; gap: 6px;
}
.rd-phdr-title {
  font-size: 32px; font-weight: 800; color: ${C.ink};
  letter-spacing: -0.03em; line-height: 1.15;
  font-family: 'Inter', sans-serif;
}
.rd-phdr-desc {
  font-size: 15px; color: ${C.inkMute}; margin-top: 6px; max-width: 440px;
}

/* ── Stats row ── */
.rd-stats {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 20px;
}
.rd-stat {
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 16px; padding: 22px 24px;
  display: flex; align-items: center; gap: 16px;
  cursor: default; transition: box-shadow .18s ease, transform .18s ease, border-color .18s ease;
  position: relative; overflow: hidden;
}
.rd-stat:hover { box-shadow: 0 12px 28px ${C.shadow}; transform: translateY(-2px); border-color: ${C.borderMid}; }
.rd-stat-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 16px 16px 0 0;
}
.rd-stat-icon {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: transform .18s ease;
}
.rd-stat:hover .rd-stat-icon { transform: scale(1.05); }
.rd-stat-lbl {
  font-size: 12px; font-weight: 700; color: ${C.inkMute};
  text-transform: uppercase; letter-spacing: .07em; margin-bottom: 5px;
}
.rd-stat-val {
  font-size: 30px; font-weight: 800; line-height: 1; color: ${C.ink};
  font-family: 'Inter', sans-serif;
}

/* ── Toolbar ── */
.rd-toolbar {
  display: flex; align-items: center; gap: 10px; margin-bottom: 18px; flex-wrap: wrap;
}
.rd-select-wrap {
  display: flex; align-items: center; gap: 8px;
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 10px; padding: 10px 16px;
  transition: border-color .15s, box-shadow .15s;
}
.rd-select-wrap:focus-within { border-color: ${C.indigo}; box-shadow: 0 0 0 3px rgba(47,125,74,.10); }
.rd-select-wrap select {
  background: none; border: none; outline: none;
  font-size: 14px; font-weight: 600; color: ${C.ink};
  font-family: 'Inter', sans-serif; cursor: pointer;
}
.rd-count-badge {
  padding: 6px 14px; border-radius: 7px;
  background: ${C.indigoPale}; color: ${C.indigo};
  font-size: 12.5px; font-weight: 700; border: 1px solid ${C.indigoMid};
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* ── Workspace ── */
.rd-workspace {
  display: grid;
  grid-template-columns: minmax(240px, 360px) minmax(0, 1fr);
  gap: 16px;
  height: calc(100vh - 258px);
  min-height: 650px;
}
@media (max-width: 980px) {
  .rd-workspace { grid-template-columns: 1fr; height: auto; }
  .rd-stats { grid-template-columns: repeat(2, 1fr); }
}

/* ── Roster (redesigned: dark control-tower panel, fused header→list) ── */
.rd-roster {
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 16px; display: flex; flex-direction: column;
  overflow: hidden; box-shadow: 0 4px 18px ${C.shadow};
}
.rd-roster-hd {
  padding: 20px 18px 16px; border: none;
  display: flex; flex-direction: column; gap: 13px;
  background: ${GRAD_ROSTER};
  position: relative; overflow: hidden;
}
.rd-roster-hd::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.06) 45%, transparent 60%);
  background-size: 200% 100%;
  animation: rosterGleam 7s ease-in-out infinite;
  pointer-events: none;
}
.rd-roster-ttl {
  font-size: 11.5px; font-weight: 800; text-transform: uppercase;
  letter-spacing: .12em; color: rgba(255,255,255,.92);
  display: flex; align-items: center; justify-content: space-between;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.rd-roster-ttl-left { display: flex; align-items: center; gap: 7px; }
.rd-count-badge--onroster {
  padding: 4px 10px; border-radius: 20px;
  background: rgba(255,255,255,.14); color: #fff;
  font-size: 11.5px; font-weight: 700; border: 1px solid rgba(255,255,255,.22);
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.rd-search {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.18);
  border-radius: 10px; padding: 10px 14px;
  transition: border-color .15s, box-shadow .15s, background .15s;
}
.rd-search:focus-within {
  border-color: rgba(255,255,255,.5);
  box-shadow: 0 0 0 3px rgba(255,255,255,.08);
  background: rgba(255,255,255,.14);
}
.rd-search input {
  flex: 1; background: none; border: none; outline: none;
  font-size: 14px; color: #fff; font-family: 'Inter', sans-serif;
}
.rd-search input::placeholder { color: rgba(255,255,255,.55); }
.rd-search svg { color: rgba(255,255,255,.6); }
.rd-roster-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 4.75rem), 1fr));
  gap: 6px;
  width: 100%;
}
.rd-rf-chip {
  min-width: 0; width: 100%;
  padding: 6px 8px; border-radius: 20px;
  font-size: 11.5px; font-weight: 700; letter-spacing: .01em;
  background: rgba(255,255,255,.09); color: rgba(255,255,255,.78);
  border: 1px solid rgba(255,255,255,.16); cursor: pointer;
  font-family: 'Inter', sans-serif;
  text-align: center; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}
.rd-rf-chip:hover { background: rgba(255,255,255,.16); color: #fff; }
.rd-rf-chip--active {
  background: #fff; color: ${C.indigoHov};
  border-color: #fff;
}
.rd-roster-list { flex: 1; overflow-y: auto; padding: 10px 10px 12px; background: ${C.surface}; }
.rd-bulkbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
  padding: 8px 10px 10px; border-bottom: 1px solid rgba(255,255,255,.08);
}
.rd-bulkbar .rd-btn { padding: 7px 10px; font-size: 12px; }
.rd-row--checked { border-color: ${C.indigoMid} !important; background: #EEF4EF !important; }
.rd-check {
  width: 16px; height: 16px; flex-shrink: 0; accent-color: ${C.indigo};
  cursor: pointer;
}

/* ── Roster row (redesigned card) ── */
.rd-row {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 12px; border-radius: 13px;
  cursor: pointer; border: 1px solid transparent;
  margin-bottom: 6px; transition: background .14s ease, border-color .14s ease, transform .12s ease, box-shadow .14s ease;
  width: 100%; text-align: left; background: ${C.surfaceEl};
  position: relative;
}
.rd-row:hover { background: #EAE8DE; border-color: ${C.border}; }
.rd-row--active {
  background: ${C.surface} !important;
  border-color: ${C.indigo} !important;
  box-shadow: 0 4px 14px rgba(30,74,56,.14);
}
.rd-row--active::before {
  content: '';
  position: absolute; left: -1px; top: 10%; bottom: 10%; width: 3px;
  background: ${GRAD_INDIGO}; border-radius: 0 3px 3px 0;
}
.rd-avatar {
  width: 40px; height: 40px; border-radius: 11px;
  background: ${C.indigoPale}; color: ${C.indigo};
  font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  letter-spacing: -0.02em;
  position: relative;
}
.rd-avatar-ring {
  position: absolute; inset: -3px; border-radius: 13px;
  border: 2px solid transparent;
}
.rd-row-name {
  font-size: 14.5px; font-weight: 700; color: ${C.ink};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 118px;
}
.rd-row-sub {
  font-size: 12px; color: ${C.inkMute};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 118px;
  display: flex; align-items: center; gap: 4px; margin-top: 2px;
}
.rd-row-right { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }

/* ── Status chip ── */
.rd-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 9px; border-radius: 5px;
  font-size: 10px; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* ── Score ── */
.rd-score {
  font-size: 11.5px; font-weight: 700;
  padding: 3px 8px; border-radius: 5px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}

/* ── Detail panel ── */
.rd-detail {
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 14px; display: flex; flex-direction: column;
  overflow: hidden; box-shadow: 0 2px 10px ${C.shadow};
}

/* ── Hero ── */
.rd-hero {
  padding: 24px 24px 20px;
  border-bottom: 1px solid ${C.border};
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
  background: ${C.surface};
}
.rd-hero-name {
  font-size: 26px; font-weight: 700; color: ${C.ink};
  letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 8px;
  font-family: 'Inter', sans-serif;
}
.rd-hero-meta {
  display: flex; flex-wrap: wrap; gap: 14px;
  font-size: 14px; color: ${C.inkSoft}; align-items: center;
}

/* ── AI Score Ring ── */
.rd-ring-wrap {
  position: relative; width: 78px; height: 78px; flex-shrink: 0;
}
.rd-ring-wrap svg { position: absolute; top: 0; left: 0; }
.rd-ring-inner {
  position: absolute; inset: 10px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column;
}
.rd-ring-val {
  font-size: 18px; font-weight: 700; line-height: 1;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.rd-ring-lbl {
  font-size: 9.5px; font-weight: 700; color: ${C.inkMute};
  text-transform: uppercase; letter-spacing: .06em;
}

/* ── Action bar ── */
.rd-actions {
  padding: 16px 24px; border-bottom: 1px solid ${C.border};
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  background: ${C.surface};
}
.rd-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 10px;
  font-size: 14px; font-weight: 600;
  font-family: 'Inter', sans-serif; border: 1px solid transparent;
  cursor: pointer; transition: opacity .14s, transform .12s, box-shadow .14s;
  text-decoration: none; white-space: nowrap;
}
.rd-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 4px 10px ${C.shadow}; }
.rd-btn:active { transform: scale(.97); }
.rd-btn--primary { background: ${GRAD_INDIGO}; color: #fff; box-shadow: 0 2px 8px rgba(47,125,74,.20); border-color: transparent; }
.rd-btn--ghost { background: ${C.surface}; color: ${C.ink}; border-color: ${C.border}; }
.rd-btn--emerald { background: ${C.emeraldP}; color: ${C.emerald}; border-color: ${C.emeraldB}; }
.rd-btn--amber { background: ${C.amberP}; color: ${C.amber}; border-color: ${C.amberB}; }
.rd-btn--blue { background: ${C.blueP}; color: ${C.blue}; border-color: ${C.blueB}; }
.rd-btn--cyan { background: ${C.cyanP}; color: ${C.cyan}; border-color: ${C.cyanB}; }
.rd-btn--solid-em { background: #059669; color: #fff; border-color: transparent; }
.rd-btn--solid-bl { background: ${C.blue}; color: #fff; border-color: transparent; }
.rd-btn--solid-pu { background: ${C.purple}; color: #fff; border-color: transparent; }
.rd-btn--solid-cy { background: ${C.cyan}; color: #fff; border-color: transparent; }
.rd-btn--solid-am { background: ${C.amber}; color: #fff; border-color: transparent; }
.rd-btn--solid-ai { background: ${GRAD_AI}; color: #2B1D06; border-color: transparent; box-shadow: 0 2px 8px rgba(168,123,35,.22); }

/* ── Tabs ── */
.rd-tabs {
  display: flex; align-items: center; gap: 4px; margin: 16px 24px 0;
  padding: 4px; background: ${C.surfaceEl}; border: 1px solid ${C.border};
  border-radius: 12px;
  overflow-x: auto;
}
.rd-tab {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px; font-size: 13.5px; font-weight: 600;
  color: ${C.inkMute}; border: none; background: transparent;
  border-radius: 9px;
  position: relative;
  cursor: pointer; transition: color .16s ease, background .16s ease, box-shadow .16s ease; font-family: 'Inter', sans-serif;
  white-space: nowrap;
}
.rd-tab svg {
  transition: color .16s ease; flex-shrink: 0;
}
.rd-tab:hover { color: ${C.ink}; }
.rd-tab--active {
  color: ${C.ink}; background: ${C.surface};
  box-shadow: 0 1px 3px rgba(17,24,39,.08), 0 1px 2px rgba(17,24,39,.04);
}
.rd-tab-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 9px; font-size: 10.5px; font-weight: 700;
  background: ${C.border}; color: ${C.inkSoft};
  transition: background .16s ease, color .16s ease;
}
.rd-tab--active .rd-tab-count { background: currentColor; color: #fff; opacity: .92; }


/* ── Detail main: rail + content (replaces horizontal tab strip) ── */
.rd-detail-main {
  display: flex; flex: 1; min-height: 0; overflow: hidden;
}
.rd-tab-rail {
  display: flex; flex-direction: column; gap: 3px;
  width: 96px; flex-shrink: 0; padding: 14px 8px;
  border-right: 1px solid ${C.border};
  background: ${C.surfaceEl};
  overflow-y: auto;
}
.rd-tab-rail-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 4px 10px; border-radius: 10px;
  border: 1px solid transparent; background: transparent;
  cursor: pointer; color: ${C.inkMute};
  font-size: 10.5px; font-weight: 600; letter-spacing: .01em;
  font-family: 'Inter', sans-serif;
  transition: background .14s ease, color .14s ease, border-color .14s ease;
}
.rd-tab-rail-btn:hover { color: ${C.ink}; background: ${C.surface}; }
.rd-tab-rail-btn--active {
  color: ${C.indigo}; background: ${C.surface};
  border-color: ${C.border};
  box-shadow: 0 1px 3px rgba(27,33,29,.08);
}
.rd-tab-rail-btn svg { flex-shrink: 0; }

/* ── Tab body ── */
.rd-tab-body {
  flex: 1; overflow-y: auto; padding: 20px 24px 24px; min-width: 0;
  scrollbar-width: thin; scrollbar-color: ${C.border} transparent;
}
.rd-tab-body::-webkit-scrollbar { width: 5px; }
.rd-tab-body::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

/* ── Section card ── */
.rd-card {
  background: ${C.surfaceEl}; border: 1px solid ${C.border};
  border-radius: 12px; padding: 16px 18px; margin-bottom: 14px;
  transition: box-shadow .15s ease, border-color .15s ease, transform .15s ease;
  position: relative;
}
.rd-card:hover { border-color: ${C.borderMid}; }
.rd-card--tinted {
  background: #FFFFFF;
  border-left-width: 3px;
  border-left-style: solid;
}
.rd-card--tinted:hover { transform: translateY(-2px); box-shadow: 0 8px 20px ${C.shadow}; }
.rd-card-ttl {
  font-size: 15px; font-weight: 700; color: ${C.ink};
  margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
  font-family: 'Inter', sans-serif;
}
.rd-card-ttl svg { color: ${C.indigo}; }
.rd-card-icon-chip {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ── Overview summary boxes (Current Stage / AI Score / Intern Assignment) ── */
.rd-obox {
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 12px; padding: 14px 16px;
  transition: border-color .15s ease;
  position: relative; overflow: hidden;
}
.rd-obox:hover { border-color: ${C.borderMid}; }
.rd-obox-top {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.rd-obox-lbl {
  display: flex; align-items: center; gap: 6px;
  font-size: 10.5px; font-weight: 700; color: ${C.inkMute};
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px;
}
.rd-obox-icon {
  width: 20px; height: 20px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.rd-obox-val { font-size: 17px; font-weight: 700; color: ${C.ink}; letter-spacing: -0.005em; }

/* ── Data grid ── */
.rd-dgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.rd-dcell { display: flex; flex-direction: column; gap: 5px; }
.rd-dlbl {
  font-size: 12px; font-weight: 700; color: ${C.inkMute};
  text-transform: uppercase; letter-spacing: .07em;
}
.rd-dval { font-size: 16px; font-weight: 600; color: ${C.ink}; }

/* ── Skill tag ── */
.rd-skill {
  display: inline-flex; padding: 6px 14px;
  background: ${C.indigoPale}; color: ${C.indigo};
  border-radius: 8px; font-size: 13px; font-weight: 600; margin: 3px;
  border: 1px solid ${C.indigoMid};
  transition: transform .12s ease;
}
.rd-skill:hover { transform: translateY(-1px); }

/* ── Activity timeline ── */
.rd-timeline { position: relative; padding-left: 4px; }
.rd-act-row {
  display: flex; gap: 14px; padding-bottom: 24px; position: relative;
}
.rd-act-row:not(:last-child)::before {
  content: ''; position: absolute; left: 17px; top: 36px; bottom: 0;
  width: 2px; background: ${C.border};
}
.rd-act-dot {
  width: 35px; height: 35px; border-radius: 50%;
  background: ${C.indigoPale}; color: ${C.indigo};
  border: 2px solid #fff; box-shadow: 0 0 0 1px ${C.indigoMid};
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px; z-index: 1;
}
.rd-act-card {
  flex: 1; background: ${C.surfaceEl}; border: 1px solid ${C.border};
  border-radius: 12px; padding: 14px 16px;
}

/* ── Insight card ── */
.rd-insight { border-radius: 14px; padding: 20px 22px; }
.rd-insight--str { background: ${C.emeraldP}; border: 1px solid ${C.emeraldB}; }
.rd-insight--weak { background: ${C.redP}; border: 1px solid ${C.redB}; }
.rd-insight-ttl {
  font-size: 15px; font-weight: 700; margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
  display: flex; align-items: center; gap: 7px;
}
.rd-insight li { font-size: 14.5px; margin-bottom: 8px; line-height: 1.65; color: ${C.ink}; }

/* ── Doc status tag / card ── */
.rd-doc-tag {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px;
  font-size: 13.5px; font-weight: 700; border: 1px solid transparent;
}
.rd-doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
.rd-doc-card {
  border-radius: 12px; padding: 16px 18px; border: 1px solid ${C.border};
  background: ${C.surfaceEl}; display: flex; flex-direction: column; gap: 10px;
  transition: transform .14s ease, box-shadow .14s ease;
}
.rd-doc-card:hover { transform: translateY(-2px); box-shadow: 0 8px 18px ${C.shadow}; }
.rd-doc-card-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.rd-doc-card-lbl { font-size: 13.5px; font-weight: 600; color: ${C.ink}; }
.rd-doc-card-status { font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 5px; }

/* ── Q row ── */
.rd-q-row {
  display: flex; gap: 13px; align-items: flex-start;
  padding: 16px 18px; background: ${C.surfaceEl};
  border: 1px solid ${C.border}; border-radius: 12px;
  margin-bottom: 10px; font-size: 14.5px; color: ${C.ink}; line-height: 1.65;
  transition: border-color .14s ease;
}
.rd-q-row:hover { border-color: ${C.indigoMid}; }
.rd-q-num {
  font-weight: 700; color: #fff; background: ${GRAD_INDIGO};
  flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 13px;
  font-family: 'Inter', sans-serif;
}

/* ── Overlay / Panel ── */
.rd-overlay {
  position: fixed;
  inset: 0;

  background: rgba(17, 24, 39, 0.38);
  backdrop-filter: blur(4px);

  z-index: 99998;
}
.rd-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;

  width: 520px;
  max-width: 100vw;
  height: 100vh;

  background: #ffffff;

  z-index: 99999;

  display: flex;
  flex-direction: column;

  overflow-y: auto;

  border-left: 1px solid ${C.border};

  box-shadow: -20px 0 60px rgba(17,24,39,0.14);

  transform: translateX(0);
  visibility: visible;
  opacity: 1;
}
.rd-panel-hd {
  padding: 26px 28px; border-bottom: 1px solid ${C.border};
  display: flex; align-items: flex-start; justify-content: space-between;
  background: ${C.surface};
}
.rd-panel-ttl {
  font-size: 22px; font-weight: 700; color: ${C.ink};
  letter-spacing: -0.02em;
  font-family: 'Inter', sans-serif;
}
.rd-panel-sub { font-size: 14px; color: ${C.inkMute}; margin-top: 5px; }
.rd-panel-close {
  width: 34px; height: 34px; border-radius: 10px;
  border: 1px solid ${C.border}; background: ${C.surfaceEl};
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: ${C.ink}; transition: background .12s;
}
.rd-panel-close:hover { background: ${C.border}; }
.rd-panel-body { flex: 1; overflow-y: auto; padding: 28px; }

/* ── Form ── */
.rd-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.rd-field { display: flex; flex-direction: column; }
.rd-field--full { grid-column: 1 / -1; }
.rd-label {
  display: block; font-size: 12px; font-weight: 700; color: ${C.ink};
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px;
}
.rd-input {
  width: 100%; padding: 12px 14px;
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 10px; font-size: 14.5px; color: ${C.ink};
  font-family: 'Inter', sans-serif; outline: none;
  transition: border-color .15s, box-shadow .15s; box-sizing: border-box;
}
.rd-input:focus { border-color: ${C.indigo}; box-shadow: 0 0 0 3px rgba(47,125,74,.10); }
.rd-input::placeholder { color: ${C.inkMute}; }

/* ── Dialog ── */
.rd-dialog {
  position: fixed;
  inset: 0;
  z-index: 100000;

  display: flex; align-items: center; justify-content: center;
  background: rgba(17,24,39,.38); backdrop-filter: blur(5px);
}
.rd-dialog-card {
  background: ${C.surface}; border: 1px solid ${C.border};
  border-radius: 16px; padding: 32px; width: 460px;
  box-shadow: 0 30px 64px rgba(27,33,29,.18);
  animation: popIn .18s ease-out;
}
.rd-dialog-ttl {
  font-size: 22px; font-weight: 700; color: ${C.ink};
  letter-spacing: -0.02em; margin-bottom: 14px;
  font-family: 'Inter', sans-serif;
}
.rd-dialog-body { font-size: 15px; color: ${C.inkSoft}; line-height: 1.65; margin-bottom: 26px; }
.rd-dialog-acts { display: flex; justify-content: flex-end; gap: 10px; }

/* ── Stage row ── */
.rd-stage-row {
  display: flex; align-items: center; gap: 14px;
  background: ${C.surfaceEl}; border: 1px solid ${C.border};
  border-radius: 12px; padding: 16px 20px; margin: 14px 0;
}
.rd-stage-lbl {
  font-size: 12px; font-weight: 700; color: ${C.inkMute};
  text-transform: uppercase; letter-spacing: .07em; margin-bottom: 5px;
}
.rd-stage-val { font-size: 17px; font-weight: 700; color: ${C.ink}; }

/* ── Officer card ── */
.rd-officer-card {
  background: ${C.indigoPale}; border: 1px solid ${C.indigoMid};
  border-radius: 14px; padding: 18px 20px; grid-column: 1 / -1;
}

/* ── AI scan ── */
.rd-ai-scan {
  position: absolute; inset: 0; border-radius: 50%; overflow: hidden; pointer-events: none;
}
.rd-ai-scan::after {
  content: '';
  position: absolute; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(30,74,56,.30), transparent);
  animation: scanLine 2.2s ease-in-out infinite;
}

/* ── Empty state ── */
.rd-empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; height: 100%; gap: 12px;
  color: ${C.inkSoft}; text-align: center; padding: 44px;
}
.rd-empty-icon {
  width: 58px; height: 58px; border-radius: 16px;
  background: ${C.surfaceEl}; border: 1.5px dashed ${C.borderMid};
  display: flex; align-items: center; justify-content: center; margin-bottom: 8px;
}

/* ── Skeleton / loading ── */
.rd-skel-wrap { padding: 12px; }
.rd-skel-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 11px; margin-bottom: 6px;
  background: ${C.surfaceEl}; border-radius: 13px;
}
.rd-skel-block {
  border-radius: 8px;
  background: linear-gradient(90deg, ${C.surfaceEl} 25%, #EFEFEF 37%, ${C.surfaceEl} 63%);
  background-size: 400px 100%;
  animation: skelSweep 1.4s ease-in-out infinite;
}

/* ── Add button ── */
.rd-add-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 11px 22px; background: ${GRAD_INDIGO};
  color: #fff; border: none; border-radius: 12px;
  font-size: 14.5px; font-weight: 600; font-family: 'Inter', sans-serif;
  cursor: pointer; box-shadow: 0 4px 14px rgba(47,125,74,.20);
  transition: opacity .14s, transform .12s; letter-spacing: .005em;
}
.rd-add-btn:hover { opacity: .92; transform: translateY(-1px); }
.rd-add-btn:active { transform: scale(.97); }

/* ── Scrollbar ── */
.rd-roster-list::-webkit-scrollbar { width: 5px; }
.rd-roster-list::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

/* ── AI thinking dots ── */
.rd-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:${C.indigo}; animation:dots 1.2s ease-in-out infinite; }
.rd-dot:nth-child(2){animation-delay:.16s}
.rd-dot:nth-child(3){animation-delay:.32s}

/* ── Pipeline stage stepper (signature element) ── */
.rd-pipeline { display: flex; align-items: flex-start; margin-top: 16px; }
.rd-pip-step { display: flex; flex-direction: column; align-items: flex-start; flex: 1; position: relative; }
.rd-pip-track {
  width: 100%; height: 3px; background: ${C.border}; border-radius: 2px;
  margin-bottom: 7px; position: relative; overflow: hidden;
}
.rd-pip-track::after {
  content: ''; position: absolute; inset: 0; background: ${C.indigo};
  transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
}
.rd-pip-step--done .rd-pip-track::after { transform: scaleX(1); }
.rd-pip-step--cur .rd-pip-track::after { transform: scaleX(1); background: ${GRAD_AI}; }
.rd-pip-lbl {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 9.5px; font-weight: 600; letter-spacing: .04em;
  color: ${C.inkMute}; text-transform: uppercase;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
}
.rd-pip-step--done .rd-pip-lbl { color: ${C.indigo}; }
.rd-pip-step--cur .rd-pip-lbl { color: ${C.aiBlue}; font-weight: 700; }

/* ── Forward to employee dialog ── */
.rd-fwd-card { width: 520px; max-width: 92vw; }
.rd-fwd-summary {
  display: flex; align-items: center; gap: 12px;
  background: ${C.surfaceEl}; border: 1px solid ${C.border};
  border-radius: 12px; padding: 12px 14px; margin-bottom: 18px;
}
.rd-fwd-summary-name { font-size: 14.5px; font-weight: 700; color: ${C.ink}; }
.rd-fwd-summary-sub { font-size: 12px; color: ${C.inkMute}; margin-top: 2px; }
.rd-fwd-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0 4px; }
.rd-fwd-chip {
  display: inline-flex; align-items: center; gap: 6px;
  background: ${C.indigoPale}; color: ${C.indigo}; border: 1px solid ${C.indigoMid};
  padding: 4px 6px 4px 10px; border-radius: 20px; font-size: 12.5px; font-weight: 600;
}
.rd-fwd-chip button {
  background: none; border: none; cursor: pointer; color: ${C.indigo};
  display: flex; align-items: center; padding: 2px; border-radius: 50%;
}
.rd-fwd-chip button:hover { background: rgba(30,74,56,.12); }
.rd-emp-list {
  max-height: 220px; overflow-y: auto; border: 1px solid ${C.border};
  border-radius: 10px; margin-top: 8px;
}
.rd-emp-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; cursor: pointer; border-bottom: 1px solid ${C.border};
  transition: background .12s;
}
.rd-emp-row:last-child { border-bottom: none; }
.rd-emp-row:hover { background: ${C.surfaceEl}; }
.rd-emp-row--sel { background: ${C.indigoPale}; }
.rd-emp-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: ${C.indigo}; background: ${C.indigoMid};
}
.rd-emp-name { font-size: 13.5px; font-weight: 600; color: ${C.ink}; }
.rd-emp-sub {
  font-size: 11.5px; color: ${C.inkMute};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.rd-emp-empty { padding: 18px; text-align: center; font-size: 13px; color: ${C.inkMute}; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PIPELINE_STAGES = [
  "NEW",
  "SCREENING",
  "INTERVIEW",
  "SELECTED",
  "JOINING",
  "HIRED",
];

const STATUS_COLORS: Record<
  string,
  { bg: string; color: string; border: string }
> = {
  NEW: { bg: C.indigoPale, color: C.indigo, border: C.indigoMid },
  SCREENING: { bg: C.amberP, color: C.amber, border: C.amberB },
  INTERVIEW: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  SELECTED: { bg: C.cyanP, color: C.cyan, border: "#A5F3FC" },
  JOINING: { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  HIRED: { bg: C.emeraldP, color: C.emerald, border: C.emeraldB },
  ACTIVE: { bg: C.emeraldP, color: C.emerald, border: C.emeraldB },
  COMPLETED: { bg: C.purpleP, color: C.purple, border: "#DDD6FE" },
};

const ROSTER_FILTERS = ["ALL", ...PIPELINE_STAGES];

function chipStyle(s: string) {
  return (
    STATUS_COLORS[s] || { bg: C.surfaceEl, color: C.ink, border: C.border }
  );
}

function scoreColors(n: number) {
  if (n >= 80) return { color: C.emerald, bg: C.emeraldP, stroke: "#059669" };
  if (n >= 50) return { color: C.amber, bg: C.amberP, stroke: C.amber };
  return { color: C.red, bg: C.redP, stroke: C.red };
}
// Rotating accent palette used to differentiate adjacent info cards
// (instead of every card defaulting to the same green tone).
const CARD_PALETTE = [
  { bg: "#EEF3FF", color: "#3556D6", border: "#D3DEFB" }, // blue
  { bg: "#F5EEFE", color: "#7C3AED", border: "#E3D3FC" }, // violet
  { bg: "#FEF3E8", color: "#D9770A", border: "#FBE0BC" }, // amber
  { bg: "#E9F8F5", color: "#0E9384", border: "#C4EEE6" }, // teal
  { bg: "#FDEEF3", color: "#DB2C6F", border: "#F7CFDD" }, // rose
  { bg: "#EAF3ED", color: "#2F7D4A", border: "#CFE4D6" }, // green
  { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" }, // sky
  { bg: "#FBF0E4", color: "#B45309", border: "#F3DBB4" }, // caramel
  { bg: "#F1F0FB", color: "#5B4FCF", border: "#DAD7F5" }, // indigo
];
function cardAccent(i: number) {
  return CARD_PALETTE[i % CARD_PALETTE.length];
}
function avatarAccent(name: string) {
  const s = name || "?";
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return CARD_PALETTE[hash % CARD_PALETTE.length];
}
function safeParseArray(value: unknown): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Old comma-separated / plain text format
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
}
function initials(name: string) {
  return (name || "?")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function nextStage(status: string) {
  const i = PIPELINE_STAGES.indexOf(status);
  return PIPELINE_STAGES[Math.min(i + 1, PIPELINE_STAGES.length - 1)];
}

// ─── ScoreRing ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 78 }: { score: number; size?: number }) {
  const s = scoreColors(score);
  const r = (size - 10) / 2,
    cx = size / 2,
    cy = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="rd-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={C.border}
          strokeWidth={4}
        />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={s.stroke}
          strokeWidth={4}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ animation: "ringDraw .8s ease-out both" }}
        />
      </svg>
      <div className="rd-ring-inner" style={{ background: s.bg }}>
        <div className="rd-ring-val" style={{ color: s.color }}>
          {score}
        </div>
        <div className="rd-ring-lbl">score</div>
      </div>
      <div className="rd-ai-scan" />
    </div>
  );
}

// ─── PipelineBar ──────────────────────────────────────────────────────────────
function PipelineBar({ status }: { status: string }) {
  const idx = PIPELINE_STAGES.indexOf(status);
  return (
    <div className="rd-pipeline">
      {PIPELINE_STAGES.map((s, i) => (
        <div
          key={s}
          className={`rd-pip-step ${i < idx ? "rd-pip-step--done" : ""} ${i === idx ? "rd-pip-step--cur" : ""}`}
        >
          <div className="rd-pip-track" />
          <span className="rd-pip-lbl">
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── SidePanel ────────────────────────────────────────────────────────────────
function SidePanel({
  open,
  onClose,
  title,
  subtitle,
  width = 520,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ov"
            className="rd-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => {}}
          />
          <motion.div
            key="pn"
            className="rd-panel"
            style={{ width }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rd-panel-hd">
              <div>
                <div className="rd-panel-ttl">{title}</div>
                {subtitle && <div className="rd-panel-sub">{subtitle}</div>}
              </div>
              <button className="rd-panel-close" onClick={onClose}>
                <X size={14} />
              </button>{" "}
            </div>
            <div className="rd-panel-body">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`rd-field${full ? " rd-field--full" : ""}`}>
      <label className="rd-label">{label}</label>
      {children}
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  confirmClass,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  confirmClass: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="rd-dialog">
      <motion.div
        className="rd-dialog-card"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18 }}
      >
        <div className="rd-dialog-ttl">{title}</div>
        <div className="rd-dialog-body">{body}</div>
        <div className="rd-dialog-acts">
          <button className="rd-btn rd-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className={`rd-btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── RosterSkeleton (loading state for the candidate list) ────────────────────
function RosterSkeleton() {
  return (
    <div className="rd-skel-wrap">
      {Array.from({ length: 7 }).map((_, i) => (
        <div className="rd-skel-row" key={i}>
          <div
            className="rd-skel-block"
            style={{ width: 40, height: 40, borderRadius: 11 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 7,
            }}
          >
            <div
              className="rd-skel-block"
              style={{ width: "70%", height: 12 }}
            />
            <div
              className="rd-skel-block"
              style={{ width: "45%", height: 10 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [internAssignments, setInternAssignments] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [candidateAnalysis, setCandidateAnalysis] = useState<any>(null);
  const [candidateToMove, setCandidateToMove] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [forwardCandidate, setForwardCandidate] = useState<any>(null);
  const [forwardSearch, setForwardSearch] = useState("");
  const [forwardSelected, setForwardSelected] = useState<any[]>([]);
  const [forwardNote, setForwardNote] = useState("");
  const [forwardSending, setForwardSending] = useState(false);
  const [analyzeJDPrompt, setAnalyzeJDPrompt] = useState<any>(null);
  const [analyzeJDChoice, setAnalyzeJDChoice] = useState("");
  const [analyzeJDBusy, setAnalyzeJDBusy] = useState(false);
  const [, setReparsingProfile] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  // const [searchParams] = useSearchParams();
  const [showDuplicateLOADialog, setShowDuplicateLOADialog] = useState(false);
  const [duplicateLOACandidate, setDuplicateLOACandidate] = useState<any>(null);
  const [showDuplicateNDADialog, setShowDuplicateNDADialog] = useState(false);
  const [duplicateNDACandidate, setDuplicateNDACandidate] = useState<any>(null);
  const [showDuplicateLOCDialog, setShowDuplicateLOCDialog] = useState(false);
  const [duplicateLOCCandidate] = useState<any>(null);
  const [showDuplicateLORDialog, setShowDuplicateLORDialog] = useState(false);
  const [duplicateLORCandidate] = useState<any>(null);
  const [showDuplicateCertificateDialog, setShowDuplicateCertificateDialog] =
    useState(false);
  const [duplicateCertificateCandidate] = useState<any>(null);
  const [showLOAModal, setShowLOAModal] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [internAssignment, setInternAssignment] = useState<any>(null);
  const [ndaCandidate, setNdaCandidate] = useState<any>(null);
  const [selectedRequirement] = useState("ALL");
  const [requirements, setRequirements] = useState<any[]>([]);
  const [ndaFormData, setNdaFormData] = useState({
    guardian_name: "",
    area: "",
    district: "",
    state: "",
    pincode: "",
  });
  const [officers, setOfficers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loaCandidate, setLoaCandidate] = useState<any>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [formData, setFormData] = useState({
    internship_drive: "",
    internship_role: "",
    internship_type: "",
    department: "",
    start_date: "",
    end_date: "",
    work_mode: "",
    working_hours: "",
    project_title: "",
    officer_name: "",
    officer_designation: "",
    officer_email: "",
    officer_phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);
  const [internForm, setInternForm] = useState({
    role_name: "",
    department: "",
    project_name: "",
    joining_date: "",
    duration: "",
    end_date: "",
    reporting_manager: "",
    supervisor: "",
  });
  const [placementForm, setPlacementForm] = useState({
    project_title: "",
    job_title: "",
    department: "",
    supervisor: "",
    manager: "",
    joining_date: "",
  });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "ai" | "resume" | "documents" | "interview" | "activity"
  >("overview");
  const { user, role, profile } = useAuth();
  const notify = useNotification();
  useEffect(() => {
    const id = "rd-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = STYLE;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const candidateData = await candidateService.getCandidates();
        console.log("CANDIDATES LOADED:", candidateData);
        console.log("CANDIDATE COUNT:", candidateData?.length);
        setCandidates(candidateData || []);
        if (candidateData?.length) {
          await selectCandidate(candidateData[0]);
        }
        const requirementData = await requirementService.getRequirements();
        console.log("REQUIREMENTS FROM SERVICE:", requirementData);
        setRequirements(requirementData || []);
        let assignments: any[] = [];
        try {
          const { data } = await supabase
            .from("intern_assignments")
            .select("*");
          assignments = data || [];
        } catch {}
        const localAssign = localInternAssignmentStore.list();
        const remoteIds = new Set(assignments.map((a: any) => a.candidate_id));
        setInternAssignments([
          ...localAssign.filter((a) => !remoteIds.has(a.candidate_id)),
          ...assignments,
        ]);
        const officerData = await officerService.getOfficers();
        setOfficers(officerData || []);
        try {
          const employeeData = await employeeService.getAll();
          setEmployees(employeeData || []);
        } catch (e) {
          console.error("Failed to load employees for forwarding:", e);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = candidates.length;
  const interviewReady = candidates.filter(
    (c) => Number(c.ai_score || 0) >= 80,
  ).length;
  const underReview = candidates.filter((c) => {
    const s = Number(c.ai_score || 0);
    return s >= 50 && s < 80;
  }).length;
  const lowMatch = candidates.filter(
    (c) => Number(c.ai_score || 0) < 50,
  ).length;

  function getAssignment(id: string) {
    const intern = internAssignments.find((a) => a.candidate_id === id);
    const cand =
      candidates.find((c) => c.id === id) || localCandidateStore.getById(id);
    const merged = {
      ...(intern || {}),
      candidate_id: id,
      role_name: intern?.role_name || intern?.job_title || cand?.job_title,
      job_title: intern?.job_title || intern?.role_name || cand?.job_title,
      project_name:
        intern?.project_name || intern?.project_title || cand?.project_title,
      project_title:
        intern?.project_title || intern?.project_name || cand?.project_title,
      department: intern?.department || cand?.department,
      reporting_manager:
        intern?.reporting_manager || intern?.manager || cand?.manager,
      manager: intern?.manager || intern?.reporting_manager || cand?.manager,
      supervisor: intern?.supervisor || cand?.supervisor,
      joining_date: intern?.joining_date || cand?.joining_date,
      end_date: intern?.end_date,
    };
    const hasAny =
      merged.job_title ||
      merged.project_title ||
      merged.department ||
      merged.supervisor ||
      merged.manager ||
      merged.joining_date ||
      intern;
    return hasAny ? merged : null;
  }

  const visible = candidates
    .filter(
      (c) => selectedRequirement === "ALL" || c.job_id === selectedRequirement,
    )
    .filter(
      (c) => statusFilter === "ALL" || (c.status || "NEW") === statusFilter,
    )
    .filter((c) => {
      if (!searchTerm.trim()) return true;
      const q = searchTerm.trim().toLowerCase();
      return (
        (c.full_name || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
      );
    });

  const selAssign = selectedCandidate
    ? getAssignment(selectedCandidate.id)
    : null;
  const allVisibleSelected =
    visible.length > 0 && visible.every((c) => selectedIds.includes(c.id));

  async function refreshCandidates(selectId?: string) {
    const list = (await candidateService.getCandidates()) || [];
    setCandidates(list);
    const nextId = selectId || selectedCandidate?.id;
    const latest = list.find((c: any) => c.id === nextId) || list[0] || null;
    if (latest) {
      setSelectedCandidate(latest);
    } else {
      setSelectedCandidate(null);
    }
    return list;
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    if (allVisibleSelected) setSelectedIds([]);
    else setSelectedIds(visible.map((c) => c.id));
  }

  function openRename(candidate?: any) {
    const target =
      candidate ||
      (selectedIds.length === 1
        ? candidates.find((c) => c.id === selectedIds[0])
        : selectedCandidate);
    if (!target) {
      notify.error("Select one candidate to rename");
      return;
    }
    setSelectedCandidate(target);
    setRenameValue(target.full_name || "");
    setShowRename(true);
  }

  async function saveRename() {
    if (!selectedCandidate) return;
    try {
      await candidateService.renameCandidate(selectedCandidate.id, renameValue);
      notify.success("Candidate renamed");
      setShowRename(false);
      await refreshCandidates(selectedCandidate.id);
    } catch (error: any) {
      notify.error(error?.message || "Rename failed");
    }
  }

  async function deleteSelected(idsArg?: string[]) {
    const ids = idsArg?.length
      ? idsArg
      : selectedIds.length
        ? selectedIds
        : selectedCandidate
          ? [selectedCandidate.id]
          : [];
    if (!ids.length) {
      notify.error("Select at least one candidate");
      return;
    }
    if (
      !window.confirm(
        `Delete ${ids.length} candidate${ids.length > 1 ? "s" : ""} from the pipeline?`,
      )
    )
      return;
    try {
      await candidateService.deleteCandidates(ids);
      setSelectedIds([]);
      notify.success(
        ids.length === 1
          ? "Candidate deleted"
          : `${ids.length} candidates deleted`,
      );
      const remaining = candidates.filter((c) => !ids.includes(c.id));
      setCandidates(remaining);
      setSelectedCandidate(remaining[0] || null);
      await refreshCandidates(remaining[0]?.id);
    } catch (error: any) {
      notify.error(error?.message || "Delete failed");
    }
  }

  async function handlePipelineResume(file: File, candidateId?: string) {
    const id = candidateId || selectedIds[0] || selectedCandidate?.id;
    if (!id) {
      notify.error("Select a candidate first");
      return;
    }
    try {
      const url = await candidateService.uploadResume(id, file);
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, resume_url: url } : c)),
      );
      setSelectedCandidate((c: any) =>
        c?.id === id ? { ...c, resume_url: url } : c,
      );
      notify.success("Resume uploaded");
      try {
        const p = await profileService.getProfile(id);
        setCandidateProfile(p);
        setCandidateAnalysis(profileToAnalysisView(p));
      } catch {}
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message || "Resume upload failed");
    }
  }

  function openResume(candidate: any) {
    const url = candidate?.resume_url;

    if (!url) {
      notify.error("No resume on file yet. Upload or replace a resume first.");
      return;
    }

    window.location.href = url;
  }

  // ── Forward candidate to employee (internal referral / knowledge check) ──
  function openForward(candidate: any) {
    setForwardCandidate(candidate);
    setForwardSearch("");
    setForwardSelected([]);
    setForwardNote("");
  }

  function closeForward() {
    if (forwardSending) return;
    setForwardCandidate(null);
    setForwardSearch("");
    setForwardSelected([]);
    setForwardNote("");
  }

  function toggleForwardEmployee(emp: any) {
    setForwardSelected((prev) =>
      prev.some((e) => e.id === emp.id)
        ? prev.filter((e) => e.id !== emp.id)
        : [...prev, emp],
    );
  }

  function buildForwardEmailHtml(candidate: any, note: string) {
    const roleTitle =
      candidate.job_title ||
      candidate.role_name ||
      requirements.find((r: any) => r.id === candidate.requirement_id)?.title ||
      "Not specified";
    const rows = [
      ["Candidate", candidate.full_name || "—"],
      ["Email", candidate.email || "—"],
      ["Phone", candidate.phone || "—"],
      ["Role applied for", roleTitle],
      ["Current pipeline stage", candidate.status || "NEW"],
      [
        "AI match score",
        candidate.ai_score != null ? `${candidate.ai_score}%` : "—",
      ],
    ];
    const rowsHtml = rows
      .map(
        ([label, value]) => `
      <tr>
        <td style="padding:6px 10px;font-size:13px;color:#6F786F;font-weight:600;white-space:nowrap;">${label}</td>
        <td style="padding:6px 10px;font-size:13px;color:#1B211D;">${value}</td>
      </tr>`,
      )
      .join("");

    return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1B211D;line-height:1.55;max-width:640px;">
  <p style="margin:0 0 14px 0;">Hi,</p>
  <p style="margin:0 0 14px 0;">
    HR is sharing a candidate currently in the <strong>${candidate.status || "NEW"}</strong> stage
    of the hiring pipeline, thought you may have useful context or knowledge relevant to this role.
  </p>
  ${
    note
      ? `<div style="background:#F0EFE9;border-left:3px solid #1E4A38;padding:10px 14px;margin:0 0 16px 0;border-radius:4px;">
          <strong>Note from HR:</strong><br/>${note.replace(/\n/g, "<br/>")}
        </div>`
      : ""
  }
  <table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid #E7EEE7;border-radius:8px;border-collapse:collapse;width:100%;margin-bottom:16px;">
    ${rowsHtml}
  </table>
  <p style="margin:0 0 4px 0;">
    ${
      candidate.resume_url
        ? "The candidate's resume is attached to this email."
        : "No resume is on file for this candidate yet."
    }
  </p>
  <p style="margin:18px 0 0 0;font-size:13px;color:#6F786F;">
    This was shared privately from the internal talent pipeline. Please don't forward it outside the company.
  </p>
</div>`;
  }

  async function handleSendForward() {
    if (!forwardCandidate) return;
    if (forwardSelected.length === 0) {
      notify.error(
        "Select at least one employee to forward this candidate to.",
      );
      return;
    }
    setForwardSending(true);
    try {
      const candidate = forwardCandidate;
      const roleTitle =
        candidate.job_title ||
        candidate.role_name ||
        requirements.find((r: any) => r.id === candidate.requirement_id)
          ?.title ||
        "role";
      const subject = `Candidate for your input: ${candidate.full_name || "Candidate"} — ${roleTitle}`;
      const html = buildForwardEmailHtml(candidate, forwardNote.trim());
      console.log("FORWARD RESUME URL:", candidate.resume_url);
      const attachments = candidate.resume_url
        ? [
            {
              filename: `${(candidate.full_name || "candidate").replace(/[^a-z0-9]+/gi, "-")}-resume`,
              url: candidate.resume_url,
            },
          ]
        : [];

      for (const emp of forwardSelected) {
        await emailAutomationService.sendEmail({
          to: emp.email,
          subject,
          html,
          attachments,
        });
        try {
          await emailHistoryService.createHistory({
            sent_by: user?.id || null,
            to_email: emp.email,
            subject,
            body: html,
            attachment_url: candidate.resume_url || undefined,
            status: "SENT",
          });
        } catch (e) {
          console.error("Failed to log forward email history:", e);
        }
      }

      try {
        await activityLogService.logActivity({
          candidate_id: candidate.id,
          action: `Resume forwarded to ${forwardSelected
            .map((e: any) => e.full_name)
            .join(", ")}`,
          performed_by: user?.email || "Unknown",
          performed_by_name: profile?.full_name || user?.email || "Unknown",
        });
        await loadActivityLogs(candidate.id);
      } catch (e) {
        console.error("Failed to log forward activity:", e);
      }

      notify.success(
        `Forwarded to ${forwardSelected.length} ${
          forwardSelected.length === 1 ? "employee" : "employees"
        }`,
      );
      closeForward();
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message || "Failed to forward candidate details");
    } finally {
      setForwardSending(false);
    }
  }

  function hiredDocFields(candidate: any) {
    const a = internAssignment || {};
    const joining =
      a.joining_date ||
      a.start_date ||
      candidate?.joining_date ||
      new Date().toISOString().slice(0, 10);
    const end =
      a.end_date ||
      (() => {
        const d = new Date(joining);
        if (Number.isNaN(d.getTime())) return joining;
        d.setMonth(d.getMonth() + 6);
        return d.toISOString().slice(0, 10);
      })();
    return {
      role_name:
        a.role_name ||
        a.internship_role ||
        a.job_title ||
        candidate?.job_title ||
        "Intern",
      project_name:
        a.project_name ||
        a.project_title ||
        candidate?.project_title ||
        "Project",
      department: a.department || candidate?.department || "Department",
      joining_date: joining,
      start_date: joining,
      end_date: end,
      reporting_manager:
        a.reporting_manager || a.manager || candidate?.manager || "Manager",
      officer_name: a.supervisor || candidate?.supervisor || "Rajesh Kumar B",
      officer_designation: "CTO",
    };
  }

  function openGeneratedDoc(
    url?: string | null,
    label = "Document",
    target?: Window | null,
  ) {
    if (!url) {
      target?.close();
      notify.error(`${label} file is not available.`);
      return false;
    }
    if (target && !target.closed) {
      target.location.href = url;
      return true;
    }
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  }

  async function previewHiredDocument(
    kind: "CERTIFICATE" | "LOC" | "LOR",
    candidate: any,
    forceGenerate = false,
  ) {
    if (!candidate?.id) return;
    const labels = {
      CERTIFICATE: "Certificate",
      LOC: "Letter of Confirmation",
      LOR: "Letter of Recommendation",
    };
    const label = labels[kind];
    try {
      if (!forceGenerate) {
        const existing = documentService.findLocalCandidateDocument(
          candidate.id,
          kind,
          candidate.email,
        );
        if (existing?.document_url) {
          openGeneratedDoc(existing.document_url, label);
          return;
        }
      }

      const preview = window.open("about:blank", "_blank");
      try {
        const fields = hiredDocFields(candidate);
        let url = "";
        if (kind === "CERTIFICATE") {
          url = await documentService.generateCertificatePdf({
            candidate_name: candidate.full_name,
            role_name: fields.role_name,
            project_name: fields.project_name,
            start_date: fields.start_date,
            end_date: fields.end_date,
            issue_date: new Date().toLocaleDateString(),
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
          await documentService.createCertificate({
            candidate_id: candidate.id,
            document_url: url,
            role_name: fields.role_name,
            project_name: fields.project_name,
            start_date: fields.start_date,
            end_date: fields.end_date,
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
          if (isUuid(candidate.id)) {
            await supabase
              .from("intern_assignments")
              .update({ certificate_generated: true })
              .eq("candidate_id", candidate.id);
          }
        } else if (kind === "LOC") {
          url = await documentService.generateLOCPdf({
            candidate_name: candidate.full_name,
            role_name: fields.role_name,
            department: fields.department,
            joining_date: fields.joining_date,
            reporting_manager: fields.reporting_manager,
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
          await documentService.createLOC({
            candidate_id: candidate.id,
            document_url: url,
            role_name: fields.role_name,
            department: fields.department,
            joining_date: fields.joining_date,
            reporting_manager: fields.reporting_manager,
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
        } else {
          url = await documentService.generateLORPdf({
            candidate_name: candidate.full_name,
            role_name: fields.role_name,
            project_name: fields.project_name,
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
          await documentService.createLOR({
            candidate_id: candidate.id,
            document_url: url,
            role_name: fields.role_name,
            project_name: fields.project_name,
            officer_name: fields.officer_name,
            officer_designation: fields.officer_designation,
          });
        }

        await activityLogService.logActivity({
          candidate_id: candidate.id,
          action: `${label} Generated`,
        });
        await loadInternAssignment(candidate.id);
        await loadActivityLogs(candidate.id);
        openGeneratedDoc(url, label, preview);
        notify.success(`${label} generated`);
      } catch (error: any) {
        preview?.close();
        throw error;
      }
    } catch (error: any) {
      console.error(error);
      notify.error(error?.message || `Failed to open ${label}`);
    }
  }

  async function selectCandidate(c: any) {
    setSelectedCandidate(c);
    setActiveTab("overview");
    try {
      const p = await profileService.getProfile(c.id);
      setCandidateProfile(p);
      setCandidateAnalysis(profileToAnalysisView(p));
    } catch (error) {
      console.warn(error);
    }
    try {
      await loadInternAssignment(c.id);
    } catch {}
    try {
      await loadActivityLogs(c.id);
    } catch {}
    const assign = localInternAssignmentStore.getByCandidate(c.id);
    setPlacementForm({
      project_title: assign?.project_name || c.project_title || "",
      job_title: assign?.role_name || c.job_title || "",
      department: assign?.department || c.department || "",
      supervisor: assign?.supervisor || c.supervisor || "",
      manager: assign?.reporting_manager || c.manager || "",
      joining_date: assign?.joining_date || c.joining_date || "",
    });
  }

  // Resolves the JD text linked to a candidate via either assignment
  // mechanism used across the app: candidates.job_id (set at creation or by
  // Resume Intelligence) or the requirement_candidates junction table.
  // Returns both the resolved requirement id and its JD text, generically,
  // for any candidate / any requirement.
  // The candidate_profiles table stores AI analysis in snake_case columns
  // (resume_score, career_level, recommended_role, ...), but the AI
  // Insights tab reads a camelCase shape (resumeScore, careerLevel,
  // recommendedRoles[0].role, ...) — the same shape a fresh AI Analyze
  // run produces in memory. Without this mapping, every time a candidate
  // is (re)selected the tab shows "Not Available" even though the data is
  // sitting right there in the database, because the field names don't
  // match. This normalizes either shape into the one the UI expects.
  function profileToAnalysisView(profile: any): any {
    if (!profile) return null;

    const parseList = (value: unknown): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || !value.trim()) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const recommendedRoles = Array.isArray(profile.recommendedRoles)
      ? profile.recommendedRoles
      : profile.recommended_role
        ? [{ role: profile.recommended_role }]
        : [];

    return {
      resumeScore: Number(profile.resumeScore ?? profile.resume_score ?? 0),
      jdMatchScore: Number(profile.resumeScore ?? profile.resume_score ?? 0),
      confidence: Number(profile.confidence ?? 0),
      careerLevel: profile.careerLevel || profile.career_level || "",
      domain: profile.domain || "",
      recommendedRoles,
      currentCompany: profile.currentCompany || profile.current_company || "",
      currentDesignation:
        profile.currentDesignation || profile.current_designation || "",
      totalExperience:
        profile.totalExperience || profile.total_experience || "",
      careerSummary:
        profile.careerSummary ||
        profile.career_summary ||
        profile.ai_summary ||
        "",
      hireRecommendation: profile.hireRecommendation || "",
      strengths: parseList(profile.strengths),
      weaknesses: parseList(profile.weaknesses),
      missingInformation: [],
      // These aren't persisted anywhere (no matching DB columns), so they
      // only ever reflect the most recent AI Analyze run in this session.
      interviewQuestions: parseList(profile.interviewQuestions),
      riskFactors: [],
      technicalRating: Number(profile.technicalRating ?? 0),
      communicationRating: 0,
      leadershipRating: 0,
      problemSolvingRating: 0,
      learningPotential: 0,
      cultureFit: 0,
      atsKeywordsMatched: parseList(profile.atsKeywordsMatched),
      atsKeywordsMissing: parseList(profile.atsKeywordsMissing),
    };
  }

  // Runs the deterministic AI match for a candidate once we have a resolved
  // JD, and persists/refreshes the resulting analysis. Contains no
  // candidate- or role-specific logic — works the same for any pairing.
  async function runResumeMatch(candidate: any, jdText: string, profile: any) {
    const resumeText = profile?.resume_text || "";

    const matchResult = await resumeMatchingAIService.matchResume(
      jdText,
      resumeText,
    );

    // JD matching (matchResult) only produces match-specific fields —
    // overallMatch, skill/experience/education match, strengths/weaknesses,
    // recommendation, interview questions. Career level, domain, recommended
    // role, current company/designation, total experience, and the career
    // summary come from the earlier Gemini resume parse (done once at
    // candidate creation) and are already stored on the profile row.
    // Carry them forward here instead of overwriting them with blanks —
    // otherwise every AI Analyze click erases that data.
    const analysis = {
      resumeScore: matchResult.overallMatch,
      jdMatchScore: matchResult.overallMatch,
      confidence: profile?.confidence ?? 0,
      careerLevel: profile?.career_level || "",
      domain: profile?.domain || "",
      recommendedRoles: profile?.recommended_role
        ? [{ role: profile.recommended_role }]
        : [],
      currentCompany: profile?.current_company || "",
      currentDesignation: profile?.current_designation || "",
      totalExperience: profile?.total_experience || "",
      hireRecommendation: matchResult.recommendation,
      strengths: matchResult.strengths,
      weaknesses: matchResult.weaknesses,
      missingInformation: [],
      careerSummary: profile?.career_summary || profile?.ai_summary || "",
      interviewQuestions: matchResult.interviewQuestions,
      riskFactors: [],
      technicalRating: matchResult.skillMatch,
      communicationRating: 0,
      leadershipRating: 0,
      problemSolvingRating: 0,
      learningPotential: 0,
      cultureFit: 0,
      atsKeywordsMatched: matchResult.matchedSkills,
      atsKeywordsMissing: matchResult.missingSkills,
    };

    setCandidateAnalysis(analysis);

    await profileService.updateAIAnalysis(candidate.id, analysis);

    const updatedProfile = await profileService.getProfile(candidate.id);

    setCandidateProfile(updatedProfile);
    setCandidateAnalysis(analysis);

    await candidateService.updateCandidateScore(
      candidate.id,
      Number(analysis.resumeScore ?? 0),
    );

    if (matchResult.usedFallback) {
      // The AI extraction step failed, so this is NOT a real match
      // score — it's the scoring engine's neutral default. Make that
      // unmistakable instead of quietly showing a normal-looking result.
      notify.error(
        `AI extraction failed — this is a neutral fallback score, not a real match.

Reason: ${matchResult.fallbackReason || "Unknown error"}

Check the Groq API key/model configuration, then try again.`,
      );
    } else {
      notify.success(
        `AI Analysis Complete

Score: ${Number(analysis.resumeScore ?? 0)}%`,
      );
    }

    const updated = await candidateService.getCandidates();

    setCandidates(updated || []);

    const selected = updated.find((c: any) => c.id === candidate.id);

    if (selected) {
      setSelectedCandidate(selected);
    }

    // Keep activity log in sync
    await loadActivityLogs(candidate.id);
  }

  async function handleAnalyze(candidate: any) {
    console.log("AI ANALYZE CLICKED:", candidate?.id, candidate?.full_name);

    try {
      // 1. Get current profile
      let profile = await profileService.getProfile(candidate.id);

      if (!profile?.resume_text) {
        notify.error("Resume text not found.");
        return;
      }

      // 2. Reparse the resume automatically
      setReparsingProfile(true);

      const parsed = await geminiResumeParserService.parseResume(
        profile.resume_text,
      );

      await profileService.updateProfileEnrichment(
        candidate.id,
        parsed.analysis,
      );

      // 3. Get the freshly updated profile
      profile = await profileService.getProfile(candidate.id);

      setCandidateProfile(profile);
      setCandidateAnalysis(profileToAnalysisView(profile));

      // 4. Continue to AI analysis / JD selection
      setAnalyzeJDChoice("");
      setAnalyzeJDPrompt(candidate);
    } catch (err: any) {
      console.error("AI ANALYZE ERROR:", err);
      notify.error(err?.message || "AI Analysis Failed");
    } finally {
      setReparsingProfile(false);
    }
  }
  async function confirmAnalyzeWithRequirement() {
    const candidate = analyzeJDPrompt;
    if (!candidate || !analyzeJDChoice) {
      notify.error("Select a requirement to continue.");
      return;
    }
    setAnalyzeJDBusy(true);
    try {
      const requirement =
        await requirementService.getRequirementById(analyzeJDChoice);
      const jdText = String(
        requirement?.job_description || requirement?.description || "",
      ).trim();

      if (!jdText) {
        notify.error(
          "That requirement has no job description saved yet. Add one before analyzing against it.",
        );
        return;
      }

      // Persist the assignment (candidates.job_id) so future analyses and
      // the rest of the app see this candidate as linked to the job.
      await candidateService.assignCandidateToRequirement(
        candidate.id,
        analyzeJDChoice,
      );

      const profile =
        candidateProfile?.id === candidate.id
          ? candidateProfile
          : await profileService.getProfile(candidate.id);

      await runResumeMatch(candidate, jdText, profile);

      setAnalyzeJDPrompt(null);
      setAnalyzeJDChoice("");
    } catch (err: any) {
      console.dir(err, { depth: null });
      notify.error(err?.message || "AI Analysis Failed");
    } finally {
      setAnalyzeJDBusy(false);
    }
  }

  async function handleMoveStage(candidate: any) {
    try {
      const stages = [
        "NEW",
        "SCREENING",
        "INTERVIEW",
        "SELECTED",
        "JOINING",
        "HIRED",
      ];
      const idx = stages.indexOf(candidate.status || "NEW");
      const next = stages[Math.min(idx + 1, stages.length - 1)];
      if (candidate.status === next) {
        notify.error("Already in final stage");
        return;
      }
      console.log("Current Stage:", candidate.status);
      if (candidate.status === "INTERVIEW") {
        await candidateService.updateCandidateStatus(candidate.id, "SELECTED");

        const updated = await candidateService.getCandidates();

        setCandidates(updated || []);

        const updatedCandidate = updated.find((c) => c.id === candidate.id);

        setSelectedCandidate(updatedCandidate);

        setShowInternModal(true);

        return;
      }
      if (candidate.status === "JOINING") {
        notify.error(
          "Candidate can be hired only after the signed NDA is received.",
        );
        return;
      }
      await candidateService.updateCandidateStatus(candidate.id, next);
      await supabase.from("candidate_activity_logs").insert({
        candidate_id: candidate.id,
        action: "STATUS_CHANGE",
        old_status: candidate.status,
        new_status: next,
        performed_by: user?.email || "Unknown",
        performed_by_name: profile?.full_name || user?.email || "Unknown",
      });
      notify.success(`Moved to ${next}`);
      const u = await candidateService.getCandidates();
      setCandidates(u || []);
      const updatedCandidate = u.find((c: any) => c.id === candidate.id);

      if (updatedCandidate) {
        setSelectedCandidate(updatedCandidate);
      }
      // refresh the activity timeline so the stage change shows immediately
      await loadActivityLogs(candidate.id);
    } catch (e) {
      console.error(e);
      notify.error("Stage Update Failed");
    }
  }

  async function saveInternAssignment() {
    if (
      !internForm.role_name ||
      !internForm.department ||
      !internForm.project_name ||
      !internForm.joining_date
    ) {
      notify.error("Please fill all required fields");
      return;
    }
    try {
      const payload = {
        candidate_id: selectedCandidate.id,
        role_name: internForm.role_name,
        job_title: internForm.role_name,
        department: internForm.department,
        project_name: internForm.project_name,
        joining_date: internForm.joining_date,
        duration: internForm.duration,
        end_date: internForm.end_date,
        reporting_manager: internForm.reporting_manager,
        supervisor: internForm.supervisor,
      };
      try {
        const { error } = await supabase.from("intern_assignments").insert({
          candidate_id: selectedCandidate.id,
          role_name: internForm.role_name,
          department: internForm.department,
          project_name: internForm.project_name,
          joining_date: internForm.joining_date,
          duration: internForm.duration,
          end_date: internForm.end_date,
          reporting_manager: internForm.reporting_manager,
        });
        if (error) throw error;
      } catch {}
      localInternAssignmentStore.upsert(payload);
      localCandidateStore.update(selectedCandidate.id, {
        job_title: internForm.role_name,
        project_title: internForm.project_name,
        department: internForm.department,
        supervisor: internForm.supervisor,
        manager: internForm.reporting_manager,
        joining_date: internForm.joining_date,
      });
      await candidateService.updateCandidateStatus(
        selectedCandidate.id,
        "JOINING",
      );
      const updated = await candidateService.getCandidates();

      setCandidates(updated);

      const latest = updated.find((c) => c.id === selectedCandidate.id);

      setSelectedCandidate(latest);

      await loadInternAssignment(latest.id);

      setShowInternModal(false);

      notify.success("Intern Assignment Created");

      await loadActivityLogs(latest.id);
    } catch (e) {
      console.error(e);
      notify.error("Failed To Save");
    }
  }

  async function loadInternAssignment(id: string) {
    let data: any = null;
    if (isUuid(id)) {
      try {
        const res = await supabase
          .from("intern_assignments")
          .select("*")
          .eq("candidate_id", id)
          .maybeSingle();
        if (!res.error) data = res.data || null;
      } catch {}
    }
    if (!data) data = localInternAssignmentStore.getByCandidate(id);
    setInternAssignment(data || null);
    setInternAssignments((prev) => {
      const others = prev.filter((a) => a.candidate_id !== id);
      return data ? [...others, data] : others;
    });
    const cand =
      candidates.find((c) => c.id === id) || localCandidateStore.getById(id);
    setPlacementForm({
      project_title: data?.project_name || cand?.project_title || "",
      job_title: data?.role_name || data?.job_title || cand?.job_title || "",
      department: data?.department || cand?.department || "",
      supervisor: data?.supervisor || cand?.supervisor || "",
      manager: data?.reporting_manager || data?.manager || cand?.manager || "",
      joining_date: data?.joining_date || cand?.joining_date || "",
    });
  }

  async function savePlacement() {
    if (!selectedCandidate) return;
    localCandidateStore.update(selectedCandidate.id, placementForm);
    const row = localInternAssignmentStore.upsert({
      candidate_id: selectedCandidate.id,
      role_name: placementForm.job_title,
      job_title: placementForm.job_title,
      project_name: placementForm.project_title,
      department: placementForm.department,
      supervisor: placementForm.supervisor,
      reporting_manager: placementForm.manager,
      joining_date: placementForm.joining_date,
    });
    setInternAssignments((prev) => {
      const others = prev.filter(
        (a) => a.candidate_id !== selectedCandidate.id,
      );
      return [...others, row];
    });
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === selectedCandidate.id ? { ...c, ...placementForm } : c,
      ),
    );
    setSelectedCandidate((c: any) => (c ? { ...c, ...placementForm } : c));
    notify.success("Assignment saved");
  }

  async function loadActivityLogs(id: string) {
    if (!isUuid(id)) {
      setActivityLogs([]);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("candidate_activity_logs")
        .select("*")
        .eq("candidate_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setActivityLogs(data || []);
    } catch {
      setActivityLogs([]);
    }
  }

  async function markNDAReceived() {
    try {
      if (!selectedCandidate) return;
      await supabase
        .from("intern_assignments")
        .update({ nda_received: true })
        .eq("candidate_id", selectedCandidate.id);
      await activityLogService.logActivity({
        candidate_id: selectedCandidate.id,
        action: "NDA Received",
      });
      await candidateService.updateCandidateStatus(
        selectedCandidate.id,
        "HIRED",
      );
      await supabase
        .from("intern_assignments")
        .update({
          nda_received: true,
        })
        .eq("candidate_id", selectedCandidate.id);

      await loadInternAssignment(selectedCandidate.id);

      const updated = await candidateService.getCandidates();

      setCandidates(updated);

      const latest = updated.find((c: any) => c.id === selectedCandidate.id);

      if (latest) {
        setSelectedCandidate(latest);
      }

      setSelectedCandidate(latest);
      await loadInternAssignment(selectedCandidate.id);
      await loadActivityLogs(selectedCandidate.id);
      notify.success("Candidate Hired Successfully");
    } catch (e) {
      console.error(e);
      notify.error("Failed To Update NDA Status");
    }
  }

  async function loadInternDataForLOA(candidate: any) {
    const { data } = await supabase
      .from("intern_assignments")
      .select("*")
      .eq("candidate_id", candidate.id)
      .maybeSingle();
    if (!data) return;
    setFormData((f) => ({
      ...f,
      internship_role: data.role_name || "",
      department: data.department || "",
      start_date: data.joining_date || "",
      end_date: data.end_date || "",
      project_title: data.project_name || "",
    }));
  }

  async function handleGenerateLOA() {
    try {
      if (!loaCandidate) return;
      if (
        !formData.internship_drive ||
        !formData.internship_role ||
        !formData.internship_type ||
        !formData.start_date ||
        !formData.end_date ||
        !formData.work_mode ||
        !formData.working_hours ||
        !formData.project_title ||
        !formData.officer_name
      ) {
        notify.error("Please fill all required fields and select an officer");
        return;
      }
      const requirement = {
        title: formData.internship_role,
        department: formData.department,
      };
      const pdfUrl = await documentService.generateLOAPdf(
        loaCandidate,
        requirement,
        formData,
      );
      const { data: existingLOA } = await supabase
        .from("generated_documents")
        .select("id")
        .eq("candidate_id", loaCandidate.id)
        .eq("document_type", "LOA")
        .maybeSingle();

      if (existingLOA) {
        await supabase
          .from("generated_documents")
          .update({
            file_name: `RECRULYN_Internship_Acceptance_Letter_${(loaCandidate.full_name || "Candidate").replace(/\s+/g, "_")}.pdf`,
            file_url: pdfUrl,
            approval_status: "PENDING_APPROVAL",
            internship_role: formData.internship_role,
            project_title: formData.project_title,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingLOA.id);
      } else {
        await documentService.createLOA({
          candidate_id: loaCandidate.id,
          requirement_id: null,
          document_url: pdfUrl,
          ...formData,
          approval_officer: formData.officer_name,
          approval_officer_id: selectedOfficerId,
        });
      }
      await supabase
        .from("intern_assignments")
        .update({
          loa_generated: true,
        })
        .eq("candidate_id", loaCandidate.id);

      await loadInternAssignment(loaCandidate.id);

      const updated = await candidateService.getCandidates();

      setCandidates(updated);

      const latest = updated.find((c) => c.id === loaCandidate.id);

      if (latest) {
        setSelectedCandidate(latest);
      }

      await activityLogService.logActivity({
        candidate_id: loaCandidate.id,
        action: "LOA Generated",
      });

      await loadActivityLogs(loaCandidate.id);

      notify.success(`LOA Generated for ${loaCandidate.full_name}`);

      setShowLOAModal(false);

      setFormData({
        internship_drive: "",
        internship_role: "",
        internship_type: "",
        department: "",
        start_date: "",
        end_date: "",
        work_mode: "",
        working_hours: "",
        project_title: "",
        officer_name: "",
        officer_designation: "",
        officer_email: "",
        officer_phone: "",
      });
    } catch (e) {
      console.error(e);
      notify.error("LOA Generation Failed");
    }
  }

  async function handleGenerateNDA() {
    try {
      if (!ndaCandidate) return;

      if (
        !ndaFormData.guardian_name ||
        !ndaFormData.area ||
        !ndaFormData.district ||
        !ndaFormData.state ||
        !ndaFormData.pincode
      ) {
        notify.error("Please fill all NDA fields");
        return;
      }

      const pdfUrl = await ndaService.generateNDAPdf(
        ndaCandidate,
        { title: "Intern" },
        ndaFormData,
      );

      const { data: existingNDA } = await supabase
        .from("generated_documents")
        .select("id")
        .eq("candidate_id", ndaCandidate.id)
        .eq("document_type", "NDA")
        .maybeSingle();

      if (existingNDA) {
        await supabase
          .from("generated_documents")
          .update({
            file_name: `RECRULYN_NDA_${(ndaCandidate.full_name || "Candidate").replace(/\s+/g, "_")}.pdf`,
            file_url: pdfUrl,
            approval_status: "PENDING_APPROVAL",
            internship_role: "Intern",
            project_title: "NDA",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingNDA.id);
      } else {
        await ndaService.createNDA({
          candidate_id: ndaCandidate.id,
          requirement_id: null,
          document_url: pdfUrl,
          ...ndaFormData,
          internship_role: "Intern",
        });
      }

      await supabase
        .from("intern_assignments")
        .update({
          nda_generated: true,
        })
        .eq("candidate_id", ndaCandidate.id);

      await loadInternAssignment(ndaCandidate.id);

      const updated = await candidateService.getCandidates();

      setCandidates(updated);

      const latest = updated.find((c: any) => c.id === ndaCandidate.id);

      if (latest) {
        setSelectedCandidate(latest);
      }

      await activityLogService.logActivity({
        candidate_id: ndaCandidate.id,
        action: "NDA Generated",
      });

      await loadActivityLogs(ndaCandidate.id);

      notify.success(`NDA Generated for ${ndaCandidate.full_name}`);

      setShowNDAModal(false);
      setNdaCandidate(null);

      setNdaFormData({
        guardian_name: "",
        area: "",
        district: "",
        state: "",
        pincode: "",
      });
    } catch (e) {
      console.error(e);
      notify.error("NDA Generation Failed");
    }
  }
  return (
    <div className="rd-root">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="rd-ambient-a" />
      <div className="rd-ambient-b" />

      {/* Command bar */}
      <div className="rd-cmdbar">
        <div className="rd-brand">
          <div className="rd-brand-mark">
            <img src="/Logo-Monogram.png" alt="RECRULYN" />
          </div>
          <span className="rd-brand-name">RECRULYN</span>
          <span className="rd-brand-sub">HireOS</span>
        </div>
        <div className="rd-cmd-right">
          <div className="rd-ai-badge">
            <Sparkles size={14} />
            <span>AI Active</span>
          </div>
          {role === "HR" && (
            <motion.button
              className="rd-add-btn"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreateForm(true)}
            >
              <Plus size={16} /> Add Candidate
            </motion.button>
          )}
        </div>
      </div>

      <div className="rd-page">
        {/* Pipeline overview stats */}
        <div className="rd-stats">
          {[
            {
              l: "Total Candidates",
              v: total,
              icon: Users,
              color: C.indigo,
              bg: C.indigoPale,
            },
            {
              l: "Interview Ready",
              v: interviewReady,
              icon: Target,
              color: C.emerald,
              bg: C.emeraldP,
            },
            {
              l: "Under Review",
              v: underReview,
              icon: Clock,
              color: C.amber,
              bg: C.amberP,
            },
            {
              l: "Low Match",
              v: lowMatch,
              icon: AlertCircle,
              color: C.red,
              bg: C.redP,
            },
          ].map((s) => (
            <div key={s.l} className="rd-stat">
              <div className="rd-stat-accent" style={{ background: s.color }} />
              <div className="rd-stat-icon" style={{ background: s.bg }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div>
                <div className="rd-stat-lbl">{s.l}</div>
                <div className="rd-stat-val rd-mono">{s.v}</div>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="rd-workspace">
            <div className="rd-roster">
              <RosterSkeleton />
            </div>
            <div className="rd-detail">
              <div className="rd-empty">
                <div className="rd-dot" />
                <div className="rd-dot" />
                <div className="rd-dot" />
                <span
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.inkMute,
                  }}
                >
                  Loading candidate workspace…
                </span>
              </div>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="rd-empty">
            <div className="rd-empty-icon">
              <Users size={24} color={C.indigo} />
            </div>
            <div
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: C.ink,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              No candidates yet
            </div>
            <div style={{ fontSize: 15, color: C.inkMute }}>
              Add a candidate to start building your pipeline.
            </div>
          </div>
        ) : (
          <div className="rd-workspace">
            {/* ── Roster (redesigned) ── */}
            <motion.div
              className="rd-roster"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div className="rd-roster-hd">
                <div className="rd-roster-ttl">
                  <span className="rd-roster-ttl-left">
                    <LayoutGrid size={13} /> Pipeline
                  </span>
                  <span className="rd-count-badge--onroster">
                    {candidates.length} of {total}
                  </span>
                </div>
                <div className="rd-search">
                  <Search size={14} />
                  <input
                    placeholder="Search candidates…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="rd-roster-filters">
                  {ROSTER_FILTERS.map((f) => (
                    <button
                      key={f}
                      className={`rd-rf-chip${statusFilter === f ? " rd-rf-chip--active" : ""}`}
                      onClick={() => setStatusFilter(f)}
                    >
                      {f === "ALL"
                        ? "All"
                        : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                {role === "HR" && (
                  <div className="rd-bulkbar">
                    <button
                      type="button"
                      className="rd-btn rd-btn--ghost"
                      onClick={toggleSelectAll}
                    >
                      {allVisibleSelected ? (
                        <CheckSquare size={14} />
                      ) : (
                        <Square size={14} />
                      )}
                      {allVisibleSelected ? "Clear" : "Select all"}
                    </button>
                    {selectedIds.length > 0 && (
                      <>
                        <span className="rd-count-badge--onroster">
                          {selectedIds.length} selected
                        </span>
                        <button
                          type="button"
                          className="rd-btn rd-btn--ghost"
                          onClick={() => openRename()}
                          disabled={selectedIds.length !== 1}
                        >
                          <Pencil size={13} /> Rename
                        </button>
                        <label
                          className="rd-btn rd-btn--ghost"
                          style={{ cursor: "pointer" }}
                        >
                          <Upload size={13} /> Resume
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            hidden
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              e.currentTarget.value = "";
                              if (!f) return;
                              await handlePipelineResume(
                                f,
                                selectedIds.length === 1
                                  ? selectedIds[0]
                                  : undefined,
                              );
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          className="rd-btn rd-btn--ghost"
                          onClick={() => deleteSelected()}
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="rd-roster-list">
                {visible.length === 0 ? (
                  <div className="rd-empty" style={{ padding: 20 }}>
                    <div
                      className="rd-empty-icon"
                      style={{ width: 44, height: 44 }}
                    >
                      <Search size={18} color={C.indigo} />
                    </div>
                    <span
                      style={{
                        fontSize: 14.5,
                        color: C.inkMute,
                        fontWeight: 600,
                      }}
                    >
                      No matches for these filters.
                    </span>
                  </div>
                ) : (
                  visible.map((c, i) => {
                    const score = Number(c.ai_score || 0);
                    const sc = scoreColors(score);
                    const ch = chipStyle(c.status || "NEW");
                    const av = avatarAccent(c.full_name);
                    const active = selectedCandidate?.id === c.id;
                    const checked = selectedIds.includes(c.id);
                    return (
                      <motion.div
                        key={c.id}
                        className={`rd-row${active ? " rd-row--active" : ""}${checked ? " rd-row--checked" : ""}`}
                        onClick={() => selectCandidate(c)}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.16,
                          delay: Math.min(i * 0.02, 0.25),
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") selectCandidate(c);
                        }}
                      >
                        {role === "HR" && (
                          <input
                            className="rd-check"
                            type="checkbox"
                            checked={checked}
                            onClick={(e: React.MouseEvent) =>
                              e.stopPropagation()
                            }
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelected(c.id);
                            }}
                          />
                        )}
                        <div
                          className="rd-avatar"
                          style={{ background: av.bg, color: av.color }}
                        >
                          {initials(c.full_name)}
                          <div
                            className="rd-avatar-ring"
                            style={{
                              borderColor: active ? av.color : "transparent",
                            }}
                          />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="rd-row-name">{c.full_name}</div>
                          <div className="rd-row-sub">
                            <Mail size={10} />
                            {c.email}
                          </div>
                        </div>
                        <div className="rd-row-right">
                          <span
                            className="rd-chip"
                            style={{
                              background: ch.bg,
                              color: ch.color,
                              border: `1px solid ${ch.border}`,
                            }}
                          >
                            {c.status || "NEW"}
                          </span>
                          <span
                            className="rd-score"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {score}%
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>

            {/* ── Detail ── */}
            <motion.div
              className="rd-detail"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28 }}
            >
              <AnimatePresence mode="wait">
                {!selectedCandidate ? (
                  <motion.div
                    key="empty"
                    className="rd-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="rd-empty-icon">
                      <Briefcase size={24} color={C.indigo} />
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: C.ink,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      Select a candidate
                    </div>
                    <div style={{ fontSize: 15, color: C.inkMute }}>
                      Click any row in the pipeline to view their full profile.
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={selectedCandidate.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {/* Hero */}
                    <div className="rd-hero">
                      <div
                        style={{
                          display: "flex",
                          gap: 16,
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        <div
                          className="rd-avatar"
                          style={{
                            width: 60,
                            height: 60,
                            fontSize: 19,
                            flexShrink: 0,
                            background: avatarAccent(
                              selectedCandidate.full_name,
                            ).bg,
                            color: avatarAccent(selectedCandidate.full_name)
                              .color,
                          }}
                        >
                          {initials(selectedCandidate.full_name)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div
                            className="rd-hero-name"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {selectedCandidate.full_name}
                            {role === "HR" && (
                              <button
                                type="button"
                                className="rd-btn rd-btn--ghost"
                                style={{ padding: "4px 8px" }}
                                onClick={() => openRename(selectedCandidate)}
                              >
                                <Pencil size={13} /> Rename
                              </button>
                            )}
                          </div>
                          <div className="rd-hero-meta">
                            <span
                              className="rd-chip"
                              style={
                                chipStyle(
                                  selectedCandidate.status || "NEW",
                                ) as any
                              }
                            >
                              {selectedCandidate.status || "NEW"}
                            </span>

                            <span
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 5,
                              }}
                            >
                              <Mail size={13} />
                              {selectedCandidate.email}
                            </span>

                            {selectedCandidate.phone && (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <Phone size={13} />
                                {selectedCandidate.phone}
                              </span>
                            )}

                            {selectedCandidate?.linkedin && (
                              <a
                                href={
                                  selectedCandidate.linkedin.startsWith("http")
                                    ? selectedCandidate.linkedin
                                    : `https://${selectedCandidate.linkedin}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="LinkedIn"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <FaLinkedin size={18} color="#0A66C2" />
                              </a>
                            )}

                            {selectedCandidate?.github && (
                              <a
                                href={
                                  selectedCandidate.github.startsWith("http")
                                    ? selectedCandidate.github
                                    : `https://${selectedCandidate.github}`
                                }
                                target="_blank"
                                rel="noreferrer"
                                title="GitHub"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <FaGithub size={18} color="#181717" />
                              </a>
                            )}

                            {selectedCandidate?.portfolio && (
                              <a
                                href={
                                  selectedCandidate.portfolio.startsWith("http")
                                    ? selectedCandidate.portfolio
                                    : `https://${selectedCandidate.portfolio}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Portfolio"
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <TbWorld size={18} color="#0F766E" />
                              </a>
                            )}
                          </div>

                          <PipelineBar
                            status={selectedCandidate.status || "NEW"}
                          />
                        </div>
                      </div>
                      <ScoreRing
                        score={Number(selectedCandidate.ai_score || 0)}
                      />
                    </div>

                    {/* Actions */}
                    <div className="rd-actions">
                      {role === "HR" && (
                        <>
                          <label
                            className="rd-btn rd-btn--ghost"
                            style={{ cursor: "pointer" }}
                          >
                            <Upload size={14} />{" "}
                            {selectedCandidate.resume_url
                              ? "Replace Resume"
                              : "Upload Resume"}
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              hidden
                              onChange={async (e) => {
                                const f = e.target.files?.[0];
                                e.currentTarget.value = "";
                                if (!f) return;
                                await handlePipelineResume(
                                  f,
                                  selectedCandidate.id,
                                );
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            className="rd-btn rd-btn--ghost"
                            onClick={() => openRename(selectedCandidate)}
                          >
                            <Pencil size={14} /> Rename
                          </button>
                          <button
                            type="button"
                            className="rd-btn rd-btn--ghost"
                            onClick={() =>
                              deleteSelected([selectedCandidate.id])
                            }
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </>
                      )}
                      {selectedCandidate.resume_url && (
                        <button
                          type="button"
                          className="rd-btn rd-btn--emerald"
                          onClick={() => openResume(selectedCandidate)}
                        >
                          <FileCheck2 size={14} /> View Resume
                        </button>
                      )}
                      {role === "HR" &&
                        PIPELINE_STAGES.indexOf(
                          selectedCandidate.status || "NEW",
                        ) >= PIPELINE_STAGES.indexOf("INTERVIEW") && (
                          <button
                            type="button"
                            className="rd-btn rd-btn--blue"
                            onClick={() => openForward(selectedCandidate)}
                            title="Share this candidate's resume and details with a colleague for their input"
                          >
                            <Share2 size={14} /> Forward to Employee
                          </button>
                        )}
                      <button
                        className="rd-btn rd-btn--solid-ai"
                        onClick={() => handleAnalyze(selectedCandidate)}
                      >
                        <Sparkles size={14} /> AI Analyze
                      </button>

                      <button
                        className="rd-btn rd-btn--amber"
                        onClick={() => setCandidateToMove(selectedCandidate)}
                      >
                        <ArrowUpRight size={14} /> Move Stage
                      </button>
                      {selectedCandidate.status === "JOINING" && (
                        <>
                          {role === "HR" && (
                            <button
                              className="rd-btn rd-btn--emerald"
                              onClick={async () => {
                                const { data: e } = await supabase
                                  .from("generated_documents")
                                  .select("id")
                                  .eq("candidate_id", selectedCandidate.id)
                                  .eq("document_type", "LOA");

                                if (e && e.length > 0) {
                                  setDuplicateLOACandidate(selectedCandidate);
                                  setShowDuplicateLOADialog(true);
                                  return;
                                }

                                setLoaCandidate(selectedCandidate);
                                await loadInternDataForLOA(selectedCandidate);
                                setShowLOAModal(true);
                              }}
                            >
                              <FileSignature size={14} />
                              {selAssign?.loa_generated
                                ? "Regenerate LOA"
                                : "Generate LOA"}
                            </button>
                          )}
                        </>
                      )}
                      {selectedCandidate.status === "JOINING" &&
                        role === "HR" && (
                          <button
                            className="rd-btn rd-btn--blue"
                            onClick={async () => {
                              const { data: e } = await supabase
                                .from("generated_documents")
                                .select("id")
                                .eq("candidate_id", selectedCandidate.id)
                                .eq("document_type", "NDA");
                              if (e && e.length > 0) {
                                setDuplicateNDACandidate(selectedCandidate);
                                setShowDuplicateNDADialog(true);
                                return;
                              }
                              setNdaCandidate(selectedCandidate);
                              setShowNDAModal(true);
                            }}
                          >
                            <ShieldCheck size={14} /> Generate NDA
                          </button>
                        )}
                      {selectedCandidate.status === "HIRED" &&
                        role === "HR" && (
                          <>
                            <button
                              className="rd-btn rd-btn--solid-em"
                              onClick={() =>
                                previewHiredDocument(
                                  "CERTIFICATE",
                                  selectedCandidate,
                                )
                              }
                            >
                              <Award size={14} /> Certificate
                            </button>
                            <button
                              className="rd-btn rd-btn--solid-bl"
                              onClick={() =>
                                previewHiredDocument("LOC", selectedCandidate)
                              }
                            >
                              <FileSignature size={14} /> LOC
                            </button>
                            <button
                              className="rd-btn rd-btn--solid-cy"
                              onClick={() =>
                                previewHiredDocument("LOR", selectedCandidate)
                              }
                            >
                              <FileSignature size={14} /> LOR
                            </button>
                          </>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="rd-tabs">
                      {[
                        { id: "overview", label: "Overview", icon: Briefcase },
                        { id: "ai", label: "AI Insights", icon: Brain },

                        {
                          id: "documents",
                          label: "Documents",
                          icon: ShieldCheck,
                        },

                        {
                          id: "activity",
                          label: "Activity",
                          icon: HistoryIcon,
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          className={`rd-tab${activeTab === t.id ? " rd-tab--active" : ""}`}
                          onClick={() => setActiveTab(t.id as any)}
                        >
                          <t.icon
                            size={15}
                            style={{
                              transform:
                                activeTab === t.id ? "scale(1.05)" : "scale(1)",
                            }}
                          />
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab body */}
                    <div className="rd-tab-body">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTab}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{ duration: 0.15 }}
                        >
                          {activeTab === "overview" && (
                            <div>
                              <div
                                className="rd-dgrid"
                                style={{ marginBottom: 16 }}
                              >
                                <div className="rd-obox">
                                  <div
                                    className="rd-obox-top"
                                    style={{ background: C.indigo }}
                                  />
                                  <div className="rd-obox-lbl">
                                    <div
                                      className="rd-obox-icon"
                                      style={{ background: C.indigoPale }}
                                    >
                                      <Briefcase size={13} color={C.indigo} />
                                    </div>
                                    Current Stage
                                  </div>
                                  <div className="rd-obox-val">
                                    {selectedCandidate.status || "New"}
                                  </div>
                                </div>
                                <div className="rd-obox">
                                  <div
                                    className="rd-obox-top"
                                    style={{
                                      background: scoreColors(
                                        Number(selectedCandidate.ai_score || 0),
                                      ).stroke,
                                    }}
                                  />
                                  <div className="rd-obox-lbl">
                                    <div
                                      className="rd-obox-icon"
                                      style={{
                                        background: scoreColors(
                                          Number(
                                            selectedCandidate.ai_score || 0,
                                          ),
                                        ).bg,
                                      }}
                                    >
                                      <Target
                                        size={13}
                                        color={
                                          scoreColors(
                                            Number(
                                              selectedCandidate.ai_score || 0,
                                            ),
                                          ).color
                                        }
                                      />
                                    </div>
                                    AI Score
                                  </div>
                                  <div
                                    className="rd-obox-val"
                                    style={{
                                      color: scoreColors(
                                        Number(selectedCandidate.ai_score || 0),
                                      ).color,
                                    }}
                                  >
                                    {selectedCandidate.ai_score || 0}%
                                  </div>
                                </div>
                              </div>
                              <div
                                className="rd-obox"
                                style={{
                                  marginBottom: 16,
                                  padding: "16px 18px",
                                }}
                              >
                                <div
                                  className="rd-obox-top"
                                  style={{ background: C.purple }}
                                />
                                <div
                                  className="rd-card-ttl"
                                  style={{ marginBottom: 14, fontSize: 13.5 }}
                                >
                                  <div
                                    className="rd-obox-icon"
                                    style={{ background: C.purpleP }}
                                  >
                                    <Briefcase size={12} color={C.purple} />
                                  </div>
                                  Assignment
                                </div>
                                <div
                                  className="rd-dgrid"
                                  style={{ marginBottom: 14 }}
                                >
                                  {[
                                    { l: "Project Title", k: "project_title" },
                                    { l: "Job Title", k: "job_title" },
                                    { l: "Department", k: "department" },
                                    { l: "Supervisor", k: "supervisor" },
                                    { l: "Manager", k: "manager" },
                                    { l: "Joining Date", k: "joining_date" },
                                  ].map((d) => (
                                    <div key={d.k} className="rd-field">
                                      <label className="rd-label">{d.l}</label>
                                      {d.k === "department" ? (
                                        <DepartmentSelect
                                          className="rd-input"
                                          value={placementForm.department}
                                          onChange={(department) =>
                                            setPlacementForm((f) => ({
                                              ...f,
                                              department,
                                            }))
                                          }
                                        />
                                      ) : (
                                        <input
                                          className="rd-input"
                                          type={
                                            d.k === "joining_date"
                                              ? "date"
                                              : "text"
                                          }
                                          value={(placementForm as any)[d.k]}
                                          onChange={(e) =>
                                            setPlacementForm((f) => ({
                                              ...f,
                                              [d.k]: e.target.value,
                                            }))
                                          }
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <button
                                  className="rd-btn rd-btn--solid-bl"
                                  onClick={savePlacement}
                                >
                                  Save assignment
                                </button>
                              </div>
                            </div>
                          )}

                          {activeTab === "ai" && (
                            <div>
                              <div
                                className="rd-dgrid"
                                style={{ marginBottom: 16 }}
                              >
                                {[
                                  {
                                    l: "Resume Score",
                                    v: `${candidateAnalysis?.resumeScore ?? 0}%`,
                                    color: C.emerald,
                                    icon: Target,
                                  },

                                  {
                                    l: "Confidence",
                                    v: `${candidateAnalysis?.confidence ?? 0}%`,
                                    icon: Star,
                                  },

                                  {
                                    l: "Recommended Role",
                                    v:
                                      candidateAnalysis?.recommendedRoles?.[0]
                                        ?.role || "Not Available",
                                    icon: Briefcase,
                                  },

                                  {
                                    l: "Domain",
                                    v:
                                      candidateAnalysis?.domain ||
                                      "Not Available",
                                    icon: Layers,
                                  },

                                  {
                                    l: "Career Level",
                                    v:
                                      candidateAnalysis?.careerLevel ||
                                      "Not Available",
                                    icon: TrendingUp,
                                  },

                                  {
                                    l: "Current Company",
                                    v:
                                      candidateAnalysis?.currentCompany ||
                                      "Not Available",
                                    icon: Building2,
                                  },

                                  {
                                    l: "Current Designation",
                                    v:
                                      candidateAnalysis?.currentDesignation ||
                                      "Not Available",
                                    icon: BadgeCheck,
                                  },

                                  {
                                    l: "Total Experience",
                                    v:
                                      candidateAnalysis?.totalExperience ||
                                      "Not Available",
                                    icon: Timer,
                                  },

                                  {
                                    l: "Resume",
                                    v: selectedCandidate.resume_url
                                      ? "Uploaded"
                                      : "Not Uploaded",
                                    color: selectedCandidate.resume_url
                                      ? C.emerald
                                      : C.red,
                                    icon: FileCheck2,
                                  },
                                ].map((d, i) => (
                                  <div
                                    key={d.l}
                                    className="rd-card rd-card--tinted"
                                    style={{
                                      margin: 0,
                                      padding: "14px 16px",
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: 10,
                                      borderLeftColor: cardAccent(i).color,
                                    }}
                                  >
                                    <div
                                      className="rd-card-icon-chip"
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 8,
                                        background: cardAccent(i).bg,
                                        flexShrink: 0,
                                      }}
                                    >
                                      <d.icon
                                        size={14}
                                        color={cardAccent(i).color}
                                      />
                                    </div>
                                    <div>
                                      <div
                                        className="rd-dlbl"
                                        style={{ fontSize: 10.5 }}
                                      >
                                        {d.l}
                                      </div>
                                      <div
                                        className="rd-dval"
                                        style={{
                                          marginTop: 3,
                                          fontSize: 14,
                                          color: (d as any).color || C.ink,
                                        }}
                                      >
                                        {d.v}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="rd-card">
                                <div className="rd-card-ttl">
                                  <Zap size={15} /> Detected Skills
                                </div>
                                {!candidateProfile?.skills ? (
                                  <p
                                    style={{ fontSize: 14.5, color: C.inkMute }}
                                  >
                                    Run AI analysis to detect skills.
                                  </p>
                                ) : (
                                  <div>
                                    {(
                                      JSON.parse(
                                        candidateProfile.skills || "[]",
                                      ) as string[]
                                    ).map((s: string) => (
                                      <span key={s} className="rd-skill">
                                        {s.trim()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="rd-card">
                                <div className="rd-card-ttl">
                                  <FileText size={15} /> Career Summary
                                </div>
                                <p
                                  style={{
                                    fontSize: 14.5,
                                    lineHeight: 1.8,
                                    color: C.ink,
                                    marginTop: 4,
                                  }}
                                >
                                  {candidateAnalysis?.careerSummary ||
                                    "No AI summary available."}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: 16,
                                }}
                              >
                                <div className="rd-insight rd-insight--str">
                                  <div
                                    className="rd-insight-ttl"
                                    style={{ color: C.emerald }}
                                  >
                                    <CheckCircle2 size={16} /> Strengths
                                  </div>

                                  <ul
                                    style={{
                                      paddingLeft: 0,
                                      listStyle: "none",
                                      margin: 0,
                                    }}
                                  >
                                    {safeParseArray(
                                      candidateAnalysis?.strengths,
                                    ).map((item: string, index: number) => (
                                      <li
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: 8,
                                          marginBottom: 10,
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#16A34A",
                                            fontWeight: 700,
                                            marginTop: 2,
                                          }}
                                        >
                                          ✓
                                        </span>

                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="rd-insight rd-insight--weak">
                                  <div
                                    className="rd-insight-ttl"
                                    style={{ color: C.red }}
                                  >
                                    <AlertCircle size={16} /> Gaps
                                  </div>
                                  <ul
                                    style={{
                                      paddingLeft: 0,
                                      listStyle: "none",
                                      margin: 0,
                                    }}
                                  >
                                    {safeParseArray(
                                      candidateAnalysis?.weaknesses,
                                    ).map((item: string, index: number) => (
                                      <li
                                        key={index}
                                        style={{
                                          display: "flex",
                                          alignItems: "flex-start",
                                          gap: 8,
                                          marginBottom: 10,
                                          lineHeight: 1.6,
                                        }}
                                      >
                                        <span
                                          style={{
                                            color: "#DC2626",
                                            fontWeight: 700,
                                            marginTop: 2,
                                          }}
                                        >
                                          ⚠
                                        </span>

                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}

                          {activeTab === "documents" && (
                            <div>
                              <div className="rd-doc-grid">
                                {[
                                  {
                                    l: "LOA",
                                    on: selAssign?.loa_generated,
                                    bg: C.indigoPale,
                                    color: C.indigo,
                                    border: C.indigoMid,
                                    icon: FileSignature,
                                  },
                                  {
                                    l: "NDA",
                                    on: selAssign?.nda_generated,
                                    bg: C.cyanP,
                                    color: C.cyan,
                                    border: "#A5F3FC",
                                    icon: ShieldCheck,
                                  },
                                  {
                                    l: "NDA Received",
                                    on: selAssign?.nda_received,
                                    bg: C.emeraldP,
                                    color: C.emerald,
                                    border: C.emeraldB,
                                    icon: FileCheck2,
                                  },
                                  {
                                    l: "Joined",
                                    on: selAssign?.joined,
                                    bg: C.purpleP,
                                    color: C.purple,
                                    border: "#DDD6FE",
                                    icon: UserCheck,
                                  },
                                  {
                                    l: "Completed",
                                    on: selAssign?.completed,
                                    bg: C.amberP,
                                    color: C.amber,
                                    border: C.amberB,
                                    icon: CheckCircle2,
                                  },
                                  {
                                    l: "Certificate",
                                    on: selAssign?.certificate_generated,
                                    bg: C.emeraldP,
                                    color: C.emerald,
                                    border: C.emeraldB,
                                    icon: Award,
                                  },
                                ].map((t) => (
                                  <div key={t.l} className="rd-doc-card">
                                    <div
                                      className="rd-doc-card-icon"
                                      style={{
                                        background: t.on ? t.bg : C.surface,
                                        border: `1px solid ${t.on ? t.border : C.border}`,
                                      }}
                                    >
                                      <t.icon
                                        size={16}
                                        color={t.on ? t.color : C.inkMute}
                                      />
                                    </div>
                                    <div className="rd-doc-card-lbl">{t.l}</div>
                                    <div
                                      className="rd-doc-card-status"
                                      style={{
                                        color: t.on ? t.color : C.inkMute,
                                      }}
                                    >
                                      {t.on ? (
                                        <CheckCircle2 size={13} />
                                      ) : (
                                        <Circle size={13} />
                                      )}
                                      {t.on ? "Complete" : "Pending"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {selAssign && (
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 10,
                                    paddingTop: 16,
                                    borderTop: `1px solid ${C.border}`,
                                  }}
                                >
                                  {!selAssign.nda_received && (
                                    <button
                                      className="rd-btn rd-btn--solid-em"
                                      onClick={markNDAReceived}
                                    >
                                      Mark NDA Received
                                    </button>
                                  )}
                                  {!selAssign.joined && (
                                    <button
                                      className="rd-btn rd-btn--solid-bl"
                                      onClick={async () => {
                                        await supabase
                                          .from("intern_assignments")
                                          .update({ joined: true })
                                          .eq(
                                            "candidate_id",
                                            selectedCandidate.id,
                                          );
                                        await supabase
                                          .from("candidates")
                                          .update({ status: "ACTIVE" })
                                          .eq("id", selectedCandidate.id);
                                        await activityLogService.logActivity({
                                          candidate_id: selectedCandidate.id,
                                          action: "Joined",
                                        });
                                        await loadInternAssignment(
                                          selectedCandidate.id,
                                        );
                                        const u =
                                          await candidateService.getCandidates();
                                        setCandidates(u || []);
                                        const latest = u?.find(
                                          (c: any) =>
                                            c.id === selectedCandidate.id,
                                        );
                                        if (latest)
                                          setSelectedCandidate(latest);
                                        await loadActivityLogs(
                                          selectedCandidate.id,
                                        );
                                      }}
                                    >
                                      Mark Joined
                                    </button>
                                  )}
                                  {!selAssign.completed && (
                                    <button
                                      className="rd-btn rd-btn--solid-pu"
                                      onClick={async () => {
                                        await supabase
                                          .from("intern_assignments")
                                          .update({ completed: true })
                                          .eq(
                                            "candidate_id",
                                            selectedCandidate.id,
                                          );
                                        await supabase
                                          .from("candidates")
                                          .update({ status: "COMPLETED" })
                                          .eq("id", selectedCandidate.id);
                                        await activityLogService.logActivity({
                                          candidate_id: selectedCandidate.id,
                                          action: "Internship Completed",
                                        });
                                        await loadInternAssignment(
                                          selectedCandidate.id,
                                        );
                                        const u =
                                          await candidateService.getCandidates();
                                        setCandidates(u || []);
                                        const latest = u?.find(
                                          (c: any) =>
                                            c.id === selectedCandidate.id,
                                        );
                                        if (latest)
                                          setSelectedCandidate(latest);
                                        await loadActivityLogs(
                                          selectedCandidate.id,
                                        );
                                      }}
                                    >
                                      Mark Completed
                                    </button>
                                  )}
                                </div>
                              )}
                              {!selAssign && (
                                <div
                                  className="rd-empty"
                                  style={{ padding: 28 }}
                                >
                                  <div
                                    className="rd-empty-icon"
                                    style={{ width: 46, height: 46 }}
                                  >
                                    <ShieldCheck size={18} color={C.indigo} />
                                  </div>
                                  <span
                                    style={{ fontSize: 14.5, color: C.inkMute }}
                                  >
                                    Onboarding actions appear once the candidate
                                    reaches the Joining stage.
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === "activity" && (
                            <div className="rd-timeline">
                              {activityLogs.length === 0 ? (
                                <div
                                  className="rd-empty"
                                  style={{ padding: 28 }}
                                >
                                  <div
                                    className="rd-empty-icon"
                                    style={{ width: 46, height: 46 }}
                                  >
                                    <HistoryIcon size={18} color={C.indigo} />
                                  </div>
                                  <span
                                    style={{ fontSize: 14.5, color: C.inkMute }}
                                  >
                                    No activity recorded yet.
                                  </span>
                                </div>
                              ) : (
                                activityLogs.map((log) => (
                                  <div key={log.id} className="rd-act-row">
                                    <div className="rd-act-dot">
                                      <UserCheck size={15} />
                                    </div>
                                    <div className="rd-act-card">
                                      <div
                                        style={{
                                          fontSize: 15.5,
                                          fontWeight: 700,
                                          color: C.ink,
                                          marginBottom: 4,
                                        }}
                                      >
                                        {log.old_status && log.new_status
                                          ? `${log.old_status} → ${log.new_status}`
                                          : log.action}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 14,
                                          color: C.inkSoft,
                                        }}
                                      >
                                        {log.performed_by_name ||
                                          log.performed_by}
                                      </div>
                                      <div
                                        style={{
                                          fontSize: 12.5,
                                          color: C.inkMute,
                                          marginTop: 3,
                                        }}
                                      >
                                        {new Date(
                                          log.created_at,
                                        ).toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Panels ── */}
      <AnimatePresence>
        {showCreateForm && (
          <>
            <motion.div
              className="rd-overlay"
              onClick={() => setShowCreateForm(false)}
            />

            <motion.div
              className="rd-dialog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                className="rd-dialog-card"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "900px",
                  maxWidth: "90vw",
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                <CreateCandidateForm
                  onClose={() => setShowCreateForm(false)}
                />{" "}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SidePanel
        open={showLOAModal}
        onClose={() => setShowLOAModal(false)}
        title="Generate LOA"
        subtitle={loaCandidate?.full_name}
        width={620}
      >
        <div className="rd-form-grid">
          <Field label="Internship Drive">
            <input
              list="rd-drives"
              className="rd-input"
              placeholder="e.g. Summer Internship Drive"
              value={formData.internship_drive}
              onChange={(e) =>
                setFormData((f) => ({ ...f, internship_drive: e.target.value }))
              }
            />
          </Field>
          <Field label="Internship Role">
            <input
              className="rd-input"
              placeholder="Role"
              value={formData.internship_role}
              onChange={(e) =>
                setFormData((f) => ({ ...f, internship_role: e.target.value }))
              }
            />
          </Field>
          <Field label="Internship Type">
            <input
              list="rd-types"
              className="rd-input"
              placeholder="Full-Time / Part-Time"
              value={formData.internship_type}
              onChange={(e) =>
                setFormData((f) => ({ ...f, internship_type: e.target.value }))
              }
            />
          </Field>
          <Field label="Department">
            <DepartmentSelect
              className="rd-input"
              value={formData.department}
              onChange={(department) =>
                setFormData((f) => ({ ...f, department }))
              }
            />
          </Field>
          <Field label="Start Date">
            <input
              type="date"
              className="rd-input"
              value={formData.start_date}
              onChange={(e) =>
                setFormData((f) => ({ ...f, start_date: e.target.value }))
              }
            />
          </Field>

          <Field label="End Date">
            <input
              type="date"
              className="rd-input"
              value={formData.end_date}
              onChange={(e) =>
                setFormData((f) => ({ ...f, end_date: e.target.value }))
              }
            />
          </Field>
          <Field label="Work Mode">
            <input
              list="rd-modes"
              className="rd-input"
              placeholder="Remote / Hybrid / Onsite"
              value={formData.work_mode}
              onChange={(e) =>
                setFormData((f) => ({ ...f, work_mode: e.target.value }))
              }
            />
          </Field>
          <Field label="Working Hours">
            <input
              className="rd-input"
              placeholder="9 AM – 6 PM"
              value={formData.working_hours}
              onChange={(e) =>
                setFormData((f) => ({ ...f, working_hours: e.target.value }))
              }
            />
          </Field>

          <Field label="Project Title" full>
            <input
              className="rd-input"
              placeholder="Project Title"
              value={formData.project_title}
              onChange={(e) =>
                setFormData((f) => ({ ...f, project_title: e.target.value }))
              }
            />
          </Field>
          <Field label="Approving Officer" full>
            <select
              className="rd-input"
              value={selectedOfficerId}
              onChange={(e) => {
                setSelectedOfficerId(e.target.value);
                const o = officers.find((o) => o.id === e.target.value);
                if (!o) return;
                setFormData((f) => ({
                  ...f,
                  officer_name: o.name,
                  officer_designation: o.designation,
                  officer_email: o.email,
                  officer_phone: o.phone,
                }));
              }}
            >
              <option value="">Select officer…</option>
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.designation}
                </option>
              ))}
            </select>
          </Field>
          {formData.officer_name && (
            <div className="rd-officer-card">
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: C.indigo,
                  marginBottom: 12,
                }}
              >
                Selected Officer
              </div>
              <div className="rd-dgrid">
                {[
                  { l: "Name", v: formData.officer_name },
                  { l: "Designation", v: formData.officer_designation },
                  { l: "Email", v: formData.officer_email },
                  { l: "Phone", v: formData.officer_phone },
                ].map((d) => (
                  <div key={d.l} className="rd-dcell">
                    <span className="rd-dlbl">{d.l}</span>
                    <span className="rd-dval">{d.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <datalist id="rd-drives">
          {[
            "Summer Internship Drive",
            "Winter Internship Drive",
            "Autumn Internship Drive",
            "Spring Internship Drive",
            "Campus Internship Drive",
            "Industry Internship Drive",
            "Industry Training Program",
            "Academic Internship Program",
          ].map((v) => (
            <option key={v} value={v} />
          ))}
        </datalist>
        <datalist id="rd-types">
          <option value="Full-Time" />
          <option value="Part-Time" />
        </datalist>
        <datalist id="rd-modes">
          <option value="Remote" />
          <option value="Hybrid" />
          <option value="Onsite" />
        </datalist>
        <button
          className="rd-btn rd-btn--solid-em"
          style={{
            width: "100%",
            marginTop: 22,
            justifyContent: "center",
            padding: "14px",
          }}
          onClick={handleGenerateLOA}
        >
          <FileSignature size={15} /> Generate LOA
        </button>
      </SidePanel>

      <SidePanel
        open={showNDAModal}
        onClose={() => setShowNDAModal(false)}
        title="Generate NDA"
        subtitle={ndaCandidate?.full_name}
      >
        <div className="rd-form-grid">
          <Field label="Parent / Guardian Name" full>
            <input
              className="rd-input"
              placeholder="Guardian name"
              value={ndaFormData.guardian_name}
              onChange={(e) =>
                setNdaFormData((f) => ({ ...f, guardian_name: e.target.value }))
              }
            />
          </Field>
          <Field label="Area">
            <input
              className="rd-input"
              placeholder="Area"
              value={ndaFormData.area}
              onChange={(e) =>
                setNdaFormData((f) => ({ ...f, area: e.target.value }))
              }
            />
          </Field>
          <Field label="District">
            <input
              className="rd-input"
              placeholder="District"
              value={ndaFormData.district}
              onChange={(e) =>
                setNdaFormData((f) => ({ ...f, district: e.target.value }))
              }
            />
          </Field>
          <Field label="State">
            <input
              className="rd-input"
              placeholder="State"
              value={ndaFormData.state}
              onChange={(e) =>
                setNdaFormData((f) => ({ ...f, state: e.target.value }))
              }
            />
          </Field>
          <Field label="Pincode">
            <input
              className="rd-input"
              placeholder="Pincode"
              value={ndaFormData.pincode}
              onChange={(e) =>
                setNdaFormData((f) => ({ ...f, pincode: e.target.value }))
              }
            />
          </Field>
        </div>
        <button
          className="rd-btn rd-btn--solid-bl"
          style={{
            width: "100%",
            marginTop: 22,
            justifyContent: "center",
            padding: "14px",
          }}
          onClick={handleGenerateNDA}
        >
          <ShieldCheck size={15} /> Generate NDA
        </button>
      </SidePanel>

      <SidePanel
        open={showInternModal}
        onClose={() => setShowInternModal(false)}
        title="Convert to Intern"
        subtitle="Assign role, department, and project"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { l: "Job Title", k: "role_name", p: "e.g. Software Intern" },
            { l: "Project Title", k: "project_name", p: "Project title" },
            { l: "Duration", k: "duration", p: "e.g. 3 months" },
            { l: "Supervisor", k: "supervisor", p: "Supervisor name" },
            { l: "Manager", k: "reporting_manager", p: "Manager name" },
          ].map((f) => (
            <div key={f.k} className="rd-field">
              <label className="rd-label">{f.l}</label>
              <input
                className="rd-input"
                placeholder={f.p}
                value={(internForm as any)[f.k]}
                onChange={(e) =>
                  setInternForm((i) => ({ ...i, [f.k]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="rd-field">
            <label className="rd-label">Department</label>
            <DepartmentSelect
              className="rd-input"
              value={internForm.department}
              onChange={(department) =>
                setInternForm((i) => ({ ...i, department }))
              }
            />
          </div>
          <div className="rd-field">
            <label className="rd-label">Joining Date</label>
            <input
              type="date"
              className="rd-input"
              value={internForm.joining_date}
              onChange={(e) =>
                setInternForm((i) => ({ ...i, joining_date: e.target.value }))
              }
            />
          </div>
          <div className="rd-field">
            <label className="rd-label">End Date</label>
            <input
              type="date"
              className="rd-input"
              value={internForm.end_date}
              onChange={(e) =>
                setInternForm((i) => ({ ...i, end_date: e.target.value }))
              }
            />
          </div>
          <button
            className="rd-btn rd-btn--solid-bl"
            style={{ width: "100%", justifyContent: "center", padding: "14px" }}
            onClick={saveInternAssignment}
          >
            Save &amp; Continue
          </button>
        </div>
      </SidePanel>

      {candidateToMove && (
        <div className="rd-dialog">
          <motion.div
            className="rd-dialog-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rd-dialog-ttl">Confirm Stage Change</div>
            <div className="rd-dialog-body">
              <div className="rd-stage-row">
                <div style={{ flex: 1 }}>
                  <div className="rd-stage-lbl">Current</div>
                  <div className="rd-stage-val">
                    {candidateToMove.status || "NEW"}
                  </div>
                </div>
                <ChevronRight size={18} color={C.ink} />
                <div style={{ flex: 1 }}>
                  <div className="rd-stage-lbl">Next</div>
                  <div className="rd-stage-val" style={{ color: C.indigo }}>
                    {nextStage(candidateToMove.status)}
                  </div>
                </div>
              </div>
              Moving <strong>{candidateToMove.full_name}</strong> to the next
              stage. This will be logged.
            </div>
            <div className="rd-dialog-acts">
              <button
                className="rd-btn rd-btn--ghost"
                onClick={() => setCandidateToMove(null)}
              >
                Cancel
              </button>
              <button
                className="rd-btn rd-btn--solid-am"
                onClick={() => {
                  const candidate = candidateToMove;

                  setCandidateToMove(null);

                  requestAnimationFrame(() => {
                    if (candidate) {
                      handleMoveStage(candidate);
                    }
                  });
                }}
              >
                Confirm Move
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {forwardCandidate && (
        <div
          className="rd-dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeForward();
          }}
        >
          <motion.div
            className="rd-dialog-card rd-fwd-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rd-dialog-ttl">Forward to Employee</div>

            <div className="rd-fwd-summary">
              <div
                className="rd-emp-avatar"
                style={{ width: 38, height: 38, fontSize: 14 }}
              >
                {(forwardCandidate.full_name || "?")
                  .split(" ")
                  .map((p: string) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="rd-fwd-summary-name">
                  {forwardCandidate.full_name}
                </div>
                <div className="rd-fwd-summary-sub">
                  {forwardCandidate.status || "NEW"} stage
                  {forwardCandidate.resume_url
                    ? " · Resume will be attached"
                    : " · No resume on file"}
                </div>
              </div>
              {forwardCandidate.resume_url && (
                <Paperclip size={16} color={C.inkMute} />
              )}
            </div>

            <div className="rd-dialog-body" style={{ marginBottom: 14 }}>
              <div className="rd-field" style={{ marginBottom: 4 }}>
                <label className="rd-label">Send to</label>
                <input
                  className="rd-input"
                  placeholder="Search employees by name, email, department…"
                  value={forwardSearch}
                  onChange={(e) => setForwardSearch(e.target.value)}
                />
              </div>

              {forwardSelected.length > 0 && (
                <div className="rd-fwd-chips">
                  {forwardSelected.map((emp) => (
                    <span key={emp.id} className="rd-fwd-chip">
                      {emp.full_name}
                      <button
                        type="button"
                        onClick={() => toggleForwardEmployee(emp)}
                        aria-label={`Remove ${emp.full_name}`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="rd-emp-list">
                {(() => {
                  const q = forwardSearch.trim().toLowerCase();
                  const filtered = employees.filter((emp) => {
                    if (!q) return true;
                    return (
                      (emp.full_name || "").toLowerCase().includes(q) ||
                      (emp.email || "").toLowerCase().includes(q) ||
                      (emp.department || "").toLowerCase().includes(q) ||
                      (emp.designation || "").toLowerCase().includes(q)
                    );
                  });
                  if (filtered.length === 0) {
                    return (
                      <div className="rd-emp-empty">
                        No employees match "{forwardSearch}"
                      </div>
                    );
                  }
                  return filtered.map((emp) => {
                    const sel = forwardSelected.some((e) => e.id === emp.id);
                    return (
                      <div
                        key={emp.id}
                        className={`rd-emp-row${sel ? " rd-emp-row--sel" : ""}`}
                        onClick={() => toggleForwardEmployee(emp)}
                      >
                        {sel ? (
                          <CheckSquare size={16} color={C.indigo} />
                        ) : (
                          <Square size={16} color={C.inkMute} />
                        )}
                        <div className="rd-emp-avatar">
                          {(emp.full_name || "?")
                            .split(" ")
                            .map((p: string) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div className="rd-emp-name">{emp.full_name}</div>
                          <div className="rd-emp-sub">
                            {[emp.designation, emp.department]
                              .filter(Boolean)
                              .join(" · ") || emp.email}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              <div className="rd-field" style={{ marginTop: 14 }}>
                <label className="rd-label">Note (optional)</label>
                <textarea
                  className="rd-input"
                  rows={3}
                  placeholder="Add context for why you're sharing this candidate…"
                  value={forwardNote}
                  onChange={(e) => setForwardNote(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "inherit" }}
                />
              </div>
            </div>

            <div className="rd-dialog-acts">
              <button
                className="rd-btn rd-btn--ghost"
                onClick={closeForward}
                disabled={forwardSending}
              >
                Cancel
              </button>
              <button
                className="rd-btn rd-btn--primary"
                onClick={handleSendForward}
                disabled={forwardSending || forwardSelected.length === 0}
              >
                <Send size={14} />
                {forwardSending
                  ? "Sending…"
                  : `Send${forwardSelected.length ? ` to ${forwardSelected.length}` : ""}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {analyzeJDPrompt && (
        <div className="rd-dialog">
          <motion.div
            className="rd-dialog-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.18 }}
          >
            <div className="rd-dialog-ttl">Select a Requirement</div>
            <div className="rd-dialog-body">
              <p style={{ marginBottom: 14 }}>
                <strong>{analyzeJDPrompt.full_name}</strong> isn't linked to a
                job requirement yet, so there's no job description to score the
                resume against. Pick the requirement to analyze against — this
                will also assign the candidate to it.
              </p>
              <div className="rd-field">
                <label className="rd-label">Requirement</label>
                <select
                  className="rd-input"
                  value={analyzeJDChoice}
                  onChange={(e) => setAnalyzeJDChoice(e.target.value)}
                >
                  <option value="">Select requirement…</option>

                  {requirements
                    .filter(
                      (req: any) =>
                        String(req.status).trim().toUpperCase() === "OPEN",
                    )
                    .map((req: any) => (
                      <option key={req.id} value={req.id}>
                        {req.title || req.job_title || "Untitled requirement"}
                      </option>
                    ))}
                </select>
              </div>
              {requirements.length === 0 && (
                <p
                  style={{
                    marginTop: 10,
                    fontSize: 13,
                    color: C.inkMute,
                  }}
                >
                  No open requirements found. Create one first, then assign it
                  here.
                </p>
              )}
            </div>
            <div className="rd-dialog-acts">
              <button
                className="rd-btn rd-btn--ghost"
                onClick={() => {
                  setAnalyzeJDPrompt(null);
                  setAnalyzeJDChoice("");
                }}
                disabled={analyzeJDBusy}
              >
                Cancel
              </button>
              <button
                className="rd-btn rd-btn--solid-ai"
                onClick={confirmAnalyzeWithRequirement}
                disabled={analyzeJDBusy || !analyzeJDChoice}
              >
                {analyzeJDBusy ? "Analyzing…" : "Assign & Analyze"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showRename && (
        <div className="rd-overlay" onClick={() => setShowRename(false)}>
          <div
            className="rd-panel"
            style={{
              width: 420,
              height: "auto",
              top: 120,
              right: "calc(50% - 210px)",
              borderRadius: 16,
              bottom: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rd-panel-hd">
              <div>
                <div className="rd-panel-ttl">Rename candidate</div>
                <div className="rd-panel-sub">{selectedCandidate?.email}</div>
              </div>
              <button
                className="rd-panel-close"
                onClick={() => setShowRename(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="rd-panel-body">
              <label className="rd-label">Full name</label>
              <input
                className="rd-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                autoFocus
              />
              <button
                className="rd-btn rd-btn--solid-bl"
                style={{
                  width: "100%",
                  marginTop: 18,
                  justifyContent: "center",
                }}
                onClick={saveRename}
              >
                Save name
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDuplicateLOADialog}
        title="LOA Already Exists"
        body={
          <>
            An LOA has already been generated for{" "}
            <strong>{duplicateLOACandidate?.full_name}</strong>. Generate
            another?
          </>
        }
        confirmLabel="Yes, Generate"
        confirmClass="rd-btn--solid-em"
        onCancel={() => setShowDuplicateLOADialog(false)}
        onConfirm={async () => {
          setShowDuplicateLOADialog(false);
          setLoaCandidate(duplicateLOACandidate);
          await loadInternDataForLOA(duplicateLOACandidate);
          setShowLOAModal(true);
        }}
      />

      <ConfirmDialog
        open={showDuplicateNDADialog}
        title="NDA Already Exists"
        body={
          <>
            An NDA already exists for{" "}
            <strong>{duplicateNDACandidate?.full_name}</strong>. Generate
            another?
          </>
        }
        confirmLabel="Yes, Generate"
        confirmClass="rd-btn--solid-bl"
        onCancel={() => setShowDuplicateNDADialog(false)}
        onConfirm={() => {
          setShowDuplicateNDADialog(false);
          setNdaCandidate(duplicateNDACandidate);
          setShowNDAModal(true);
        }}
      />

      <ConfirmDialog
        open={showDuplicateLOCDialog}
        title="LOC Already Exists"
        body={
          <>
            A Letter of Confirmation already exists for{" "}
            <strong>{duplicateLOCCandidate?.full_name}</strong>. Generate
            another?
          </>
        }
        confirmLabel="Yes, Generate"
        confirmClass="rd-btn--solid-bl"
        onCancel={() => setShowDuplicateLOCDialog(false)}
        onConfirm={async () => {
          setShowDuplicateLOCDialog(false);
          await previewHiredDocument("LOC", duplicateLOCCandidate, true);
        }}
      />

      <ConfirmDialog
        open={showDuplicateLORDialog}
        title="LOR Already Exists"
        body={
          <>
            A Letter of Recommendation already exists for{" "}
            <strong>{duplicateLORCandidate?.full_name}</strong>. Generate
            another?
          </>
        }
        confirmLabel="Yes, Generate"
        confirmClass="rd-btn--solid-cy"
        onCancel={() => setShowDuplicateLORDialog(false)}
        onConfirm={async () => {
          setShowDuplicateLORDialog(false);
          await previewHiredDocument("LOR", duplicateLORCandidate, true);
        }}
      />

      <ConfirmDialog
        open={showDuplicateCertificateDialog}
        title="Certificate Already Exists"
        body={
          <>
            A certificate already exists for{" "}
            <strong>{duplicateCertificateCandidate?.full_name}</strong>.
            Generate another?
          </>
        }
        confirmLabel="Yes, Generate"
        confirmClass="rd-btn--solid-em"
        onCancel={() => setShowDuplicateCertificateDialog(false)}
        onConfirm={async () => {
          setShowDuplicateCertificateDialog(false);
          await previewHiredDocument(
            "CERTIFICATE",
            duplicateCertificateCandidate,
            true,
          );
        }}
      />
    </div>
  );
}
