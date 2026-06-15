-- Script per creare la funzione grant_referral_bonus
-- Questa funzione viene chiamata per assegnare un "bonus_charge" (60 secondi)
-- all'utente di cui è stato usato il codice di invito.

CREATE OR REPLACE FUNCTION grant_referral_bonus(ref_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Aggiunge 1 a bonus_charges per l'utente che ha il referral_code specificato.
  -- Se bonus_charges è NULL, lo inizializza a 1.
  UPDATE profiles
  SET bonus_charges = COALESCE(bonus_charges, 0) + 1
  WHERE referral_code = ref_code;
END;
$$;
