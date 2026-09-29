import { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ── Phosphor-style rich icons (inline SVG components) ──────────────────────
const Icon = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor">
    <path d={d} />
  </svg>
);

const ICONS = {
  grid: "M216,48H40a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V56A8,8,0,0,0,216,48ZM112,192H48V128h64Zm0-80H48V64h64Zm96,80H128V128h80Zm0-80H128V64h80Z",

  users:
    "M117.25,157.92a60,60,0,1,0-66.5,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.14,98.7a8,8,0,0,1-11.07-2.33A79.83,79.83,0,0,0,172,168a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.14,206.7Z",

  brain:
    "M248,132a88.1,88.1,0,0,0-88-88,87.44,87.44,0,0,0-28,4.6A52,52,0,0,0,76,96a51.51,51.51,0,0,0,6.6,25.43A72.06,72.06,0,0,0,16,192a8,8,0,0,0,16,0,56.06,56.06,0,0,1,56-56,8,8,0,0,0,0-16,40,40,0,1,1,40,40,8,8,0,0,0,0,16,56.06,56.06,0,0,1,56,56,8,8,0,0,0,16,0A72,72,0,0,0,152,163.38,88.12,88.12,0,0,0,248,132Z",

  calendar:
    "M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V80H208Zm0-144H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z",

  file: "M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Zm-32-80a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,136Zm0,32a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,168Z",

  check:
    "M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z",

  mail: "M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.19V181.81Z",

  bot: "M208,136H180V116a52.06,52.06,0,0,0-48-51.8V48h20a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16h20V64.2A52.06,52.06,0,0,0,76,116v20H48a8,8,0,0,0-8,8v32a8,8,0,0,0,8,8H76v12a16,16,0,0,0,16,16H164a16,16,0,0,0,16-16V184h28a8,8,0,0,0,8-8V144A8,8,0,0,0,208,136Zm-8,32H172a8,8,0,0,0-8,8v20H92V176a8,8,0,0,0-8-8H56V152H84a8,8,0,0,0,8-8V116a36,36,0,0,1,72,0v28a8,8,0,0,0,8,8h28ZM112,132a12,12,0,1,1,12,12A12,12,0,0,1,112,132Zm32,0a12,12,0,1,1,12,12A12,12,0,0,1,144,132Z",

  briefcase:
    "M216,72H180V60a20,20,0,0,0-20-20H96A20,20,0,0,0,76,60V72H40A16,16,0,0,0,24,88V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72ZM96,56h64a4,4,0,0,1,4,4V72H92V60A4,4,0,0,1,96,56ZM216,192H40V88H216V192Zm-80-64H120a8,8,0,0,0,0,16h16a8,8,0,0,0,0-16Z",

  clipboard:
    "M184,56H152V48a24,24,0,0,0-48,0v8H72A16,16,0,0,0,56,72V216a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V72A16,16,0,0,0,184,56ZM120,48a8,8,0,0,1,16,0v16H120Zm-8,32h48v8H112Zm72,136H72V72H104v8a8,8,0,0,0,8,8h32a8,8,0,0,0,8-8V72h32ZM104,136h48a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Zm0,32h48a8,8,0,0,0,0-16H104a8,8,0,0,0,0,16Z",

  usercheck:
    "M130.84,175.9l-19.66,19.66a8,8,0,0,1-11.32,0L84,179.7a8,8,0,0,1,11.32-11.32l10.2,10.2,14-14a8,8,0,1,1,11.32,11.32ZM232,136a56,56,0,1,1-110.6-13.09,88.07,88.07,0,0,1-26.5,3.09C64.68,126,40,111.3,40,88V56a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8V88c0,7.61-3,14.79-8.37,21.13A55.87,55.87,0,0,1,232,136ZM64,56V88c0,9.46,17.39,22,30.9,22S176,97.46,176,88V56Zm0,64.63V136a56.07,56.07,0,0,1,43.27-54.73,56,56,0,0,0-43.27,39.36Z",

  settings:
    "M232.49,93.38l-12.07-7A87.59,87.59,0,0,0,221,80c.32-2.23.66-4.46.89-6.74l0-.27a16,16,0,0,0-14.19-17.4l-13.92-1.49a88.27,88.27,0,0,0-8.61-14.91L193,26.41a16,16,0,0,0-21.19-5.64h0l-12.08,7a87.16,87.16,0,0,0-31.71,0l-12.07-7A16,16,0,0,0,94.78,26.29L87.82,39.14a88.27,88.27,0,0,0-8.61,14.91L65.29,55.54A16,16,0,0,0,51.1,73l0,.26C51.32,75.5,51.66,77.73,52,80a87.59,87.59,0,0,0,.58,6.41l-12.07,7a16,16,0,0,0-5.76,21.87l7,12.07A88.37,88.37,0,0,0,36.49,139c-1.43.63-2.87,1.24-4.27,1.94A16.06,16.06,0,0,0,27.7,163l7,12.08a16,16,0,0,0,21.87,5.75l12.07-7a87.6,87.6,0,0,0,8.62,14.92l-1.49,13.92a16,16,0,0,0,14.19,17.4l13.92,1.49A88.25,88.25,0,0,0,118.78,216L128,232l-34.25-19.78A88,88,0,1,1,128,40a87.09,87.09,0,0,1,44,11.85ZM128,184a56,56,0,1,0-56-56A56.06,56.06,0,0,0,128,184Zm0-96a40,40,0,1,1-40,40A40,40,0,0,1,128,88Z",

  shield:
    "M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40ZM48,56H208V168H48ZM48,200V184H208v16Z",

  menu: "M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128ZM40,72H216a8,8,0,0,0,0-16H40a8,8,0,0,0,0,16ZM216,184H40a8,8,0,0,0,0,16H216a8,8,0,0,0,0-16Z",

  close:
    "M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z",

  sparkles:
    "M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm8-136V56a8,8,0,0,0-16,0V80H96a8,8,0,0,0,0,16h24v24a8,8,0,0,0,16,0V96h24a8,8,0,0,0,0-16Z",
};

