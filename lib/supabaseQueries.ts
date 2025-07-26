import { supabase, supabaseCall } from './supabase';

export async function fetchUserInfo(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // No user found, return test user data for development
      console.log('No user found, returning test data for userId:', userId);
      return {
        id: userId,
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com',
        degree_type: 'Bachelor',
        degree_name: 'Computer Science',
        years_experience: '3'
      };
    }
    
    if (error) throw new Error(`Error fetching user info: ${error.message}`);
    return data;
  } catch (err) {
    console.error('fetchUserInfo error:', err);
    // Fallback for test mode
    return {
      id: userId,
      first_name: 'Test',
      last_name: 'User', 
      email: 'test@example.com',
      degree_type: 'Bachelor',
      degree_name: 'Computer Science',
      years_experience: '3'
    };
  }
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
  return (count ?? 0) > 0;
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

export async function fetchUserExamData(userId: string): Promise<{ multipleChoice: Record<string, string>; concepts: Record<string, string>; calculations: Record<string, string> }> {
  const { data, error } = await supabase.from('user_responses').select('*').eq('user_id', userId);
  if (error) throw new Error(`Error fetching user responses: ${error.message}`);
  const examData: { multipleChoice: Record<string, string>; concepts: Record<string, string>; calculations: Record<string, string> } = { multipleChoice: {}, concepts: {}, calculations: {} };
  data.forEach((res: { question_type: string; question_id: number; response_text?: string; response_numerical?: number }) => {
    const qid = res.question_id.toString();
    if (res.question_type === 'multiple_choice') {
      examData.multipleChoice[qid] = res.response_text || '';
    } else if (res.question_type === 'response') {
      examData.concepts[qid] = res.response_text || '';
    } else if (res.question_type === 'calculation') {
      examData.calculations[`${qid}-answer`] = res.response_numerical?.toString() || '';
      examData.calculations[`${qid}-explanation`] = res.response_text || '';
    }
  });
  return examData;
}
