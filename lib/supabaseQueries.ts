import { supabase, supabaseCall } from './supabase';

export async function fetchUserInfo(userId: string) {
  const { data, error } = await supabase
    .from('user_info')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw new Error(`Error fetching user info: ${error.message}`);
  return data;
}

export async function fetchMultipleChoiceQuestions() {
  const { data, error } = await supabase
    .from('questions_multiple_choice')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw new Error(`Error fetching multiple choice questions: ${error.message}`);
  return data;
}

export async function fetchCalculationQuestions() {
  const { data, error } = await supabase
    .from('questions_calculations')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw new Error(`Error fetching calculation questions: ${error.message}`);
  return data;
}

export async function fetchBehavioralQuestions() {
  const { data, error } = await supabase
    .from('questions_behavioral')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw new Error(`Error fetching behavioral questions: ${error.message}`);
  return data;
}

export async function fetchResponseQuestions() {
  const { data, error } = await supabase
    .from('questions_response')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw new Error(`Error fetching response questions: ${error.message}`);
  return data;
}

export async function fetchNonBehavioralQuestions() {
  const [mc, response, calc] = await Promise.all([
    fetchMultipleChoiceQuestions(),
    fetchResponseQuestions(),
    fetchCalculationQuestions()
  ]);
  return [...mc, ...response, ...calc];
}

export async function checkBehavioralCompleted(userId: string) {
  const { count, error } = await supabase
    .from('user_responses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('question_type', 'behavioral');
  if (error) throw new Error(`Error checking behavioral completion: ${error.message}`);
  return count > 0;
}

export async function fetchLatestSubmissions(limit: number = 10): Promise<any[]> {
  return supabaseCall(async () => {
    const { data, error } = await supabase.from('user_responses').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  });
}

export async function fetchAllUserResponses(): Promise<any[]> {
  return supabaseCall(async () => {
    const { data, error } = await supabase.from('user_responses').select('*');
    if (error) throw error;
    return data;
  });
}

export async function fetchRecentSubmissions() {
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id,
      submitted_at,
      user_info (
        name,
        email
      )
    `)
    .order('submitted_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching recent submissions:', error);
    throw new Error(`Error fetching recent submissions: ${error.message}`);
  }
  
  return data;
}
