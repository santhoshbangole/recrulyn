import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  Circle,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getDemoNotices, isDemoMode } from "../../modules/demo/seed";
import WorkspaceSettingsModal from "../../components/settings/WorkspaceSettingsModal";

function useRelativeClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  return now;
}

const TOKENS = {
  green: "#2F7D4A",
  greenDeep: "#1F5C36",
  live: "#3FAE6E",
  linen: "#FFFFFF",
  ink: "#111827",
  body: "#4B5563",
  border: "#E8EDF2",
  danger: "#C24F4F",
  dangerBg: "#FBEDED",
};

export default function Topbar() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const now = useRelativeClock();
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const demo = isDemoMode();
  const notices = getDemoNotices();

  const timeLabel = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((x: string) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
        setNoticeOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function runSearch(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/app/candidates?q=${encodeURIComponent(q)}`);
  }

  return (
    <header
      className="relative z-20 flex h-[3.5rem] shrink-0 items-center justify-between gap-4 px-6"
      style={{
        background: TOKENS.linen,
        borderBottom: `1px solid ${TOKENS.border}`,
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
          style={{
            borderColor: TOKENS.border,
            background: "#F6F8FA",
            color: TOKENS.body,
          }}
        >
          <span className="relative flex h-[7px] w-[7px] items-center justify-center">
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ background: TOKENS.live }}
              animate={{ scale: [1, 2.2, 1], opacity: [0.55, 0, 0.55] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <Circle
              size={7}
              className="relative"
              style={{ fill: TOKENS.live, color: TOKENS.live }}
              strokeWidth={0}
            />
          </span>
          {demo ? "Demo workspace" : "Live HR"}
        </span>

        <span
          className="hidden text-[12px] font-semibold tabular-nums sm:inline"
          style={{ color: TOKENS.body }}
        >
          {timeLabel}
        </span>
      </div>

      <form onSubmit={runSearch} className="hidden max-w-md flex-1 md:block">
        <label className="relative block">
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: TOKENS.body,
            }}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search talent, roles, or documents"
            style={{
              width: "100%",
              height: 38,
              borderRadius: 999,
              border: `1px solid ${TOKENS.border}`,
              padding: "0 14px 0 34px",
              fontSize: 13,
              background: "#F6F8FA",
              color: TOKENS.ink,
            }}
          />
        </label>
      </form>

      <div ref={menuRef} className="flex items-center gap-2">
        <div className="relative">
          <motion.button
            type="button"
            aria-label="Notifications"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setNoticeOpen((v) => !v);
              setMenuOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#EEF7F1]"
            style={{ color: TOKENS.body }}
          >
            <Bell size={18} />
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 7,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: TOKENS.green,
              }}
            />
          </motion.button>
          <AnimatePresence>
            {noticeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border bg-white shadow-2xl"
                style={{ borderColor: TOKENS.border }}
              >
                <div className="px-4 py-3 text-sm font-semibold" style={{ color: TOKENS.ink }}>
                  HR alerts
                </div>
                {notices.map((item: { id: string; title: string; time: string }) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setNoticeOpen(false);
                      navigate("/app/approvals");
                    }}
                    className="block w-full border-t px-4 py-3 text-left"
                    style={{ borderColor: TOKENS.border }}
                  >
                    <p className="text-[13px] font-medium" style={{ color: TOKENS.ink }}>
                      {item.title}
                    </p>
                    <p className="mt-1 text-[11px]" style={{ color: TOKENS.body }}>
                      {item.time}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mx-1 h-6 w-px" style={{ background: TOKENS.border }} />

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((open) => !open);
              setNoticeOpen(false);
            }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F6F8FA]"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-[12.5px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${TOKENS.green}, ${TOKENS.greenDeep})`,
                boxShadow: "0 8px 18px -6px rgba(31,92,54,0.4)",
              }}
            >
              {initials}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-tight" style={{ color: TOKENS.ink }}>
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs font-medium leading-tight" style={{ color: TOKENS.body }}>
                {profile?.title || profile?.role_name || "Member"}
              </p>
            </div>
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                role="menu"
                className="absolute right-0 z-50 mt-3 w-64 overflow-hidden rounded-2xl border bg-white shadow-2xl"
                style={{ borderColor: TOKENS.border }}
              >
                <div className="p-4" style={{ borderBottom: `1px solid ${TOKENS.border}` }}>
                  <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
                    {profile?.full_name || "User"}
                  </p>
                  <p className="mt-0.5 truncate text-xs" style={{ color: TOKENS.body }}>
                    {profile?.email}
                  </p>
                  <span
                    className="mt-2.5 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{
                      background: "rgba(47,125,74,0.12)",
                      color: TOKENS.greenDeep,
                    }}
                  >
                    {profile?.role_name || "Member"}
                  </span>
                </div>

                <div className="p-1.5">
                  <button
                    role="menuitem"
                    onClick={() => {
                      navigate("/app/settings");
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#EEF7F1]"
                    style={{ color: TOKENS.ink }}
                  >
                    <User size={16} style={{ color: TOKENS.body }} />
                    My HR profile
                  </button>

                  <button
                    role="menuitem"
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setMenuOpen(false);
                      setNoticeOpen(false);
                      setWorkspaceOpen(true);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#EEF7F1]"
                    style={{ color: TOKENS.ink }}
                  >
                    <Settings size={16} style={{ color: TOKENS.body }} />
                    Workspace settings
                  </button>
                </div>

                <div className="p-1.5" style={{ borderTop: `1px solid ${TOKENS.border}` }}>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
                    style={{ color: TOKENS.danger }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = TOKENS.dangerBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <WorkspaceSettingsModal open={workspaceOpen} onClose={() => setWorkspaceOpen(false)} />
    </header>
  );
}
