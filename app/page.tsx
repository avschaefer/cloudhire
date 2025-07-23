"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import UserProfile from '../components/UserProfile';
import FileUpload from '../components/FileUpload';
import ExamDashboard from '../components/ExamDashboard';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    getUser();
  }, []);

  if (!userId) return <div>Loading... Please log in.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cloudhire Exam</h1>
      <UserProfile userId={userId} />
      <FileUpload userId={userId} />
      <ExamDashboard userId={userId} />
    </div>
  );
}
