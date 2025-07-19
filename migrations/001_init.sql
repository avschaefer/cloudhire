-- Initial database schema for exam submissions
CREATE TABLE IF NOT EXISTS exam_submissions (
    id TEXT PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    position TEXT NOT NULL,
    exam_data TEXT NOT NULL, -- JSON string
    grading_result TEXT NOT NULL, -- JSON string
    submitted_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_exam_submissions_email ON exam_submissions(candidate_email);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_submitted_at ON exam_submissions(submitted_at);

-- Table for storing questions (for future question management)
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    question TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    difficulty TEXT,
    points INTEGER DEFAULT 10,
    options TEXT, -- JSON string for multiple choice options
    correct_answer TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample questions
INSERT OR IGNORE INTO questions (id, question, type, category, difficulty, points) VALUES
(1, 'What is the difference between let and var in JavaScript?', 'Open Ended', 'JavaScript', 'Medium', 10),
(2, 'Explain the concept of closures in JavaScript.', 'Open Ended', 'JavaScript', 'Hard', 15),
(3, 'What is the time complexity of binary search?', 'Multiple Choice', 'Algorithms', 'Medium', 10);
