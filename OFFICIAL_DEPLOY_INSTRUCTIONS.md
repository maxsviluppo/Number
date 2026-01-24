# ISTRUZIONI PER L'AGGIORNAMENTO ONLINE

Ottime notizie! Il gioco è completo di Pausa, Salvataggio e Video Logic corretti.

## 1. FILE DA COPIARE SU GITHUB
Devi aggiornare questi file nel tuo repository (o trascinarli se usi l'upload manuale):
*   `App.tsx` (Contiene tutte le logiche di gioco, pausa, video e timer)
*   `types.ts` (Contiene le definizioni aggiornate)
*   `services/supabaseClient.ts` (Se lo hai modificato nelle sessioni precedenti per aggiungere i metodi di save)

> **Nota:** Se usi Git, basta fare `git add .`, `git commit -m "Aggiornamento Pausa e Save"`, `git push`.

## 2. DATABASE (Supabase)
⚠️ **ATTENZIONE:** Hai aggiunto la funzionalità di "Salvataggio Partita", quindi il tuo database online DEVE avere la colonna per ospitare questi dati.

**Cosa devi fare:**
1.  Vai sul tuo progetto Supabase online.
2.  Apri l'**SQL Editor** (icona laterale).
3.  Incolla ed esegui questo comando:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_run_state jsonb default null;
```

*Se non lo fai, il gioco funzionerà ma non salverà i progressi quando chiudi la pagina.*

## 3. VERIFICA
Dopo aver fatto il deploy e aggiornato il DB:
1.  Apri il gioco online.
2.  Gioca un livello.
3.  Premi "Pausa" per vedere se oscura tutto.
4.  Ricarica la pagina (F5) mentre stai giocando: il gioco dovrebbe chiederti "Vuoi riprendere la partita?".

Tutto qui! Sei pronto al lancio. 🚀
