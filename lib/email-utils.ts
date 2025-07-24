export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function formatReportEmail(report: any): string {
  return `Subject: Cloudhire Report\n\n${JSON.stringify(report, null, 2)}`;
}

export function validateEmailConfig(): boolean {
  // TODO: Implement actual email configuration validation
  return true;
} 