// ── Design tokens ──────────────────────────────────────────────────────────
const T = {
  sidebarBg: "#FFFFFF",
  contentBg: "#FAFBFC",
  border: "#E8EDF2",
  primary: "#2F7D4A",
  primaryDark: "#1F5C36",
  hoverBg: "#F6F8FA",
  activeBg: "#EEF7F1",
  ink: "#111827",
  body: "#374151",
  muted: "#6B7280",
  iconDefault: "#6B7280",
  iconActive: "#2F7D4A",
  white: "#FFFFFF",
};

type NavIconKey = keyof typeof ICONS;

type NavItemConfig = {
  to: string;
  label: string;
  iconKey: NavIconKey;
  end?: boolean;
};

// ── Navigation ─────────────────────────────────────────────────────────────
const ADMIN_NAV: NavItemConfig[] = [
  { to: "/app", label: "Dashboard", iconKey: "grid", end: true },
  { to: "/app/users", label: "User Management", iconKey: "users" },
  { to: "/app/roles", label: "Role Management", iconKey: "shield" },
];

const HR_NAV: NavItemConfig[] = [
  { to: "/app", label: "Home", iconKey: "grid", end: true },
  { to: "/app/candidates", label: "Talent pipeline", iconKey: "users" },
  { to: "/app/requirements", label: "Open roles", iconKey: "briefcase" },
  { to: "/app/ai-recruiter", label: "AI recruiter", iconKey: "bot" },
  {
    to: "/app/resume-intelligence",
    label: "Resume AI",
    iconKey: "sparkles",
  },
  { to: "/app/email-automation", label: "HR inbox", iconKey: "mail" },
  { to: "/app/documents", label: "People docs", iconKey: "file" },
  {
    to: "/app/document-automation",
    label: "Issue letters",
    iconKey: "clipboard",
  },
  { to: "/app/approvals", label: "Approvals", iconKey: "check" },
  {
    to: "/app/leave-management",
    label: "Leave desk",
    iconKey: "calendar",
  },
  {
    to: "/app/reports",
    label: "People analytics",
    iconKey: "clipboard",
  },
];

const EMPLOYEE_NAV: NavItemConfig[] = [
  { to: "/app", label: "Workspace", iconKey: "grid", end: true },
  { to: "/app/candidates", label: "Candidates", iconKey: "users" },
  {
    to: "/app/resume-intelligence",
    label: "AI Apps",
    iconKey: "sparkles",
  },
  {
    to: "/app/employee-leave",
    label: "My Leave",
    iconKey: "calendar",
  },
];

