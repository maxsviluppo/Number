import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_FILE = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(TEMPLATE_FILE)) {
  console.error("Template file not found! Run npm run build first.");
  process.exit(1);
}

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

// Embedded BLOG_POSTS data so the script is standalone and independent of TS compilation
const BLOG_POSTS = [
  {
    id: 1,
    title: "Come allenare la mente con i giochi numerici",
    excerpt: "Scopri come stimolare la neuroplasticità cerebrale risolvendo enigmi matematici ogni giorno.",
    category: "Neurologia",
    date: "04 Mar 2026",
    author: "Brain Team",
    slug: "allenare-mente-giochi-numerici",
    content: `
      <p>L'allenamento mentale attraverso i numeri non è solo una sfida per studenti di matematica; è una vera e propria ginnastica per il cervello che può avere impatti profondi sulla nostra longevità cognitiva. Studi recenti nel campo delle neuroscienze hanno dimostrato che l'impegno regolare in attività che richiedono calcolo mentale e risoluzione di problemi logici favorisce la cosiddetta <strong>neuroplasticità</strong>.</p>
      <h2>Cos'è la Neuroplasticità?</h2>
      <p>La neuroplasticità è la capacità del cervello di riorganizzarsi creando nuove connessioni neurali nel corso della vita. Quando affrontiamo un puzzle numerico complesso, il nostro cervello deve "sforzarsi" di trovare percorsi logici alternativi. Questo processo non solo mantiene attive le cellule cerebrali esistenti, ma ne incoraggia anche la comunicazione più efficiente.</p>
      <h2>I Benefici del Calcolo Mentale</h2>
      <p>Oltre alla pura velocità di esecuzione, il calcolo mentale quotidiano migliora:</p>
      <ul>
        <li><strong>Memoria di Lavoro:</strong> Essenziale per trattenere informazioni temporanee mentre elaboriamo altri dati.</li>
        <li><strong>Attenzione Selettiva:</strong> La capacità di concentrarsi su un compito ignorando le distrazioni ambientali.</li>
        <li><strong>Flessibilità Cognitiva:</strong> Passare da un concetto all'altro o da una regola all'altra in modo fluido.</li>
      </ul>
      <h2>Come Iniziare</h2>
      <p>Non serve essere geni della matematica. Il segreto è la costanza. Iniziare con semplici operazioni di addizione e sottrazione in modo rapido, per poi passare a combinazioni più complesse come quelle offerte da <em>Numbergame.it</em>, permette al cervello di adattarsi progressivamente a carichi di lavoro cognitivi superiori.</p>
      <p>In conclusione, dedicare anche solo 10-15 minuti al giorno ai giochi numerici può fare la differenza nel lungo termine, mantenendo la mente lucida, reattiva e pronta ad affrontare le sfide della vita quotidiana con una marcia in più.</p>
    `
  },
  {
    id: 2,
    title: "La matematica dietro i puzzle logici",
    excerpt: "Analisi approfondita degli algoritmi e della logica che governano i giochi di intelletto moderni.",
    category: "Scienza",
    date: "01 Mar 2026",
    author: "Logica Experts",
    slug: "matematica-puzzle-logici",
    content: `
      <p>Molti utenti che giocano su Numbergame.it si chiedono: quale matematica c'è dietro le quinte? Sebbene per il giocatore l'esperienza sia ludica, ogni combinazione di numeri e operatori risponde a leggi matematiche precise e algoritmi di generazione deterministica.</p>
      <h2>L'Algoritmo di Generazione</h2>
      <p>Un buon gioco numerico deve essere risolvibile ma non banale. Utilizziamo algoritmi che generano percorsi (paths) casuali e validano il risultato in tempo reale. Questo assicura che ogni livello presentato all'utente abbia almeno una soluzione valida, spesso nascosta dietro diversi strati di operandi.</p>
      <h2>Proprietà Associativa e Distributiva</h2>
      <p>Senza rendersene conto, il giocatore applica costantemente proprietà fondamentali dell'aritmetica. La capacità di visualizzare come un numero possa essere scomposto o combinato con altri attraverso addizioni o moltiplicazioni è alla base del successo nel gioco. Questo tipo di "pensiero algoritmico" è lo stesso utilizzato dai programmatori per risolvere problemi complessi nel mondo del software.</p>
      <h2>Perché la Logica è Divertente?</h2>
      <p>Il cervello umano è evolutivamente programmato per cercare dei pattern, ovvero dei modelli ricorrenti. Quando "risolviamo" un puzzle, il nostro sistema dopaminergico rilascia una piccola quantità di dopamina (il neurotrasmettitore del piacere), ricompensandoci per aver ristabilito l'ordine dal caos numerico.</p>
      <p>Capire la struttura logica del gioco non solo aiuta a scalare le classifiche, ma apre una finestra affascinante sulla bellezza intrinseca della matematica pura applicata al divertimento digitale.</p>
    `
  },
  {
    id: 3,
    title: "Benefici del brain training quotidiano",
    excerpt: "Perché dedicare solo 10 minuti al giorno al calcolo mentale può migliorare la tua vita professionale.",
    category: "Salute",
    date: "25 Feb 2026",
    author: "Health & Mind",
    slug: "benefici-brain-training",
    content: `
      <p>Viviamo in un'epoca di sovraccarico informativo e distrazioni costanti. In questo contesto, il "Brain Training" (allenamento cerebrale) è diventato essenziale per mantenere alti livelli di produttività e benessere mentale.</p>
      <h2>Il Concetto di "Muscolo Cerebrale"</h2>
      <p>Sebbene il cervello non sia un muscolo in senso stretto, si comporta in modo simile: se non viene esercitato, tende a perdere tono. Il brain training quotidiano funge da "palestra" per le funzioni esecutive, ovvero quelle capacità mentali che ci permettono di pianificare, focalizzare l'attenzione e gestire compiti multipli.</p>
      <h2>Vantaggi nella Vita Professionale</h2>
      <ul>
        <li><strong>Risoluzione dei Problemi:</strong> Chi allena regolarmente la logica tende a trovare soluzioni più creative e rapide sul posto di lavoro.</li>
        <li><strong>Gestione dello Stress:</strong> Essendo abituati a sfide che richiedono concentrazione sotto pressione (come i livelli a tempo), si sviluppa una maggiore resilienza mentale.</li>
        <li><strong>Precisione:</strong> L'abitudine al rigore matematico riduce la probabilità di errori banali dovuti a distrazione.</li>
      </ul>
      <h2>Quanto Esercizio Serve?</h2>
      <p>La scienza suggerisce che sessioni brevi ma intense sono più efficaci di lunghe sessioni sporadiche. Solo 10 minuti di Numbergame al giorno possono produrre risultati tangibili in poche settimane. Non è necessario stancarsi; l'obiettivo è mantenere il cervello in uno stato di "flusso" (flow) dove la sfida bilancia perfettamente le proprie abilità.</p>
      <p>Investire sulla propria mente è l'investimento con il più alto ritorno possibile, sia in termini di salute che di carriera.</p>
    `
  },
  {
    id: 4,
    title: "Strategie per migliorare nel calcolo mentale",
    excerpt: "Consigli pratici e trucchi matematici per diventare un campione di Numbergame.",
    category: "Tutorial",
    date: "20 Feb 2026",
    author: "Math Master",
    slug: "strategie-migliorare-calcolo-mentale",
    content: `
      <p>Vuoi scalare la classifica di Numbergame.it? Diventare rapidi nel calcolo mentale non richiede poteri soprannaturali, ma solo l'applicazione di alcune strategie intelligenti che rilassano la mente e riducono il carico cognitivo.</p>
      <h2>1. Visualizzazione è Potere</h2>
      <p>Invece di ripetere i numeri a mente, cerca di visualizzare l'operazione come un'immagine. Questo attiva la memoria visiva, che è spesso più rapida di quella verbale.</p>
      <h2>2. Arrotondamento e Compensazione</h2>
      <p>Quando devi fare calcoli complessi, prova ad arrotondare per eccesso o difetto. Per esempio, per fare 19 x 4, puoi pensare a (20 x 4) - 4.</p>
      <h2>3. Memorizza i "Mattoni"</h2>
      <p>Imparare a memoria le potenze di 2, i quadrati fino a 20 e le tabelline fornisce una base di dati immediata a cui il cervello può attingere senza dover ricalcolare tutto da zero.</p>
      <h2>4. Respira e Mantieni il Calmo</h2>
      <p>L'ansia da tempo blocca la corteccia prefrontale, l'area dedicata al calcolo. Se sei bloccato su un target, chiudi gli occhi per un secondo, fai un respiro profondo e guarda la griglia da una nuova angolazione.</p>
    `
  },
  {
    id: 5,
    title: "Perché i puzzle numerici riducono lo stress",
    excerpt: "La scienza del relax attraverso la concentrazione focalizzata.",
    category: "Benessere",
    date: "15 Feb 2026",
    author: "Zen Mind",
    slug: "puzzle-numerici-stress",
    content: `
      <p>Può sembrare un paradosso: come può un gioco che richiede sforzo mentale ridurre lo stress? La risposta risiede in un fenomeno psicologico chiamato **"Focalizzazione Attentiva"**.</p>
      <h2>Fuga dalle Preoccupazioni</h2>
      <p>Quando siamo stressati, la nostra mente tende a vagare tra pensieri ansiosi. Un puzzle logico richiede tutta la nostra attenzione, costringendoci a staccare dai problemi quotidiani.</p>
      <h2>Lo Stato di Flow</h2>
      <p>Lo stato di "Flow" (flusso) si raggiunge quando siamo così immersi in un'attività da perdere la cognizione del tempo. In questo stato, i livelli di cortisolo diminuiscono sensibilmente.</p>
    `
  },
  {
    id: 6,
    title: "Intelligence Quotient (IQ) e Gaming",
    excerpt: "Come il nostro algoritmo AI stima il tuo QI di gioco e cosa significa veramente.",
    category: "AI",
    date: "10 Feb 2026",
    author: "Neural Lab",
    slug: "iq-gaming-ai",
    content: `
      <p>Su Numbergame.it, calcoliamo un valore chiamato **Estimated IQ**. Monitoriamo velocità di reazione, percorso ottimale, precisione e adattabilità per stimare la tua efficienza cognitiva numerica.</p>
    `
  },
  {
    id: 7,
    title: "Perché la matematica è il linguaggio universale",
    excerpt: "Un viaggio filosofico attraverso i numeri, da Pitagora al Neural Gaming.",
    category: "Filosofia",
    date: "05 Feb 2026",
    author: "Philo Math",
    slug: "matematica-linguaggio-universale",
    content: `
      <p>Giocare con i numeri significa interagire con le strutture fondamentali della realtà. La logica matematica è l'unica vera lingua globale che supera qualsiasi barriera culturale o linguistica.</p>
    `
  },
  {
    id: 8,
    title: "Sviluppo cognitivo e logica nei bambini",
    excerpt: "L'importanza di introdurre i concetti matematici attraverso il gioco sin dalla tenera età.",
    category: "Educazione",
    date: "01 Feb 2026",
    author: "Edu Pro",
    slug: "sviluppo-cognitivo-logica-bambini",
    content: `
      <p>Giochi logici come Numbergame aiutano a sviluppare il "senso del numero" e la capacità di problem solving in modo ludico ed efficace fin da piccoli.</p>
    `
  },
  {
    id: 9,
    title: "Storia dei giochi matematici: millenni di logica",
    excerpt: "Dai quadrati magici dell'antica Cina alle moderne app di puzzle game.",
    category: "Storia",
    date: "28 Gen 2026",
    author: "History Buff",
    slug: "storia-giochi-matematici",
    content: `
      <p>L'uomo gioca con i numeri da millenni. Dai quadrati magici alle tavolette d'argilla, fino alle app moderne, la sfida di ristabilire l'ordine logico resta una costante della nostra evoluzione.</p>
    `
  },
  {
    id: 10,
    title: "La gamification nell'apprendimento",
    excerpt: "Perché badge e classifiche ci spingono a diventare più bravi nei calcoli.",
    category: "Tecnologia",
    date: "20 Gen 2026",
    author: "Game Designer",
    slug: "gamification-apprendimento",
    content: `
      <p>La presenza di badge, obiettivi e classifiche globali trasforma lo sforzo cognitivo in uno sport gratificante, rilasciando dopamina e stimolando una crescita costante.</p>
    `
  }
];

