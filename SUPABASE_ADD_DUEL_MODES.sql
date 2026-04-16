-- 1. Add 'mode' column to matches table (to distinguish between standard and blitz)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'mode') THEN
        ALTER TABLE public.matches ADD COLUMN mode TEXT DEFAULT 'standard'; -- 'standard' or 'blitz'
    END IF;
END $$;

-- 2. Add round tracking columns for Blitz mode
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'p1_rounds') THEN
        ALTER TABLE public.matches ADD COLUMN p1_rounds INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'p2_rounds') THEN
        ALTER TABLE public.matches ADD COLUMN p2_rounds INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'current_round') THEN
        ALTER TABLE public.matches ADD COLUMN current_round INTEGER DEFAULT 1;
    END IF;
END $$;
