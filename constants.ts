
export const INITIAL_TIME = 60;
export const BASE_POINTS_START = 5;
export const MAX_STREAK = 5;
export const GRID_ROWS = 7;
export const GRID_COLS = 5;

export const OPERATORS = ['+', '-', '×', '÷'];

export const MOCK_LEADERBOARD = [
  { name: 'Einstein99', score: 12450, iq: 165, country: 'DE' },
  { name: 'MathWizard', score: 11200, iq: 158, country: 'IT' },
  { name: 'LogicQueen', score: 10800, iq: 155, country: 'UK' },
  { name: 'NumberCruncher', score: 9500, iq: 148, country: 'FR' },
  { name: 'HexMaster', score: 8700, iq: 142, country: 'US' },
];

export const APP_CONFIG = {
  seo: {
    game: {
      title: 'Gioca a Number Game | Sfida Matematica & Allena il QI',
      description: 'Entra nell\'arena di Number Game! Risolvi enigmi matematici in tempo reale, sfida amici in Neural Duel e allena il tuo QI con la logica neurale.',
      canonical: 'https://numbergame.it/',
      keywords: 'gioco matematica, brain training, sfida qi, logica neurale, duello matematico, calcolo mentale'
    },
    site: {
      title: 'Number Game | La Piattaforma di Brain Training Matematico',
      description: 'Scopri Number Game: il gioco che potenzia la tua mente. Allena la neuroplasticità cerebrale, scala le classifiche mondiali e scopri i benefici del calcolo mentale.',
      canonical: 'https://numbergame.it/site',
      keywords: 'brain training online, potenziamento cognitivo, matematica divertente, classifiche mondiali, neuroplasticità'
    },
    blog: {
      title: 'Blog Number Game | Neuroplasticità e Curiosità Matematiche',
      description: 'Esplora approfondimenti sulla neurologia, consigli per il brain training e le ultime novità dal mondo di Number Game.',
      canonical: 'https://numbergame.it/blog',
      keywords: 'blog matematica, news brain training, curiosità scientifiche, allenamento mente blog'
    },
    about: {
      title: 'Chi Siamo | La Visione dietro Number Game',
      description: 'Scopri la missione di Numbergame.it: rendere l\'allenamento mentale un\'avventura competitiva e accessibile a tutti.',
      canonical: 'https://numbergame.it/about',
      keywords: 'chi siamo, visione aziendale, missione brain training, team numbergame'
    },
    contact: {
      title: 'Contatti & Supporto | Lavora con Number Game',
      description: 'Hai bisogno di supporto o vuoi proporre una partnership? Contatta il team di Numbergame.it o richiedi preventivi per sviluppo software.',
      canonical: 'https://numbergame.it/contact',
      keywords: 'contatti, supporto tecnico, partnership gaming, sviluppo software, preventivo app'
    },
    privacy: {
      title: 'Privacy Policy & GDPR | Sicurezza dei Dati Number Game',
      description: 'Informativa sul trattamento dei dati personali e conformità GDPR per gli utenti di Numbergame.it.',
      canonical: 'https://numbergame.it/privacy',
      keywords: 'privacy policy, gdpr, sicurezza dati, trattamento dati personali'
    },
    cookies: {
      title: 'Cookie Policy | Trasparenza sull\'uso dei Cookie',
      description: 'Scopri come utilizziamo i cookie tecnici e di terze parti per migliorare la tua esperienza su Number Game.',
      canonical: 'https://numbergame.it/cookies',
      keywords: 'cookie policy, gestione cookie, pubblicità personalizzata'
    },
    terms: {
      title: 'Termini e Condizioni | Regolamento Numbergame.it',
      description: 'Leggi i termini d\'uso, le limitazioni di responsabilità e il regolamento della piattaforma Number Game.',
      canonical: 'https://numbergame.it/terms',
      keywords: 'termini di servizio, condizioni d\'uso, regolamento gioco'
    }
  },
  adsense: {
    client: 'ca-pub-8620196010585213',
    slots: {
      game_bottom: '4546676285',
      home_banner: '4546676285'
    }
  },
  analytics: {
    measurementId: 'G-XXXXXXXXXX' // Da popolare
  }
};

