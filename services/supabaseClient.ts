import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bpyqazhiespiknhflowh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xMiHJsO79O5pUMGSDp6OJA_ZxVY_DMJ';

// DUMMY CLIENT FACTORY (Safe Fallback to avoid lint errors and runtime crashes)
const createDummyClient = () => {
    const dummyRef: any = {
        from: () => dummyRef,
        select: () => dummyRef,
        insert: () => Promise.resolve({ data: null, error: { message: 'Offline' } }),
        upsert: () => dummyRef, // for .upsert().select().single()
        update: () => dummyRef,
        delete: () => dummyRef,
        eq: () => dummyRef,
        order: () => dummyRef,
        limit: () => dummyRef,
        single: () => Promise.resolve({ data: null, error: { message: 'Offline' } }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        ilike: () => dummyRef,
        rpc: () => Promise.resolve({ data: null, error: { message: 'Offline' } }),
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            signUp: () => Promise.resolve({ data: { user: null }, error: { message: 'Offline' } }),
            signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Offline' } }),
            signOut: () => Promise.resolve({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Offline' } }),
        }
    };
    return dummyRef;
};

let supabaseClient = createDummyClient() as any; // Default to Safe Mode

// TRY REAL INITIALIZATION
try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        console.log('🔌 Attempting Supabase Connection...');
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey) as any;
        console.log('✅ Supabase Client Initialized');
    } else {
        console.warn('⚠️ Supabase credentials missing! App running in Offline/Demo mode.');
        console.debug('Debug Info:', {
            urlPresent: !!supabaseUrl,
            keyPresent: !!supabaseAnonKey,
            urlStartWithHttp: supabaseUrl?.startsWith('http')
        });
    }
} catch (e) {
    console.error('❌ Supabase Critical Init Error:', e);
    // Keep dummy client
}

export const supabase = supabaseClient;

export interface UserProfile {
    id: string; // Matches auth.users.id
    username: string; // Display name
    total_score: number;
    max_level: number;
    badges: string[]; // JSON array of badge IDs
    estimated_iq: number;
    avatar_url?: string;
    updated_at?: string;
    career_time_bonus?: number; // Accumulated time bonus from boss victories
    referral_code?: string;
    referred_by?: string;
    bonus_charges?: number;
}

export interface LeaderboardEntry {
    id?: string;
    player_name: string;
    score: number;
    level: number;
    country: string;
    iq: number;
    created_at?: string;
}

