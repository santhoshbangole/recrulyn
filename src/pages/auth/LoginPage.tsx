import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Circle,
  ShieldCheck,
} from "lucide-react";
import { authService } from "../../modules/auth/services/auth.service";
import { useNotification } from "../../components/notification/useNotification";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "../../modules/auth/services/demo-auth";
// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  stone:    "#F8F6F1",     // warm ivory — left panel base
  night:    "#12102A",     // deep indigo-night — primary text
  indigo:   "#4B3FE4",     // electric indigo — primary action
  indigoHi: "#6357F0",     // lighter indigo for hovers
  lavender: "#EAE7FA",     // lavender mist — input bg / badges
  ink:      "#1E1B3A",     // near-black for headings
  slate:    "#5A5B78",     // body prose
  ghost:    "#9898B0",     // placeholders
  border:   "#DDDAF2",     // subtle borders
  white:    "#FFFFFF",
  success:  "#1DAD6F",
};

function AmbientLeft() {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 560 760"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* large circle top-right */}
      <circle cx="480" cy="-40" r="260" fill="none" stroke="#D8D2F0" strokeWidth="1.5" opacity="0.55"/>
      <circle cx="480" cy="-40" r="190" fill="none" stroke="#C9C1EC" strokeWidth="1" opacity="0.4"/>
      {/* arc bottom-left */}
      <circle cx="-60" cy="800" r="320" fill="none" stroke="#D8D2F0" strokeWidth="1.2" opacity="0.45"/>
      {/* diagonal rule */}
      <line x1="0" y1="540" x2="560" y2="220" stroke="#D0CBEC" strokeWidth="0.8" opacity="0.5"/>
      {/* small dots */}
      <circle cx="60" cy="90" r="2.5" fill="#C2BBE8" opacity="0.7"/>
      <circle cx="100" cy="110" r="1.8" fill="#C2BBE8" opacity="0.5"/>
      <circle cx="80" cy="135" r="1.4" fill="#C2BBE8" opacity="0.4"/>
      <circle cx="45" cy="125" r="1.6" fill="#C2BBE8" opacity="0.45"/>
      {/* subtle indigo smear */}
      <ellipse cx="420" cy="680" rx="200" ry="120" fill="#5246E5" opacity="0.04"/>
    </svg>
  );
}

// ─── Loading steps ────────────────────────────────────────────────────────────
const STEPS = [
  "Authenticating",
  "Loading workspace",
  "Fetching permissions",
  "Preparing dashboard",
];

