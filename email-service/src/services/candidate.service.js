import "../loadEnv.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function createCandidate(candidate) {
    const { data: existing } = await supabase
  .from("candidates")
  .select("id")
  .eq("email", candidate.email)
  .maybeSingle();

if (existing) {
  return existing;
}
  const { data, error } = await supabase
    .from("candidates")
    
    .insert({
      full_name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resume_url: candidate.resumeUrl,
      status: "Applied",
      source: "Email",
      ai_score: 0,
      duplicate_score: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}