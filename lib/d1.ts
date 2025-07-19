import { getD1Database } from "@/lib/config"
import type { ExamResult } from "@/utils/grader"
import type { CandidateInfo, ExamSession } from "@/app/utils/email-service"

export interface ExamRecord {
  id: string
  candidate_name: string
  candidate_email: string
  position: string
  company?: string
  session_id: string
  start_time: string
  end_time: string
  duration: number
  total_score: number
  max_score: number
  percentage: number
  results: string // JSON string
  overall_feedback: string
  created_at: string
}

// Save exam result to D1 database
export const saveExamResult = async (
  candidate: CandidateInfo,
  session: ExamSession,
  result: ExamResult,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getD1Database()

    if (!db) {
      console.log("D1 database not available, skipping save")
      return { success: false, error: "Database not configured" }
    }

    const record: Omit<ExamRecord, "id" | "created_at"> = {
      candidate_name: candidate.name,
      candidate_email: candidate.email,
      position: candidate.position,
      company: candidate.company,
      session_id: session.sessionId,
      start_time: session.startTime.toISOString(),
      end_time: session.endTime.toISOString(),
      duration: session.duration,
      total_score: result.totalScore,
      max_score: result.maxScore,
      percentage: result.percentage,
      results: JSON.stringify(result.results),
      overall_feedback: result.overallFeedback,
    }

    const stmt = db.prepare(`
      INSERT INTO exam_results (
        candidate_name, candidate_email, position, company, session_id,
        start_time, end_time, duration, total_score, max_score, percentage,
        results, overall_feedback, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    await stmt
      .bind(
        record.candidate_name,
        record.candidate_email,
        record.position,
        record.company,
        record.session_id,
        record.start_time,
        record.end_time,
        record.duration,
        record.total_score,
        record.max_score,
        record.percentage,
        record.results,
        record.overall_feedback,
      )
      .run()

    return { success: true }
  } catch (error) {
    console.error("Error saving exam result to D1:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error",
    }
  }
}

// Get exam results by session ID
export const getExamResult = async (sessionId: string): Promise<ExamRecord | null> => {
  try {
    const db = getD1Database()

    if (!db) {
      return null
    }

    const stmt = db.prepare("SELECT * FROM exam_results WHERE session_id = ?")
    const result = await stmt.bind(sessionId).first()

    return result as ExamRecord | null
  } catch (error) {
    console.error("Error getting exam result from D1:", error)
    return null
  }
}

// Get all exam results (for admin view)
export const getAllExamResults = async (): Promise<ExamRecord[]> => {
  try {
    const db = getD1Database()

    if (!db) {
      return []
    }

    const stmt = db.prepare("SELECT * FROM exam_results ORDER BY created_at DESC")
    const results = await stmt.all()

    return results.results as ExamRecord[]
  } catch (error) {
    console.error("Error getting all exam results from D1:", error)
    return []
  }
}

// Delete exam result
export const deleteExamResult = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const db = getD1Database()

    if (!db) {
      return { success: false, error: "Database not configured" }
    }

    const stmt = db.prepare("DELETE FROM exam_results WHERE session_id = ?")
    await stmt.bind(sessionId).run()

    return { success: true }
  } catch (error) {
    console.error("Error deleting exam result from D1:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Database error",
    }
  }
}
