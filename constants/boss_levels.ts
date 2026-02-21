export interface BossLevel {
    id: number;
    requiredLevel: number;
    title: string;
    description: string;
    targets?: number;
    time?: number;
    reward?: string;
    bg?: string;
    isComingSoon?: boolean;
}

export const BOSS_LEVELS: BossLevel[] = [
    {
        id: 1,
        requiredLevel: 5,
        title: "MATEMATICO",
        description: "Risolvi i calcoli!",
        targets: 10,
        time: 90,
        reward: "30s BONUS",
        bg: "bg-emerald-900"
    },
    {
        id: 2,
        requiredLevel: 10,
        title: "FALLEN",
        description: "Celle instabili! Ogni mossa corretta le farà cadere nel vuoto. Trova le combinazioni programmate.",
        targets: 5,
        time: 60,
        reward: "45s BONUS",
        bg: "bg-red-950"
    },
    {
        id: 3,
        requiredLevel: 25,
        title: "L'ARCHITETTO",
        description: "La struttura è tutto.",
        isComingSoon: true
    },
    {
        id: 4,
        requiredLevel: 40,
        title: "CERCATORE D'ORO",
        description: "Sequenze perfette o nulla.",
        isComingSoon: true
    },
    {
        id: 5,
        requiredLevel: 55,
        title: "CYBER DEMON",
        description: "Sconfiggi il codice.",
        isComingSoon: true
    },
    {
        id: 6,
        requiredLevel: 70,
        title: "VIBRANIUM",
        description: "Infrangibile come la tua logica.",
        isComingSoon: true
    },
    {
        id: 7,
        requiredLevel: 85,
        title: "ORACLE",
        description: "Prevedi il risultato.",
        isComingSoon: true
    },
    {
        id: 8,
        requiredLevel: 100,
        title: "TITANO",
        description: "Il peso della matematica.",
        isComingSoon: true
    },
    {
        id: 9,
        requiredLevel: 115,
        title: "NIGHTMARE",
        description: "Zero spazio per l'errore.",
        isComingSoon: true
    },
    {
        id: 10,
        requiredLevel: 130,
        title: "PHANTOM",
        description: "Numeri che appaiono e scompaiono.",
        isComingSoon: true
    },
    {
        id: 11,
        requiredLevel: 145,
        title: "GLITCH",
        description: "Domina il caos.",
        isComingSoon: true
    },
    {
        id: 12,
        requiredLevel: 160,
        title: "NEBULA",
        description: "Oltre i confini del calcolo.",
        isComingSoon: true
    },
    {
        id: 13,
        requiredLevel: 175,
        title: "SUPERNOVA",
        description: "Un'esplosione di cifre.",
        isComingSoon: true
    },
    {
        id: 14,
        requiredLevel: 190,
        title: "QUANTUM",
        description: "Tutto e niente allo stesso tempo.",
        isComingSoon: true
    },
    {
        id: 15,
        requiredLevel: 205,
        title: "SINGULARITY",
        description: "Il punto di non ritorno.",
        isComingSoon: true
    },
    {
        id: 16,
        requiredLevel: 220,
        title: "ORIGIN",
        description: "Dove tutto ebbe inizio.",
        isComingSoon: true
    }
];
