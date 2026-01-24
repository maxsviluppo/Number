-- EMERGENCY PERMISSIONS FIX (GLOBAL OPEN)
-- Da usare se le policy precedenti bloccano ancora l'accesso.
-- Questo aprirà temporaneamente tutto agli utenti loggati per sbloccare la situazione.

-- 1. Assicurati che le tabelle esistano (Safety check)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username text,
  total_score bigint DEFAULT 0,
  max_level int DEFAULT 1,
  estimated_iq int DEFAULT 100,
  current_run_state jsonb DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name text,
  score bigint,
  level int,
  country text DEFAULT 'IT',
  iq int,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 2. DISABILITA COMPLETAMENTE RLS TEMPORANEAMENTE
-- Se questo funziona, il problema era 100% nelle policy.
-- Esegui queste due righe per testare:
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard DISABLE ROW LEVEL SECURITY;

-- ... E POI FERMATI QUI SE VUOI SOLO TESTARE ...
-- OPPURE, se vuoi mantenere la sicurezza ma essere super-permissivo:

/*
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy "Accetta Tutto" per utenti autenticati
CREATE POLICY "ALL_ACCESS_PROFILES" ON profiles
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "ALL_ACCESS_LEADERBOARD" ON leaderboard
FOR ALL
USING (true)
WITH CHECK (true);
*/
