'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { AuthPage } from './components/auth-page'
import { ExamDashboard } from '@/components/ExamDashboard'
import { Loader2 } from 'lucide-react'
import AdminDashboard from '../components/AdminDashboard'

// Create a mock admin user object that satisfies the User type shape
const createMockAdminUser = (): User => ({
  id: 'admin-user-id',
  app_metadata: { provider: 'email' },
  user_metadata: { is_admin: true },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'admin@cloudhire.local',
});

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check for a real Supabase session on initial load
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
      }
      setLoading(false)
    }
    getSession()

    // Listen for auth state changes for real users (candidates)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setIsAdmin(false) // Real sessions are never admin
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleAdminLogin = async (code: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Admin login failed')
    }

    // If code is valid, create and set the mock admin user
    const mockAdmin = createMockAdminUser();
    setUser(mockAdmin)
    setIsAdmin(true)
    
    return { success: true, message: 'Admin login successful!' }
  }

  const handleLogout = async () => {
    if (isAdmin) {
      // For mock admin, just clear the state
      setUser(null)
      setIsAdmin(false)
    } else {
      // For real users, sign out from Supabase
      await supabase.auth.signOut()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAdminLogin={handleAdminLogin} />
  }

  // For admin users, show the AdminDashboard
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto p-4">
          
          <AdminDashboard userId={user.id} onLogout={handleLogout} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <ExamDashboard user={user} isAdmin={isAdmin} onLogout={handleLogout} />
    </div>
  )
}