// Helper to write static file inside a subdirectory (e.g. dist/site/index.html)
function writePage(routePath, htmlContent, metaTags = {}) {
  const dir = routePath === '__root__' ? DIST_DIR : path.join(DIST_DIR, routePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  let pageHtml = template;

  // Replace Title
  if (metaTags.title) {
    pageHtml = pageHtml.replace(/<title>.*?<\/title>/, `<title>${metaTags.title}</title>`);
  }

  // Inject Meta Description and other SEO headers
  let headSEO = '';
  if (metaTags.description) {
    headSEO += `\n  <meta name="description" content="${metaTags.description.replace(/"/g, '&quot;')}" />`;
  }
  if (metaTags.keywords) {
    headSEO += `\n  <meta name="keywords" content="${metaTags.keywords.replace(/"/g, '&quot;')}" />`;
  }
  // Open Graph
  headSEO += `\n  <meta property="og:type" content="website" />`;
  if (metaTags.title) {
    headSEO += `\n  <meta property="og:title" content="${metaTags.title.replace(/"/g, '&quot;')}" />`;
  }
  if (metaTags.description) {
    headSEO += `\n  <meta property="og:description" content="${metaTags.description.replace(/"/g, '&quot;')}" />`;
  }
  headSEO += `\n  <meta property="og:site_name" content="Numbergame" />`;
  
  // Insert inside head
  pageHtml = pageHtml.replace('</head>', `${headSEO}\n</head>`);

  // Insert body inside the react root container
  const rootPlaceholder = '<div id="root">';
  const rootIndex = pageHtml.indexOf(rootPlaceholder);
  if (rootIndex !== -1) {
    const insertPosition = rootIndex + rootPlaceholder.length;
    pageHtml = pageHtml.slice(0, insertPosition) + `\n${htmlContent}\n` + pageHtml.slice(insertPosition);
  }

  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml, 'utf8');
  console.log(`Pre-rendered: ${routePath === '__root__' ? '/' : routePath + '/'}index.html`);
}

