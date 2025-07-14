CREATE TABLE seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  context TEXT,
  sprouts JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);