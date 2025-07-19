export function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
    toEmail: process.env.RESEND_TO_EMAIL || "hiring@example.com",
  }
}

export function getXaiConfig() {
  return {
    apiKey: process.env.XAI_API_KEY || "",
  }
}

export function getAiWorkerConfig() {
  return {
    url: process.env.AI_GRADER_WORKER_URL || "https://ai-grader-worker.youraccount.workers.dev/",
  }
}

export function getSiteConfig() {
  return {
    url: process.env.SITE_URL || "https://cloudhire.pages.dev",
  }
}

export function getWorkerUrl() {
  return getAiWorkerConfig().url
}