// Common Layout components to replicate for crawler
const headerHtml = `
<header style="background: rgba(15, 23, 42, 0.9); border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
  <div style="display: flex; align-items: center; gap: 8px;">
    <div style="width: 32px; height: 32px; background: #FF8800; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: white; font-style: italic;">N</div>
    <a href="/" style="font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 20px; color: #FF8800; text-decoration: none;">number</a>
  </div>
  <nav style="display: flex; gap: 24px;">
    <a href="/" style="color: #cbd5e1; text-decoration: none; font-weight: 600; font-size: 14px;">Home</a>
    <a href="/play" style="color: #ffffff; text-decoration: none; font-weight: 900; font-size: 14px;">Gioca</a>
    <a href="/blog" style="color: #cbd5e1; text-decoration: none; font-weight: 600; font-size: 14px;">Blog</a>
    <a href="/about" style="color: #cbd5e1; text-decoration: none; font-weight: 600; font-size: 14px;">About</a>
  </nav>
</header>
`;

const footerHtml = `
<footer style="background: #020617; border-top: 1px solid rgba(255, 255, 255, 0.05); padding: 48px 24px; margin-top: 80px;">
  <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 40px; color: #94a3b8; font-family: 'Inter', sans-serif;">
    <div>
      <h4 style="color: #ffffff; font-weight: 700; margin-bottom: 16px;">numbergame.it</h4>
      <p style="font-size: 14px; line-height: 1.6;">La piattaforma definitiva per gli amanti dei numeri. Allenamento cognitivo, competizione e divertimento.</p>
    </div>
    <div>
      <h4 style="color: #FF8800; font-weight: 700; margin-bottom: 16px;">Link Utili</h4>
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 2;">
        <li><a href="/play" style="color: #94a3b8; text-decoration: none;">Gioca Ora</a></li>
        <li><a href="/blog" style="color: #94a3b8; text-decoration: none;">Blog & News</a></li>
        <li><a href="/about" style="color: #94a3b8; text-decoration: none;">Chi Siamo</a></li>
      </ul>
    </div>
    <div>
      <h4 style="color: #FF8800; font-weight: 700; margin-bottom: 16px;">Legale</h4>
      <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 2;">
        <li><a href="/privacy" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a></li>
        <li><a href="/cookies" style="color: #94a3b8; text-decoration: none;">Cookie Policy</a></li>
        <li><a href="/terms" style="color: #94a3b8; text-decoration: none;">Termini d'uso</a></li>
      </ul>
    </div>
  </div>
  <div style="text-align: center; color: #475569; font-size: 11px; margin-top: 48px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 24px;">
    © 2026 GIULINCY SRL • ALL RIGHTS RESERVED • MATH IS POWER
  </div>
</footer>
`;

