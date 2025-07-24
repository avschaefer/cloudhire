import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Validate the admin code against the environment variable
    const adminCode = process.env.NEXT_PUBLIC_ADMIN_CODE;
    
    if (!adminCode) {
      return NextResponse.json(
        { error: 'Admin code not configured' },
        { status: 500 }
      );
    }

    if (code !== adminCode) {
      return NextResponse.json(
        { error: 'Invalid admin code' },
        { status: 401 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Admin authentication successful'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
