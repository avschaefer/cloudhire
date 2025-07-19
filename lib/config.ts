export function getResendApiKey(): string {
  return process.env.RESEND_API_KEY || ""
}

export function getResendFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || "noreply@example.com"
}

export function getResendToEmail(): string {
  return process.env.RESEND_TO_EMAIL || "hiring@example.com"
}

export function getSiteUrl(): string {
  return process.env.SITE_URL || "https://localhost:3000"
}

export function getXaiApiKey(): string {
  return process.env.XAI_API_KEY || ""
}

export function getAiWorkerUrl(): string {
  return process.env.AI_GRADER_WORKER_URL || ""
}

export function getDatabaseUrl(): string {
  return process.env.DATABASE_URL || ""
}
