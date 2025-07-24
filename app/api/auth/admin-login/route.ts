import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Admin code is required' }, { status: 400 });
    }

    const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE;

    if (!adminCode) {
      console.error('FATAL: NEXT_PUBLIC_ADMIN_CODE environment variable is not set.');
      return NextResponse.json({ error: 'Server is not configured for admin login.' }, { status: 500 });
    }

    if (code !== adminCode) {
      return NextResponse.json({ error: 'Invalid administrator code.' }, { status: 401 });
    }

    // If the code is correct, simply return a success response.
    // The client will handle the creation of the mock admin session.
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Admin login API error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
