import { supabase } from './supabase';

export async function submitUserInfo({ firstName, lastName, email, degreeType, degreeName, yearsExperience }: { firstName: string, lastName: string, email: string, degreeType: string, degreeName: string, yearsExperience: string }) {
  const { data, error } = await supabase
    .from('user_info')
    .insert([{ first_name: firstName, last_name: lastName, email, degree_type: degreeType, degree_name: degreeName, years_experience: yearsExperience }])
    .select('id')
    .single();
  if (error) throw new Error(`Error submitting user info: ${error.message}`);
  return data.id;
}

export async function submitFileMetadata({ userId, fileType, fileName, bucketName, filePath }: { userId: string, fileType: string, fileName: string, bucketName: string, filePath: string }) {
  const { data, error } = await supabase
    .from('user_files')
    .insert([{ user_id: userId, file_type: fileType, file_name: fileName, bucket_name: bucketName, file_path: filePath }]);
  if (error) throw new Error(`Error submitting file metadata: ${error.message}`);
  return data;
}

export async function submitUserResponse({ userId, questionType, questionId, responseText, responseNumerical, aiFeedback, isCorrect }: { userId: string, questionType: string, questionId: number, responseText?: string, responseNumerical?: number, aiFeedback?: string, isCorrect?: boolean }) {
  const { data, error } = await supabase
    .from('user_responses')
    .insert([{ user_id: userId, question_type: questionType, question_id: questionId, response_text: responseText, response_numerical: responseNumerical, ai_feedback: aiFeedback, is_correct: isCorrect }]);
  if (error) throw new Error(`Error submitting user response: ${error.message}`);
  return data;
} 