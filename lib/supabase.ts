import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  }
});

export async function supabaseCall(func: () => Promise<any>): Promise<any> {
  try {
    return await func();
  } catch (error: any) {
    console.error('Supabase error:', error);
    throw new Error(`Supabase request failed: ${error.message}`);
  }
}
