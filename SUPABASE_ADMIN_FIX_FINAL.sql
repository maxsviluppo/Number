-- NUMBER GAME: DATABASE REPAIR & ADMIN SYNC SCRIPT
-- Esegui questo script nell'SQL Editor di Supabase per ripristinare il collegamento tra Admin Panel e il Database.

-- 1. AGGIUNTA COLONNE MANCANTI ALLA TABELLA PROFILES
-- Queste colonne sono necessarie per il corretto funzionamento dell'Admin Panel (Lista Iscritti e Statistiche Traffico)
DO $$
BEGIN
    -- Aggiunta colonna email (se manca)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email text;
    END IF;

    -- Aggiunta colonna created_at (se manca, necessaria per statistiche nuovi iscritti)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
    END IF;

    -- Aggiunta colonna recovery_password (se manca, necessaria per recupero credenziali admin)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'recovery_password') THEN
        ALTER TABLE profiles ADD COLUMN recovery_password text;
    END IF;

    -- Aggiunta colonna avatar_url (se manca)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
    END IF;
END $$;

-- 2. AGGIORNAMENTO LOGICA TRIGGER (handle_new_user)
-- Assicura che al momento della registrazione tutti i campi vengano popolati correttamente.
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
      recovery_password,
      created_at,
      updated_at
  )
  VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'username', 'User ' || substr(new.id::text, 1, 6)),
      new.email,
      0, 
      1, 
      100,
      NULL, -- La password viene aggiornata client-side al primo login/signUp se necessario
      now(),
      now()
  )
  ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      username = COALESCE(profiles.username, EXCLUDED.username);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RIPRISTINO PERMESSI (RLS)
-- Assicura che l'Admin Panel possa leggere tutte le informazioni necessarie bypassando o avendo policy corrette.
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
FOR SELECT USING (true);

-- 4. FUNZIONE ADMIN PER ELIMINAZIONE UTENTI (Utilizzata nel pannello admin)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID, admin_secret TEXT)
RETURNS void AS $$
BEGIN
    -- Verifica segreta semplice (corrisponde a quanto configurato nel componente React)
    IF admin_secret = 'accessometti' THEN
        DELETE FROM auth.users WHERE id = target_user_id;
    ELSE
        RAISE EXCEPTION 'Accesso negato: Secret Admin non valido.';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CONFIGURAZIONE SISTEMA (Assicura che la tabella esista e sia pronta)
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Config viewable by everyone" ON public.system_config;
CREATE POLICY "Config viewable by everyone" ON public.system_config FOR SELECT USING (true);
DROP POLICY IF EXISTS "Config editable by everyone" ON public.system_config;
CREATE POLICY "Config editable by everyone" ON public.system_config FOR ALL USING (true);

INSERT INTO public.system_config (id, data)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;

-- FINE SCRIPT
