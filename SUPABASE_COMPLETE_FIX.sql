-- SUPABASE COMPLETE FIX SCRIPT
-- Esegui questo script nell'SQL Editor di Supabase per riparare permessi e triggers.

-- 1. CLEANUP (Rimuovi vecchie policy e trigger per evitare conflitti)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop Policies su PROFILES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles; -- variante col punto
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Public profiles email viewable" ON profiles;

-- Drop Policies su LEADERBOARD
DROP POLICY IF EXISTS "Leaderboard viewable by everyone" ON leaderboard;
DROP POLICY IF EXISTS "Users can insert own score" ON leaderboard;
DROP POLICY IF EXISTS "Authenticated users can insert score" ON leaderboard;

-- 2. SCHEMA UPDATE (Assicura che la colonna email esista)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email text;
    END IF;
END $$;

-- 3. FUNCTION & TRIGGER (Logica Server-Side Robusta)
-- Questa funzione viene eseguita AUTOMATICAMENTE da Supabase quando un utente si registra.
-- Usa SECURITY DEFINER per bypassare RLS e scrivere sempre il profilo.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
      id, 
      username, 
      email, 
      total_score, 
      max_level, 
      estimated_iq, 
      wallet_balance
  )
  VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'username', 'User ' || substr(new.id::text, 1, 6)), -- Fallback se username manca
      new.email,
      0, 
      1, 
      100, 
      0
  )
  ON CONFLICT (id) DO NOTHING; -- Evita errori se il profilo esiste già
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. ROW LEVEL SECURITY (Permessi)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Policy PROFILES
-- Chiunque può leggere i profili (necessario per Login via Username e Classifiche)
CREATE POLICY "Public profiles viewable" ON profiles
FOR SELECT USING (true);

-- L'utente può modificare SOLO il suo profilo
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- L'utente può inserire il suo profilo (Backup client-side, anche se gestito dal trigger)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy LEADERBOARD
-- Chiunque può vedere la classifica
CREATE POLICY "Leaderboard viewable by everyone" ON leaderboard
FOR SELECT USING (true);

-- Utenti autenticati possono salvare punteggi
CREATE POLICY "Authenticated users can insert score" ON leaderboard
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- FINE SCRIPT
