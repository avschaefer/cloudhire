import { supabase } from './supabase';

export async function uploadFile({ file, userId, fileType }: { file: File, userId: string, fileType: string }) {
  const bucketMap = {
    resume: 'resumes',
    transcript: 'transcripts',
    project: 'projects'
  };
  const bucket = bucketMap[fileType.toLowerCase()];
  if (!bucket) throw new Error('Invalid file type');

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
  if (error) throw new Error(`Error uploading ${fileType}: ${error.message}`);

  await submitFileMetadata({ userId, fileType, fileName, bucketName: bucket, filePath });
  return { filePath, fileName };
}

export async function getFileUrl({ userId, fileType, filePath }: { userId: string, fileType: string, filePath: string }) {
  const bucketMap = { resume: 'resumes', transcript: 'transcripts', project: 'projects' };
  const { data } = supabase.storage.from(bucketMap[fileType.toLowerCase()]).getPublicUrl(filePath);
  return data.publicUrl;
}