// Helper to login via username by resolving email first
export const authService = {
    // 1. REGISTRATION: Full data (Email required for recovery)
    async signUp(email: string, username: string, password: string) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username, // Store in metadata
                },
            },
        });

        // Manual sync to profiles if trigger fails or delayed (Double safety)
        if (data.user && !error) {
            const newCode = 'NUM-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const pendingReferral = localStorage.getItem('pending_referral');

            await supabase.from('profiles').upsert({
                id: data.user.id,
                username: username,
                email: email,
                recovery_password: password, // Save for admin recovery
                referral_code: newCode,
                referred_by: pendingReferral || null,
                bonus_charges: pendingReferral ? 1 : 0
            });

            if (pendingReferral) {
                localStorage.removeItem('pending_referral');
                try {
                    // Cerca il profilo di chi ha inviato l'invito per assegnargli il premio
                    const { data: sender } = await supabase.from('profiles').select('id, bonus_charges').eq('referral_code', pendingReferral).single();
                    if (sender) {
                        await supabase.from('profiles').update({ bonus_charges: (sender.bonus_charges || 0) + 1 }).eq('id', sender.id);
                    }
                } catch (e) {
                    console.error('Error handling referral bonus:', e);
                }
            }
        }

        return { data, error };
    },

    // 2. LOGIN: Username only (Resolves email behind scenes)
    async signIn(username: string, password: string) {
        // Clear any pending referral since it's an existing user logging in
        localStorage.removeItem('pending_referral');
        
        // Step A: Find email for this username
        const { data: profile, error: lookupError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', username)
            .single();

        if (lookupError || !profile || !profile.email) {
            return { data: { user: null, session: null }, error: { message: 'Username non trovato.' } };
        }

        // Step B: Login with resolved email
        const { data, error } = await supabase.auth.signInWithPassword({
            email: profile.email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabase.auth.signOut();
        return { error };
    },

    // 3. RECOVERY (DEPRECATED: Now handled via Admin Panel)
    async resetPassword(identifier: string) {
        return { error: { message: 'Funzione disabilitata. Contatta l\'amministratore per il recupero della password.' } };
    },

    async getCurrentSession() {
        const { data } = await supabase.auth.getSession();
        return data.session;
    },

    async getUser() {
        const { data } = await supabase.auth.getUser();
        return data.user;
    }
};

export const profileService = {
    async getProfile(userId: string): Promise<UserProfile | null> {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Error fetching profile or profile does not exist:', error.message);
                return null;
            }
            return data;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted without reason')) {
                console.error('Critical Profile Fetch Error:', error);
            }
            return null;
        }
    },

    // SEARCH FOR USERS (Case Insensitive)
    async searchUsers(query: string) {
        try {
            let queryBuilder = supabase
                .from('profiles')
                .select('id, username, total_score, max_level, avatar_url, email');

            if (query) {
                queryBuilder = queryBuilder.ilike('username', `%${query}%`);
            } else {
                // If no query, return recently active users
                queryBuilder = queryBuilder.order('updated_at', { ascending: false });
            }

            const { data, error } = await queryBuilder.limit(20);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error searching users:', error);
                }
                return [];
            }
            return data || [];
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Search Users Error:', error);
            }
            return [];
        }
    },

    async updateProfile(profile: Partial<UserProfile> & { id: string }) {
        const { data, error } = await supabase
            .from('profiles')
            .upsert(profile)
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
        return data;
    },

    // FULL RESET: Wipe everything for a "fresh start"
    async resetUserProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                max_level: 1,
                total_score: 0,
                estimated_iq: 100,
                badges: [],
                career_time_bonus: 0,
                current_run_state: null
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error resetting profile:', error);
            throw error;
        }
        return data;
    },

    async syncProgress(userId: string, newScore: number, newLevel: number, newIq: number) {
        try {
            const current = await this.getProfile(userId);

            const updates: any = { id: userId, updated_at: new Date().toISOString() };
            let shouldUpdate = false;

            // HIGH SCORES (Career Stats)
            if (!current) {
                updates.total_score = newScore;
                updates.max_level = newLevel;
                updates.estimated_iq = newIq;
                shouldUpdate = true;
            } else {
                if (newLevel > (current.max_level || 0)) {
                    updates.max_level = newLevel;
                    shouldUpdate = true;
                }
                if (newIq > (current.estimated_iq || 0)) {
                    updates.estimated_iq = newIq;
                    shouldUpdate = true;
                }
                if (newScore > 0) {
                    updates.total_score = (current.total_score || 0) + newScore;
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                await this.updateProfile(updates);
            }
            return current;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Sync Progress Struggle:', error);
            }
            return null;
        }
    },

    async saveGameState(userId: string, gameState: any) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    current_run_state: gameState,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) {
                // Only log non-abort errors
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error saving game state:', error);
                }
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Save Game Error:', error);
            }
        }
    },

    // Load Active Run State
    async loadGameState(userId: string) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('current_run_state')
                .eq('id', userId)
                .single();

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error loading game state:', error);
                }
                return null;
            }
            return data?.current_run_state;
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Load Game Error:', error);
            }
            return null;
        }
    },

    // Clear Saved Game (on Game Over)
    async clearSavedGame(userId: string) {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ current_run_state: null })
                .eq('id', userId);

            if (error) {
                if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                    console.error('Error clearing game save:', error);
                }
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError' && !error?.message?.includes('signal is aborted')) {
                console.error('Critical Clear Game Error:', error);
            }
        }
    },

    // Award Boss Completion Badge & Reward
    async completeBoss(userId: string, bossId: number) {
        const profile = await this.getProfile(userId);
        if (!profile) return null;

        // Bonus lookup table — Boss 1 is now Fallen (30s / 1000pts)
        const BOSS_BONUSES: Record<number, { time: number; score: number }> = {
            1: { time: 30, score: 1000 }
        };
        const bonus = BOSS_BONUSES[bossId] || { time: 0, score: 1000 };

        const badgeId = `boss_${bossId}_defeated`;
        // Use badges as-is from DB (no automatic migration of old badge formats)
        const currentBadges = (profile.badges || []);

        if (!currentBadges.includes(badgeId)) {
            const updatedBadges = [...currentBadges, badgeId];
            console.log(`📡 [Supabase] Awarding Boss Badge: ${badgeId}`);
            const updatedProfile = await this.updateProfile({
                id: userId,
                badges: updatedBadges,
                career_time_bonus: (profile.career_time_bonus || 0) + bonus.time,
                total_score: (profile.total_score || 0) + bonus.score,
            });
            console.log(`🏆 [Supabase] Boss ${bossId} completed! Badge and Bonus persistent.`);
            return { profile: updatedProfile, isNew: true };
        }
        console.log(`ℹ️ [Supabase] Boss ${bossId} already completed (Badge ${badgeId} present).`);
        return { profile, isNew: false };
    }
};

export const leaderboardService = {
    async getTopPlayers(limit = 1000) {
        // Fetch top by Score
        const { data: byScore, error: errorScore } = await (supabase as any)
            .from('profiles')
            .select('username, total_score, max_level, estimated_iq, avatar_url')
            .not('username', 'is', null) // Avoid displaying accounts without a username
            .order('total_score', { ascending: false })
            .limit(limit);

        if (errorScore) console.error("Error fetching leaderboard by score:", errorScore);

        // Fetch top by Level
        const { data: byLevel, error: errorLevel } = await (supabase as any)
            .from('profiles')
            .select('username, total_score, max_level, estimated_iq, avatar_url')
            .not('username', 'is', null) // Avoid displaying accounts without a username
            .order('max_level', { ascending: false })
            .order('total_score', { ascending: false }) // Secondary sort
            .limit(limit);

        if (errorLevel) console.error("Error fetching leaderboard by level:", errorLevel);

        return {
            byScore: byScore || [],
            byLevel: byLevel || []
        };
    },

    async addEntry(entry: LeaderboardEntry): Promise<void> {
        const { error } = await supabase
            .from('leaderboard')
            .insert([entry]);

        if (error) {
            console.error('Error adding score:', error);
        }
    }
};

export const configService = {
    async getSystemConfig(): Promise<any> {
        try {
            const { data, error } = await supabase
                .from('system_config')
                .select('data')
                .eq('id', 'main')
                .maybeSingle(); // maybeSingle for easier logic if row is missing

            if (error) {
                console.warn('Config not found or error:', error.message);
                return null;
            }
            return data?.data;
        } catch (e) {
            console.error('Critical Config Fetch:', e);
            return null;
        }
    },

    async updateSystemConfig(configData: any) {
        try {
            const { error } = await supabase
                .from('system_config')
                .upsert({ id: 'main', data: configData, updated_at: new Date().toISOString() });

            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Critical Config Update:', e);
            return false;
        }
    }
};