const MANAGEMENT_NAV: NavItemConfig[] = [
  { to: "/app", label: "Workspace", iconKey: "grid", end: true },
  { to: "/app/candidates", label: "Candidates", iconKey: "users" },
  {
    to: "/app/resume-intelligence",
    label: "AI Apps",
    iconKey: "sparkles",
  },
  {
    to: "/app/leave-management",
    label: "Leave Management",
    iconKey: "calendar",
  },
  { to: "/app/approvals", label: "Approvals", iconKey: "check" },
  { to: "/app/reports", label: "Analytics", iconKey: "clipboard" },
];

const COLLAPSED_WIDTH = 64;
const EXPANDED_WIDTH = 236;

// ── Component ──────────────────────────────────────────────────────────────
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAuth();

  const navItems: NavItemConfig[] =
    role === "ADMIN"
      ? ADMIN_NAV
      : role === "HR"
        ? HR_NAV
        : role === "EMPLOYEE"
          ? EMPLOYEE_NAV
          : MANAGEMENT_NAV;

  const showSettings = true;
  const width = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  // Open sidebar whenever the mouse reaches the extreme left edge.
  useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    const x = e.clientX;

    // Open when cursor reaches the extreme left edge
    if (x <= 18) {
      setCollapsed(false);
      return;
    }

    // Collapse when cursor moves outside the expanded sidebar
    if (!collapsed && x > EXPANDED_WIDTH + 20) {
      setCollapsed(true);
    }
  };

  window.addEventListener("mousemove", handleMouseMove);

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
  };
}, [collapsed]);

  return (
    <>
      {/* Invisible hover zone at extreme left edge */}
      <div
        onMouseEnter={() => setCollapsed(false)}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 22,
          height: "100vh",
          zIndex: 100,
          background: "transparent",
        }}
      />

      {/* Inter font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .sidebar-root * {
          font-family: 'Inter', system-ui, sans-serif;
        }

        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }

        .sidebar-nav {
          scrollbar-width: none;
        }
      `}</style>

      <motion.aside
        className="sidebar-root relative hidden h-screen shrink-0 flex-col overflow-hidden md:flex"
        initial={false}
        animate={{
          width,
        }}
        transition={{
          duration: 0.32,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          background: T.sidebarBg,
          borderRight: `1px solid ${T.border}`,
          boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
          zIndex: 30,
        }}
      >
        {/* ── Header ── */}
        <div
          className="relative z-10 flex items-center gap-2.5"
          style={{
            height: 64,
            paddingLeft: collapsed ? 14 : 18,
            paddingRight: collapsed ? 14 : 12,
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0a0a0a",
              overflow: "hidden",
              cursor: "pointer",
            }}
            onClick={() => {
              window.location.href = "/app";
            }}
            title="Home"
          >
            <img
              src="/Logo-Monogram.png"
              alt="RECRULYN"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Wordmark */}
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{
                  opacity: 0,
                  width: 0,
                }}
                animate={{
                  opacity: 1,
                  width: "auto",
                }}
                exit={{
                  opacity: 0,
                  width: 0,
                }}
                transition={{
                  duration: 0.18,
                }}
                style={{
                  overflow: "hidden",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div className="flex items-center gap-2">
                  <p
                    style={{
                      whiteSpace: "nowrap",
                      fontSize: 20,
                      fontWeight: 700,
                      color: T.ink,
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    RECRULYN
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapse toggle */}
          <motion.button
            onClick={() => setCollapsed((c) => !c)}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              marginLeft: "auto",
              flexShrink: 0,
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: T.white,
              color: T.muted,
              border: `1px solid ${T.border}`,
              boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                T.hoverBg;
              (e.currentTarget as HTMLButtonElement).style.color =
                T.primaryDark;
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 4px 10px rgba(15,23,42,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = T.white;
              (e.currentTarget as HTMLButtonElement).style.color = T.muted;
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 1px 3px rgba(15,23,42,0.04)";
            }}
          >
            <motion.span
              animate={{
                rotate: collapsed ? 180 : 0,
              }}
              transition={{
                duration: 0.28,
                ease: "easeInOut",
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon d={ICONS.menu} size={14} />
            </motion.span>
          </motion.button>
        </div>

        {/* ── Nav ── */}
        <nav
          className="sidebar-nav relative z-10 flex-1 overflow-y-auto"
          style={{
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 18,
            paddingBottom: 16,
          }}
        >
          <ul
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
            }}
          >
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} collapsed={collapsed} />
            ))}
          </ul>
        </nav>

        {/* ── Settings footer ── */}
        {showSettings && (
          <div
            className="relative z-10"
            style={{
              padding: "12px 10px",
              borderTop: `1px solid ${T.border}`,
            }}
          >
            <SettingsItem collapsed={collapsed} />
          </div>
        )}
      </motion.aside>
    </>
  );
}