// ─── Inline keyframes injected once ──────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rxa-root {
    font-family: 'Inter', system-ui, sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: stretch;
    background: ${T.stone};
    overflow: hidden;
    position: relative;
  }

  /* ── Left panel ── */
  .rxa-left {
    flex: 0 0 56%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 48px 56px 44px;
    background: ${T.stone};
    position: relative;
    overflow: hidden;
  }

  /* Watermark monogram */
  .rxa-monogram {
    position: absolute;
    right: -80px;
    bottom: -80px;
    width: 520px;
    height: 520px;
    object-fit: cover;
    opacity: 0.06;
    pointer-events: none;
    user-select: none;
  }

  /* ── Right panel ── */
  .rxa-right {
    flex: 1;
    background: ${T.white};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 52px;
    position: relative;
    overflow: hidden;
  }

  .rxa-right::before {
    content: '';
    position: absolute;
    top: -120px;
    right: -120px;
    width: 360px;
    height: 360px;
    border-radius: 50%;
    background: radial-gradient(circle, #EAE7FA 0%, transparent 70%);
    pointer-events: none;
  }
  .rxa-right::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -80px;
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: radial-gradient(circle, #EAE7FA 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── Logo ── */
  .rxa-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .rxa-logo-mark {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    overflow: hidden;
    flex-shrink: 0;
    background: #0a0a0a;
  }
  .rxa-logo-mark img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .rxa-logo-name {
    font-size: 15px;
    font-weight: 700;
    color: ${T.night};
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .rxa-logo-sub {
    font-size: 11px;
    font-weight: 500;
    color: ${T.slate};
    letter-spacing: 0.02em;
    margin-top: 1px;
  }

  /* ── Hero text ── */
  .rxa-hero {
    max-width: 440px;
  }
  .rxa-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 12px;
    font-weight: 600;
    color: ${T.indigo};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 22px;
  }
  .rxa-eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${T.indigo};
  }
  .rxa-h1 {
    font-family: 'DM Serif Display', Georgia, serif;
    font-size: 54px;
    line-height: 1.10;
    color: ${T.ink};
    font-weight: 400;
    letter-spacing: -0.02em;
  }
  .rxa-h1 em {
    font-style: italic;
    color: ${T.indigo};
  }
  .rxa-body {
    margin-top: 20px;
    font-size: 15.5px;
    line-height: 1.68;
    color: ${T.slate};
    max-width: 380px;
  }

  /* ── Pillars ── */
  .rxa-pillars {
    display: flex;
    gap: 28px;
    margin-top: 48px;
  }
  .rxa-pillar {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .rxa-pillar-num {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    color: ${T.indigo};
    line-height: 1;
  }
  .rxa-pillar-label {
    font-size: 12px;
    font-weight: 600;
    color: ${T.ink};
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .rxa-pillar-sep {
    width: 1px;
    background: ${T.border};
    align-self: stretch;
    margin: 0 4px;
  }

  /* ── Footer caption ── */
  .rxa-caption {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: ${T.ghost};
  }
  .rxa-caption-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${T.ghost};
  }

  /* ── Form side ── */
  .rxa-form-wrap {
    width: 100%;
    max-width: 360px;
    position: relative;
    z-index: 1;
  }

  .rxa-form-title {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    line-height: 1.15;
    color: ${T.ink};
    font-weight: 400;
    letter-spacing: -0.01em;
    margin-bottom: 6px;
  }
  .rxa-form-sub {
    font-size: 14px;
    color: ${T.slate};
    margin-bottom: 30px;
  }

  /* ── Input ── */
  .rxa-field {
    margin-bottom: 16px;
  }
  .rxa-label {
    display: block;
    font-size: 12.5px;
    font-weight: 600;
    color: ${T.ink};
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 7px;
  }
  .rxa-input-wrap {
    position: relative;
  }
  .rxa-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    color: ${T.ghost};
    display: flex;
    align-items: center;
  }
  .rxa-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    font-size: 14.5px;
    font-family: 'Inter', sans-serif;
    color: ${T.ink};
    background: ${T.lavender};
    border: 1.5px solid transparent;
    border-radius: 10px;
    outline: none;
    transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
    caret-color: ${T.indigo};
  }
  .rxa-input::placeholder { color: ${T.ghost}; }
  .rxa-input:focus {
    border-color: ${T.indigo};
    background: ${T.white};
    box-shadow: 0 0 0 4px rgba(75, 63, 228, 0.10);
  }
  .rxa-input-action {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: ${T.ghost};
    display: flex;
    transition: color 0.15s;
  }
  .rxa-input-action:hover { color: ${T.slate}; }

  /* ── Primary button ── */
  .rxa-btn-primary {
    width: 100%;
    padding: 14px 20px;
    background: ${T.night};
    color: ${T.white};
    border: none;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    letter-spacing: 0.01em;
    transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
    box-shadow: 0 4px 16px rgba(18,16,42,0.18);
    margin-top: 22px;
    position: relative;
    overflow: hidden;
  }
  .rxa-btn-primary:hover {
    background: ${T.indigo};
    box-shadow: 0 6px 24px rgba(75,63,228,0.30);
    transform: translateY(-1px);
  }
  .rxa-btn-primary:active { transform: translateY(0px); }

  /* ── Divider ── */
  .rxa-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
  }
  .rxa-divider-line {
    flex: 1;
    height: 1px;
    background: ${T.border};
  }
  .rxa-divider-text {
    font-size: 12px;
    color: ${T.ghost};
    font-weight: 500;
  }

  /* ── Social buttons ── */
  .rxa-social-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 6px;
  }
  .rxa-btn-social {
    padding: 11px 12px;
    background: ${T.white};
    border: 1.5px solid ${T.border};
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: ${T.ink};
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  }
  .rxa-btn-social:hover {
    background: ${T.lavender};
    border-color: #C5BFEF;
    box-shadow: 0 2px 10px rgba(75,63,228,0.09);
  }

  /* ── SSO link ── */
  .rxa-sso {
    text-align: center;
    margin-top: 14px;
    font-size: 13px;
    color: ${T.slate};
  }
  .rxa-sso a {
    color: ${T.indigo};
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
  .rxa-sso a:hover { text-decoration: underline; }

  /* ── Security badge ── */
  .rxa-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    color: ${T.success};
    font-weight: 600;
    margin-bottom: 26px;
  }

  /* ── Loading state ── */
  .rxa-loading-wrap {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 360px;
    position: relative;
    z-index: 1;
  }
  .rxa-loading-title {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: ${T.ink};
    font-weight: 400;
    margin-bottom: 6px;
  }
  .rxa-loading-sub {
    font-size: 14px;
    color: ${T.slate};
    margin-bottom: 30px;
  }
  .rxa-steps {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 28px;
  }
  .rxa-step {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 9px;
    border: 1.5px solid transparent;
    transition: background 0.3s, border-color 0.3s;
  }
  .rxa-step--done {
    background: #EAF6F0;
    border-color: #B9E8D1;
  }
  .rxa-step--waiting {
    background: ${T.lavender};
    border-color: ${T.border};
  }
  .rxa-step-label {
    font-size: 13.5px;
    font-weight: 500;
    color: ${T.ink};
  }
  .rxa-step-status {
    margin-left: auto;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .rxa-step-status--done { color: ${T.success}; }
  .rxa-step-status--waiting { color: ${T.ghost}; }
  .rxa-progress-bar {
    height: 3px;
    border-radius: 20px;
    background: ${T.lavender};
    overflow: hidden;
  }
  .rxa-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, ${T.indigo} 0%, #8579F3 100%);
    border-radius: 20px;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  .rxa-progress-label {
    margin-top: 8px;
    font-size: 12px;
    color: ${T.ghost};
    text-align: right;
    font-weight: 500;
  }

  /* ── Slide transitions ── */
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideOutLeft {
    from { opacity: 1; transform: translateX(0); }
    to   { opacity: 0; transform: translateX(-40px); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rxa-anim-in  { animation: slideInRight 0.45s cubic-bezier(0.22,1,0.36,1) forwards; }
  .rxa-anim-out { animation: slideOutLeft  0.35s cubic-bezier(0.4,0,1,1) forwards; }

  .rxa-fadeup { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  .rxa-fadeup-1 { animation-delay: 0.05s; }
  .rxa-fadeup-2 { animation-delay: 0.13s; }
  .rxa-fadeup-3 { animation-delay: 0.21s; }
  .rxa-fadeup-4 { animation-delay: 0.30s; }
  .rxa-fadeup-5 { animation-delay: 0.38s; }

  /* ── Vertical seam ── */
  .rxa-seam {
    width: 1px;
    background: linear-gradient(to bottom, transparent 0%, ${T.border} 20%, ${T.border} 80%, transparent 100%);
    flex-shrink: 0;
  }

  @media (max-width: 960px) {
    .rxa-left { display: none; }
    .rxa-seam { display: none; }
    .rxa-right { padding: 40px 28px; }
  }
`;

// ─── Main component ───────────────────────────────────────────────────────────
const HR_DEMO = DEMO_ACCOUNTS[0];

export default function LoginPage() {
  const [email, setEmail]           = useState(HR_DEMO.email);
  const [password, setPassword]     = useState(HR_DEMO.password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn]   = useState(false);
  const [loadingStep, setLoadingStep]   = useState(0);
  const [view, setView]             = useState("login"); // "login" | "loading"
  const [mounted, setMounted]       = useState(false);
const notify = useNotification();
  useEffect(() => {
    // inject CSS
    const id = "rxa-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
    requestAnimationFrame(() => setMounted(true));
    return () => {};
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) {
      notify.error("Login Failed", "Email and password are required.");
      return;
    }

    setIsSigningIn(true);
    try {
      const { error } = await authService.signInOrCreate(
        email.trim(),
        password
      );

      if (error) {
        setIsSigningIn(false);
        notify.error(
          "Login Failed",
          error.message ||
            "Unable to sign in. Check credentials or Supabase connectivity."
        );
        return;
      }

      setView("loading");
      for (let i = 0; i < STEPS.length; i++) {
        setLoadingStep(i + 1);
        await new Promise((r) => setTimeout(r, 400));
      }
      // Full reload so AuthProvider picks up demo/local session cleanly
      window.location.href = "/app";
    } catch (e: any) {
      setIsSigningIn(false);
      notify.error(
        "Login Failed",
        e?.message || "Unexpected login error"
      );
    }  }

  return (
    <div className="rxa-root">
      {/* ── Left editorial panel ── */}
      <div className="rxa-left">
        <AmbientLeft />
        <img
          className="rxa-monogram"
          src="/Logo-Monogram.png"
          alt=""
          aria-hidden
        />

        {/* Logo */}
        <div className={`rxa-logo rxa-fadeup`} style={{ position: "relative", zIndex: 1 }}>
          <div className="rxa-logo-mark">
            <img src="/Logo-Monogram.png" alt="RECRULYN" />
          </div>
          <div>
            <div className="rxa-logo-name">Recrulyn</div>
            <div className="rxa-logo-sub">AI-Powered HR Platform</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="rxa-hero" style={{ position: "relative", zIndex: 1 }}>
          <div className={`rxa-eyebrow rxa-fadeup rxa-fadeup-1`}>
            <span className="rxa-eyebrow-dot"/>
            Enterprise HR Intelligence
          </div>
          <h1 className={`rxa-h1 rxa-fadeup rxa-fadeup-2`}>
            Hiring that<br/>thinks <em>ahead.</em>
          </h1>
          <p className={`rxa-body rxa-fadeup rxa-fadeup-3`}>
            RECRULYN combines AI candidate screening, automated documentation,
            and real-time workforce analytics into one coherent platform—built
            for HR teams that move fast.
          </p>

          {/* Stats */}
          <div className={`rxa-pillars rxa-fadeup rxa-fadeup-4`}>
            <div className="rxa-pillar">
              <span className="rxa-pillar-num">3×</span>
              <span className="rxa-pillar-label">Faster screening</span>
            </div>
            <div className="rxa-pillar-sep"/>
            <div className="rxa-pillar">
              <span className="rxa-pillar-num">94%</span>
              <span className="rxa-pillar-label">Placement accuracy</span>
            </div>
            <div className="rxa-pillar-sep"/>
            <div className="rxa-pillar">
              <span className="rxa-pillar-num">60%</span>
              <span className="rxa-pillar-label">Less admin</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`rxa-caption rxa-fadeup rxa-fadeup-5`} style={{ position: "relative", zIndex: 1 }}>
          <span>© 2026 </span>
          <span className="rxa-caption-dot"/>
          <span>Recrulyn Technologies</span>
          <span className="rxa-caption-dot"/>
          <span> All rights reserved.</span>
        </div>
      </div>

      {/* ── Vertical seam ── */}
      <div className="rxa-seam"/>

      {/* ── Right form panel ── */}
      <div className="rxa-right">
        {view === "login" && (
          <div
            className={`rxa-form-wrap ${mounted ? "rxa-anim-in" : ""}`}
            key="login"
          >
            {/* Security badge */}
            <div className="rxa-badge">
              <ShieldCheck size={14}/>
              Encrypted &amp; secure
            </div>

            <h2 className="rxa-form-title">HR demo sign-in</h2>
            <p className="rxa-form-sub">Pick a people-team role or use the HR workspace</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="rxa-btn-secondary"
                  style={{
                    border: email === account.email ? "1px solid #4B3FE4" : "1px solid #d1d5db",
                    background: email === account.email ? "#EEF1FE" : "#f8fafc",
                    color: "#111827",
                    borderRadius: 12,
                    padding: "10px 10px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {account.role}
                  <div style={{ fontSize: 11, fontWeight: 500, color: "#6b7280", marginTop: 2 }}>
                    {account.email}
                  </div>
                </button>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
              Shared demo password: <strong>{DEMO_PASSWORD}</strong>
            </p>

            <div className="rxa-divider">
              <span className="rxa-divider-line"/>
              <span className="rxa-divider-text">Enter your Credentials</span>
              <span className="rxa-divider-line"/>
            </div>

            {/* Email */}
            <div className="rxa-field">
              <label className="rxa-label" htmlFor="rxa-email">Email</label>
              <div className="rxa-input-wrap">
                <span className="rxa-input-icon"><Mail size={16}/></span>
                <input
                  id="rxa-email"
                  className="rxa-input"
                  type="email"
                  placeholder="hr@reude.tech"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="rxa-field">
              <label className="rxa-label" htmlFor="rxa-pwd">Password</label>
              <div className="rxa-input-wrap">
                <span className="rxa-input-icon"><Lock size={16}/></span>
                <input
                  id="rxa-pwd"
                  className="rxa-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
                <button
                  type="button"
                  className="rxa-input-action"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>

          
            {/* Sign in */}
            <button
              className="rxa-btn-primary"
              type="button"
              onClick={handleLogin}
              disabled={isSigningIn}
            >
              {isSigningIn ? "Signing in…" : "Sign in"}
              {!isSigningIn && <ArrowRight size={16}/>}
            </button>

            
          </div>
        )}

        {view === "loading" && (
          <div
            className="rxa-loading-wrap rxa-anim-in"
            key="loading"
          >
            <h2 className="rxa-loading-title">Welcome back 👋</h2>
            <p className="rxa-loading-sub">Setting up your workspace…</p>

            <div className="rxa-steps">
              {STEPS.map((step, i) => {
                const done = loadingStep > i;
                return (
                  <div key={step} className={`rxa-step ${done ? "rxa-step--done" : "rxa-step--waiting"}`}>
                    <span className="rxa-step-label">{step}</span>
                    <span className={`rxa-step-status ${done ? "rxa-step-status--done" : "rxa-step-status--waiting"}`}>
                      {done
                        ? <><CheckCircle2 size={13}/> Done</>
                        : <><Circle size={13}/> Waiting</>
                      }
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="rxa-progress-bar">
              <div className="rxa-progress-fill" style={{ width: `${loadingStep * 25}%` }}/>
            </div>
            <div className="rxa-progress-label">{loadingStep * 25}%</div>
          </div>
        )}
      </div>
    </div>
  );
}