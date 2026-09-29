import { seedDemoWorkspace } from "../../demo/seed";

const DEMO_SESSION_KEY = "recrulyn_demo_session";

export type DemoAccount = {
  email: string;
  password: string;
  role: "HR" | "ADMIN" | "MANAGEMENT" | "EMPLOYEE";
  full_name: string;
  title: string;
};

export const DEMO_PASSWORD = "Reude_HR_2026";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "hr@reude.tech",
    password: DEMO_PASSWORD,
    role: "HR",
    full_name: "Meera Sharma",
    title: "HR Business Partner",
  },
  {
    email: "admin@reude.tech",
    password: DEMO_PASSWORD,
    role: "ADMIN",
    full_name: "Arun Prakash",
    title: "People Systems Admin",
  },
  {
    email: "mgmt@reude.tech",
    password: DEMO_PASSWORD,
    role: "MANAGEMENT",
    full_name: "Kavitha Rao",
    title: "Head of People",
  },
  {
    email: "intern@reude.tech",
    password: DEMO_PASSWORD,
    role: "EMPLOYEE",
    full_name: "Siddharth Nair",
    title: "Software Intern",
  },
];

export function buildDemoUser(account: DemoAccount) {
  const id = `demo-${account.role.toLowerCase()}-${account.email}`;
  return {
    id,
    email: account.email,
    user_metadata: {
      full_name: account.full_name,
      role: account.role,
    },
    app_metadata: {
      role: account.role,
      provider: "demo",
    },
    is_demo: true,
  };
}

export function buildDemoProfile(account: DemoAccount, userId: string) {
  return {
    id: userId,
    email: account.email,
    full_name: account.full_name,
    role_name: account.role,
    title: account.title,
  };
}

export function saveDemoSession(account: DemoAccount) {
  const user = buildDemoUser(account);
  const profile = buildDemoProfile(account, user.id);
  const session = { user, profile, created_at: Date.now() };
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  seedDemoWorkspace();
  return session;
}

export function readDemoSession() {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      user: any;
      profile: any;
      created_at: number;
    };
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  localStorage.removeItem(DEMO_SESSION_KEY);
}

export function findDemoAccount(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return (
    DEMO_ACCOUNTS.find(
      (a) =>
        a.email.toLowerCase() === normalized && a.password === password
    ) || null
  );
}

export function isNetworkAuthError(error: unknown) {
  const message = String((error as any)?.message || error || "").toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("name_not_resolved") ||
    message.includes("err_name_not_resolved") ||
    message.includes("enotfound") ||
    message.includes("load failed") ||
    message.includes("networkerror")
  );
}
