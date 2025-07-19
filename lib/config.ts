// Configuration for the exam application
export const config = {
  // Database configuration
  database: {
    enabled: process.env.DATABASE_URL ? true : false,
    url: process.env.DATABASE_URL,
  },

  // AI Worker configuration
  aiWorker: {
    enabled: process.env.AI_GRADER_WORKER_URL ? true : false,
    url: process.env.AI_GRADER_WORKER_URL,
  },

  // Email configuration
  email: {
    enabled: process.env.RESEND_API_KEY ? true : false,
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
    hiringManagerEmail: process.env.NEXT_PUBLIC_HIRING_MANAGER_EMAIL || "hiring@example.com",
  },

  // Exam settings
  exam: {
    timeLimit: 60, // minutes
    questionsPerPage: 1,
    allowBackNavigation: true,
    autoSave: true,
  },
}

export function getConfig() {
  return config
}

export function isDatabaseEnabled(): boolean {
  return config.database.enabled
}

export function isAIWorkerEnabled(): boolean {
  return config.aiWorker.enabled
}

export function isEmailEnabled(): boolean {
  return config.email.enabled
}
