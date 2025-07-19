// Configuration utilities for environment variables
export const getResendApiKey = (): string => {
  return process.env.RESEND_API_KEY || ""
}

export const getResendFromEmail = (): string => {
  return process.env.RESEND_FROM_EMAIL || "noreply@example.com"
}

export const getResendToEmail = (): string => {
  return process.env.RESEND_TO_EMAIL || "admin@example.com"
}

export const getSiteUrl = (): string => {
  return process.env.SITE_URL || "https://localhost:3000"
}

export const getXaiApiKey = (): string => {
  return process.env.XAI_API_KEY || ""
}

export const getAiGraderWorkerUrl = (): string => {
  return process.env.AI_GRADER_WORKER_URL || ""
}

export const getDatabaseUrl = (): string => {
  return process.env.DATABASE_URL || ""
}

// Check if we're in a Cloudflare environment
export const isCloudflareEnvironment = (): boolean => {
  return typeof process.env.CF_PAGES !== "undefined"
}

// Get database binding for Cloudflare D1
export const getD1Database = (): any => {
  if (typeof globalThis !== "undefined" && "DB" in globalThis) {
    return (globalThis as any).DB
  }
  return null
}
