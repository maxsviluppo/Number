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
    created_at: string;
}

export const matchService = {
    // Crea una nuova richiesta di partita
    async createMatch(playerId: string, seed: string): Promise<Match | null> {
        const { data, error } = await supabase
            .from('matches')
            .insert([{
                player1_id: playerId,
                grid_seed: seed,
                status: 'pending',
                target_score: 5 // Default victory condition
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
        const { error } = await supabase
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

    // Trova una partita aperta in attesa
    async findOpenMatch(): Promise<Match | null> {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'pending')
            .is('player2_id', null)
            .order('created_at', { ascending: false }) // Prendi la più recente
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignora errore "nessuna riga trovata"
            console.error('Error finding match:', error);
        }
        return data || null;
    },

    // Aggiorna il punteggio di un giocatore
    async updateScore(matchId: string, playerId: string, newScore: number, isPlayer1: boolean) {
        const updateData = isPlayer1
            ? { player1_score: newScore }
            : { player2_score: newScore };

        const { error } = await supabase
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error updating score:', error);
    },

    // Dichiara vittoria
    async declareWinner(matchId: string, winnerId: string) {
        const { error } = await supabase
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
        return supabase
            .channel(`match:${matchId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
                (payload) => callback(payload)
            )
            .subscribe();
    }
};
