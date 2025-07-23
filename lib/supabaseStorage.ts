import { supabase } from './supabase';

export async function uploadFile({ file, userId, fileType }: { file: File, userId: number, fileType: 'resume' | 'transcript' | 'project' }) {
  const bucketMap = {
    resume: 'resumes',
    transcript: 'transcripts',
    project: 'projects'
  };
  
  const bucket = bucketMap[fileType];
  if (!bucket) throw new Error('Invalid file type');

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(`Error uploading ${fileType}: ${error.message}`);

  // Save metadata to user_files table
  const { error: metaError } = await supabase
    .from('user_files')
    .insert([
      { user_id: userId, file_type: fileType, file_name: fileName, bucket_name: bucket, file_path: filePath }
    ]);

  if (metaError) throw new Error(`Error saving ${fileType} metadata: ${metaError.message}`);

  return { filePath, fileName };
}

export async function getFileUrl({ userId, fileType, filePath }: { userId: number, fileType: 'resume' | 'transcript' | 'project', filePath: string }) {
  const bucketMap = {
    resume: 'resumes',
    transcript: 'transcripts',
    project: 'projects'
  };

  const { data } = supabase.storage.from(bucketMap[fileType]).getPublicUrl(filePath);

  return data.publicUrl;
} 