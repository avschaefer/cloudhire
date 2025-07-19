// Configuration utilities for environment variables
// Provides fallbacks and type safety for all environment variables

export const getResendConfig = () => ({
  apiKey: process.env.RESEND_API_KEY || "",
  fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
  toEmail: process.env.RESEND_TO_EMAIL || "admin@example.com",
})

export const getXaiConfig = () => ({
  apiKey: process.env.XAI_API_KEY || "",
})

export const getSiteConfig = () => ({
  url: process.env.SITE_URL || "http://localhost:3000",
})

export const getAiWorkerConfig = () => ({
  url: process.env.AI_GRADER_WORKER_URL || "https://fallback-worker.example.com",
})

export const isDevelopment = () => process.env.NODE_ENV === "development"
export const isProduction = () => process.env.NODE_ENV === "production"

// Database configuration
export const getDbConfig = () => ({
  // D1 binding will be available in Cloudflare environment
  binding: "DB",
})
