-- Initial schema for exam reports database
CREATE TABLE IF NOT EXISTS exam_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  overall_score INTEGER,
  recommendation TEXT,
  data TEXT NOT NULL, -- JSON blob with full report data
  email_id TEXT, -- Resend email ID for tracking
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_submission_id ON exam_reports(submission_id);
CREATE INDEX IF NOT EXISTS idx_candidate_name ON exam_reports(candidate_name);
CREATE INDEX IF NOT EXISTS idx_created_at ON exam_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_recommendation ON exam_reports(recommendation);
