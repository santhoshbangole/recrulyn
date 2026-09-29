import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import { useNotification } from "../../components/notification/useNotification";
import {
  getDemoUserProfiles,
  isDemoMode,
  saveDemoUserProfiles,
} from "../../modules/demo/seed";
import { ROLE_META, ROLE_OPTIONS, roleOf } from "./roleMeta";

export default function RolesPage() {
  const notify = useNotification();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    if (isDemoMode()) {
      setUsers(getDemoUserProfiles());
      return;
    }
    try {
      const { data, error } = await supabase.from("profiles").select("*").order("full_name");
      if (error) throw error;
      const rows = data?.length ? data : getDemoUserProfiles();
      setUsers(rows);
    } catch {
      setUsers(getDemoUserProfiles());
    }
  }

  async function updateRole(id: string, role: string) {
    if (isDemoMode()) {
      const next = getDemoUserProfiles().map((user: any) =>
        user.id === id ? { ...user, role_name: role, role } : user
      );
      saveDemoUserProfiles(next);
      setUsers(next);
      notify.success("Role updated");
      return;
    }

    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      notify.error("Could not update role");
      return;
    }
    loadUsers();
    notify.success("Role updated");
  }

  const counts = ROLE_OPTIONS.map((role) => ({
    role,
    count: users.filter((user) => roleOf(user) === role).length,
  }));

  return (
    <div className="p-1">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Admin</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#111827]">Role management</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Assign what each person can do. Changes apply immediately in this workspace.
        </p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        {counts.map(({ role, count }) => {
          const meta = ROLE_META[role];
          return (
            <div key={role} className="rounded-2xl border border-[#E8EDF2] bg-white px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: meta.text }}>
                {meta.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#111827]">{count}</p>
              <p className="mt-1 text-xs leading-snug text-[#6B7280]">{meta.access}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#E8EDF2] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E8EDF2] bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Current role</th>
              <th className="px-4 py-3">Access</th>
              <th className="px-4 py-3">Change role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const role = roleOf(user);
              const meta = ROLE_META[role] || ROLE_META.EMPLOYEE;
              return (
                <tr key={user.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFBFC]">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[#111827]">{user.full_name}</p>
                    <p className="text-xs text-[#6B7280]">{user.title || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{user.email}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{user.department || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{ background: meta.bg, color: meta.text }}
                    >
                      {meta.label}
                    </span>
                  </td>
                  <td className="max-w-[220px] px-4 py-3 text-xs leading-snug text-[#6B7280]">{meta.access}</td>
                  <td className="px-4 py-3">
                    <select
                      className="w-full max-w-[180px] rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-2 text-sm"
                      value={role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {ROLE_META[option].label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
