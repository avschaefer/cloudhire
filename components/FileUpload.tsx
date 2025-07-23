import { useState } from 'react';
import { uploadFile } from '../lib/supabaseStorage';

export default function FileUpload({ userId, fileType }: { userId: string, fileType: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null);
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile({ file, userId, fileType });
      alert(`${fileType} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to upload ${fileType}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-4">
      <label className="block">{`Upload ${fileType.charAt(0).toUpperCase() + fileType.slice(1)}`}</label>
      <input type="file" onChange={handleFileChange} className="mt-2" disabled={uploading} />
      <button onClick={handleUpload} disabled={!file || uploading} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
        {uploading ? 'Uploading...' : `Upload ${fileType}`}
      </button>
    </div>
  );
} 