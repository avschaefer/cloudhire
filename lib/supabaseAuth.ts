import { supabase, supabaseCall } from './supabase';

export async function generateMagicLink(email: string): Promise<string> {
  return supabaseCall(async () => {
    const { data, error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
    return (data as any).properties?.action_link || 'Link generated - check Supabase dashboard for details';
  });
}

export async function getCurrentUser() {
  return supabaseCall(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  });
}

export async function checkAdminRole(userId: string): Promise<boolean> {
  return supabaseCall(async () => {
    const { data } = await supabase.from('user_info').select('role').eq('id', userId).single();
    return data?.role === 'admin';
  });
}

export async function logout(): Promise<void> {
  return supabaseCall(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  });
} 