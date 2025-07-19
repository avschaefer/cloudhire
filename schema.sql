-- Cloudflare D1 Database Schema for Exam Reports

CREATE TABLE IF NOT EXISTS exam_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  position TEXT NOT NULL,
  overall_score INTEGER,
  recommendation TEXT,
  data TEXT NOT NULL, -- JSON blob with full report data
  submitted_at DATETIME NOT NULL,
  email_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submission_id ON exam_reports(submission_id);
CREATE INDEX idx_candidate_name ON exam_reports(candidate_name);
CREATE INDEX idx_submitted_at ON exam_reports(submitted_at);
CREATE INDEX idx_recommendation ON exam_reports(recommendation);
