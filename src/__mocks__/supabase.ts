// Mock Supabase client
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
  update: jest.fn().mockReturnThis(),
  gt: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
}

export const supabase = mockSupabase