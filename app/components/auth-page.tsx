"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AuthPageProps {
  onAdminLogin: (code: string) => Promise<{ success: boolean; message: string }>;
}

export function AuthPage({ onAdminLogin }: AuthPageProps) {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCode.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await onAdminLogin(adminCode);
      setMessage({ type: 'success', text: result.message });
      // The parent component will handle the redirect upon successful state change
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Invalid admin code' });
    } finally {
      setLoading(false);
    }
  };

  if (showAdminLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
            <CardHeader className="space-y-4 pb-8">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdminLogin(false);
                    setMessage(null);
                  }}
                  className="p-2 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-gradient-to-r from-amber-500 to-orange-500">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      Administrator Access
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Enter your administrator code to log in directly.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleAdminSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="admin-code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Administrator Code
                  </label>
                  <Input
                    id="admin-code"
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Enter your admin code"
                    className="h-12 text-base"
                    required
                    disabled={loading}
                  />
                </div>
                {message && (
                  <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : ''}>
                    {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertDescription>
                      {message.text}
                    </AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  disabled={loading || !adminCode.trim()}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging In...
                    </>
                  ) : (
                    'Log In as Admin'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
          <CardHeader className="space-y-6 pb-8">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome to Cloudhire
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Technical Assessment Platform
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <div className="p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3">
                  Check Your Email
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  A magic link has been sent to your email address. Click the link in your email to access your technical assessment.
                </p>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                <p>Didn't receive an email? Check your spam folder or contact your recruiter.</p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="ghost"
                onClick={() => setShowAdminLogin(true)}
                className="w-full h-12 text-base font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
              >
                <Shield className="mr-2 h-4 w-4" />
                Administrator Access
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
