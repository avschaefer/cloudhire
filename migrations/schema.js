// migrations/schema.js
export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    questions JSONB NOT NULL,
    responses JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    exam_id INTEGER REFERENCES exams(id),
    score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`; 