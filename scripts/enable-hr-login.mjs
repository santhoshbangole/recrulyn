import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return out;
}

const env = {
  ...loadEnv(path.join(root, ".env")),
  ...loadEnv(path.join(root, "email-service/.env")),
};

const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Prefer email-service dependency if root import fails
let createClientFn = createClient;
try {
  createClientFn = createClient;
} catch {
  const require = createRequire(path.join(root, "email-service/package.json"));
  createClientFn = require("@supabase/supabase-js").createClient;
}

const admin = createClientFn(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = "hr@reude.tech";
const password = "Reude_HR_2026";

async function main() {
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) {
    console.error("listUsers error:", listErr.message);
    process.exit(1);
  }

  let user = listData.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );

  if (user) {
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { full_name: "HR User", role: "HR" },
      app_metadata: { role: "HR" },
    });
    if (error) {
      console.error("updateUser error:", error.message);
      process.exit(1);
    }
    user = data.user;
    console.log("UPDATED_USER", user.id);
  } else {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "HR User", role: "HR" },
      app_metadata: { role: "HR" },
    });
    if (error) {
      console.error("createUser error:", error.message);
      process.exit(1);
    }
    user = data.user;
    console.log("CREATED_USER", user.id);
  }

  const { data: existingProfile, error: profErr } = await admin
    .from("user_profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (profErr) {
    console.log("PROFILE_SELECT_ERROR", profErr.message, profErr.code);
  } else {
    console.log("PROFILE_EXISTS", !!existingProfile);
    if (existingProfile) {
      console.log("PROFILE_KEYS", Object.keys(existingProfile).join(","));
      console.log("PROFILE_ROLE", existingProfile.role_name);
    }
  }

  // Build upsert from existing row shape when possible
  const base = existingProfile
    ? {
        ...existingProfile,
        email,
        role_name: "HR",
        full_name: existingProfile.full_name || "HR User",
      }
    : {
        id: user.id,
        email,
        role_name: "HR",
        full_name: "HR User",
      };

  // Ensure id matches auth user when column exists
  if ("id" in (existingProfile || { id: true })) {
    base.id = existingProfile?.id || user.id;
  }

  const tries = [
    base,
    { id: user.id, email, role_name: "HR", full_name: "HR User" },
    {
      id: user.id,
      email,
      role_name: "HR",
      full_name: "HR User",
      status: "active",
    },
  ];

  let profileOk = false;
  for (const payload of tries) {
    const { data, error } = await admin
      .from("user_profiles")
      .upsert(payload)
      .select()
      .maybeSingle();
    if (!error) {
      console.log("PROFILE_UPSERT_OK", data?.email, data?.role_name);
      profileOk = true;
      break;
    }
    console.log("PROFILE_UPSERT_TRY_FAIL", error.message);
  }

  if (!profileOk && existingProfile) {
    const { error } = await admin
      .from("user_profiles")
      .update({ role_name: "HR", email })
      .eq("email", email);
    if (error) console.log("PROFILE_UPDATE_FAIL", error.message);
    else console.log("PROFILE_UPDATE_OK");
  }

  if (!anonKey) {
    console.error("Missing VITE_SUPABASE_ANON_KEY for sign-in test");
    process.exit(1);
  }

  const anon = createClientFn(env.VITE_SUPABASE_URL || url, anonKey);
  const { data: signInData, error: signInErr } =
    await anon.auth.signInWithPassword({ email, password });
  if (signInErr) {
    console.error("SIGNIN_FAIL", signInErr.message);
    process.exit(1);
  }
  console.log("SIGNIN_OK", signInData.user?.id);

  const { data: profileAfter } = await anon
    .from("user_profiles")
    .select("email, role_name, full_name")
    .eq("email", email)
    .maybeSingle();
  console.log("PROFILE_AFTER_LOGIN", profileAfter);

  await anon.auth.signOut();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
