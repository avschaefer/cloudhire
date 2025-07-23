import { supabase } from './supabase';
import { getFileUrl } from './supabaseStorage';
import { fetchUserInfo } from './supabaseQueries';

async function generateReport(userId: string, emailTo: string) {
  const userInfo = await fetchUserInfo(userId);
  const { data: files } = await supabase.from('user_files').select('*').eq('user_id', userId);
  const { data: responses } = await supabase.from('user_responses').select('*').eq('user_id', userId);

  const fileUrls: { [key: string]: string } = {};
  for (const file of files ?? []) {
    fileUrls[file.file_type] = await getFileUrl({ userId, fileType: file.file_type, filePath: file.file_path });
  }

  const report = { userInfo, files, responses, fileUrls };
  console.log('Report:', report); // Mock email for now
  return report;
}

export default generateReport; 