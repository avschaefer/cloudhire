'use client';

import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateMagicLink } from '@/lib/supabaseAuth';
import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Loader2, History, LinkIcon, LogOut, Shield, UserIcon, Clock, Mail } from 'lucide-react';
import { fetchRecentSubmissions } from '@/lib/supabaseQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface ExamDashboardProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

type Submission = {
  id: string;
  submitted_at: string;
  user_info: {
    name: string | null;
    email: string | null;
  } | null;
};

export function ExamDashboard({ user, isAdmin, onLogout }: ExamDashboardProps) {
  const [candidateEmail, setCandidateEmail] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      const loadSubmissions = async () => {
        try {
          setSubmissionsLoading(true);
          const data = await fetchRecentSubmissions();
          setSubmissions(data as Submission[]);
        } catch (error: any) {
          setSubmissionsError(error.message);
        } finally {
          setSubmissionsLoading(false);
        }
      };
      loadSubmissions();
    }
  }, [isAdmin]);

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminMessage('');
    try {
      const link = await generateMagicLink(candidateEmail);
      setAdminMessage(`Magic link generated successfully! Link: ${link}`);
      setCandidateEmail('');
    } catch (error: any) {
      setAdminMessage(`Error: ${error.message}`);
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Modern Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                {isAdmin ? (
                  <Shield className="h-7 w-7 text-white" />
                ) : (
                  <UserIcon className="h-7 w-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  {isAdmin ? 'Admin Dashboard' : 'Candidate Portal'}
                </h1>
                <p className="text-slate-600 mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              {isAdmin && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              )}
              <Button 
                onClick={onLogout} 
                variant="outline" 
                className="border-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-8">
          {isAdmin ? (
            <>
              {/* Magic Link Generation Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                      <LinkIcon className="h-5 w-5 text-white" />
                    </div>
                    Generate Assessment Link
                  </CardTitle>
                  <p className="text-slate-600 ml-11">Create a unique magic link for a new candidate assessment.</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <form onSubmit={handleGenerateLink} className="space-y-6">
                    <div className="space-y-3">
                      <label htmlFor="candidate-email" className="text-sm font-semibold text-slate-700">
                        Candidate Email Address
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input
                          id="candidate-email"
                          type="email"
                          value={candidateEmail}
                          onChange={(e) => setCandidateEmail(e.target.value)}
                          placeholder="candidate@example.com"
                          required
                          className="flex-grow h-12 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20"
                        />
                        <Button 
                          type="submit" 
                          disabled={adminLoading} 
                          className="h-12 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg w-full sm:w-auto"
                        >
                          {adminLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <LinkIcon className="mr-2 h-4 w-4" />
                              Generate Link
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {adminMessage && (
                      <div className={`p-4 rounded-lg border ${
                        adminMessage.includes('Error') 
                          ? 'bg-red-50 border-red-200 text-red-700' 
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        <p className="text-sm font-medium">{adminMessage}</p>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Recent Submissions Card */}
              <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    Recent Submissions
                  </CardTitle>
                  <p className="text-slate-600 ml-11">Latest 10 candidate submissions and their details.</p>
                </CardHeader>
                <CardContent className="pt-0">
                  {submissionsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-1/3" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : submissionsError ? (
                    <div className="p-6 text-center">
                      <div className="p-3 rounded-full bg-red-100 w-fit mx-auto mb-3">
                        <History className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-red-600 font-medium">Failed to load submissions</p>
                      <p className="text-slate-500 text-sm mt-1">{submissionsError}</p>
                    </div>
                  ) : submissions.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="p-4 rounded-full bg-slate-100 w-fit mx-auto mb-4">
                        <History className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No submissions yet</p>
                      <p className="text-slate-400 text-sm mt-1">Candidate submissions will appear here once they complete their assessments.</p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">Candidate</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Submitted</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {submissions.map((submission, index) => (
                            <TableRow key={submission.id} className="hover:bg-slate-50/50 transition-colors">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
                                    <UserIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800">
                                      {submission.user_info?.name || 'Anonymous'}
                                    </div>
                                    <div className="text-sm text-slate-500 flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {submission.user_info?.email || 'No email provided'}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  <span className="text-slate-600 font-medium">
                                    {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                  Your Assessment
                </CardTitle>
                <p className="text-slate-600 ml-11">Details about your ongoing or completed technical assessment.</p>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <div className="p-4 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-slate-600">Assessment content will be displayed here.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
