import { useState, useEffect } from 'react';
import QuestionComponent from './QuestionComponent';
import { supabase } from '../lib/supabase';

import { submitUserResponse } from '../lib/supabaseSubmissions';

export default function ExamDashboard({ userId }: { userId: string }) {
  const [responses, setResponses] = useState<any[]>([]);
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'calculation' | 'behavioral' | 'response'>('multiple_choice');

  useEffect(() => {
    async function loadResponses() {
      const { data, error } = await supabase.from('user_responses').select('*').eq('user_id', userId);
      if (!error) setResponses(data);
    }
    loadResponses();
  }, [userId]);

  const handleAnswer = async ({ questionId, answer }: { questionId: number, answer: string }) => {
    const responseNumerical = questionType === 'calculation' ? parseFloat(answer) : undefined;
    const responseText = questionType !== 'calculation' ? answer : undefined;
    await submitUserResponse({
      userId,
      questionType,
      questionId,
      responseText,
      responseNumerical,
      aiFeedback: undefined,
      isCorrect: undefined
    });
    const { data } = await supabase.from('user_responses').select('*').eq('user_id', userId);
    setResponses(data ?? []);
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">Exam Dashboard</h3>
      <select value={questionType} onChange={(e) => setQuestionType(e.target.value as any)} className="mt-2 p-2 border rounded">
        <option value="multiple_choice">Multiple Choice</option>
        <option value="calculation">Calculation</option>
        <option value="behavioral">Behavioral</option>
        <option value="response">Response</option>
      </select>
      <QuestionComponent questionType={questionType} onAnswer={handleAnswer} />
      <h4 className="mt-4 text-md font-semibold">Your Responses</h4>
      <ul className="list-disc pl-5">
        {responses.map((resp) => (
          <li key={resp.id}>{resp.question_type}: {resp.response_text || resp.response_numerical}</li>
        ))}
      </ul>
    </div>
  );
} 