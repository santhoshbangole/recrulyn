/**
 * RECRULYN — Shared Design Tokens
 * ============================================================
 * Single source of truth for color, radius, shadow, and motion
 * values used across BOTH the public marketing site and the
 * private AI workspace.
 *
 * This does not replace any existing local token objects yet
 * (Sidebar.tsx, Topbar.tsx, DashboardLayout.tsx each still have
 * their own for now) — it's introduced first so every new file
 * we build from here on imports from one place instead of
 * inventing a fourth local palette. Wiring the existing three
 * files to import from here happens later, as its own explicit
 * step, so we don't silently reskin working screens.
 *
 * Usage:
 *   import { tokens } from "@/styles/tokens";
 *   style={{ background: tokens.color.surface }}
 * ============================================================
 */

export const tokens = {
  color: {
    // Brand / primary action
    brand: "#4B3FE4", // electric indigo — primary CTA, active states
    brandHover: "#5A4FF0",
    brandDeep: "#3529B8",

    // Neutrals / surfaces
    bg: "#FAFAF9", // page background
    surface: "#FFFFFF", // cards, panels, sidebar
    surfaceMuted: "#F6F5F2", // subtle recessed surface
    border: "#E7E5E1",
    borderStrong: "#D8D5CF",

    // Text
    ink: "#15131F", // headings
    body: "#4A4858", // paragraph text
    muted: "#8B899B", // secondary / placeholder text
    onBrand: "#FFFFFF", // text on top of brand-colored surfaces

    // Accent family (ambient gradients, badges, illustrations)
    accent: {
      iris: "#6E62E5",
      quartz: "#F3C6CE",
      sage: "#AEDFC5",
      sand: "#F6DDB0",
      linen: "#FBFAF6",
    },

    // Semantic
    success: "#1DAD6F",
    successBg: "#E7F7EF",
    warning: "#D69A20",
    warningBg: "#FBF1DA",
    danger: "#C24F4F",
    dangerBg: "#FBEAEA",
    info: "#3F7BE0",
    infoBg: "#EAF1FD",

    // Overlay / glass
    glass: "rgba(255,255,255,0.72)",
    scrim: "rgba(21,19,31,0.48)",
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 999,
  },

  shadow: {
    xs: "0 1px 2px rgba(21,19,31,0.04)",
    sm: "0 2px 6px rgba(21,19,31,0.06)",
    md: "0 6px 18px rgba(21,19,31,0.08)",
    lg: "0 16px 40px rgba(21,19,31,0.12)",
    glow: "0 0 0 1px rgba(75,63,228,0.12), 0 8px 24px rgba(75,63,228,0.16)",
  },

  motion: {
    fast: 0.18,
    base: 0.28,
    slow: 0.45,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    easeOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },

  font: {
    family: "'Inter', system-ui, -apple-system, sans-serif",
    importUrl:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
  },

  layout: {
    sidebarExpanded: 236,
    sidebarCollapsed: 64,
    topbarHeight: 64,
    contentMaxWidth: 1320,
  },
} as const;

export type Tokens = typeof tokens;