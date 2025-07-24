import { supabase } from './supabase';

export async function generateMagicLink(email: string): Promise<string> {
  const res = await fetch('/api/auth/generate-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    credentials: 'include'
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Error generating link');
  }

  const { action_link } = await res.json();
  return action_link;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function checkAdminRole(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('user_info').select('role').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
    console.error('Error checking admin role:', error);
    return false;
  }
  return data?.role === 'admin';
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Error logging out: ${error.message}`);
}
