'use client'

import { useSearchParams } from 'next/navigation';
import ExamPage from '../components/exam-page';
import { createTestSession } from '../../lib/supabaseAuth';
import { Question } from '../../types/exam';

export default function Exam() {
  const searchParams = useSearchParams();
  const isTest = searchParams.get('test') === 'true';

  if (!isTest) {
    return <div className="min-h-screen flex items-center justify-center">Not authorized</div>;
  }

  const testUser = createTestSession();
  const mockBio = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    position: 'Developer',
    experience: '5 years',
    motivation: 'Testing',
    educationalDegree: 'BS',
  };
  const mockQuestions = [] as any;
  const mockData = { multipleChoice: {}, concepts: {}, calculations: {} };
  const mockOnComplete = () => console.log('Test complete');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ExamPage
        initialExamData={mockData}
        userBio={mockBio}
        onComplete={mockOnComplete}
        questions={mockQuestions}
        userId={Number(testUser.id)}
      />
    </div>
  );
} 