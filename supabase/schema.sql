CREATE TABLE seeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  context TEXT,
  sprouts JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'done', 'error')),
  is_hidden BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);