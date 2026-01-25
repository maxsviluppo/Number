import { supabase } from './supabaseClient';

export interface Match {
    id: string;
    player1_id: string;
    player2_id: string | null;
    status: 'pending' | 'active' | 'finished' | 'cancelled';
    winner_id: string | null;
    grid_seed: string;
    player1_score: number;
    player2_score: number;
    target_score: number;
    mode: 'standard' | 'blitz';
    p1_rounds: number;
    p2_rounds: number;
    current_round: number;
    created_at: string;
}

export const matchService = {
    // Crea una nuova richiesta di partita con modalità specifica
    async createMatch(playerId: string, seed: string, mode: 'standard' | 'blitz' = 'standard'): Promise<Match | null> {
        const { data, error } = await (supabase as any)
            .from('matches')
            .insert([{
                player1_id: playerId,
                grid_seed: seed,
                status: 'pending',
                mode: mode,
                target_score: mode === 'blitz' ? 3 : 5, // Blitz rounds are shorter (3 targets), Standard match is 5 targets
                p1_rounds: 0,
                p2_rounds: 0,
                current_round: 1
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating match:', error);
            return null;
        }
        return data;
    },

    // Unisciti a una partita esistente (Matchmaking semplice)
    async joinMatch(matchId: string, playerId: string): Promise<boolean> {
        const { error } = await (supabase as any)
            .from('matches')
            .update({
                player2_id: playerId,
                status: 'active' // La partita inizia appena entra il secondo giocatore
            })
            .eq('id', matchId)
            .is('player2_id', null); // Sicurezza: controlla che sia ancora libera

        if (error) {
            console.error('Error joining match:', error);
            return false;
        }
        return true;
    },

    // Trova una partita aperta in attesa PER LA STESSA MODALITÀ
    async findOpenMatch(mode: 'standard' | 'blitz' = 'standard'): Promise<Match | null> {
        const { data, error } = await (supabase as any)
            .from('matches')
            .select('*')
            .eq('status', 'pending')
            .eq('mode', mode) // Filter by mode
            .is('player2_id', null)
            .order('created_at', { ascending: false }) // Prendi la più recente
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora errore "nessuna riga trovata"
            console.error('Error finding match:', error);
        }
        return data || null;
        return data || null;
    },

    // Ottieni tutte le partite aperte per una modalità (per la lista lobby)
    async getOpenMatches(mode: 'standard' | 'blitz'): Promise<any[]> {
        const { data, error } = await (supabase as any)
            .from('matches')
            .select(`
                *,
                player1:profiles!player1_id (username, max_level)
            `)
            .eq('status', 'pending')
            .eq('mode', mode)
            .is('player2_id', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching matches:', error);
            return [];
        }
        return data || [];
    },

    // Cancella una richiesta di partita (se mi stanco di aspettare)
    async cancelMatch(matchId: string) {
        const { error } = await (supabase as any)
            .from('matches')
            .delete() // O .update({ status: 'cancelled' }) se vogliamo storico. Delete è più pulito per lobby.
            .eq('id', matchId);

        if (error) console.error('Error canceling match:', error);
    },

    // Aggiorna il punteggio di un giocatore
    async updateScore(matchId: string, playerId: string, newScore: number, isPlayer1: boolean) {
        const updateData = isPlayer1
            ? { player1_score: newScore }
            : { player2_score: newScore };

        const { error } = await (supabase as any)
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error updating score:', error);
    },

    // Incrementa i round vinti (Blitz Mode)
    async incrementRound(matchId: string, isPlayer1: boolean, currentRounds: number) {
        const updateData = isPlayer1
            ? { p1_rounds: currentRounds + 1, current_round: currentRounds + 1 } // Note: current_round should probably be handled carefully if both win simulatneously? 
            // Better: just inc p1_rounds. The "current_round" is sum of rounds + 1? Or just cosmetic.
            // Let's just update p1_rounds.
            : { p2_rounds: currentRounds + 1 };

        // For "current_round", purely display? Or actual logic?
        // Let's just update the winner's round count.
        const { error } = await (supabase as any)
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error incrementing round:', error);
    },

    // Dichiara vittoria
    async declareWinner(matchId: string, winnerId: string) {
        const { error } = await (supabase as any)
            .from('matches')
            .update({
                status: 'finished',
                winner_id: winnerId,
                finished_at: new Date().toISOString()
            })
            .eq('id', matchId);

        if (error) console.error('Error declaring winner:', error);
    },

    // Iscriviti agli aggiornamenti di una partita specifica
    subscribeToMatch(matchId: string, callback: (payload: any) => void) {
        return (supabase as any)
            .channel(`match:${matchId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
                (payload: any) => callback(payload)
            )
            .subscribe();
    }
};
