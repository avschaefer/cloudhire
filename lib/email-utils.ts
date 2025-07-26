import { Resend } from 'resend';

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

export async function sendAiGradedReport(report, toEmail) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: toEmail || process.env.RESEND_TO_EMAIL,
    subject: 'Cloudhire AI Graded Report',
    text: `Report Details: ${JSON.stringify(report, null, 2)}` // Or HTML template
  });
  if (error) throw new Error(`Resend error: ${error.message}`);
  return data;
}
