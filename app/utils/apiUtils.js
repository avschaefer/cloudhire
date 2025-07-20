// app/utils/apiUtils.js
export async function gradeExam(data) {
  return fetch('/api/grade', { 
    method: 'POST',
    body: JSON.stringify(data)
  });
} 