// 1. Pre-render Landing Page (/site)
const siteHtml = `
<div style="background-color: #020617; color: #ffffff; min-height: 100vh; font-family: 'Inter', sans-serif;">
  ${headerHtml}
  <main style="max-width: 1200px; margin: 0 auto; padding: 80px 24px; text-align: center;">
    <span style="background: rgba(255, 136, 0, 0.1); border: 1px solid rgba(255, 136, 0, 0.2); color: #FF8800; padding: 6px 16px; border-radius: 9999px; font-size: 12px; font-weight: 900; letter-spacing: 2px;">NEURAL MATH GAMING • V2.0</span>
    <h1 style="font-family: 'Orbitron', sans-serif; font-size: 48px; font-weight: 900; margin-top: 24px; margin-bottom: 16px; line-height: 1.1;">Sfida la tua Mente con la Logica Matematica</h1>
    <p style="color: #94a3b8; font-size: 18px; max-width: 600px; margin: 0 auto 40px auto; line-height: 1.6;">Il gioco di logica numerica più avanzato. Allena il tuo quoziente intellettivo (QI), partecipa a duelli neurali 1vs1 e scala la classifica globale.</p>
    <a href="/play" style="background: #FF8800; color: #000000; padding: 16px 40px; border-radius: 12px; font-weight: 900; text-decoration: none; display: inline-block; font-size: 18px; box-shadow: 0 0 30px rgba(255,136,0,0.3);">INIZIA A GIOCARE ORA</a>
  </main>
  
  <section style="background: rgba(15, 23, 42, 0.4); padding: 80px 24px; border-top: 1px solid rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
    <div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 48px;">
      <div style="text-align: center;">
        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #FF8800;">Allena la Logica</h3>
        <p style="color: #94a3b8; line-height: 1.6;">Risolvi enigmi matematici sempre più complessi per stimolare la neuroplasticità cerebrale e migliorare la concentrazione.</p>
      </div>
      <div style="text-align: center;">
        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #38bdf8;">Neural Duel 1vs1</h3>
        <p style="color: #94a3b8; line-height: 1.6;">Sfida altri giocatori online in tempo reale nelle modalità Standard o Blitz ad alta velocità.</p>
      </div>
      <div style="text-align: center;">
        <h3 style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 12px; color: #c084fc;">Scala i Ranking</h3>
        <p style="color: #94a3b8; line-height: 1.6;">Accumula punti, sblocca badge unici e confrontati con una community globale di amanti dei numeri.</p>
      </div>
    </div>
  </section>

  <section style="max-width: 1200px; margin: 0 auto; padding: 60px 24px 80px;">
    <h2 style="font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900; text-align: center; margin-bottom: 12px;">Blog e approfondimenti</h2>
    <p style="color: #94a3b8; text-align: center; max-width: 640px; margin: 0 auto 32px; line-height: 1.7;">Articoli originali su calcolo mentale, neuroplasticità, strategie di studio e benessere cognitivo. Contenuti pensati per chi vuole allenare la mente oltre la partita.</p>
    <div style="text-align: center;">
      <a href="/blog" style="color: #FF8800; font-weight: 900; text-decoration: none; margin-right: 24px;">Vai al Blog →</a>
      <a href="/about" style="color: #cbd5e1; font-weight: 700; text-decoration: none;">Chi Siamo</a>
    </div>
  </section>
  ${footerHtml}
</div>
`;
writePage('__root__', siteHtml, {
  title: "Numbergame | Allena la mente con i puzzle matematici",
  description: "Sfida la tua mente con Numbergame.it, il gioco di logica matematica più avanzato. Allena il tuo cervello, partecipa a duelli 1vs1 online e migliora il tuo QI.",
  keywords: "numbergame, gioco logica matematica, allenamento mentale, cervello, duelli logica, calcolo mentale"
});

