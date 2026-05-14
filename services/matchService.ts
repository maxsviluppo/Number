import { supabase } from './supabaseClient';

export interface Match {
    id: string;
    player1_id: string;
    player2_id: string | null;
    status: 'pending' | 'active' | 'finished' | 'cancelled' | 'invite_pending';
    winner_id: string | null;
    grid_seed: string;
    player1_score: number;
    player2_score: number;
    target_score: number;
    mode: 'standard' | 'blitz' | 'time_attack';
    p1_rounds: number;
    p2_rounds: number;
    current_round: number; // In Blitz/Dominion Mode: Stores the VALUE of the last stolen target (Positive=P1, Negative=P2)
    created_at: string;
    player1?: { username: string; avatar_url: string };
    player2?: { username: string; avatar_url: string };
}

export const matchService = {
    // Pulisce partite vecchie "appese" del giocatore
    async cleanupUserMatches(playerId: string) {
        try {
            console.log("🧹 Inizializzazione pulizia partite per:", playerId);
            const { error } = await (supabase as any)
                .from('matches')
                .update({ status: 'finished' })
                .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
                .in('status', ['pending', 'active']);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error("Errore pulizia sessioni:", error);
                }
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error("Critical Cleanup Error:", error);
            }
        }
    },

    // Crea una nuova richiesta di partita con modalità specifica
    async createMatch(playerId: string, seed: string, mode: 'standard' | 'blitz' = 'standard'): Promise<Match | null> {
        // [IMPORTANT] Prima di creare, puliamo eventuali partite vecchie rimaste "appese"
        await this.cleanupUserMatches(playerId);

        // [SELF-HEALING] Check if profile exists...
        const { data: profileCheck } = await (supabase as any).from('profiles').select('id').eq('id', playerId).maybeSingle();

        if (!profileCheck) {
            console.warn("⚠️ Profile not found for user. Attempting auto-fix...", playerId);
            // Attempt to create a fallback profile
            const { error: profileError } = await (supabase as any).from('profiles').insert([
                { id: playerId, username: 'Player_' + playerId.substring(0, 4), max_level: 1, elo_rating: 1200 }
            ]);
            if (profileError) {
                console.error("❌ CRITICAL: Failed to create fallback profile. Match creation will likely fail.", profileError);
                // We continue anyway hoping for the best (maybe race condition), but log it.
            } else {
                console.info("✅ Profile auto-created. Proceeding with match.");
            }
        }

        const { data, error } = await (supabase as any)
            .from('matches')
            .insert([
                {
                    player1_id: playerId,
                    grid_seed: seed,
                    mode: mode,
                    status: 'pending', // Explicitly set pending
                    target_score: mode === 'blitz' ? 5 : 5, // Both modes use 5 targets for fair layout and shared grid rules
                    p1_rounds: 0,
                    p2_rounds: 0,
                    current_round: 1
                }
            ])
            .select() // Returns the created object
            .single();

        if (error) {
            console.error('CREATE MATCH ERROR FULL:', error);
            console.error('Payload:', { player1_id: playerId, grid_seed: seed, mode });

            // Analyze Error Code
            if (error.code === '23503') {
                throw new Error("PROFILO NON TROVATO: Effettua il logout e rientra per sincronizzare i dati.");
            } else if (error.code === '42703') {
                throw new Error("ERRORE SCHEMA: Il database non è aggiornato alle ultime funzionalità.");
            } else {
                throw new Error(`ERRORE SFIDA (${error.code}): ${error.message}`);
            }
            return null;
        }
        return data;
    },

    // CREA SFIDA SU INVITO (Diretta)
    async createInviteMatch(playerId: string, opponentId: string, seed: string, mode: 'standard' | 'blitz' | 'time_attack' = 'standard'): Promise<Match | null> {
        try {
            await this.cleanupUserMatches(playerId);

            const { data, error } = await (supabase as any)
                .from('matches')
                .insert([
                    {
                        player1_id: playerId,
                        player2_id: opponentId,
                        grid_seed: seed,
                        mode: mode,
                        status: 'invite_pending',
                        target_score: mode === 'blitz' ? 5 : 5,
                        p1_rounds: 0,
                        p2_rounds: 0,
                        current_round: 1
                    }
                ])
                .select()
                .single();

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('CREATE INVITE MATCH ERROR:', error);
                }
                throw new Error("Impossibile creare l'invito. Riprova.");
            }
            return data;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Invite Error:', error);
            }
            return null;
        }
    },

    // Partecipa a una partita esistente
    async joinMatch(matchId: string, playerId: string): Promise<boolean> {
        try {
            await this.cleanupUserMatches(playerId);

            const { error } = await (supabase as any)
                .from('matches')
                .update({
                    player2_id: playerId,
                    status: 'active'
                })
                .eq('id', matchId)
                .is('player2_id', null);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error joining match:', error);
                }
                return false;
            }
            return true;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Join Error:', error);
            }
            return false;
        }
    },

    // Accetta un invito diretto
    async acceptInvite(matchId: string, playerId: string): Promise<boolean> {
        try {
            await this.cleanupUserMatches(playerId);

            const { error } = await (supabase as any)
                .from('matches')
                .update({
                    status: 'active'
                })
                .eq('id', matchId)
                .eq('player2_id', playerId)
                .eq('status', 'invite_pending');

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error accepting invite:', error);
                }
                return false;
            }
            return true;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Accept Error:', error);
            }
            return false;
        }
    },

    async getPendingInvitesForUser(userId: string): Promise<Match[]> {
        const { data, error } = await (supabase as any)
            .from('matches')
            .select(`
                *,
                player1:player1_id (username, avatar_url, max_level)
            `)
            .eq('player2_id', userId)
            .eq('status', 'invite_pending');

        if (error) {
            console.error('Error fetching pending invites:', error);
            return [];
        }
        return data || [];
    },

    // RIFIUTA INVITO (Cancella la partita)
    async declineInvite(matchId: string, playerId: string) {
        const { error } = await (supabase as any)
            .from('matches')
            .update({ status: 'cancelled' })
            .eq('id', matchId)
            .eq('player2_id', playerId);

        if (error) console.error('Error declining invite:', error);
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
    },

    // Ottieni tutte le partite (Aperte o In Corso) per mostrare lo stato dei giocatori
    async getOpenMatches(mode: 'standard' | 'blitz'): Promise<any[]> {
        console.log("Fetching matches for mode:", mode);

        // Prendiamo SOLO le 'pending' (In Attesa) e le 'active' (In Sfida)
        // Escludiamo le 'finished' per tenere la lobby pulita
        const { data: rawMatches, error: rawError } = await (supabase as any)
            .from('matches')
            .select('*')
            .in('status', ['pending', 'active', 'invite_pending'])
            .eq('mode', mode)
            .order('created_at', { ascending: false })
            .limit(30);

        if (rawError) {
            console.error('LOBBY ERROR (RAW):', rawError);
            return [];
        }

        console.log(`LOBBY: Raw matches found for ${mode}:`, rawMatches?.length || 0);

        // Now attempt to hydrate with profiles
        const { data, error } = await (supabase as any)
            .from('matches')
            .select(`
                *,
                player1:profiles!player1_id (*),
                player2:profiles!player2_id (*)
            `)
            .in('status', ['pending', 'active', 'invite_pending'])
            .eq('mode', mode)
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) {
            console.error('LOBBY ERROR (JOINED):', error);
        }

        // STRATEGIA ROBUSTA: Ignoriamo la join automatica se fallisce e IDRATIAMO SEMPRE MANUALMENTE
        // Raccogliamo tutti gli ID unici dai match trovati
        const matchesToReturn = (data && data.length > 0) ? data : (rawMatches || []);
        const userIds = new Set<string>();

        matchesToReturn.forEach((m: any) => { // Type assertion per sicurezza
            if (m.player1_id) userIds.add(m.player1_id);
            if (m.player2_id) userIds.add(m.player2_id);
        });

        if (userIds.size > 0) {
            console.log(`LOBBY: Idratazione manuale per ${userIds.size} profili...`);
            const { data: profiles, error: profileError } = await (supabase as any)
                .from('profiles')
                .select('id, username, max_level')
                .in('id', Array.from(userIds));

            if (profileError) {
                console.error("LOBBY: Errore idratazione profili:", profileError);
            }

            if (profiles) {
                matchesToReturn.forEach((m: any) => {
                    // Sovrascrivi o riempi player1
                    if (m.player1_id) {
                        const p1 = profiles.find((p: any) => p.id === m.player1_id);
                        if (p1) {
                            // Merge per preservare altri campi se presenti
                            m.player1 = m.player1 ? { ...m.player1, ...p1 } : p1;
                        }
                    }
                    // Sovrascrivi o riempi player2
                    if (m.player2_id) {
                        const p2 = profiles.find((p: any) => p.id === m.player2_id);
                        if (p2) {
                            m.player2 = m.player2 ? { ...m.player2, ...p2 } : p2;
                        }
                    }
                });
            }
        }

        return matchesToReturn;
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
        try {
            const updateData = isPlayer1
                ? { player1_score: newScore }
                : { player2_score: newScore };

            const { error } = await (supabase as any)
                .from('matches')
                .update(updateData)
                .eq('id', matchId);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error updating score:', error);
                }
                throw error;
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Score Update Error:', error);
            }
        }
    },

    // Aggiorna il numero di target trovati
    async updateTargets(matchId: string, isPlayer1: boolean, targetsCount: number) {
        try {
            const updateData = isPlayer1
                ? { p1_rounds: targetsCount }
                : { p2_rounds: targetsCount };

            const { error } = await (supabase as any)
                .from('matches')
                .update(updateData)
                .eq('id', matchId);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error updating targets:', error);
                }
                throw error;
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Targets Update Error:', error);
            }
        }
    },

    // ATOMIC UPDATE: Punteggio + Target insieme per evitare race conditions/glitch di sync
    async updateMatchStats(matchId: string, isPlayer1: boolean, score: number, targetsCount: number) {
        try {
            const updateData = isPlayer1
                ? { player1_score: score, p1_rounds: targetsCount }
                : { player2_score: score, p2_rounds: targetsCount };

            const { error } = await (supabase as any)
                .from('matches')
                .update(updateData)
                .eq('id', matchId);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error updating match stats:', error);
                }
                throw error;
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Stats Update Error:', error);
            }
        }
    },

    // STEAL TARGET (Blitz/Dominion Mode)
    // Updates TARGET COUNTS (in pX_rounds) AND POINTS (in playerX_score) AND signals stolen target
    async stealTarget(matchId: string, isPlayer1: boolean, targetValue: number,
        targetsP1: number, targetsP2: number,
        pointsP1: number, pointsP2: number) {

        // Semantic: current_round > 0 (P1 took it), < 0 (P2 took it)
        const signalingValue = isPlayer1 ? targetValue : -targetValue;

        const updateData = {
            p1_rounds: targetsP1,         // Targets Owned
            p2_rounds: targetsP2,         // Targets Owned
            player1_score: pointsP1,      // Match Points (Tie-breaker)
            player2_score: pointsP2,      // Match Points (Tie-breaker)
            current_round: signalingValue // Signal
        };

        const { error } = await (supabase as any)
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error stealing target:', error);
    },

    // Incrementa i round vinti (Standard Mode Only Now)
    async incrementRound(matchId: string, isPlayer1: boolean, currentRounds: number, nextRoundNumber: number) {
        const updateData = isPlayer1
            ? { p1_rounds: currentRounds + 1, current_round: nextRoundNumber, player1_score: 0, player2_score: 0 }
            : { p2_rounds: currentRounds + 1, current_round: nextRoundNumber, player1_score: 0, player2_score: 0 };

        const { error } = await (supabase as any)
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error incrementing round:', error);
    },

    // Dichiara vittoria in modo competitivo (solo se il match è ancora attivo)
    async declareWinner(matchId: string, winnerId: string): Promise<boolean> {
        try {
            const { data, error } = await (supabase as any)
                .from('matches')
                .update({
                    status: 'finished',
                    winner_id: winnerId
                })
                .eq('id', matchId)
                .eq('status', 'active')
                .select('id');

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error declaring winner:', error);
                }
                return false;
            }
            return !!(data && data.length > 0);
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Winner Declaration Error:', error);
            }
            return false;
        }
    },

    // [OPTIMIZATION] Update Stats AND Finish Match in ONE atomic DB call
    // This reduces latency by sending only 1 Realtime event instead of 2
    async finishMatch(matchId: string, winnerId: string | null, isPlayer1: boolean, finalScore: number, finalRounds: number) {
        try {
            const updateData = isPlayer1
                ? {
                    status: 'finished',
                    winner_id: winnerId,
                    player1_score: finalScore,
                    p1_rounds: finalRounds
                }
                : {
                    status: 'finished',
                    winner_id: winnerId,
                    player2_score: finalScore,
                    p2_rounds: finalRounds
                };

            const { error } = await (supabase as any)
                .from('matches')
                .update(updateData)
                .eq('id', matchId);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error finishing match atomically:', error);
                }
                throw error;
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Finish Match Error:', error);
            }
        }
    },

    // Imposta lo stato "Pronto" per il round successivo
    async setPlayerReady(matchId: string, isPlayer1: boolean, ready: boolean) {
        const updateData = isPlayer1
            ? { p1_ready: ready }
            : { p2_ready: ready };

        const { error } = await (supabase as any)
            .from('matches')
            .update(updateData)
            .eq('id', matchId);

        if (error) console.error('Error setting player ready:', error);
    },

    // Reset degli stati "Pronto" all'inizio di un nuovo round
    async resetRoundStatus(matchId: string) {
        const { error } = await (supabase as any)
            .from('matches')
            .update({ p1_ready: false, p2_ready: false })
            .eq('id', matchId);

        if (error) console.error('Error resetting round status:', error);
    },

    // ABBANDONA PARTITA (Gestione Ritiro)
    async abandonMatch(matchId: string, playerId: string) {
        // 1. Notify Opponent immediately (Fast path)
        await this.sendAbandonment(matchId, playerId);

        // 2. Update DB status
        // If pending, just delete. If active, mark cancelled/finished.
        const { data: match } = await (supabase as any).from('matches').select('status, player1_id, player2_id').eq('id', matchId).single();

        if (match) {
            if (match.status === 'pending') {
                await this.cancelMatch(matchId);
            } else if (match.status === 'active') {
                const winnerId = (match.player1_id === playerId) ? match.player2_id : match.player1_id;
                await (supabase as any)
                    .from('matches')
                    .update({
                        status: 'cancelled',
                        winner_id: winnerId, // Declare the other player as winner
                        finished_at: new Date().toISOString()
                    })
                    .eq('id', matchId);
            }
        }
    },

    // --- MATCH SIGNALING (BROADCAST & PRESENCE) ---
    subscribeToMatchEvents(matchId: string, userId: string, onEvent: (event: string, payload: any) => void) {
        const channel = (supabase as any).channel(`match_${matchId}_events`, {
            config: {
                presence: {
                    key: userId,
                },
            },
        });

        channel
            .on('broadcast', { event: 'match_abandoned' }, (payload: any) => onEvent('match_abandoned', payload.payload))
            .on('broadcast', { event: 'rematch_started' }, (payload: any) => onEvent('rematch_started', payload.payload))
            .on('broadcast', { event: 'match_won' }, (payload: any) => onEvent('match_won', payload.payload))
            .on('broadcast', { event: 'time_sync' }, (payload: any) => onEvent('time_sync', payload.payload))
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                onEvent('presence_sync', state);
            })
            .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
                onEvent('presence_leave', leftPresences);
            })
            .subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({
                        user_id: userId,
                        online_at: new Date().toISOString(),
                    });
                }
            });

        return channel;
    },

    async sendAbandonment(matchId: string, fromUserId: string) {
        return new Promise<void>((resolve) => {
            const channel = (supabase as any).channel(`match_${matchId}_events_abandon`);
            channel.subscribe(async (status: string) => {
                if (status === 'SUBSCRIBED') {
                    try {
                        await channel.send({
                            type: 'broadcast',
                            event: 'match_abandoned',
                            payload: { fromUserId }
                        });
                        console.log("⚡ Abandonment broadcast sent.");
                        setTimeout(() => {
                            (supabase as any).removeChannel(channel);
                            resolve();
                        }, 500); // Small margin for delivery
                    } catch (e) {
                        console.error("Broadcast send failed:", e);
                        resolve();
                    }
                }
            });
        });
    },

    async sendRematchEvent(matchId: string, newMatchId: string, seed: string) {
        const channel = (supabase as any).channel(`match_${matchId}_events`);
        channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                try {
                    await channel.send({
                        type: 'broadcast',
                        event: 'rematch_started',
                        payload: { newMatchId, seed }
                    });
                } catch (e) {
                    console.error("Rematch broadcast failed:", e);
                }
            }
        });
    },

    async sendTimeSync(matchId: string, timeLeft: number) {
        const channel = (supabase as any).channel(`match_${matchId}_events`);
        channel.send({
            type: 'broadcast',
            event: 'time_sync',
            payload: { timeLeft }
        }).catch((e: any) => console.error("Time sync broadcast failed:", e));
    },

    async sendWinSignal(matchId: string, winnerId: string, score: number) {
        // FAST PATH: Broadcast "I WON" immediately.
        // This is caught by the opponent to trigger defeat sequence instantly,
        // bypassing DB latency.
        const channel = (supabase as any).channel(`match_${matchId}_events`);
        channel.subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
                try {
                    await channel.send({
                        type: 'broadcast',
                        event: 'match_won',
                        payload: { winnerId, score }
                    });
                    console.log("⚡ Broadcast: Win Signal sent!", { winnerId });
                    // Only need to send once, can unsubscribe or let it persist briefly
                } catch (e) {
                    console.error("Win broadcast failed:", e);
                }
            }
        });
    },

    async startRematch(oldMatch: any, newSeed: string) {
        const { data, error } = await (supabase as any)
            .from('matches')
            .insert([
                {
                    player1_id: oldMatch.player1_id,
                    player2_id: oldMatch.player2_id,
                    grid_seed: newSeed,
                    mode: oldMatch.mode,
                    status: 'active',
                    target_score: oldMatch.target_score,
                    p1_rounds: 0,
                    p2_rounds: 0,
                    current_round: 1
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating rematch:', error);
            return null;
        }
        return data;
    },
    // Iscriviti agli aggiornamenti di una partita specifica
    subscribeToMatch(matchId: string, callback: (payload: any) => void) {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return (supabase as any)
            .channel(`match:${matchId}_${randomSuffix}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` },
                (payload: any) => callback(payload)
            )
            .subscribe();
    },

    // VERIFY MATCH STATUS (Fallback check)
    // Returns:
    // - Data object: Match exists
    // - null: Match definitively missing (PGRST116)
    // - { status: 'ERROR' }: Transient error, ignore this check
    async verifyMatchStatus(matchId: string) {
        try {
            const { data, error } = await (supabase as any)
                .from('matches')
                .select('status, winner_id')
                .eq('id', matchId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null;
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.warn("Sync Watchdog Transient Error:", error.message);
                }
                return { status: 'ERROR' };
            }
            return data;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Verify Status Error:', error);
            }
            return { status: 'ERROR' };
        }
    },

    async getMatchById(matchId: string): Promise<Match | null> {
        const { data, error } = await (supabase as any)
            .from('matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (error) {
            console.error('Error fetching match by id:', error);
            return null;
        }
        return data;
    },

    async getHeadToHeadStats(userId: string, opponentIds: string[]) {
        if (!userId) return {};

        try {
            // Simplified Strategy: Fetch ALL finished matches for this user.
            // This ensures we don't miss anything due to complex filter logic or pagination quirks on specific columns.
            // Performance impact is negligible for < 1000 matches.
            const { data: allMatches, error } = await (supabase as any)
                .from('matches')
                .select('winner_id, player1_id, player2_id')
                .or(`player1_id.eq.${userId},player2_id.eq.${userId}`)
                .eq('status', 'finished');

            if (error) {
                console.error('Error fetching global H2H stats:', error);
                return {};
            }

            const stats: Record<string, { wins: number; losses: number }> = {};
            // Initialize for requested opponents
            opponentIds.forEach(id => stats[id] = { wins: 0, losses: 0 });

            if (allMatches) {
                allMatches.forEach((match: any) => {
                    // Determine opponent ID
                    const oppId = match.player1_id === userId ? match.player2_id : match.player1_id;

                    // Only count if this opponent is in our requested list (or if we want to return all, but the UI asks for specific ones)
                    // Currently the UI passes a list of visible opponents.
                    if (oppId && stats[oppId]) {
                        if (match.winner_id === userId) {
                            stats[oppId].wins++;
                        } else if (match.winner_id === oppId) {
                            stats[oppId].losses++;
                        }
                    }
                });
            }

            return stats;
        } catch (e) {
            console.error("Exception in H2H stats:", e);
            return {};
        }
    },

    // Calcola il totale degli XP guadagnati ESCLUSIVAMENTE nei duelli
    async getTotalDuelXp(userId: string): Promise<number> {
        // Somma punti come player 1
        const { data: p1Data, error: p1Error } = await (supabase as any)
            .from('matches')
            .select('player1_score')
            .eq('player1_id', userId)
            .eq('status', 'finished');

        // Somma punti come player 2
        const { data: p2Data, error: p2Error } = await (supabase as any)
            .from('matches')
            .select('player2_score')
            .eq('player2_id', userId)
            .eq('status', 'finished');

        if (p1Error || p2Error) {
            console.error("Error calculating duel XP:", p1Error || p2Error);
            return 0;
        }

        const p1Total = p1Data?.reduce((acc: number, curr: any) => acc + (curr.player1_score || 0), 0) || 0;
        const p2Total = p2Data?.reduce((acc: number, curr: any) => acc + (curr.player2_score || 0), 0) || 0;

        console.log(`📊 Total Duel XP for ${userId}: ${p1Total + p2Total}`);
        return p1Total + p2Total;
    }
};
