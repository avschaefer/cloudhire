"use client"

import type React from "react"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateMagicLink } from "@/lib/supabaseAuth"
import { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Loader2, LogOut } from "lucide-react"
import { fetchRecentSubmissions } from "@/lib/supabaseQueries"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"

interface ExamDashboardProps {
  user: User
  isAdmin: boolean
  onLogout: () => void
}

type Submission = {
  id: string
  submitted_at: string
  user_info: {
    name: string | null
    email: string | null
  } | null
}

export function ExamDashboard({ user, isAdmin, onLogout }: ExamDashboardProps) {
  const [candidateEmail, setCandidateEmail] = useState("")
  const [adminMessage, setAdminMessage] = useState("")
  const [adminLoading, setAdminLoading] = useState(false)

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionsLoading, setSubmissionsLoading] = useState(true)
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)

  useEffect(() => {
    if (isAdmin) {
      const loadSubmissions = async () => {
        try {
          setSubmissionsLoading(true)
          const data = await fetchRecentSubmissions()
          setSubmissions(data as Submission[])
        } catch (error: any) {
          setSubmissionsError(error.message)
        } finally {
          setSubmissionsLoading(false)
        }
      }
      loadSubmissions()
    }
  }, [isAdmin])

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminMessage("")
    try {
      const link = await generateMagicLink(candidateEmail)
      setAdminMessage(`Magic link generated successfully! Link: ${link}`)
      setCandidateEmail("")
    } catch (error: any) {
      setAdminMessage(`Error: ${error.message}`)
    } finally {
      setAdminLoading(false)
    }
  }

  if (!isAdmin) {
    // Non-admin view
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto p-6 lg:p-8 max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Candidate Portal</h1>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </header>
          <Card>
            <CardHeader>
              <CardTitle>Your Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Welcome! Your assessment content will be displayed here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 lg:p-8 max-w-6xl">
        {/* Modern Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4 sm:mb-0">
            Cloudhire Admin Dashboard
          </h1>
          <Button
            onClick={onLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg px-6 py-3 rounded-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-10">
          {/* Magic Link Generation Card */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-bold text-slate-800">Admin Dashboard</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <form onSubmit={handleGenerateLink} className="space-y-6">
                <div className="space-y-3">
                  <label htmlFor="candidate-email" className="text-lg font-semibold text-slate-700 block">
                    Generate Magic Link for Candidate
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Input
                      id="candidate-email"
                      type="email"
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="Candidate Email"
                      required
                      className="flex-grow h-14 text-lg border-2 border-slate-200 focus:border-amber-500 focus:ring-amber-500/20 rounded-xl"
                    />
                    <Button
                      type="submit"
                      disabled={adminLoading}
                      className="h-14 px-10 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl text-lg font-semibold w-full sm:w-auto rounded-xl"
                    >
                      {adminLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Generate Link"}
                    </Button>
                  </div>
                </div>
                {adminMessage && (
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      adminMessage.includes("Error")
                        ? "bg-red-50 border-red-200 text-red-700"
                        : "bg-amber-50 border-amber-200 text-amber-700"
                    }`}
                  >
                    <p className="text-base font-medium">{adminMessage}</p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Recent Submissions Card */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-bold text-slate-800">Latest Exam Submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {submissionsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : submissionsError ? (
                <div className="p-8 text-center rounded-lg bg-red-50 border-2 border-red-200">
                  <p className="text-red-600 font-semibold">Failed to load submissions</p>
                </div>
              ) : submissions.length === 0 ? (
                <div className="p-8 text-center rounded-lg bg-slate-50 border-2 border-slate-100">
                  <p className="text-slate-500 font-medium">No submissions yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border-2 border-orange-100">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-orange-100 hover:bg-amber-50/80">
                        <TableHead className="font-bold text-slate-700 text-base py-4 px-6">Candidate</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 text-base py-4 px-6">
                          Submitted
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow
                          key={submission.id}
                          className="hover:bg-amber-50/50 transition-colors border-b border-orange-100/50 last:border-b-0"
                        >
                          <TableCell className="py-4 px-6">
                            <div className="font-semibold text-slate-800">
                              {submission.user_info?.name || "Anonymous"}
                            </div>
                            <div className="text-sm text-slate-500">
                              {submission.user_info?.email || "No email provided"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right py-4 px-6">
                            <span className="text-slate-600 font-medium">
                              {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
