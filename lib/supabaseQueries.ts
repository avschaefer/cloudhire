import { supabase } from './supabase';

export async function fetchBehavioralQuestions() {
  const { data, error } = await supabase
    .from('behavioral')
    .select('id, question')
    .order('id', { ascending: true });
  
  if (error) throw new Error(`Error fetching behavioral questions: ${error.message}`);
  return data;
}

export async function fetchCalculationQuestions() {
  const { data, error } = await supabase
    .from('calculations')
    .select('id, question, answer_numerical, answer_explanation')
    .order('id', { ascending: true });
  
  if (error) throw new Error(`Error fetching calculation questions: ${error.message}`);
  return data;
}

export async function fetchMultipleChoiceQuestions() {
  const { data, error } = await supabase
    .from('multiple_choice')
    .select('id, question, option_a, option_b, option_c, option_d, correct_answer')
    .order('id', { ascending: true });
  
  if (error) throw new Error(`Error fetching multiple choice questions: ${error.message}`);
  return data;
}

export async function fetchResponseQuestions() {
  const { data, error } = await supabase
    .from('response')
    .select('id, question')
    .order('id', { ascending: true });
  
  if (error) throw new Error(`Error fetching response questions: ${error.message}`);
  return data;
} 