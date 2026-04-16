-- Add ready columns for round synchronization
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS p1_ready BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS p2_ready BOOLEAN DEFAULT FALSE;

-- Ensure realtime is-- Safe add to publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE matches;
    END IF;
END $$;
