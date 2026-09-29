export type JobStatus =
  | "draft"
  | "open"
  | "paused"
  | "closed"
  | "filled";

export type CandidateStage =
  | "sourced"
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type RiskLevel =
  | "low"
  | "medium"
  | "high";

export interface Job {
  id: string;

  title: string;

  department: string;

  location: string;

  status: JobStatus;

  created_at: string;

  updated_at: string;

  employment_type?: string;

  description?: string;

  headcount?: number;

  filled_count?: number;

  candidate_count?: number;

  avg_time_to_fill_days?: number | null;

  pipeline_health?: RiskLevel;

  hiring_manager?: string | null;
}

export interface Candidate {
  id: string;

  full_name: string;

  email: string;

  phone: string | null;

  job_id: string;

  status: string;

  resume_url: string | null;

  ai_score: number | null;

  source: string | null;

  linkedin_url: string | null;

  created_at: string;

  updated_at: string;
}

export interface DocumentRecord {
  id: string;

  name: string;

  kind:
    | "resume"
    | "offer_letter"
    | "contract"
    | "policy"
    | "report"
    | "other";

  related_candidate_id: string | null;

  related_job_id: string | null;

  size_bytes: number;

  uploaded_by: string;

  created_at: string;

  status:
    | "processed"
    | "processing"
    | "failed";
}

export interface AIInsight {
  id: string;

  created_at: string;

  severity: RiskLevel;

  title: string;

  body: string;

  category:
    | "pipeline"
    | "retention"
    | "sourcing"
    | "compliance"
    | "velocity";

  related_entity_label: string | null;

  related_entity_path: string | null;
}

export interface ActivityEvent {
  id: string;

  created_at: string;

  actor_name: string;

  actor_avatar_url: string | null;

  verb: string;

  target_label: string;

  target_path: string | null;
}

export interface MetricSeriesPoint {
  t: string;

  v: number;
}

export interface DashboardMetrics {
  open_roles: number;

  open_roles_series: MetricSeriesPoint[];

  active_candidates: number;

  active_candidates_series: MetricSeriesPoint[];

  avg_time_to_hire_days: number;

  avg_time_to_hire_series: MetricSeriesPoint[];

  offers_pending: number;

  offers_pending_series: MetricSeriesPoint[];
}