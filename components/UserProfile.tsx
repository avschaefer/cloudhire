import { useState, useEffect } from 'react';
import { fetchUserInfo } from '../lib/supabaseQueries';
import { submitUserInfo } from '../lib/supabaseSubmissions';

export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    async function loadUser() {
      const data = await fetchUserInfo(userId);
      setUser(data);
      setFormData(data);
    }
    loadUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitUserInfo(formData);
    setEditMode(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">User Profile</h3>
      {editMode ? (
        <form onSubmit={handleSubmit} className="mt-2">
          <input name="first_name" value={formData.first_name || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="First Name" />
          <input name="last_name" value={formData.last_name || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="Last Name" />
          <input name="email" value={formData.email || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="Email" />
          <input name="degree_type" value={formData.degree_type || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="Degree Type" />
          <input name="degree_name" value={formData.degree_name || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="Degree Name" />
          <input name="years_experience" value={formData.years_experience || ''} onChange={handleChange} className="p-2 border rounded mb-2 w-full" placeholder="Years Experience" />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
          <button onClick={() => setEditMode(false)} className="ml-2 bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
        </form>
      ) : (
        <div className="mt-2">
          <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Degree:</strong> {user.degree_type} - {user.degree_name}</p>
          <p><strong>Experience:</strong> {user.years_experience} years</p>
          <button onClick={() => setEditMode(true)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Edit Profile</button>
        </div>
      )}
    </div>
  );
}