writePage('site', siteHtml, {
  title: "Numbergame | Allena la mente con i puzzle matematici",
  description: "Sfida la tua mente con Numbergame.it, il gioco di logica matematica più avanzato. Allena il tuo cervello, partecipa a duelli 1vs1 online e migliora il tuo QI.",
  keywords: "numbergame, gioco logica matematica, allenamento mentale, cervello, duelli logica, calcolo mentale"
});

// 2. Pre-render Blog Index (/blog)
const blogListHtml = BLOG_POSTS.map(post => `
  <article style="background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; margin-bottom: 16px;">
    <div>
      <span style="color: #FF8800; font-size: 12px; font-weight: 700; text-transform: uppercase;">${post.category}</span>
      <h3 style="font-family: 'Orbitron', sans-serif; font-size: 20px; font-weight: 700; margin-top: 8px; margin-bottom: 12px; color: #ffffff;">${post.title}</h3>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">${post.excerpt}</p>
    </div>
    <a href="/blog/${post.slug}" style="color: #FF8800; font-weight: 900; font-size: 14px; text-decoration: none; text-transform: uppercase; margin-top: auto; display: inline-flex; align-items: center; gap: 4px;">Leggi Articolo →</a>
  </article>
`).join('');

const blogHtml = `
<div style="background-color: #020617; color: #ffffff; min-height: 100vh; font-family: 'Inter', sans-serif;">
  ${headerHtml}
  <main style="max-width: 1200px; margin: 0 auto; padding: 80px 24px;">
    <h1 style="font-family: 'Orbitron', sans-serif; font-size: 40px; font-weight: 900; text-align: center; margin-bottom: 16px;">Approfondimenti Neurali & Blog</h1>
    <p style="color: #94a3b8; font-size: 16px; text-align: center; max-width: 600px; margin: 0 auto 60px auto;">Esplora il mondo della logica, della matematica e del potenziamento cognitivo attraverso i nostri articoli scientifici.</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 32px;">
      ${blogListHtml}
    </div>
  </main>
  ${footerHtml}
</div>
`;
writePage('blog', blogHtml, {
  title: "Blog & Approfondimenti Neurali | Numbergame",
  description: "Esplora i nostri articoli su neuroplasticità, benefici del calcolo mentale, brain training e strategie matematiche per allenare il cervello.",
  keywords: "blog matematica, calcolo mentale benefici, neuroplasticità giochi, brain training quotidiano"
});

