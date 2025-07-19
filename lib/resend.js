// lib/resend.js - Reusable Resend client with runtime env check
import { Resend } from 'resend';

let resendClient;  // Lazy-init singleton

export function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY environment variable');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendEmail({ to, subject, html }) {
  const resend = getResendClient();
  const from = process.env.RESEND_FROM_EMAIL || 'default@cloudhire.app';
  try {
    const data = await resend.emails.send({ from, to, subject, html });
    return data;
  } catch (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }
}