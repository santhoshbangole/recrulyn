import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "../../services/supabase/client";
import { useNotification } from "../../components/notification/useNotification";
import {
  getDemoUserProfiles,
  isDemoMode,
  saveDemoUserProfiles,
} from "../../modules/demo/seed";
import { ROLE_META, ROLE_OPTIONS, roleOf } from "./roleMeta";

export default function UsersPage() {
  const notify = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleName, setRoleName] = useState("EMPLOYEE");
  const [department, setDepartment] = useState("Talent Acquisition");
  const [title, setTitle] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    if (isDemoMode()) {
      setUsers(getDemoUserProfiles());
      return;
    }
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").order("full_name");
      if (error) throw error;
      setUsers(data?.length ? data : getDemoUserProfiles());
    } catch {
      setUsers(getDemoUserProfiles());
    }
  }

  async function createUser() {
    if (!fullName.trim() || !email.trim()) {
      notify.error("Name and email are required");
      return;
    }

    const row = {
      id: `demo-user-${Date.now()}`,
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role_name: roleName,
      title: title.trim() || ROLE_META[roleName]?.label || roleName,
      department,
      is_active: true,
    };

    if (isDemoMode()) {
      const next = [row, ...getDemoUserProfiles()];
      saveDemoUserProfiles(next);
      setUsers(next);
      setShowForm(false);
      setFullName("");
      setEmail("");
      setTitle("");
      setRoleName("EMPLOYEE");
      notify.success("User added");
      return;
    }

    const { error } = await supabase.from("profiles").insert({
      id: crypto.randomUUID(),
      full_name: row.full_name,
      email: row.email,
      role: roleName,
      is_active: true,
    });
    if (error) {
      notify.error("Failed", error.message);
      return;
    }
    setShowForm(false);
    loadUsers();
    notify.success("User created successfully.");
  }

  async function toggleUserStatus(id: string, currentStatus: boolean) {
    if (isDemoMode()) {
      const next = getDemoUserProfiles().map((user: any) =>
        user.id === id ? { ...user, is_active: !currentStatus } : user
      );
      saveDemoUserProfiles(next);
      setUsers(next);
      setSelectedUser((prev: any) => (prev?.id === id ? { ...prev, is_active: !currentStatus } : prev));
      notify.success(currentStatus ? "User deactivated" : "User activated");
      return;
    }

    const { error } = await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      notify.error("Failed", "Unable to update user status.");
      return;
    }
    loadUsers();
    notify.success(`User ${currentStatus ? "deactivated" : "activated"} successfully.`);
  }

  return (
    <div className="p-1">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">Admin</p>
          <h1 className="mt-1 text-3xl font-semibold text-[#111827]">User management</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {users.length} people in this workspace. Click a name to view or change status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} />
          Add user
        </button>
      </div>

      {selectedUser && (
        <div className="mb-5 rounded-2xl border border-[#E8EDF2] bg-white p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#111827]">{selectedUser.full_name}</h2>
              <p className="text-sm text-[#6B7280]">{selectedUser.email}</p>
            </div>
            <button type="button" onClick={() => setSelectedUser(null)} className="rounded-lg p-2 hover:bg-[#F6F8FA]">
              <X size={16} />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Role" value={ROLE_META[roleOf(selectedUser)]?.label || roleOf(selectedUser)} />
            <Field label="Department" value={selectedUser.department || "—"} />
            <Field label="Status" value={selectedUser.is_active ? "Active" : "Inactive"} />
          </div>
          <button
            type="button"
            className="mt-4 rounded-xl border border-[#E8EDF2] px-4 py-2 text-sm font-semibold text-[#111827]"
            onClick={() => toggleUserStatus(selectedUser.id, Boolean(selectedUser.is_active))}
          >
            {selectedUser.is_active ? "Deactivate user" : "Activate user"}
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-5 rounded-2xl border border-[#E8EDF2] bg-white p-5">
          <h3 className="mb-4 text-base font-semibold text-[#111827]">Create user</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"
              placeholder="Job title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <select
              className="rounded-xl border border-[#E5E7EB] px-3 py-2.5 text-sm"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_META[role].label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={createUser}
              className="rounded-xl bg-[#2F7D4A] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Save user
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#6B7280]">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[#E8EDF2] bg-white">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#E8EDF2] bg-[#F8FAFB] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const role = roleOf(user);
              const meta = ROLE_META[role] || ROLE_META.EMPLOYEE;
              return (
                <tr key={user.id} className="border-b border-[#F1F5F9] last:border-0 hover:bg-[#FAFBFC]">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedUser(user)}
                      className="text-left font-semibold text-[#111827] hover:underline"
                    >
                      {user.full_name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563]">{user.title || "—"}</td>
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
                  <td className="px-4 py-3">
                    <span className={user.is_active !== false ? "font-medium text-[#1F5C36]" : "font-medium text-[#9CA3AF]"}>
                      {user.is_active !== false ? "Active" : "Inactive"}
                    </span>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[#111827]">{value}</p>
    </div>
  );
}
