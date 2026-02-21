# Number Game: Mobile Integration Workflow

Questo documento contiene le istruzioni per riprendere il lavoro sull'integrazione mobile di "Number".

## Stato Attuale
- **Capacitor** è installato e configurato.
- Cartelle native `/android` e `/ios` create.
- Sistema di **Haptics** (vibrazione) integrato nella logica di gioco (`vibrateDevice`).
- Ottimizzazioni CSS mobile (`user-select: none`, `tap-highlight-color`) applicate in `index.html`.

## Come riprendere i lavori (Slash Command)
Quando vuoi ripartire con lo sviluppo mobile, dimmi semplicemente:
> **"Procediamo con la Fase 4 del piano Mobile"** oppure **"Apri la guida mobile"**.

## Comandi Rapidi
- `npm run build`: Compila il gioco.
- `npx cap sync`: Sincronizza il codice web con le app Android/iOS.
- `npx cap open android`: Apre il progetto in Android Studio.
- `npx cap open ios`: Apre il progetto in Xcode.

---

# Piano Analisi: Monetizzazione tramite Advertising (Rewarded Ads)

L'introduzione di video pubblicitari premio (Rewarded Ads) è il modo migliore per monetizzare un gioco "Hypercasual" come Number.

## 1. Modello di Business e Ricavi stimati
Il formato consigliato è il **Rewarded Video**: l'utente sceglie di guardare un video di 15-30 secondi in cambio di un vantaggio.

### Partner Consigliato: **Google AdMob**
È lo standard per app Android e iOS. Si integra perfettamente con Capacitor tramite plugin ufficiali.

#### Stima Ricavi (eCPM)
Il guadagno dipende dal valore dei mille annunci visualizzati (eCPM).
- **Italia/Europa:** ~€3,00 - €8,00 ogni 1000 video visti.
- **USA:** ~€15,00 - €25,00 ogni 1000 video visti.
- **Esempio:** Se hai 1000 utenti attivi che guardano 2 video al giorno, puoi guadagnare tra i €6 e i €16 al giorno solo con i video premio.

## 2. Meccanica di Gioco ("Time Perk")
**Domanda:** Quanto tempo conviene regalare?
- **Proposta:** +30 o +60 secondi.
- **Perché:** 5 o 10 secondi sono troppo pochi per giustificare un video di 30 secondi. L'utente si sentirebbe frustrato. Regalare un minuto intero dà un valore reale e spinge l'utente a guardare il video.

## 3. Esperienza Utente (UX)
- **Pausa Automatica:** Quando l'utente clicca sull'icona ADV (la "bolla"), il timer del gioco si ferma immediatamente.
- **Ripresa:** Il video parte a schermo intero. Al termine, il gioco mostra un effetto visivo (es. "+60s") e riprende esattamente da dove era rimasto.

## 4. Soluzione Tecnica (Roadmap Implementazione)

### Passaggio 1: Integrazione Plugin AdMob
Useremo `@capacitor-community/admob`. Permette di gestire i video con facilità sia su Web (con placeholder) che su Mobile (con video veri).

### Passaggio 2: Creazione Bolla "Extra Time"
Aggiungeremo un'icona accanto ai target durante la partita carriera. L'icona sarà visibile solo se:
1. Il tempo è sotto una certa soglia (es. meno di 30 secondi rimasti).
2. L'utente non ha già usato il bonus in quel livello (limite di 1 volta per livello).

### Passaggio 3: Gestione Stati
```typescript
const handleRequestExtraTime = () => {
    togglePause(true); // Fermiamo il gioco
    // Chiamata al plugin AdMob per mostrare il video
    AdMob.showRewardVideo().then(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft + 60 }));
        togglePause(false); // Riprendiamo
    });
};
```

---

## Prossimi Passi Consigliati
1.  **Registrazione AdMob:** Dovrai creare un account su [admob.google.com](https://admob.google.com) per ottenere gli ID degli annunci.
2.  **Mock UI:** Possiamo iniziare ora a creare l'icona grafica della bolla ADV e la logica di pausa/ripresa con un "finto video" (per testare la fluidità).

Vuoi che procediamo con la creazione grafica dell'icona Extra Time e della logica di sospensione partita?
