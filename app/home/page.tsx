"use client"

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { checkAdminRole, logout, generateMagicLink } from '../../lib/supabaseAuth';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserProfile from '../../components/UserProfile';
import FileUpload from '../../components/FileUpload';
import ExamDashboard from '../../components/ExamDashboard';

interface HomePageProps {
  session: Session;
}

export default function HomePage({ session }: HomePageProps) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // For admin dashboard
  const [candidateEmail, setCandidateEmail] = useState<string>('');
  const [adminMessage, setAdminMessage] = useState<string>('');
  const [adminLoading, setAdminLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (session?.user) {
        const isAdminUser = await checkAdminRole(session.user.id);
        setIsAdmin(isAdminUser);
        
        const { data } = await supabase.from('user_info').select('id').eq('id', session.user.id).single();
        if (!data) {
          await supabase.from('user_info').insert({
            id: session.user.id,
            email: session.user.email,
          });
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [session]);

  const handleGenerateCandidateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage('');
    try {
      const magicLink = await generateMagicLink(candidateEmail);
      setAdminMessage(`Magic link generated. Copy and send this to the candidate: ${magicLink}`);
      setCandidateEmail('');
    } catch (error: any) {
      setAdminMessage(`Error: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">Cloudhire Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Log Out
        </Button>
      </header>
      
      {isAdmin && (
        <div className="mb-6 p-6 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-semibold mb-4">Admin: Generate Magic Link for Candidate</h2>
          <form onSubmit={handleGenerateCandidateLink} className="flex items-end gap-4">
            <div className="flex-grow">
              <label htmlFor="candidate-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate Email</label>
              <Input
                id="candidate-email"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="candidate@example.com"
                required
              />
            </div>
            <Button type="submit" disabled={adminLoading}>
              {adminLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Link
            </Button>
          </form>
          {adminMessage && <p className="mt-3 text-sm">{adminMessage}</p>}
        </div>
      )}
      
      <main className="space-y-8">
        <UserProfile userId={session.user.id} />
        <FileUpload userId={session.user.id} />
        <ExamDashboard userId={session.user.id} />
      </main>
    </div>
  );
}
