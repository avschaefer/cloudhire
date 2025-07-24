'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, User, Shield, FileText, Users, Settings } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface ExamDashboardProps {
  user: SupabaseUser
  isAdmin: boolean
  onLogout: () => void
}

export function ExamDashboard({ user, isAdmin, onLogout }: ExamDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600">
              {isAdmin ? (
                <Shield className="h-6 w-6 text-white" />
              ) : (
                <User className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {isAdmin ? 'Admin Dashboard' : 'Candidate Dashboard'}
              </h1>
              <p className="text-slate-600">
                Welcome, {user.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Administrator
              </Badge>
            )}
            <Button onClick={onLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isAdmin ? (
            <>
              {/* Admin Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Candidates
                  </CardTitle>
                  <CardDescription>
                    View and manage candidate assessments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Candidates
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Assessment Reports
                  </CardTitle>
                  <CardDescription>
                    Review completed assessments and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Reports
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Settings
                  </CardTitle>
                  <CardDescription>
                    Configure assessment parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Settings
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Candidate Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Start Assessment
                  </CardTitle>
                  <CardDescription>
                    Begin your technical evaluation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    Start Now
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile
                  </CardTitle>
                  <CardDescription>
                    Update your information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Previous Results
                  </CardTitle>
                  <CardDescription>
                    View your assessment history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Results
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
