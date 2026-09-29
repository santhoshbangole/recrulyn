export interface AIRecruiterSearch {
  role: string;
  skills: string[];
}

export interface AIRecruiterResult {
  id: string;

  candidate_name: string;

  email: string;

  resume_url: string;

  ai_score: number;

  recommendation: string;

  skills: string;

  strengths: string;

  weaknesses: string;

  matched_keywords: string;

  missing_keywords: string;

  interview_questions: string;

  risk_factors: string;

  resume_text: string;

  requirement_role?: string;

  required_skills?: string;
}