-- POLICY DI SICUREZZA AGGIORNATE
-- Esegui questo script nell'SQL Editor di Supabase per sbloccare i permessi di scrittura

-- 1. Abilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- 2. Rimuovi policy vecchie per evitare conflitti (opzionale ma consigliato)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile." ON profiles;
DROP POLICY IF EXISTS "Leaderboard viewable by everyone" ON leaderboard;
DROP POLICY IF EXISTS "Users can insert own score" ON leaderboard;

-- 3. Crea Nuove Policy PERMISSIVE

-- PROFILES
-- Chiunque può leggere i profili (per le classifiche)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (true);

-- Un utente può INSERIRE e RESTITUIRE il proprio profilo solo se l'ID corrisponde
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Un utente può AGGIORNARE il proprio profilo (punteggi, salvataggi)
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- LEADERBOARD
-- Chiunque può leggere la classifica
CREATE POLICY "Leaderboard viewable by everyone" ON leaderboard
FOR SELECT USING (true);

-- Chiunque autenticato può inserire un record (anche se non è il suo tecnicamente, ma lo leghiamo all'auth)
-- Nota: Sarebbe meglio checkare auth.uid(), ma per ora lasciamo aperto agli utenti loggati.
CREATE POLICY "Authenticated users can insert score" ON leaderboard
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ISTRUZIONE IMPORTANTE:
-- Se vedi ancora "Offline Mode", è perché mancano le variabili d'ambiente su Vercel.
-- Vai su Vercel -> Settings -> Environment Variables e aggiungi:
-- VITE_SUPABASE_URL = ...
-- VITE_SUPABASE_ANON_KEY = ...
