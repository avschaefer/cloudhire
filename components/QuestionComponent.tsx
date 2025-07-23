import { useState, useEffect } from 'react';
import { fetchMultipleChoiceQuestions, fetchCalculationQuestions, fetchBehavioralQuestions, fetchResponseQuestions } from '../lib/supabaseQueries';

export default function QuestionComponent({ questionType, onAnswer }: { questionType: 'multiple_choice' | 'calculation' | 'behavioral' | 'response', onAnswer: (data: { questionId: number, answer: string }) => void }) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState('');
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
        setSelectedQuestion(data[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, [questionType]);

  if (loading) return <div>Loading...</div>;

  if (!selectedQuestion) return <div>No questions available</div>;

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value);
  const handleSubmit = () => {
    if (onAnswer) onAnswer({ questionId: selectedQuestion.id, answer });
    setAnswer('');
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">{selectedQuestion.question}</h3>
      {questionType === 'multiple_choice' && (
        <div>
          {['a', 'b', 'c', 'd'].map((opt) => (
            <label key={opt} className="block">
              <input
                type="radio"
                name="answer"
                value={opt}
                checked={answer === opt}
                onChange={handleAnswerChange}
              />{' '}
              Option {opt}: {selectedQuestion[`option_${opt}`]}
            </label>
          ))}
        </div>
      )}
      {(questionType === 'calculation' || questionType === 'behavioral' || questionType === 'response') && (
        <div>
          <input
            type={questionType === 'calculation' ? 'number' : 'text'}
            value={answer}
            onChange={handleAnswerChange}
            className="mt-2 p-2 border rounded"
            placeholder="Enter your answer"
          />
        </div>
      )}
      <button onClick={handleSubmit} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        Submit Answer
      </button>
    </div>
  );
} 