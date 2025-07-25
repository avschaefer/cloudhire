'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ExamPage from '../components/exam-page';
import { getCurrentUser, getTestUserId } from '../../lib/supabaseAuth';
import { fetchUserInfo, fetchUserExamData, fetchMultipleChoiceQuestions, fetchCalculationQuestions, fetchResponseQuestions } from '../../lib/supabaseQueries';
import { submitExamResponses } from '../../lib/supabaseSubmissions';
import { toast } from 'sonner';

function ExamContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTest = searchParams.get('test') === 'true';
  const [userId, setUserId] = useState<string | null>(null);
  const [userBio, setUserBio] = useState<any | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [initialExamData, setInitialExamData] = useState<any>({ multipleChoice: {}, concepts: {}, calculations: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        let uid: string;
        if (isTest) {
          console.log('Loading test mode...');
          uid = await getTestUserId();
          console.log('Test user ID:', uid);
        } else {
          const user = await getCurrentUser();
          if (!user) {
            setError('Not authorized');
            return;
          }
          uid = user.id;
        }
        setUserId(uid);
        
        console.log('Fetching data for user:', uid);
        const [bioData, mc, responseQ, calc, examData] = await Promise.all([
          fetchUserInfo(uid),
          fetchMultipleChoiceQuestions(),
          fetchResponseQuestions(),
          fetchCalculationQuestions(),
          fetchUserExamData(uid)
        ]);
        
        console.log('Fetched data:', { bioData, mcCount: mc.length, responseCount: responseQ.length, calcCount: calc.length });
        
        setUserBio({
          firstName: bioData?.first_name || '',
          lastName: bioData?.last_name || '',
          email: bioData?.email || '',
          position: '',
          experience: bioData?.years_experience || '',
          motivation: '',
          educationalDegree: bioData?.degree_type || ''
        });
        const typedQuestions = [
          ...mc.map((q: any) => ({ ...q, ID: q.id, type: 'multipleChoice' })),
          ...responseQ.map((q: any) => ({ ...q, ID: q.id, type: 'concepts' })),
          ...calc.map((q: any) => ({ ...q, ID: q.id, type: 'calculations' }))
        ];
        setQuestions(typedQuestions);
        setInitialExamData(examData);
        console.log('Successfully loaded exam data');
      } catch (err) {
        console.error('Error in load function:', err);
        setError('Failed to load exam data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isTest]);

  const onComplete = async (examData: any) => {
    if (!userId) return;
    try {
      await submitExamResponses(userId, examData);
      toast.success('Exam submitted successfully!');
      router.push('/');
    } catch (err) {
      toast.error('Failed to submit exam');
      console.error(err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !userId || !userBio) return <div className="min-h-screen flex items-center justify-center">{error || 'Not authorized'}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ExamPage
        initialExamData={initialExamData}
        userBio={userBio}
        onComplete={onComplete}
        questions={questions}
        userId={userId}
      />
    </div>
  );
}

export default function Exam() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading exam...</div>}>
      <ExamContent />
    </Suspense>
  );
} 