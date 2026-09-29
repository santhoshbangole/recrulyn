import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Building2, Shield, X } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { isDemoMode } from "../../modules/demo/seed";

const PREFS_KEY = "recrulyn_workspace_prefs";

type Prefs = {
  emailAlerts: boolean;
  joiningReminders: boolean;
  documentApprovals: boolean;
};

const DEFAULT_PREFS: Prefs = {
  emailAlerts: true,
  joiningReminders: true,
  documentApprovals: true,
};

function readPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
      style={{ background: checked ? "#2F7D4A" : "#D1D5DB" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
        style={{ left: checked ? 22 : 2, transition: "left 0.15s ease" }}
      />
    </button>
  );
}

export default function WorkspaceSettingsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { profile } = useAuth();
  const demo = isDemoMode();
  const [prefs, setPrefs] = useState<Prefs>(readPrefs);

  useEffect(() => {
    if (!open) return;
    setPrefs(readPrefs());
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  function updatePref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  }

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[12000] flex items-center justify-center p-4"
      style={{ background: "rgba(17, 24, 39, 0.45)" }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-settings-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-[#E8EDF2] px-6 py-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
              Workspace
            </p>
            <h2 id="workspace-settings-title" className="mt-1 text-xl font-semibold text-[#111827]">
              Workspace settings
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F6F8FA]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          <section className="rounded-xl border border-[#E8EDF2] p-4">
            <div className="mb-3 flex items-center gap-2 text-[#111827]">
              <Building2 size={16} />
              <h3 className="text-sm font-semibold">Organisation</h3>
            </div>
            <p className="text-sm font-medium text-[#111827]">RECRULYN HireOS</p>
            <p className="mt-1 text-sm text-[#6B7280]">
              {demo ? "Demo workspace with sample talent and documents." : "Live HR workspace."}
            </p>
            <p className="mt-3 text-sm text-[#6B7280]">
              Signed in as <span className="font-medium text-[#111827]">{profile?.full_name || "User"}</span>
              {profile?.email ? ` · ${profile.email}` : ""}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-[#E9F5EE] px-2.5 py-1 text-[11px] font-semibold text-[#1F5C36]">
              {profile?.role_name || "Member"}
            </span>
          </section>

          <section className="rounded-xl border border-[#E8EDF2] p-4">
            <div className="mb-3 flex items-center gap-2 text-[#111827]">
              <Bell size={16} />
              <h3 className="text-sm font-semibold">Alerts</h3>
            </div>
            <div className="space-y-3">
              {(
                [
                  ["emailAlerts", "Email pipeline alerts"],
                  ["joiningReminders", "Joining date reminders"],
                  ["documentApprovals", "Document approval notices"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[#374151]">{label}</span>
                  <Toggle checked={prefs[key]} onChange={(next) => updatePref(key, next)} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-[#E8EDF2] p-4">
            <div className="mb-2 flex items-center gap-2 text-[#111827]">
              <Shield size={16} />
              <h3 className="text-sm font-semibold">Access</h3>
            </div>
            <p className="text-sm text-[#6B7280]">
              HR, Admin, and Management can generate letters and manage the pipeline. Intern
              access is limited to assigned workspace views.
            </p>
          </section>
        </div>

        <div className="flex justify-end border-t border-[#E8EDF2] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
