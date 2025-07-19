import type { GradingResult } from "@/utils/grader"
import { getDbBinding, isServiceBound } from "@/lib/config"

export interface ReportData {
  submissionId: string
  candidateName: string
  position: string
  examData: any
  gradingResult: GradingResult
  submittedAt: Date
  emailId?: string
}

export async function saveReportToD1(reportData: ReportData): Promise<void> {
  try {
    if (!isServiceBound()) {
      console.log("D1 not available in current environment - skipping database save")
      return
    }

    const { getRequestContext } = await import("@cloudflare/next-on-pages")
    const { env } = getRequestContext()
    const dbBinding = getDbBinding()

    const stmt = env[dbBinding]
      .prepare(`
      INSERT INTO exam_reports (
        submission_id, 
        candidate_name, 
        position, 
        overall_score,
        recommendation,
        data, 
        email_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        reportData.submissionId,
        reportData.candidateName,
        reportData.position,
        reportData.gradingResult.overallScore,
        reportData.gradingResult.recommendation,
        JSON.stringify(reportData),
        reportData.emailId || null,
        new Date().toISOString(),
      )

    await stmt.run()
    console.log("Report saved to D1 database:", reportData.submissionId)
  } catch (error) {
    console.error("Failed to save report to D1:", error)
  }
}

export async function getReportById(id: string): Promise<ReportData | null> {
  try {
    if (!isServiceBound()) {
      console.log("D1 not available in current environment")
      return null
    }

    const { getRequestContext } = await import("@cloudflare/next-on-pages")
    const { env } = getRequestContext()
    const dbBinding = getDbBinding()

    const result = await env[dbBinding]
      .prepare("SELECT data FROM exam_reports WHERE submission_id = ?")
      .bind(id)
      .first()

    return result ? JSON.parse(result.data as string) : null
  } catch (error) {
    console.error("Failed to get report from D1:", error)
    return null
  }
}

export async function getAllReports(): Promise<
  Array<{
    id: number
    submission_id: string
    candidate_name: string
    position: string
    overall_score: number
    recommendation: string
    created_at: string
  }>
> {
  try {
    if (!isServiceBound()) {
      console.log("D1 not available in current environment")
      return []
    }

    const { getRequestContext } = await import("@cloudflare/next-on-pages")
    const { env } = getRequestContext()
    const dbBinding = getDbBinding()

    const results = await env[dbBinding]
      .prepare(`
        SELECT 
          id, 
          submission_id, 
          candidate_name, 
          position, 
          overall_score,
          recommendation,
          created_at 
        FROM exam_reports 
        ORDER BY created_at DESC
      `)
      .all()

    return results.results || []
  } catch (error) {
    console.error("Failed to get reports from D1:", error)
    return []
  }
}

export async function getReportStats(): Promise<{
  totalReports: number
  averageScore: number
  recommendationCounts: { [key: string]: number }
}> {
  try {
    if (!isServiceBound()) {
      return { totalReports: 0, averageScore: 0, recommendationCounts: {} }
    }

    const { getRequestContext } = await import("@cloudflare/next-on-pages")
    const { env } = getRequestContext()
    const dbBinding = getDbBinding()

    const [countResult, avgResult, recResult] = await Promise.all([
      env[dbBinding].prepare("SELECT COUNT(*) as count FROM exam_reports").first(),
      env[dbBinding].prepare("SELECT AVG(overall_score) as avg FROM exam_reports").first(),
      env[dbBinding]
        .prepare("SELECT recommendation, COUNT(*) as count FROM exam_reports GROUP BY recommendation")
        .all(),
    ])

    const recommendationCounts: { [key: string]: number } = {}
    recResult.results?.forEach((row: any) => {
      recommendationCounts[row.recommendation] = row.count
    })

    return {
      totalReports: countResult?.count || 0,
      averageScore: Math.round(avgResult?.avg || 0),
      recommendationCounts,
    }
  } catch (error) {
    console.error("Failed to get report stats from D1:", error)
    return { totalReports: 0, averageScore: 0, recommendationCounts: {} }
  }
}
