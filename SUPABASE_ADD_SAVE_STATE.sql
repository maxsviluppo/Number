
-- AGGIUNTA COLONNA PER SALVATAGGIO STATO PARTITA (JSONB)
-- Esegui questo se hai già creato la tabella profiles, altrimenti è incluso nel setup completo

alter table profiles 
add column if not exists current_run_state jsonb default null;

-- Esempio di struttura JSON che salveremo:
-- {
--   "level": 5,
--   "score": 1250,
--   "totalScore": 5000,
--   "timeLeft": 85,
--   "streak": 2,
--   "estimatedIQ": 115,
--   "timestamp": "2026-01-24T..."
-- }
