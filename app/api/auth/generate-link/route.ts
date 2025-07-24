import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: process.env.SITE_URL || 'http://localhost:3000',
      },
    });

    if (error) {
      console.error('Error generating magic link:', error);
      return NextResponse.json({ error: 'Failed to generate magic link' }, { status: 500 });
    }

    return NextResponse.json({ action_link: data.properties.action_link });

  } catch (error: any) {
    console.error('Generate link error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
