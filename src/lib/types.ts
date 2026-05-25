export interface WeeklyKpi {
  id?: number;
  week_start: string;
  fortifyfit_blogs: number;
  naver_blogs: number;
  threads_posts: number;
  main_hours: number;
  meta_ad_spend: number;
  created_at?: string;
  updated_at?: string;
}

export interface IdeaBoxItem {
  id?: number;
  title: string;
  description: string;
  registered_date: string;
  lock_until: string;
  reviewed: boolean;
  review_decision?: string;
  // Deep analysis fields (strength-based)
  deep_analysis?: string;
  connection_to_main?: string;
  analysis_time_minutes?: number;
  review_checklist?: {
    main_result_check: boolean;
    market_validation: boolean;
    no_revenue_impact: boolean;
    still_valuable: boolean;
  };
  created_at?: string;
}

export interface WeeklyExperiment {
  id?: number;
  week_start: string;
  experiment_type: 'new_keyword' | 'new_geo_test' | 'new_content_format' | 'new_schema' | 'new_outreach';
  title: string;
  hypothesis?: string;
  result?: string;
  insight?: string;
  status: 'planned' | 'running' | 'completed';
  created_at?: string;
}

export interface ContentItem {
  id?: number;
  title: string;
  channel: 'fortifyfit' | 'naver' | 'threads';
  status: 'idea' | 'writing' | 'published';
  target_keyword?: string;
  scheduled_date?: string;
  published_date?: string;
  url?: string;
  notes?: string;
  created_at?: string;
}

export interface Client {
  id?: number;
  clinic_name: string;
  specialty: string;
  location: string;
  stage: 'lead' | 'discovery' | 'proposal' | 'negotiation' | 'won' | 'lost';
  expected_setup_fee: number;
  expected_monthly_fee: number;
  contact_date: string;
  next_action?: string;
  next_action_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklyReport {
  id?: number;
  week_start: string;
  report_content: string;
  ai_feedback?: string;
  submitted_at?: string;
}

export interface DailyLog {
  id?: number;
  log_date: string;
  morning_session_done: boolean;
  morning_session_notes?: string;
  threads_posted: boolean;
  feeling?: 'excited' | 'focused' | 'distracted' | 'tired' | 'frustrated';
  trigger_keywords?: string;
  created_at?: string;
}

export interface Asset {
  id?: number;
  name: string;
  type: 'domain' | 'saas' | 'tool' | 'client' | 'book' | 'content';
  tier: '0' | '1' | '2' | 'archive';
  status: 'active' | 'dormant' | 'archived';
  monthly_revenue: number;
  notes?: string;
  created_at?: string;
}

export interface InputEnvironment {
  id?: number;
  date: string;
  decompression_hours: number;
  constructive_input_hours: number;
  academic_input_hours: number;
  comparison_trigger_count: number;
  trigger_source?: 'youtube' | 'instagram' | 'threads' | 'conversation' | 'news' | 'natural';
  notes?: string;
}

export interface SetupChecklistItem {
  task: string;
  category: string;
  priority: number;
  done: boolean;
  done_date?: string;
}

export const KPI_TARGETS = {
  fortifyfit_blogs: 2,
  naver_blogs: 2,
  threads_posts: 5,
  main_hours: 9,
  meta_ad_spend: 0,
} as const;
