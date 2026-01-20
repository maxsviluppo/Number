# Number Game - Logica di Gioco (Elite Rules)

## 1. Sistema di Punteggio (Progressivo per Livello)

Il punteggio scala esponenzialmente in base al **Livello** attuale e alla **Streak** di risposte corrette.

*   **Logica Base**: Il punteggio di partenza per il primo target raddoppia ad ogni livello.
    *   **Livello 1**: 1, 2, 4, 8, 16 punti.
    *   **Livello 2**: 2, 4, 8, 16, 32 punti.
    *   **Livello 3**: 4, 8, 16, 32, 64 punti.
    *   ...e così via.
*   **Errore**: Resetta la streak al valore base del livello corrente.

## 2. Gestione della Griglia (Grid Persistence)

*   **Staticità**: I numeri e gli operatori sulla griglia **NON cambiano** quando si trova una combinazione corretta.
*   **Refresh**: La griglia viene rigenerata **solo ed esclusivamente** al superamento del livello (dopo aver trovato tutti i 5 target).
*   **Sfida**: Il giocatore deve trovare tutte le soluzioni possibili con le risorse limitate visibili a schermo fin dall'inizio del livello.

## 3. Gestione del Tempo (Carry-Over & Bonus)

*   **Tempo Base**: 60 secondi assegnati all'inizio.
*   **Carry-Over (Accumulo)**: Se termini un livello in anticipo, il tempo residuo si **SOMMA** ai 60 secondi del livello successivo.
    *   *Esempio*: Livello terminato in 40s (restano 20s). Nuovo Livello: 60s + 20s = 80s disponibili.
*   **Dynamic Bonus (Livello 5+)**:
    *   A partire dal superamento del 5° livello, ogni combinazione corretta trovata aggiunge **+2 secondi** immediati al timer.

## 4. Difficoltà Progressiva (Infinite Scaling)

Il gioco utilizza un sistema a "scaglioni" per generare target sempre più complessi:

*   **Livelli 1-2**: Range Target facile [1 - 20] (Riscaldamento).
*   **Livelli 3-5**: Range Target medio [8 - 30].
*   **Livelli 6-10**: Range Target avanzato [20 - 50].
*   **Livelli 10+**: Range Target "Genius" (aumenta progressivamente senza limiti).

L'algoritmo garantisce che il gioco rimanga infinito ma sempre sfidante.

---
*Ultimo aggiornamento: 20/01/2026*
