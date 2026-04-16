-- FIX PERMESSI VISIBILITÀ SFIDE
-- Permette a tutti gli utenti di vedere le partite in corso nella Lobby

-- 1. Rimuovi le vecchie policy di selezione restrittive
DROP POLICY IF EXISTS "Users can view matches they are involved in" ON public.matches;
DROP POLICY IF EXISTS "Users can view OPEN pending matches" ON public.matches;
DROP POLICY IF EXISTS "Matches viewable by everyone" ON public.matches;

-- 2. Crea una policy universale per la lettura (necessaria per la Lobby)
CREATE POLICY "Matches are viewable by everyone" ON public.matches
FOR SELECT USING (true);

-- 3. Assicurati che i profili siano visibili (già dovrebbe esserci, ma per sicurezza)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
FOR SELECT USING (true);

-- 4. Notifica Realtime (Publication)
-- Se non vedi aggiornamenti istantanei, assicurati di aver abilitato Realtime sulla tabella 'matches' 
-- nel tab Replication del dashboard Supabase.