// ── Shared tooltip for collapsed state ─────────────────────────────────────
function CollapsedTooltip({ label }: { label: string }) {
  return (
    <span
      className="group-hover:opacity-100"
      style={{
        pointerEvents: "none",
        position: "absolute",
        left: "calc(100% + 12px)",
        top: "50%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 13,
        fontWeight: 500,
        background: T.ink,
        color: T.white,
        boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
        opacity: 0,
        transition: "opacity 0.15s",
        zIndex: 50,
      }}
    >
      {label}
    </span>
  );
}

// ── NavItem ────────────────────────────────────────────────────────────────
function NavItem({
  item,
  collapsed,
}: {
  item: NavItemConfig;
  collapsed: boolean;
}) {
  return (
    <li style={{ position: "relative" }} className="group">
      <NavLink
        to={item.to}
        end={item.end ?? false}
        style={{ textDecoration: "none" }}
      >
        {({ isActive }) => (
          <motion.div
            whileHover={{ y: -1 }}
            transition={{
              duration: 0.18,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 52,
              borderRadius: 16,
              paddingLeft: collapsed ? 0 : 14,
              paddingRight: collapsed ? 0 : 12,
              justifyContent: collapsed ? "center" : "flex-start",
              cursor: "pointer",
              transition: "background 0.2s ease, box-shadow 0.2s ease",
              background: isActive ? T.activeBg : "transparent",
              boxShadow: isActive ? "0 4px 10px rgba(47,125,74,0.08)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLDivElement).style.background =
                  T.hoverBg;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLDivElement).style.background =
                  "transparent";
              }
            }}
          >
            {isActive && (
              <motion.span
                layoutId="active-accent-bar"
                transition={{
                  type: "spring",
                  stiffness: 440,
                  damping: 36,
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3.5,
                  borderRadius: 4,
                  background: T.primary,
                  zIndex: 1,
                }}
              />
            )}

            <motion.span
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              style={{
                position: "relative",
                zIndex: 1,
                flexShrink: 0,
                color: isActive ? T.iconActive : T.iconDefault,
                display: "flex",
                alignItems: "center",
                transition: "color 0.2s ease",
              }}
            >
              <Icon d={ICONS[item.iconKey]} size={21} />
            </motion.span>

            {!collapsed && (
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: "20px",
                  color: isActive ? T.primaryDark : T.ink,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  letterSpacing: "-0.005em",
                }}
              >
                {item.label}
              </span>
            )}
          </motion.div>
        )}
      </NavLink>

      {collapsed && <CollapsedTooltip label={item.label} />}
    </li>
  );
}

// ── SettingsItem ───────────────────────────────────────────────────────────
function SettingsItem({ collapsed }: { collapsed: boolean }) {
  return (
    <div style={{ position: "relative" }} className="group">
      <NavLink to="/app/settings" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <motion.div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 12,
              height: 52,
              borderRadius: 16,
              paddingLeft: collapsed ? 0 : 14,
              paddingRight: collapsed ? 0 : 12,
              justifyContent: collapsed ? "center" : "flex-start",
              cursor: "pointer",
              background: isActive ? T.activeBg : "transparent",
              boxShadow: isActive ? "0 4px 10px rgba(47,125,74,0.08)" : "none",
            }}
            whileHover={{
              background: isActive ? T.activeBg : T.hoverBg,
              y: -1,
            }}
            transition={{
              duration: 0.18,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {isActive && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 3.5,
                  borderRadius: 4,
                  background: T.primary,
                }}
              />
            )}

            <motion.span
              whileHover={{ rotate: 90 }}
              transition={{
                duration: 0.28,
                ease: "easeInOut",
              }}
              style={{
                color: isActive ? T.iconActive : T.iconDefault,
                flexShrink: 0,
                display: "flex",
                position: "relative",
                zIndex: 1,
              }}
            >
              <Icon d={ICONS.settings} size={21} />
            </motion.span>

            {!collapsed && (
              <span
                style={{
                  fontSize: 15,
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: "20px",
                  color: isActive ? T.primaryDark : T.ink,
                  letterSpacing: "-0.005em",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                Settings
              </span>
            )}
          </motion.div>
        )}
      </NavLink>

      {collapsed && <CollapsedTooltip label="Settings" />}
    </div>
  );
}
