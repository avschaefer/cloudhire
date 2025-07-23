import { supabase } from './supabase';

export async function submitBehavioralResponse({ questionId, userResponse, aiResponse, userId }: { questionId: number, userResponse: string, aiResponse: string, userId: number }) {
  const { data, error } = await supabase
    .from('behavioral')
    .update({ user_response: userResponse, ai_response: aiResponse })
    .eq('id', questionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Error submitting behavioral response: ${error.message}`);
  return data;
}

export async function submitCalculationResponse({ questionId, userResponseNumerical, userResponseText, aiResponse, userId }: { questionId: number, userResponseNumerical: number, userResponseText: string, aiResponse: string, userId: number }) {
  const { data, error } = await supabase
    .from('calculations')
    .update({ 
      user_response_numerical: userResponseNumerical, 
      user_response_text: userResponseText, 
      ai_response: aiResponse 
    })
    .eq('id', questionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Error submitting calculation response: ${error.message}`);
  return data;
}

export async function submitMultipleChoiceResponse({ questionId, userResponse, aiResponse, userId }: { questionId: number, userResponse: string, aiResponse: string, userId: number }) {
  const { data, error } = await supabase
    .from('multiple_choice')
    .update({ user_response: userResponse, ai_response: aiResponse })
    .eq('id', questionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Error submitting multiple choice response: ${error.message}`);
  return data;
}

export async function submitGeneralResponse({ questionId, userResponse, aiResponse, userId }: { questionId: number, userResponse: string, aiResponse: string, userId: number }) {
  const { data, error } = await supabase
    .from('response')
    .update({ user_response: userResponse, ai_response: aiResponse })
    .eq('id', questionId)
    .eq('user_id', userId);

  if (error) throw new Error(`Error submitting general response: ${error.message}`);
  return data;
}

export async function submitUserBio({ firstName, lastName, email, position, motivation, educationalDegree, experience }: { firstName: string, lastName: string, email: string, position: string, motivation: string, educationalDegree: string, experience: string }) {
  const { data, error } = await supabase
    .from('user_bio')
    .insert([
      { first_name: firstName, last_name: lastName, email, position, motivation, educational_degree: educationalDegree, experience }
    ])
    .select('id')
    .single();

  if (error) throw new Error(`Error submitting user bio: ${error.message}`);
  return data.id;
} 