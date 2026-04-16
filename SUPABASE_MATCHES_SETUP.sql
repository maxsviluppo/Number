-- 1. Create MATCHES table if not exists (using manual text check instead of enum to avoid conflicts if enum present)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    player1_id UUID NOT NULL, -- references profiles(id)
    player2_id UUID, -- references profiles(id) -- Can be null initially if matchmaking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished', 'cancelled')),
    winner_id UUID, -- references profiles(id)
    grid_seed TEXT NOT NULL, -- To ensure both play the same grid
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    target_score INTEGER DEFAULT 5 -- First to 5 wins
);

-- 2. Enable Realtime for matches table (crucial for signaling start and updates without polling)
-- Note: This usually requires a special Supabase command or UI setting, 
-- but we can try to add it to the publication if privileges allow.
-- If this fails, the user must enable "Realtime" on the 'matches' table in the Supabase Dashboard -> Database -> Replication.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'matches'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
  END IF;
END $$;

-- 3. Add 'elo_rating' to profiles if not exists (for ranking 1vs1 specific)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'elo_rating') THEN
        ALTER TABLE public.profiles ADD COLUMN elo_rating INTEGER DEFAULT 1200;
    END IF;
END $$;

-- 4. Create RLS Policies for Matches (SAFE idempotent)
-- We drop existing policies to ensure clean state if re-run
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view matches they are involved in" ON public.matches;
CREATE POLICY "Users can view matches they are involved in" ON public.matches
    FOR SELECT USING (auth.uid() = player1_id OR auth.uid() = player2_id);

DROP POLICY IF EXISTS "Users can view OPEN pending matches" ON public.matches;
CREATE POLICY "Users can view OPEN pending matches" ON public.matches
    FOR SELECT USING (status = 'pending' AND player2_id IS NULL);

DROP POLICY IF EXISTS "Users can create matches" ON public.matches;
CREATE POLICY "Users can create matches" ON public.matches
    FOR INSERT WITH CHECK (auth.uid() = player1_id);

DROP POLICY IF EXISTS "Users can update their matches" ON public.matches;
CREATE POLICY "Users can update their matches" ON public.matches
    FOR UPDATE USING (auth.uid() = player1_id OR auth.uid() = player2_id);
