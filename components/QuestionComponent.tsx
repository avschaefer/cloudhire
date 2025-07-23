import { useState, useEffect } from 'react';
import { fetchMultipleChoiceQuestions, fetchCalculationQuestions, fetchBehavioralQuestions, fetchResponseQuestions } from '../lib/supabaseQueries';

export default function QuestionComponent({ questionType }: { questionType: 'multiple_choice' | 'calculation' | 'behavioral' | 'response' }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      try {
        let data;
        switch (questionType) {
          case 'multiple_choice':
            data = await fetchMultipleChoiceQuestions();
            break;
          case 'calculation':
            data = await fetchCalculationQuestions();
            break;
          case 'behavioral':
            data = await fetchBehavioralQuestions();
            break;
          case 'response':
            data = await fetchResponseQuestions();
            break;
          default:
            throw new Error('Invalid question type');
        }
        setQuestions(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [questionType]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>{q.question}</div>
      ))}
    </div>
  );
} 