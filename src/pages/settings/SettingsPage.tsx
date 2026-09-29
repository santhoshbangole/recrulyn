import { motion } from "framer-motion";
import { User, Shield, Bell, Info } from "lucide-react";
import { useAuth } from "../../app/providers/AuthProvider";
import { useState } from "react";
import { useNotification } from "../../components/notification/useNotification";
import { settingsService } from "./settings.service";
const TOKENS = {
  green: "#5D8C63",
  greenDeep: "#3F6B46",
  linen: "#F6F3EC",
  ink: "#1F2A24",
  body: "#5E5E54",
};

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border bg-white p-6"
      style={{
        borderColor: "#E8E4DA",
      }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="rounded-xl p-2"
          style={{
            background: "#EDF4EE",
            color: TOKENS.green,
          }}
        >
          {icon}
        </div>

        <h2
          className="text-lg font-semibold"
          style={{
            color: TOKENS.ink,
          }}
        >
          {title}
        </h2>
      </div>

      {children}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { profile } = useAuth();
  const notify = useNotification();
const [password, setPassword] =
  useState("");

const [confirmPassword, setConfirmPassword] =
  useState("");

const [loading, setLoading] =
  useState(false);
  async function changePassword() {
  if (!password) {
    notify.warning("Enter a password");
    return;
  }

  if (password !== confirmPassword) {
   notify.error("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    await settingsService.updatePassword(
      password
    );
notify.success("Password updated successfully.");

    setPassword("");
    setConfirmPassword("");

  } catch (error: any) {
   notify.error(error.message);
  } finally {
    setLoading(false);
  }
}
  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: TOKENS.linen,
      }}
    >
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{
            color: TOKENS.ink,
          }}
        >
          Settings
        </h1>

        <p
          className="mt-2"
          style={{
            color: TOKENS.body,
          }}
        >
          Manage your account, workspace alerts, and people-ops preferences.
        </p>
      </div>

      {String(profile?.email || "").includes("reude.tech") && (
        <div
          className="mb-6 rounded-3xl border p-5"
          style={{ borderColor: "#D7E8DC", background: "#F3F9F5" }}
        >
          <p className="text-sm font-semibold" style={{ color: TOKENS.ink }}>
            Demo workspace
          </p>
          <p className="mt-1 text-sm" style={{ color: TOKENS.body }}>
            You are signed in as {profile?.full_name}. Sample talent, letters, and inbox
            items are loaded so every HR walkthrough has data to show.
          </p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">

        <Card
  title="Profile"
  icon={<User size={20} />}
>
  <div className="flex items-start gap-6">

    <div
      className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white"
      style={{
        background: `linear-gradient(135deg, ${TOKENS.green}, ${TOKENS.greenDeep})`,
      }}
    >
      {(profile?.full_name || "U")
        .split(" ")
        .map((x: string) => x[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()}
    </div>

    <div className="grid flex-1 gap-5 md:grid-cols-2">

      <Field
        label="Full Name"
        value={profile?.full_name}
      />

      <Field
        label="Email"
        value={profile?.email}
      />

      <Field
        label="Role"
        value={profile?.role_name}
      />

      <Field
        label="Department"
        value={(profile as any)?.department}
      />

    </div>

  </div>
</Card>

      <Card
  title="Security"
  icon={<Shield size={20} />}
>

  <div className="space-y-5">

    <div>

      <label className="mb-2 block text-sm font-medium">
        New Password
      </label>

      <input
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
        className="w-full rounded-xl border px-4 py-3 outline-none"
      />

    </div>

    <div>

      <label className="mb-2 block text-sm font-medium">
        Confirm Password
      </label>

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) =>
          setConfirmPassword(e.target.value)
        }
        className="w-full rounded-xl border px-4 py-3 outline-none"
      />

    </div>

    <button
      onClick={changePassword}
      disabled={loading}
      className="rounded-xl bg-[#5D8C63] px-5 py-3 text-white disabled:opacity-50"
    >
      {loading
        ? "Updating..."
        : "Update Password"}
    </button>

  </div>

</Card>

        <Card title="Notifications" icon={<Bell size={20} />}>

          <p
            style={{
              color: TOKENS.body,
            }}
          >
            Notification preferences will be available here.
          </p>

        </Card>

        <Card title="About" icon={<Info size={20} />}>

  <div className="space-y-2">

    <Field
      label="Application"
      value="RECRULYN"
    />

    <Field
      label="Version"
      value="1.0"
    />

  </div>

</Card>

      </div>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>

      <label
        className="text-xs font-semibold uppercase tracking-wider"
        style={{
          color: "#8B8B80",
        }}
      >
        {label}
      </label>

      <div
        className="mt-2 rounded-xl border bg-[#FAFAF7] px-4 py-3"
        style={{
          borderColor: "#E7E3D8",
        }}
      >
        <span
          className="font-medium"
          style={{
            color: "#1F2A24",
          }}
        >
          {value || "-"}
        </span>
      </div>

    </div>
  );
}