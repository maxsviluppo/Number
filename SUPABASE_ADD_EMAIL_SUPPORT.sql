-- AGGIUNTA CAMPO EMAIL AI PROFILI (Per Login via Username)

-- 1. Aggiungi colonna email alla tabella profiles (se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email text;
    END IF;
END $$;

-- 2. Permetti lettura pubblica della mail (NECESSARIO per il login tramite username)
--    Senza questo, l'authService non puo' trovare la mail partendo dall'username.
--    NB: Questo espone le email in chiaro a chi sa fare query dirette. 
--    Per un gioco semplice va bene. In produzione enterprise servirebbe una "Edge Function" sicura.
CREATE POLICY "Public profiles email viewable" ON profiles
FOR SELECT USING (true);

-- 3. Crea una funzione per sincronizzare automaticamente la mail all'iscrizione
--    Cosi quando un utente si iscrive, la sua mail viene copiata nel profilo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Assicura che il trigger esista
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ISTRUZIONI:
-- Esegui questo script in Supabase SQL Editor.
