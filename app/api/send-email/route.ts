// app/api/send-email/route.js - Modular email route
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';  // Import reusable function

export const runtime = 'edge';  // Cloudflare compat

export async function POST(request) {
  try {
    const { to = process.env.RESEND_TO_EMAIL, subject, html, reportData } = await request.json();  // Payload e.g., from exam submit
    // Optional: Generate report HTML if not provided (modular)
    const reportHtml = html || `<p>Exam Report: ${JSON.stringify(reportData)}</p><p>Site: ${process.env.SITE_URL}</p>`;
    const data = await sendEmail({ to, subject: subject || 'Exam Report', html: reportHtml });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}