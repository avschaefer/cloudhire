// lib/config.ts - Centralized configuration management
export interface Config {
  // AI Configuration
  ai: {
    xaiApiKey: string;
    graderWorkerUrl: string;
  };
  
  // Site Configuration
  site: {
    url: string;
  };
  
  // Database Configuration
  database: {
    binding: string;
    name: string;
  };
}

function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnvVar(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export function getConfig(): Config {
  return {
    ai: {
      xaiApiKey: getRequiredEnvVar('XAI_API_KEY'),
      graderWorkerUrl: getOptionalEnvVar('AI_GRADER_WORKER_URL'),
    },
    site: {
      url: getOptionalEnvVar('SITE_URL', 'https://www.cloudhire.app'),
    },
    database: {
      binding: 'DB',
      name: 'cloudhire-db',
    },
  };
}

// Validation function to check all required config on app startup
export function validateConfig(): void {
  try {
    getConfig();
    console.log('✅ Configuration validated successfully');
  } catch (error) {
    console.error('❌ Configuration validation failed:', error);
    throw error;
  }
}

// Helper functions for specific config sections
export function getAiConfig() {
  return getConfig().ai;
}

export function getSiteConfig() {
  return getConfig().site;
}

export function getDatabaseConfig() {
  return getConfig().database;
}