// 3. Pre-render individual blog posts (/blog/:slug)
BLOG_POSTS.forEach(post => {
  const postHtml = `
  <div style="background-color: #020617; color: #ffffff; min-height: 100vh; font-family: 'Inter', sans-serif;">
    ${headerHtml}
    <main style="max-width: 800px; margin: 0 auto; padding: 80px 24px;">
      <a href="/blog" style="color: #94a3b8; text-decoration: none; font-size: 14px;">← Torna al Blog</a>
      <div style="margin-top: 24px; margin-bottom: 40px;">
        <span style="color: #FF8800; font-weight: 700; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">${post.category}</span>
        <h1 style="font-family: 'Orbitron', sans-serif; font-size: 36px; font-weight: 900; margin-top: 8px; margin-bottom: 16px; color: #ffffff; line-height: 1.2;">${post.title}</h1>
        <div style="color: #64748b; font-size: 14px;">
          <span>Data: ${post.date}</span> • <span>Autore: ${post.author}</span>
        </div>
      </div>
      <div style="font-size: 16px; line-height: 1.8; color: #e2e8f0; font-family: 'Inter', sans-serif;">
        ${post.content}
      </div>
    </main>
    ${footerHtml}
  </div>
  `;
  writePage(`blog/${post.slug}`, postHtml, {
    title: `${post.title} | Blog Numbergame`,
    description: post.excerpt,
    keywords: `${post.category.toLowerCase()}, ${post.title.toLowerCase().replace(/ /g, ', ')}`
  });
});

// 4. Pre-render Static Legal Pages
const createSimpleStaticPage = (pathName, title, headline, bodyText) => {
  const pageHtml = `
  <div style="background-color: #020617; color: #ffffff; min-height: 100vh; font-family: 'Inter', sans-serif;">
    ${headerHtml}
    <main style="max-width: 800px; margin: 0 auto; padding: 80px 24px;">
      <h1 style="font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; margin-bottom: 24px; color: #ffffff;">${headline}</h1>
      <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1;">
        ${bodyText}
      </div>
    </main>
    ${footerHtml}
  </div>
  `;
  writePage(pathName, pageHtml, {
    title: `${title} | Numbergame`,
    description: `Leggi la pagina di ${title} sul nostro sito ufficiale Numbergame.`
  });
};

