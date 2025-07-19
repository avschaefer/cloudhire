export interface ExamSession {
  id: string
  candidateName: string
  candidateEmail: string
  startTime: string
  endTime?: string
  status: "in_progress" | "completed" | "abandoned"
  totalScore?: number
  maxScore?: number
  percentage?: number
  reportData?: string
  createdAt: string
  updatedAt: string
}

export interface QuestionResponse {
  id: string
  sessionId: string
  questionId: number
  answer: string
  timeSpent: number
  score?: number
  maxScore?: number
  feedback?: string
  createdAt: string
}

// Type for Cloudflare D1 database binding
interface D1Database {
  prepare(query: string): D1PreparedStatement
  exec(query: string): Promise<D1ExecResult>
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement
  first<T = any>(): Promise<T | null>
  all<T = any>(): Promise<D1Result<T>>
  run(): Promise<D1RunResult>
}

interface D1Result<T = any> {
  results: T[]
  success: boolean
  meta: any
}

interface D1RunResult {
  success: boolean
  meta: {
    changes: number
    last_row_id: number
    duration: number
  }
}

interface D1ExecResult {
  count: number
  duration: number
}

// Get D1 database instance (available in Cloudflare Workers/Pages environment)
function getDatabase(): D1Database | null {
  // In Cloudflare environment, D1 binding is available as global
  if (typeof globalThis !== "undefined" && (globalThis as any).DB) {
    return (globalThis as any).DB as D1Database
  }

  // In development or when D1 is not available
  return null
}

export async function createExamSession(candidateName: string, candidateEmail: string): Promise<string> {
  const db = getDatabase()

  if (!db) {
    // Fallback: generate a session ID without database storage
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  try {
    await db
      .prepare(`
        INSERT INTO exam_sessions (
          id, candidate_name, candidate_email, start_time, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(sessionId, candidateName, candidateEmail, now, "in_progress", now, now)
      .run()

    return sessionId
  } catch (error) {
    console.error("Error creating exam session:", error)
    // Return session ID even if database save fails
    return sessionId
  }
}

export async function saveQuestionResponse(
  sessionId: string,
  questionId: number,
  answer: string,
  timeSpent: number,
): Promise<void> {
  const db = getDatabase()

  if (!db) {
    console.warn("Database not available, skipping question response save")
    return
  }

  const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  try {
    await db
      .prepare(`
        INSERT INTO question_responses (
          id, session_id, question_id, answer, time_spent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(responseId, sessionId, questionId, answer, timeSpent, now)
      .run()
  } catch (error) {
    console.error("Error saving question response:", error)
  }
}

export async function completeExamSession(
  sessionId: string,
  totalScore: number,
  maxScore: number,
  percentage: number,
  reportData: any,
): Promise<void> {
  const db = getDatabase()

  if (!db) {
    console.warn("Database not available, skipping exam completion save")
    return
  }

  const now = new Date().toISOString()

  try {
    await db
      .prepare(`
        UPDATE exam_sessions 
        SET end_time = ?, status = ?, total_score = ?, max_score = ?, percentage = ?, 
            report_data = ?, updated_at = ?
        WHERE id = ?
      `)
      .bind(now, "completed", totalScore, maxScore, percentage, JSON.stringify(reportData), now, sessionId)
      .run()
  } catch (error) {
    console.error("Error completing exam session:", error)
  }
}

export async function getExamSession(sessionId: string): Promise<ExamSession | null> {
  const db = getDatabase()

  if (!db) {
    console.warn("Database not available, cannot retrieve exam session")
    return null
  }

  try {
    const session = await db.prepare("SELECT * FROM exam_sessions WHERE id = ?").bind(sessionId).first<ExamSession>()

    return session
  } catch (error) {
    console.error("Error retrieving exam session:", error)
    return null
  }
}

export async function getQuestionResponses(sessionId: string): Promise<QuestionResponse[]> {
  const db = getDatabase()

  if (!db) {
    console.warn("Database not available, cannot retrieve question responses")
    return []
  }

  try {
    const result = await db
      .prepare("SELECT * FROM question_responses WHERE session_id = ? ORDER BY created_at")
      .bind(sessionId)
      .all<QuestionResponse>()

    return result.results || []
  } catch (error) {
    console.error("Error retrieving question responses:", error)
    return []
  }
}

export async function getAllExamSessions(): Promise<ExamSession[]> {
  const db = getDatabase()

  if (!db) {
    console.warn("Database not available, cannot retrieve exam sessions")
    return []
  }

  try {
    const result = await db.prepare("SELECT * FROM exam_sessions ORDER BY created_at DESC").all<ExamSession>()

    return result.results || []
  } catch (error) {
    console.error("Error retrieving exam sessions:", error)
    return []
  }
}
