"use client"

import { useState, useEffect } from "react"
import { fetchLatestSubmissions } from "../lib/supabaseQueries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wand2, ShieldCheck, History, AlertCircle, Copy, LogOut } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from 'next/navigation';

type Submission = {
  id: string
  user_id: string
  user_email: string
  created_at: string
}

export default function AdminDashboard({ userId, onLogout }: { userId: string; onLogout?: () => void }) {
  const [email, setEmail] = useState("")
  const [magicLink, setMagicLink] = useState("")
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter();

  useEffect(() => {
    async function loadSubmissions() {
      try {
        setIsLoading(true)
        const data = await fetchLatestSubmissions()
        // Assuming fetchLatestSubmissions returns user email
        const submissionsWithEmail = data.map((sub: any) => ({
          ...sub,
          user_email: sub.user?.email || "N/A",
        }))
        setSubmissions(submissionsWithEmail)
        setError(null)
      } catch (err: any) {
        setError("Failed to load submissions. Please try again later.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSubmissions()
  }, [])

  const handleGenerateLink = async () => {
    if (!email) {
      toast.error("Please enter a candidate email.");
      return;
    }
    setIsGenerating(true);
    try {
      const response = await fetch('/api/auth/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate magic link');
      }

      const data = await response.json();
      setMagicLink(data.action_link);
      toast.success("Magic link generated successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to generate magic link.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(magicLink)
    toast.info("Magic link copied to clipboard!")
  }

  const handleLogoutClick = async () => {
    if (onLogout) {
      await onLogout();
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg shadow-md">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span>Admin Dashboard</span>
          </h1>
          <Button
            onClick={handleLogoutClick}
            variant="ghost"
            className="bg-white/80 hover:bg-white/90 text-slate-700 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md flex items-center gap-2 px-4 py-2"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-slate-700 dark:text-slate-300">
                  <Wand2 className="h-6 w-6 text-orange-500" />
                  Generate Magic Link
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Create a unique sign-in link for a new candidate.
                </p>
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="bg-white/80 dark:bg-slate-800/80"
                  />
                  <Button
                    onClick={handleGenerateLink}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold"
                  >
                    {isGenerating ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
                {magicLink && (
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Generated Link:</p>
                    <div className="flex items-center gap-2">
                      <Input readOnly value={magicLink} className="text-xs bg-white dark:bg-slate-800 truncate" />
                      <Button size="icon" variant="ghost" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => router.push('/exam?test=true')}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded mt-4"
                >
                  Enter Exam as Test User
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-slate-700 dark:text-slate-300">
                  <History className="h-6 w-6 text-orange-500" />
                  Latest Exam Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-200 dark:border-slate-700">
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Candidate Email</TableHead>
                        <TableHead>Submission Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i} className="border-slate-200 dark:border-slate-700">
                            <TableCell>
                              <Skeleton className="h-10 w-10 rounded-full" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-48" />
                            </TableCell>
                            <TableCell>
                              <Skeleton className="h-4 w-32" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : submissions.length > 0 ? (
                        submissions.map((sub) => (
                          <TableRow
                            key={sub.id}
                            className="border-slate-200 dark:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                          >
                            <TableCell>
                              <Avatar>
                                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${sub.user_email}`} />
                                <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                                  {sub.user_email.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </TableCell>
                            <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                              {sub.user_email}
                            </TableCell>
                            <TableCell className="text-slate-500 dark:text-slate-400">
                              {new Date(sub.created_at).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-12 text-slate-500 dark:text-slate-400">
                            <p>No submissions yet.</p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
