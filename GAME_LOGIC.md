# Number Game - Logica di Gioco Avanzata "Elite IQ Challenge"

Questo documento descrive le meccaniche di gioco, il sistema di punteggio e la visione competitiva per il progetto "Number".

## 1. Sistema di Punteggio (Exponential Streak)

La progressione del punteggio premia la continuità e la precisione all'interno di ogni livello.

*   **Obiettivo Livello**: Risolvere **5 Target** matematici sequenziali.
*   **Progressione Punteggio**:
    *   1° Target: **5 punti**
    *   2° Target: **10 punti**
    *   3° Target: **20 punti**
    *   4° Target: **40 punti**
    *   5° Target: **80 punti** (Culmine della streak)
*   **Totale per Livello Perfetto**: 155 punti.
*   **Errore**: Interrompe la streak. Il punteggio per il target successivo viene resettato valore base (5 punti).

## 2. Meccanica "Tempo Carry-Over" (Accumulo Strategico)

Il tempo non è solo una scadenza, ma una risorsa accumulabile che premia la velocità di pensiero.

*   **Tempo Base**: Ogni livello concede **60 secondi**.
*   **Carry-Over**: Il tempo NON consumato in un livello viene **trasferito integrailmente** al livello successivo.
    *   *Esempio*: Completamento Liv. 1 in 40s (avanzano 20s). Il Liv. 2 inizia con 60s + 20s = **80 secondi**.
*   **Strategia**: Permette ai giocatori esperti di costruire una "banca del tempo" per affrontare i livelli avanzati, dove la complessità dei calcoli aumenta.

## 3. Bonus "Perfezione" Inter-Livello (Meccanica Futura)

Premia l'eccellenza assoluta nel superare un livello senza alcun errore.

*   **Condizione**: Completare tutti i 5 target del livello attuale senza commettere errori (Streak ininterrotta).
*   **Ricompensa**: Il livello successivo inizia con un **Punteggio Base Potenziato**.
    *   Base Standard: 5 punti.
    *   **Base Potenziata**: **6 punti**.
*   **Nuova Scala (con Bonus)**: 6 → 12 → 24 → 48 → 96 punti.
*   **Effetto**: Un vantaggio esponenziale sul punteggio totale che distingue i veri maestri dai semplici esperti.
*   *Nota*: Se si commette un errore durante un livello "potenziato", il reset riporta alla base standard (5 punti).

## 4. Ranking Globale & Misuratore QI

La competizione si sposta dal semplice "punteggio" al prestigio e alla dimostrazione di intelligenza superiore.

*   **Criterio Principale**: Punteggio Totale accumulato.
*   **Tie-Breaker (Spareggio)**: A parità di punteggio, si posiziona più in alto il giocatore con il **Maggior Tempo Rimanente/Accumulato**.
*   **QI Challenge**: Il gioco calcolerà e visualizzerà un "QI Stimato" basato sulle performance (velocità, streak perfette, complessità raggiunta), offrendo un badge di merito oltre alla posizione numerica.
*   **Filosofia**: Livelli procedurali "infiniti" e difficoltà crescente mettono alla prova la concentrazione umana, creando una selezione naturale dei migliori player globali.

---
*Documento creato il 19/01/2026. Da implementare su richiesta.*
