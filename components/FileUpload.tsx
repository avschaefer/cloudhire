import { useState, useEffect } from 'react';
import { uploadFile, getFileUrl } from '../lib/supabaseStorage';
import { supabase } from '../lib/supabase';

export default function FileUpload({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadFiles() {
      const { data, error } = await supabase.from('user_files').select('*').eq('user_id', userId);
      if (!error) setUploadedFiles(data);
    }
    loadFiles();
  }, [userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null);
  const handleUpload = async (fileType: string) => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadFile({ file, userId, fileType });
      const { data } = await supabase.from('user_files').select('*').eq('user_id', userId);
      setUploadedFiles(data ?? []);
      alert(`${fileType} uploaded successfully!`);
    } catch (error) {
      console.error(error);
      alert(`Failed to upload ${fileType}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold">Upload Files</h3>
      <div className="mt-2">
        {['resume', 'transcript', 'project'].map((type) => (
          <div key={type} className="mb-4">
            <label className="block">{`Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`}</label>
            <input type="file" onChange={handleFileChange} className="mt-2" disabled={uploading} />
            <button
              onClick={() => handleUpload(type)}
              disabled={!file || uploading}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              {uploading ? 'Uploading...' : `Upload ${type}`}
            </button>
          </div>
        ))}
      </div>
      <h4 className="mt-4 text-md font-semibold">Uploaded Files</h4>
      <ul className="list-disc pl-5">
        {uploadedFiles.map((file) => (
          <li key={file.id}>{file.file_name} ({file.file_type})</li>
        ))}
      </ul>
    </div>
  );
}
