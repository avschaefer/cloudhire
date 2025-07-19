// app/api/send-email/route.js - Modular email route
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/resend';  // Import reusable function

export const runtime = 'nodejs';  // Node.js runtime for better compatibility

export async function POST(request: Request) {
  try {
    const { to = process.env.RESEND_TO_EMAIL, subject, html, reportData } = await request.json();  // Payload e.g., from exam submit
    // Optional: Generate report HTML if not provided (modular)
    const reportHtml = html || `<p>Exam Report: ${JSON.stringify(reportData)}</p><p>Site: ${process.env.SITE_URL}</p>`;
    const data = await sendEmail({ to, subject: subject || 'Exam Report', html: reportHtml });
    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}