createSimpleStaticPage('about', 'Chi Siamo', 'Chi Siamo — Numbergame.it', `
  <p><strong>Numbergame.it</strong> è una piattaforma italiana di intrattenimento educativo sviluppata da <strong>Giulincy srl</strong>. Uniamo game design, logica matematica e competizione online per offrire un'esperienza gratuita di brain training accessibile a studenti, adulti e appassionati di puzzle numerici.</p>

  <h2 style="color: #FF8800; font-family: 'Orbitron', sans-serif; margin-top: 32px;">Cosa trovi su Numbergame</h2>
  <ul style="line-height: 1.9; padding-left: 20px;">
    <li><strong>Modalità Campagna:</strong> risolvi combinazioni numeriche su una griglia esagonale, completa obiettivi a tempo e scala i livelli.</li>
    <li><strong>Neural Duel 1vs1:</strong> sfida altri giocatori in tempo reale nelle modalità Standard e Blitz.</li>
    <li><strong>Classifiche globali:</strong> accumula punteggio, monitora il tuo QI stimato e confrontati con la community.</li>
    <li><strong>Boss Challenge:</strong> livelli speciali con regole avanzate per giocatori esperti.</li>
    <li><strong>Blog editoriale:</strong> articoli su calcolo mentale, neuroplasticità, strategie di studio e benessere cognitivo.</li>
  </ul>

  <h2 style="color: #FF8800; font-family: 'Orbitron', sans-serif; margin-top: 32px;">Perché allenare la mente con i numeri</h2>
  <p>La ricerca in ambito cognitivo suggerisce che esercizi regolari di calcolo mentale e risoluzione di problemi possono sostenere attenzione, memoria di lavoro e flessibilità mentale. Numbergame trasforma questo allenamento in un gioco coinvolgente, con feedback immediato e progressione graduale.</p>

  <h2 style="color: #FF8800; font-family: 'Orbitron', sans-serif; margin-top: 32px;">Il team</h2>
  <p>Il progetto è ideato da <strong>Giovanni Coda</strong> (Product Manager) e sviluppato da <strong>Castro Massimo</strong>, con focus su performance mobile, accessibilità e sicurezza dei dati (GDPR).</p>

  <h2 style="color: #FF8800; font-family: 'Orbitron', sans-serif; margin-top: 32px;">Contenuti e trasparenza</h2>
  <p>Oltre al gioco, pubblichiamo regolarmente contenuti originali nel <a href="/blog" style="color: #FF8800;">blog</a>, pagine legali complete (privacy, cookie, termini) e un canale di contatto diretto per assistenza e partnership: <a href="mailto:info@numbergame.it" style="color: #FF8800;">info@numbergame.it</a>.</p>

  <p style="margin-top: 24px;"><a href="/play" style="background: #FF8800; color: #000; padding: 12px 24px; border-radius: 8px; font-weight: 900; text-decoration: none; display: inline-block;">Inizia a giocare gratis</a></p>
`);

createSimpleStaticPage('contact', 'Contatti', 'Contattaci', `
  <p>Per qualsiasi domanda, dubbio o proposta commerciale, puoi scrivere una email al nostro supporto clienti:</p>
  <p style="font-size: 18px; color: #FF8800; font-weight: 700; margin-top: 16px;">supporto@numbergame.it</p>
  <p style="margin-top: 24px;">Risponderemo a tutte le richieste entro 24-48 ore lavorative.</p>
`);

createSimpleStaticPage('privacy', 'Privacy Policy', 'Privacy Policy', `
  <p>Trattiamo tutti i dati dei nostri utenti con il massimo rispetto e in totale conformità con il GDPR.</p>
  <p>Per visualizzare i dettagli completi sul trattamento, l'archiviazione e la cancellazione dei dati raccolti nel gioco o nel sito, consulta la nostra informativa sulla privacy.</p>
`);

createSimpleStaticPage('cookies', 'Cookie Policy', 'Cookie Policy', `
  <p>Il nostro sito utilizza cookie tecnici ed analitici per ottimizzare l'esperienza utente e monitorare le performance della piattaforma in modo anonimo.</p>
  <p>Puoi modificare le preferenze di consenso in qualsiasi momento attraverso il banner presente in basso.</p>
`);

createSimpleStaticPage('terms', 'Termini d\'Uso', 'Termini di Servizio', `
  <p>L'accesso e l'utilizzo dei servizi gratuiti e delle modalità competitive su Numbergame.it sono soggetti all'accettazione dei nostri termini di servizio.</p>
  <p>Gli utenti si impegnano a utilizzare il servizio in modo leale, senza ricorrere a bot o alterazioni software durante i duelli competitivi.</p>
`);

console.log("Pre-rendering process completed successfully.");
