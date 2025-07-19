CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice',  -- e.g., 'multiple_choice', 'short_answer', 'coding'
  options JSON,  -- For multiple-choice options, stored as JSON array
  correct_answer TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);