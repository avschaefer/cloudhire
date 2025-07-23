"use client"

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { generateMagicLink, getCurrentUser, checkAdminRole, logout } from '../lib/supabaseAuth';
import UserProfile from '../components/UserProfile';
import FileUpload from '../components/FileUpload';
import ExamDashboard from '../components/ExamDashboard';

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isAdminEntry, setIsAdminEntry] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    async function init() {
      const user = await getCurrentUser();
      if (user) {
        const { data } = await supabase.from('user_info').select('id').eq('id', user.id).single();
        if (!data) {
          await supabase.from('user_info').insert({
            id: user.id,
            email: user.email,
          });
        }
        setUserId(user.id);
        setIsAdmin(await checkAdminRole(user.id));
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const magicLink = await generateMagicLink(email);
      setMessage(`Magic link generated. Copy and send this to the candidate: ${magicLink}`);
      setEmail('');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (code !== 'ADMIN123') throw new Error('Invalid admin code');
      const user = await getCurrentUser();
      if (!user) {
        const magicLink = await generateMagicLink('your-email@example.com'); // Your admin email
        setMessage(`Admin magic link generated: ${magicLink}`);
      } else if (await checkAdminRole(user.id)) {
        setUserId(user.id);
        setIsAdmin(true);
      } else {
        await supabase.from('user_info').update({ role: 'admin' }).eq('id', user.id);
        setUserId(user.id);
        setIsAdmin(true);
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserId(null);
    setIsAdmin(false);
  };

  if (loading) return <div>Loading...</div>;

  if (!userId) return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cloudhire - Access Exam</h1>
      {isAdminEntry ? (
        <form onSubmit={handleAdminCode}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Admin Code"
            className="p-2 border rounded mb-2 w-full"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Enter</button>
          <button type="button" onClick={() => setIsAdminEntry(false)} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">Back</button>
        </form>
      ) : (
        <div>
          <p>Please check your email for the magic link to access the exam.</p>
          <button type="button" onClick={() => setIsAdminEntry(true)} className="mt-4 bg-gray-500 text-white px-4 py-2 rounded">Admin Entry</button>
        </div>
      )}
      {message && <p className="mt-2">{message}</p>}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Cloudhire Exam</h1>
      {isAdmin && (
        <div className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Admin: Generate Magic Link for Candidate</h2>
          <form onSubmit={handleMagicLink}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Candidate Email"
              className="p-2 border rounded mb-2 w-full"
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Generate</button>
          </form>
          {message && <p className="mt-2">{message}</p>}
        </div>
      )}
      <button onClick={handleLogout} className="mb-4 bg-red-500 text-white px-4 py-2 rounded">Log Out</button>
      <UserProfile userId={userId} />
      <FileUpload userId={userId} />
      <ExamDashboard userId={userId} />
    </div>
  );
}
