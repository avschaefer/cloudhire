-- D1 Database schema for exam reports
CREATE TABLE IF NOT EXISTS exam_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON blob containing full report data
  email_id TEXT, -- Resend email ID for tracking
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submission_id ON exam_reports(submission_id);
CREATE INDEX idx_candidate_name ON exam_reports(candidate_name);
CREATE INDEX idx_created_at ON exam_reports(created_at);
