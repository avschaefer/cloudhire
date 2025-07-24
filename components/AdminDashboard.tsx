import { useState, useEffect } from 'react';
import { generateMagicLink } from '../lib/supabaseAuth';
import { fetchLatestSubmissions } from '../lib/supabaseQueries';

export default function AdminDashboard({ userId }: { userId: string }) {
  const [email, setEmail] = useState('');
  const [magicLink, setMagicLink] = useState('');
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    async function loadSubmissions() {
      const data = await fetchLatestSubmissions();
      setSubmissions(data);
    }
    loadSubmissions();
  }, []);

  const handleGenerateLink = async () => {
    try {
      const link = await generateMagicLink(email);
      setMagicLink(link);
    } catch (error: any) {
      console.error(error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">Admin Dashboard</h3>
      <div className="mt-4">
        <h4>Generate Magic Link for Candidate</h4>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Candidate Email" className="p-2 border rounded mb-2 w-full" />
        <button onClick={handleGenerateLink} className="bg-blue-500 text-white px-4 py-2 rounded">Generate Link</button>
        {magicLink && <p>Magic Link: {magicLink} (Copy and email manually)</p>}
      </div>
      <div className="mt-4">
        <h4>Latest Exam Submissions</h4>
        <ul className="list-disc pl-5">
          {submissions.map((sub) => (
            <li key={sub.id}>User {sub.user_id}: {sub.question_type} - {sub.response_text || sub.response_numerical}</li>
          ))}
        </ul>
      </div>
    </div>
  );
} 