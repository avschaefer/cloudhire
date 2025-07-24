// lib/envConfig.js
export function getEnv(key) {
  return process.env[key];
}

// Admin code configuration
export function getAdminCode() {
  return process.env.NEXT_PUBLIC_ADMIN_CODE;
}
