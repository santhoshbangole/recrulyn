export const ROLE_OPTIONS = ["ADMIN", "HR", "MANAGEMENT", "EMPLOYEE"] as const;

export const ROLE_META: Record<
  string,
  { label: string; bg: string; text: string; access: string }
> = {
  ADMIN: {
    label: "Admin",
    bg: "#EEF2FF",
    text: "#3730A3",
    access: "Users, roles, and system settings",
  },
  HR: {
    label: "HR",
    bg: "#E9F5EE",
    text: "#1F5C36",
    access: "Pipeline, documents, reports, and leave",
  },
  MANAGEMENT: {
    label: "Management",
    bg: "#FEF3C7",
    text: "#92400E",
    access: "Approvals, reports, and team overview",
  },
  EMPLOYEE: {
    label: "Intern / Employee",
    bg: "#F3F4F6",
    text: "#374151",
    access: "Assigned workspace and intern dashboard",
  },
};

export function roleOf(user: any) {
  return String(user?.role_name || user?.role || "EMPLOYEE").toUpperCase();
}
