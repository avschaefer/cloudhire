import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('Question').select('*');
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createSupabaseClient();
  const body = await request.json();
  const { data, error } = await supabase.from('Question').insert(body);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
} 