-- Fortifyfit Dashboard Schema
-- Run this in Supabase SQL Editor

-- Weekly KPI
CREATE TABLE IF NOT EXISTS weekly_kpi (
  id SERIAL PRIMARY KEY,
  week_start DATE UNIQUE NOT NULL,
  fortifyfit_blogs INTEGER DEFAULT 0,
  naver_blogs INTEGER DEFAULT 0,
  threads_posts INTEGER DEFAULT 0,
  main_hours DECIMAL(4,1) DEFAULT 0,
  meta_ad_spend INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Calendar
CREATE TABLE IF NOT EXISTS content_items (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('fortifyfit', 'naver', 'threads')),
  status TEXT CHECK (status IN ('idea', 'writing', 'published')) DEFAULT 'idea',
  target_keyword TEXT,
  scheduled_date DATE,
  published_date DATE,
  url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Pipeline
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  clinic_name TEXT NOT NULL,
  specialty TEXT,
  location TEXT,
  stage TEXT CHECK (stage IN ('lead', 'discovery', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'lead',
  expected_setup_fee INTEGER DEFAULT 0,
  expected_monthly_fee INTEGER DEFAULT 0,
  contact_date DATE,
  next_action TEXT,
  next_action_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Box (strength-based deep analysis)
CREATE TABLE IF NOT EXISTS idea_box (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  registered_date DATE DEFAULT CURRENT_DATE,
  lock_until DATE,
  reviewed BOOLEAN DEFAULT FALSE,
  review_decision TEXT,
  deep_analysis TEXT,
  connection_to_main TEXT,
  analysis_time_minutes INTEGER DEFAULT 0,
  review_checklist JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly Reports
CREATE TABLE IF NOT EXISTS weekly_reports (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  report_content TEXT,
  ai_feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Logs
CREATE TABLE IF NOT EXISTS daily_logs (
  id SERIAL PRIMARY KEY,
  log_date DATE DEFAULT CURRENT_DATE,
  morning_session_done BOOLEAN DEFAULT FALSE,
  morning_session_notes TEXT,
  threads_posted BOOLEAN DEFAULT FALSE,
  feeling TEXT CHECK (feeling IN ('excited', 'focused', 'distracted', 'tired', 'frustrated')),
  trigger_keywords TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('domain', 'saas', 'tool', 'client', 'book', 'content')),
  tier TEXT CHECK (tier IN ('0', '1', '2', 'archive')),
  status TEXT CHECK (status IN ('active', 'dormant', 'archived')) DEFAULT 'active',
  monthly_revenue INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Beliefs (static seed)
CREATE TABLE IF NOT EXISTS beliefs (
  id SERIAL PRIMARY KEY,
  order_num INTEGER,
  content TEXT NOT NULL
);

-- Rules (static seed)
CREATE TABLE IF NOT EXISTS rules (
  id SERIAL PRIMARY KEY,
  order_num INTEGER,
  content TEXT NOT NULL
);

-- Weekly Experiments (Innovation Slot)
CREATE TABLE IF NOT EXISTS weekly_experiments (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  experiment_type TEXT CHECK (experiment_type IN ('new_keyword', 'new_geo_test', 'new_content_format', 'new_schema', 'new_outreach')),
  title TEXT NOT NULL,
  hypothesis TEXT,
  result TEXT,
  insight TEXT,
  status TEXT CHECK (status IN ('planned', 'running', 'completed')) DEFAULT 'planned',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collaborators (deep relationships)
CREATE TABLE IF NOT EXISTS collaborators (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('designer', 'developer', 'partner', 'client', 'family')),
  active_projects TEXT[],
  next_action TEXT,
  next_action_date DATE,
  relationship_depth TEXT CHECK (relationship_depth IN ('deep_long_term', 'deep_new', 'moderate', 'professional_only')),
  meeting_frequency TEXT CHECK (meeting_frequency IN ('weekly', 'monthly', 'quarterly', 'ad_hoc')),
  next_meeting_date DATE,
  constructive_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Input Environment (3-split tracking)
CREATE TABLE IF NOT EXISTS input_environment (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  decompression_hours DECIMAL(3,1) DEFAULT 0,
  constructive_input_hours DECIMAL(3,1) DEFAULT 0,
  academic_input_hours DECIMAL(3,1) DEFAULT 0,
  comparison_trigger_count INTEGER DEFAULT 0,
  trigger_source TEXT CHECK (trigger_source IN ('youtube', 'instagram', 'threads', 'conversation', 'news', 'natural')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Checklist (D-1 actions)
CREATE TABLE IF NOT EXISTS setup_checklist (
  id SERIAL PRIMARY KEY,
  task TEXT NOT NULL,
  category TEXT,
  done BOOLEAN DEFAULT FALSE,
  done_date DATE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Synthesis
CREATE TABLE IF NOT EXISTS monthly_synthesis (
  id SERIAL PRIMARY KEY,
  month_year TEXT NOT NULL,
  experiments_done INTEGER DEFAULT 0,
  content_published INTEGER DEFAULT 0,
  clients_pipeline_changes JSONB,
  key_insights TEXT,
  pptx_update_notes TEXT,
  next_month_priorities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strength Tracker (weekly pattern tracking)
CREATE TABLE IF NOT EXISTS strength_tracker (
  id SERIAL PRIMARY KEY,
  week_start DATE NOT NULL,
  new_ideas_count INTEGER DEFAULT 0,
  ideas_box_logged INTEGER DEFAULT 0,
  ideas_deep_analyzed INTEGER DEFAULT 0,
  ideas_main_connected INTEGER DEFAULT 0,
  quick_publishes INTEGER DEFAULT 0,
  weekly_experiments_done INTEGER DEFAULT 0,
  new_domain_purchases INTEGER DEFAULT 0,
  new_hosting_setups INTEGER DEFAULT 0,
  new_sites_built INTEGER DEFAULT 0,
  self_evaluation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - single user, allow all
ALTER TABLE weekly_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_box ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE beliefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_synthesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE strength_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_environment ENABLE ROW LEVEL SECURITY;
ALTER TABLE setup_checklist ENABLE ROW LEVEL SECURITY;

-- Allow anon access for all tables (single user app)
CREATE POLICY "Allow all" ON weekly_kpi FOR ALL USING (true);
CREATE POLICY "Allow all" ON content_items FOR ALL USING (true);
CREATE POLICY "Allow all" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all" ON idea_box FOR ALL USING (true);
CREATE POLICY "Allow all" ON weekly_reports FOR ALL USING (true);
CREATE POLICY "Allow all" ON daily_logs FOR ALL USING (true);
CREATE POLICY "Allow all" ON assets FOR ALL USING (true);
CREATE POLICY "Allow all" ON beliefs FOR ALL USING (true);
CREATE POLICY "Allow all" ON rules FOR ALL USING (true);
CREATE POLICY "Allow all" ON weekly_experiments FOR ALL USING (true);
CREATE POLICY "Allow all" ON collaborators FOR ALL USING (true);
CREATE POLICY "Allow all" ON monthly_synthesis FOR ALL USING (true);
CREATE POLICY "Allow all" ON strength_tracker FOR ALL USING (true);
CREATE POLICY "Allow all" ON input_environment FOR ALL USING (true);
CREATE POLICY "Allow all" ON setup_checklist FOR ALL USING (true);
