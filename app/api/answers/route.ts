import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.from('UserAnswer').select('*');
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createSupabaseClient();
  const { userId, questionId, answerText } = await request.json();
  const { data, error } = await supabase.from('UserAnswer').insert({ userId, questionId, answerText }).select();
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json(data);
}
