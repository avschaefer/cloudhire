-- Create exam_results table for storing exam submissions
CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    position TEXT NOT NULL,
    company TEXT,
    session_id TEXT UNIQUE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    total_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    percentage INTEGER NOT NULL,
    results TEXT NOT NULL, -- JSON string of detailed results
    overall_feedback TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_session_id ON exam_results(session_id);
CREATE INDEX IF NOT EXISTS idx_candidate_email ON exam_results(candidate_email);
CREATE INDEX IF NOT EXISTS idx_created_at ON exam_results(created_at);

-- Create questions table for dynamic question management
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'Multiple Choice', 'Open Ended', 'Calculation'
    category TEXT NOT NULL,
    difficulty TEXT NOT NULL, -- 'Easy', 'Medium', 'Hard'
    points INTEGER DEFAULT 10,
    options TEXT, -- JSON string for multiple choice options
    correct_answer TEXT, -- For multiple choice questions
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Create index for questions
CREATE INDEX IF NOT EXISTS idx_question_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_is_active ON questions(is_active);

-- Insert sample questions
INSERT OR IGNORE INTO questions (id, question_text, question_type, category, difficulty, points, options) VALUES
(1, 'What is the primary purpose of a database index?', 'Multiple Choice', 'Database', 'Easy', 10, '["Improve query performance", "Store data", "Backup data", "Delete records"]'),
(2, 'Explain the difference between SQL and NoSQL databases.', 'Open Ended', 'Database', 'Medium', 15, NULL),
(3, 'Calculate the time complexity of binary search.', 'Calculation', 'Algorithms', 'Medium', 15, NULL),
(4, 'What is the difference between GET and POST HTTP methods?', 'Multiple Choice', 'Web Development', 'Easy', 10, '["GET retrieves data, POST sends data", "GET is secure, POST is not", "GET is faster, POST is slower", "No difference"]'),
(5, 'Describe how you would implement user authentication in a web application.', 'Open Ended', 'Security', 'Hard', 20, NULL),
(6, 'Calculate the space complexity of a recursive factorial function.', 'Calculation', 'Algorithms', 'Medium', 15, NULL),
(7, 'What is the purpose of CSS Grid?', 'Multiple Choice', 'Frontend', 'Easy', 10, '["Layout design", "Database queries", "Server requests", "File storage"]'),
(8, 'Explain the concept of microservices architecture.', 'Open Ended', 'Architecture', 'Hard', 20, NULL),
(9, 'Calculate the number of possible combinations for a 4-digit PIN.', 'Calculation', 'Mathematics', 'Easy', 10, NULL),
(10, 'What is the main advantage of using TypeScript over JavaScript?', 'Multiple Choice', 'Programming', 'Medium', 15, '["Type safety", "Faster execution", "Smaller file size", "Better graphics"]');
