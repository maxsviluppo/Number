-- SCRIPT DI RIPARAZIONE PER NUMBER GAME: SISTEMA DI CONFIGURAZIONE
-- Esegui questo script nell'SQL Editor di Supabase per sbloccare il salvataggio dei Meta Tag Google.

-- 1. Creazione Tabella (se non esiste)
CREATE TABLE IF NOT EXISTS public.system_config (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Abilitazione Sicurezza (RLS)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- 3. Pulizia vecchie policy per evitare messaggi di errore
DROP POLICY IF EXISTS "Config viewable by everyone" ON public.system_config;
DROP POLICY IF EXISTS "Config editable by everyone" ON public.system_config;
DROP POLICY IF EXISTS "Config updateable by everyone" ON public.system_config;

-- 4. Creazione Policy PERMISSIVE (necessarie per il pannello admin locale)
-- CHIUNQUE può leggere la config (necessario per caricare SEO e Tag Google)
CREATE POLICY "Config viewable by everyone" ON public.system_config
FOR SELECT USING (true);

-- CHIUNQUE può modificare la config (L'autenticazione è gestita dal pannello admin locale)
CREATE POLICY "Config editable by everyone" ON public.system_config
FOR ALL USING (true) WITH CHECK (true);

-- 5. Inizializzazione riga principale (se manca)
INSERT INTO public.system_config (id, data)
VALUES ('main', '{}')
ON CONFLICT (id) DO NOTHING;

-- FINE SCRIPT
-- Una volta eseguito, il pulsante "Salva Tutto" nell'Admin Panel funzionerà correttamente.
