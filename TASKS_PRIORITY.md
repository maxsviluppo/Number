# 📝 PROMEMORIA SVILUPPO - NUMBER PROJECT

## 🔴 PRIORITÀ 1: Rifinitura Blitz Mode (Interfaccia e UX)
Nonostante i miglioramenti, la dinamica visiva non è ancora ottimale ("non ci siamo ancora").
- **Sintesi Visiva**: Trovare un modo più elegante e premium per mostrare simultaneamente:
    - Round corrente della serie (es. 2 di 5).
    - Progresso dell'avversario nel round attuale (0/5 target).
    - Feedback immediato di chi sta vincendo la serie senza appesantire l'header.
- **Aesthetics**: Elevare ulteriormente il design (effetti, micro-animazioni, posizionamento) per un look state-of-the-art.
- **Validazione Logica**: Verificare la fluidità dei reset tra un round e l'altro per evitare glitch di sincronizzazione.

## 🟡 PRIORITÀ 2: Completamento Time Attack (Duel Mode)
Mancano le componenti core per rendere giocabile la Time Attack in VS:
- **Timer Sincronizzato**: Assicurarsi che entrambi i giocatori vedano lo stesso conto alla rovescia (partendo da 60s).
- **Logica Punteggio**: In questa modalità vince chi accumula più punti/target prima che il tempo scada (a differenza di Blitz che è a round fissi).
- **Interfaccia Specifica**: Mostrare chiaramente il tempo residuo e la differenza di punteggio tra i due sfidanti "live".

## 🟢 PROSSIMI PASSI
1. Analizzare riferimenti di design per dashboard di gioco competitive (Es: Clash Royale, Game Show UI).
2. Refactoring componenti Header in `App.tsx` per maggiore modularità.
3. Implementazione `matchService.syncTimer` per Time Attack.
