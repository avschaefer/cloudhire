import { fetchBehavioralQuestions } from '../lib/supabaseQueries';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase');

describe('Supabase Queries', () => {
  test('fetchBehavioralQuestions returns questions', async () => {
    const mockData = [{ id: 1, question: 'Test question' }];
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      })
    });

    const result = await fetchBehavioralQuestions();
    expect(result).toEqual(mockData);
  });
}); 