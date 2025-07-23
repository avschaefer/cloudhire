import { supabase } from './supabase';

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