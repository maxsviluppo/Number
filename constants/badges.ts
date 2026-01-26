
import { Trophy, Zap, Brain, Target, Star, Crown, Flame, Medal } from 'lucide-react';

export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: any; // Lucide icon component
    color: string; // Tailwind text color class
    bgGradient: string; // Tailwind bg gradient class for unlocked state
    condition: (stats: { total_score: number; max_level: number; estimated_iq: number }) => boolean;
}

export const BADGES: Badge[] = [
    {
        id: 'rookie',
        title: 'Recluta',
        description: 'Inizia il viaggio. Raggiungi il Livello 2.',
        icon: Star,
        color: 'text-cyan-400',
        bgGradient: 'from-cyan-500/20 to-blue-500/20',
        condition: (stats) => stats.max_level >= 2
    },
    {
        id: 'score_1000',
        title: 'Promessa',
        description: 'Raggiungi 1.000 punti totali.',
        icon: Zap,
        color: 'text-yellow-400',
        bgGradient: 'from-yellow-500/20 to-orange-500/20',
        condition: (stats) => stats.total_score >= 1000
    },
    {
        id: 'iq_110',
        title: 'Sveglio',
        description: 'Raggiungi un QI stimato di 110.',
        icon: Brain,
        color: 'text-pink-400',
        bgGradient: 'from-pink-500/20 to-rose-500/20',
        condition: (stats) => stats.estimated_iq >= 110
    },
    {
        id: 'level_10',
        title: 'Scalatore',
        description: 'Raggiungi il livello 10.',
        icon: Target,
        color: 'text-green-400',
        bgGradient: 'from-green-500/20 to-emerald-500/20',
        condition: (stats) => stats.max_level >= 10
    },
    {
        id: 'score_5000',
        title: 'Esperto',
        description: 'Raggiungi 5.000 punti totali.',
        icon: Flame,
        color: 'text-orange-500',
        bgGradient: 'from-orange-500/20 to-red-500/20',
        condition: (stats) => stats.total_score >= 5000
    },
    {
        id: 'iq_130',
        title: 'Genio',
        description: 'Raggiungi un QI stimato di 130.',
        icon: Crown,
        color: 'text-purple-500',
        bgGradient: 'from-purple-500/20 to-indigo-500/20',
        condition: (stats) => stats.estimated_iq >= 130
    },
    {
        id: 'score_10000',
        title: 'Leggenda',
        description: 'Raggiungi 10.000 punti totali.',
        icon: Medal,
        color: 'text-amber-500',
        bgGradient: 'from-amber-500/20 to-yellow-600/20',
        condition: (stats) => stats.total_score >= 10000
    },
    {
        id: 'iq_145',
        title: 'Visionario',
        description: 'Raggiungi un QI stimato di 145.',
        icon: Trophy,
        color: 'text-emerald-400',
        bgGradient: 'from-emerald-500/20 to-teal-500/20',
        condition: (stats) => stats.estimated_iq >= 145
    }
];
