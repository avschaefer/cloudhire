-- Create exam_sessions table
CREATE TABLE IF NOT EXISTS exam_sessions (
    id TEXT PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    status TEXT NOT NULL DEFAULT 'in_progress',
    total_score REAL,
    max_score REAL,
    percentage REAL,
    report_data TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create question_responses table
CREATE TABLE IF NOT EXISTS question_responses (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    question_id INTEGER NOT NULL,
    answer TEXT NOT NULL,
    time_spent INTEGER NOT NULL,
    score REAL,
    max_score REAL,
    feedback TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (session_id) REFERENCES exam_sessions (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_sessions_status ON exam_sessions(status);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_created_at ON exam_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_question_responses_session_id ON question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_question_responses_question_id ON question_responses(question_id);
