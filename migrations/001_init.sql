-- Database schema for exam reports
CREATE TABLE exam_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT UNIQUE NOT NULL,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  position TEXT NOT NULL,
  exam_data TEXT NOT NULL,
  grading_result TEXT,
  email_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_submission_id ON exam_reports(submission_id);
CREATE INDEX idx_candidate_email ON exam_reports(candidate_email);
CREATE INDEX idx_created_at ON exam_reports(created_at);
