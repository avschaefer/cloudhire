// D1 Database utilities for Cloudflare
export interface D1Database {
  prepare(query: string): D1PreparedStatement
  dump(): Promise<ArrayBuffer>
  batch(statements: D1PreparedStatement[]): Promise<D1Result[]>
  exec(query: string): Promise<D1ExecResult>
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement
  first(): Promise<any>
  run(): Promise<D1Result>
  all(): Promise<D1Result>
}

export interface D1Result {
  results?: any[]
  success: boolean
  error?: string
  meta: {
    duration: number
    size_after: number
    rows_read: number
    rows_written: number
  }
}

export interface D1ExecResult {
  count: number
  duration: number
}

// Database operations
export class ExamDatabase {
  constructor(private db: D1Database) {}

  async saveExamResult(examResult: any): Promise<boolean> {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO exam_results (
          user_name, user_email, position, total_score, max_score, 
          completed_at, time_spent, answers_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const result = await stmt
        .bind(
          examResult.userInfo.name,
          examResult.userInfo.email,
          examResult.userInfo.position,
          examResult.totalScore,
          examResult.maxScore,
          examResult.completedAt,
          examResult.timeSpent,
          JSON.stringify(examResult.answers),
        )
        .run()

      return result.success
    } catch (error) {
      console.error("Error saving exam result:", error)
      return false
    }
  }

  async getExamResults(limit = 50): Promise<any[]> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM exam_results 
        ORDER BY completed_at DESC 
        LIMIT ?
      `)

      const result = await stmt.bind(limit).all()
      return result.results || []
    } catch (error) {
      console.error("Error fetching exam results:", error)
      return []
    }
  }

  async getExamResultByEmail(email: string): Promise<any | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM exam_results 
        WHERE user_email = ? 
        ORDER BY completed_at DESC 
        LIMIT 1
      `)

      const result = await stmt.bind(email).first()
      return result || null
    } catch (error) {
      console.error("Error fetching exam result:", error)
      return null
    }
  }
}

// Helper function to get database instance
export function getDatabase(): D1Database | null {
  // This will be available in Cloudflare Workers environment
  if (typeof globalThis !== "undefined" && "DB" in globalThis) {
    return (globalThis as any).DB
  }
  return null
}

// Helper function to create database instance
export function createExamDatabase(): ExamDatabase | null {
  const db = getDatabase()
  return db ? new ExamDatabase(db) : null
}
