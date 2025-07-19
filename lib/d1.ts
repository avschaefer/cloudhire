// Cloudflare D1 integration module
// This will be used when deploying to Cloudflare Pages

export interface ReportData {
  submissionId: string
  candidateName: string
  position: string
  examData: any
  gradingResult: any
  submittedAt: Date
  emailId?: string
}

// Note: This requires Cloudflare environment
export async function saveReportToD1(reportData: ReportData) {
  try {
    // In Cloudflare environment, we would use:
    // const { env } = getRequestContext();
    // const stmt = env.DB.prepare('INSERT INTO exam_reports (submission_id, candidate_name, position, data, submitted_at) VALUES (?, ?, ?, ?, ?)').bind(
    //   reportData.submissionId,
    //   reportData.candidateName,
    //   reportData.position,
    //   JSON.stringify(reportData),
    //   reportData.submittedAt.toISOString()
    // );
    // await stmt.run();

    console.log("D1 save would happen here in Cloudflare environment:", reportData.submissionId)
  } catch (error) {
    console.error("Failed to save report to D1:", error)
  }
}

export async function getReportById(id: string): Promise<ReportData | null> {
  try {
    // In Cloudflare environment:
    // const { env } = getRequestContext();
    // const result = await env.DB.prepare('SELECT data FROM exam_reports WHERE submission_id = ?').bind(id).first();
    // return result ? JSON.parse(result.data as string) : null;

    console.log("D1 fetch would happen here in Cloudflare environment:", id)
    return null
  } catch (error) {
    console.error("Failed to fetch report from D1:", error)
    return null
  }
}

export async function getAllReports(): Promise<ReportData[]> {
  try {
    // In Cloudflare environment:
    // const { env } = getRequestContext();
    // const results = await env.DB.prepare('SELECT data FROM exam_reports ORDER BY submitted_at DESC').all();
    // return results.results.map(row => JSON.parse(row.data as string));

    console.log("D1 fetch all would happen here in Cloudflare environment")
    return []
  } catch (error) {
    console.error("Failed to fetch all reports from D1:", error)
    return []
  }
}
