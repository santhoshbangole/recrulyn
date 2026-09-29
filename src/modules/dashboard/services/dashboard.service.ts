import { supabase } from "../../../services/supabase/client";
import { getDemoDashboardMetrics, isDemoMode } from "../../demo/seed";

export async function getDashboardMetrics() {
  if (isDemoMode()) {
    return getDemoDashboardMetrics();
  }

  try {
  const [
    jobsResult,
    candidatesResult,
    applicationsResult,
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("candidates")
      .select("*", {
        count: "exact",
        head: true,
      }),

    supabase
      .from("applications")
      .select("*", {
        count: "exact",
        head: true,
      }),
  ]);

  return {
    open_roles:
      jobsResult.count || 0,

    open_roles_series: [],

    active_candidates:
      candidatesResult.count || 0,

    active_candidates_series: [],

    avg_time_to_hire_days: 0,

    avg_time_to_hire_series: [],

    offers_pending:
      applicationsResult.count || 0,

    offers_pending_series: [],
  };
  } catch {
    return getDemoDashboardMetrics();
  }
}

export async function getAIInsights() {
  return [];
}

export async function getRecentActivity() {
  return [];
}

export function subscribeToActivity() {
  return () => {};
}