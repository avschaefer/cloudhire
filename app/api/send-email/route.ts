// app/api/send-email/route.ts - Modular email route with enhanced error handling
import { NextResponse } from 'next/server';
import { sendEmail, sendReportEmail, EmailError } from '@/lib/email-utils';
import { validateEmailConfig } from '@/lib/email-utils';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Validate email configuration
    if (!validateEmailConfig()) {
      return NextResponse.json(
        { error: 'Email configuration is invalid' }, 
        { status: 500 }
      );
    }

    const body = await request.json();
    const { to, subject, html, reportData, userBio, examResult } = body;

    let emailData;

    if (reportData && userBio && examResult) {
      // Send comprehensive report email
      emailData = await sendReportEmail({
        examResult,
        userBio,
        reportHtml: html,
        customSubject: subject
      });
    } else {
      // Send simple email
      emailData = await sendEmail({
        to: to || process.env.RESEND_TO_EMAIL!,
        subject: subject || 'CloudHire Notification',
        html: html || `<p>Exam Report: ${JSON.stringify(reportData)}</p>`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      data: emailData
    });

  } catch (error) {
    console.error('Email API error:', error);
    
    if (error instanceof EmailError) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to send email: ${errorMessage}` }, 
      { status: 500 }
    );
  }
}
