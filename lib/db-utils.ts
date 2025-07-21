// lib/db-utils.ts - Modular D1 database utilities
import { sql } from '@vercel/postgres';
import { getEnv } from './envConfig'; // Assuming envConfig is created

export interface ExamData {
  id: string;
  userId: string;
  answers: Record<string, any>;
  questions: Record<string, any>;
  userInfo: Record<string, any>;
  completedAt: string;
  timeSpent: number;
  totalScore: number;
  maxScore: number;
  overallFeedback: string;
  gradingResults: Record<string, any>;
}

export interface UserBio {
  firstName: string;
  lastName: string;
  position: string;
  experience: string;
  education: string;
  email: string;
}

export interface ExamResult {
  id: string;
  examData: ExamData;
  userBio: UserBio;
  reportGenerated: boolean;
  reportSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export function createDbClient() {
  const connectionString = getEnv('DATABASE_URL');
  return { sql: (query, params) => sql(query, params) };
}

export async function queryDb(sqlQuery, params = []) {
  const client = createDbClient();
  return await client.sql(sqlQuery, params);
}

export async function insertExamResult(
  env: any, 
  examData: ExamData, 
  userBio: UserBio
): Promise<string> {
  try {
    const db = await getD1Client(env);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const result = await db.prepare(`
      INSERT INTO exam_results (
        id, exam_data, user_bio, report_generated, report_sent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      JSON.stringify(examData),
      JSON.stringify(userBio),
      false,
      false,
      now,
      now
    ).run();
    
    if (!result.success) {
      throw new DatabaseError('Failed to insert exam result');
    }
    
    return id;
  } catch (error) {
    throw new DatabaseError('Error inserting exam result', error);
  }
}

export async function getExamResult(env: any, id: string): Promise<ExamResult | null> {
  try {
    const db = await getD1Client(env);
    
    const result = await db.prepare(`
      SELECT * FROM exam_results WHERE id = ?
    `).bind(id).first();
    
    if (!result) {
      return null;
    }
    
    return {
      id: result.id,
      examData: JSON.parse(result.exam_data),
      userBio: JSON.parse(result.user_bio),
      reportGenerated: Boolean(result.report_generated),
      reportSent: Boolean(result.report_sent),
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    };
  } catch (error) {
    throw new DatabaseError('Error retrieving exam result', error);
  }
}

export async function updateExamResult(
  env: any, 
  id: string, 
  updates: Partial<Pick<ExamResult, 'reportGenerated' | 'reportSent'>>
): Promise<void> {
  try {
    const db = await getD1Client(env);
    const now = new Date().toISOString();
    
    const setClauses = [];
    const values = [];
    
    if (updates.reportGenerated !== undefined) {
      setClauses.push('report_generated = ?');
      values.push(updates.reportGenerated);
    }
    
    if (updates.reportSent !== undefined) {
      setClauses.push('report_sent = ?');
      values.push(updates.reportSent);
    }
    
    setClauses.push('updated_at = ?');
    values.push(now);
    values.push(id);
    
    const result = await db.prepare(`
      UPDATE exam_results 
      SET ${setClauses.join(', ')}
      WHERE id = ?
    `).bind(...values).run();
    
    if (!result.success) {
      throw new DatabaseError('Failed to update exam result');
    }
  } catch (error) {
    throw new DatabaseError('Error updating exam result', error);
  }
}

export async function listExamResults(
  env: any, 
  limit: number = 50, 
  offset: number = 0
): Promise<ExamResult[]> {
  try {
    const db = await getD1Client(env);
    
    const results = await db.prepare(`
      SELECT * FROM exam_results 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    return results.results.map((row: any) => ({
      id: row.id,
      examData: JSON.parse(row.exam_data),
      userBio: JSON.parse(row.user_bio),
      reportGenerated: Boolean(row.report_generated),
      reportSent: Boolean(row.report_sent),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    throw new DatabaseError('Error listing exam results', error);
  }
}

export async function deleteExamResult(env: any, id: string): Promise<void> {
  try {
    const db = await getD1Client(env);
    
    const result = await db.prepare(`
      DELETE FROM exam_results WHERE id = ?
    `).bind(id).run();
    
    if (!result.success) {
      throw new DatabaseError('Failed to delete exam result');
    }
  } catch (error) {
    throw new DatabaseError('Error deleting exam result', error);
  }
}

// Utility function to check database health
export async function checkDatabaseHealth(env: any): Promise<boolean> {
  try {
    const db = await getD1Client(env);
    await db.prepare('SELECT 1').first();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}
