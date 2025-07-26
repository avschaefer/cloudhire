import { supabase, supabaseCall } from './supabase';

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
  return supabaseCall(async () => {
    const { data, error } = await supabase.from('user_responses').insert([{ user_id: userId, question_type: questionType, question_id: questionId, response_text: responseText, response_numerical: responseNumerical, ai_feedback: aiFeedback, is_correct: isCorrect }]);
    if (error) throw error;
    return data;
  });
}

export async function submitExamResponses(userId: string, examData: { multipleChoice: Record<string, string>; concepts: Record<string, string>; calculations: Record<string, string> }) {
  const responses: any[] = [];
  Object.entries(examData.multipleChoice).forEach(([qid, responseText]) => {
    if (responseText.trim()) {
      responses.push({ user_id: userId, question_type: 'multiple_choice', question_id: parseInt(qid), response_text: responseText });
    }
  });
  Object.entries(examData.concepts).forEach(([qid, responseText]) => {
    if (responseText.trim()) {
      responses.push({ user_id: userId, question_type: 'response', question_id: parseInt(qid), response_text: responseText });
    }
  });
  const calcMap = new Map<number, {answer?: string; explanation?: string}>();
  Object.entries(examData.calculations).forEach(([key, value]) => {
    const match = key.match(/^(\d+)-(answer|explanation)$/);
    if (match && value.trim()) {
      const qid = parseInt(match[1]);
      const type = match[2];
      if (!calcMap.has(qid)) calcMap.set(qid, {});
      if (type === 'answer') calcMap.get(qid)!.answer = value;
      else calcMap.get(qid)!.explanation = value;
    }
  });
  for (const [qid, vals] of calcMap) {
    responses.push({
      user_id: userId,
      question_type: 'calculation',
      question_id: qid,
      response_numerical: vals.answer ? parseFloat(vals.answer) : null,
      response_text: vals.explanation || null
    });
  }
  if (responses.length > 0) {
    const { error } = await supabase.from('user_responses').insert(responses);
    if (error) throw new Error(`Error submitting exam responses: ${error.message}`);
  }
}
