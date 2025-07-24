import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateMagicLink } from '@/lib/supabaseAuth';
import { useState } from 'react';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';

interface ExamDashboardProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

export function ExamDashboard({ user, isAdmin, onLogout }: ExamDashboardProps) {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage('');
    try {
      const link = await generateMagicLink(candidateEmail);
      setAdminMessage(`Magic link generated for ${candidateEmail}. Link: ${link}`);
    } catch (error: any) {
      setAdminMessage(`Error: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Cloudhire Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome, {user.email}</p>
        </div>
        <Button onClick={onLogout} variant="outline" className="mt-4 sm:mt-0">
          Log Out
        </Button>
      </header>

      <main className="space-y-8">
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>Generate a magic link for a new candidate assessment.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateLink} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="candidate-email" className="font-medium">Candidate Email</label>
                  <div className="flex gap-2">
                    <Input
                      id="candidate-email"
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="candidate@example.com"
                      required
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={adminLoading}>
                      {adminLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate Link
                    </Button>
                  </div>
                </div>
                {adminMessage && (
                  <p className={`mt-2 text-sm ${adminMessage.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {adminMessage}
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Assessment</CardTitle>
            <CardDescription>Details about your ongoing or completed technical assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Assessment content will be displayed here.</p>
            {/* Placeholder for exam components */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
