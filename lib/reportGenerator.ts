import { supabase } from './supabase';
import { getFileUrl } from './supabaseStorage';

async function generateReport(userId: number, emailTo: string) {
  // Fetch user bio
  const { data: bio, error: bioError } = await supabase
    .from('user_bio')
    .select('*')
    .eq('id', userId)
    .single();

  if (bioError) throw new Error(`Error fetching bio: ${bioError.message}`);

  // Fetch responses
  const tables = ['behavioral', 'calculations', 'multiple_choice', 'response'];
  const responses: { [key: string]: any[] } = {};

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw new Error(`Error fetching ${table} responses: ${error.message}`);
    responses[table] = data;
  }

  // Fetch file metadata
  const { data: files, error: fileError } = await supabase
    .from('user_files')
    .select('file_type, file_path, bucket_name')
    .eq('user_id', userId);

  if (fileError) throw new Error(`Error fetching files: ${fileError.message}`);

  // Generate file URLs
  const fileUrls: { [key: string]: string } = {};
  for (const file of files ?? []) {
    fileUrls[file.file_type] = await getFileUrl({ 
      userId, 
      fileType: file.file_type as 'resume' | 'transcript' | 'project', 
      filePath: file.file_path 
    });
  }

  // Call XAI API for AI evaluation (pseudo-code, replace with actual API call)
  const aiEvaluations: { [key: string]: any } = {};
  for (const table of tables) {
    for (const response of responses[table]) {
      const aiResponse = await callXaiApi(response.user_response, response.question);
      aiEvaluations[response.id] = aiResponse;
    }
  }

  // Compile report
  const report = {
    userBio: bio,
    responses,
    fileUrls,
    aiEvaluations
  };

  // Send report via Resend API
  await sendReportEmail(report, emailTo);

  return report;
}

async function callXaiApi(userResponse: string, question: string) {
  // Implement XAI API call using XAI_API_KEY
  // Placeholder: Replace with actual API integration
  return { evaluation: 'Sample AI evaluation' };
}

async function sendReportEmail(report: any, emailTo: string) {
  // Implement Resend API call using RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_TO_EMAIL
  // Placeholder: Replace with actual API integration
  console.log(`Sending report to ${emailTo}`);
}

export { generateReport }; 