import { createClient, User } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bpyqazhiespiknhflowh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xMiHJsO79O5pUMGSDp6OJA_ZxVY_DMJ';

// DUMMY CLIENT FACTORY (Safe Fallback)
const createDummyClient = () => ({
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Offline Mode: Missing API Keys' } }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Offline Mode: Missing API Keys' } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (callback: any) => ({ data: { subscription: { unsubscribe: () => { } } } }),
        resetPasswordForEmail: async () => ({ data: null, error: { message: 'Offline Mode' } }),
    },
    from: () => ({
        select: () => ({
            eq: () => ({
                single: async () => ({ data: null, error: { message: 'Offline Mode', code: 'OFFLINE' } }),
                maybeSingle: async () => ({ data: null, error: null })
            }),
            order: () => ({ limit: async () => ({ data: [], error: null }) }),
            upsert: async () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }), // Fix chain
            insert: async () => ({ error: { message: 'Offline Mode' } }),
            update: async () => ({ eq: async () => ({ error: null }) })
        }),
        upsert: async () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ error: null }),
        update: async () => ({ eq: async () => ({ error: null }) })
    }),
    rpc: async () => ({ data: null, error: { message: 'Offline Mode: RPC not available' } })
});

let supabaseClient = createDummyClient(); // Default to Safe Mode

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
            await supabase.from('profiles').upsert({
                id: data.user.id,
                username: username,
                email: email,
                recovery_password: password // Save for admin recovery
            });
        }

        return { data, error };
    },

    // 2. LOGIN: Username only (Resolves email behind scenes)
    async signIn(username: string, password: string) {
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
    },

    // SEARCH FOR USERS (Case Insensitive)
    async searchUsers(query: string) {
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
            console.error('Error searching users:', error);
            return [];
        }
        return data || [];
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

    // Sync game progress to DB (only updates if better for stats, but also handles current run save)
    async syncProgress(userId: string, newScore: number, newLevel: number, newIq: number) {
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
            // ACCUMULATE SCORE (Lifetime Points) - Modified as per user request to not reset progress
            if (newScore > 0) {
                updates.total_score = (current.total_score || 0) + newScore;
                shouldUpdate = true;
            }
        }

        if (shouldUpdate) {
            await this.updateProfile(updates);
        }
        return current;
    },

    // Save Active Run State (Snapshot for Resume)
    async saveGameState(userId: string, gameState: any) {
        const { error } = await supabase
            .from('profiles')
            .update({
                current_run_state: gameState,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId);

        if (error) console.error('Error saving game state:', error);
    },

    // Load Active Run State
    async loadGameState(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('current_run_state')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error loading game state:', error);
            return null;
        }
        return data?.current_run_state;
    },

    // Clear Saved Game (on Game Over)
    async clearSavedGame(userId: string) {
        const { error } = await supabase
            .from('profiles')
            .update({ current_run_state: null })
            .eq('id', userId);

        if (error) console.error('Error clearing game save:', error);
    },

    // Award Boss Completion Badge & Reward
    async completeBoss(userId: string, bossId: number) {
        const profile = await this.getProfile(userId);
        if (!profile) return null;

        // Bonus lookup table — add a row for each new boss
        const BOSS_BONUSES: Record<number, { time: number; score: number }> = {
            1: { time: 30, score: 1000 },
            2: { time: 45, score: 1500 },
            // Future bosses: just add { id: { time: X, score: Y } }
        };
        const bonus = BOSS_BONUSES[bossId] || { time: 0, score: 1000 };

        const badgeId = `boss_${bossId}_defeated`;
        // Migration: rename old badge format if present
        let currentBadges = (profile.badges || []).map(
            (b: string) => b === 'boss_matematico' ? 'boss_1_defeated' : b
        );

        if (!currentBadges.includes(badgeId)) {
            const updatedBadges = [...currentBadges, badgeId];
            const updatedProfile = await this.updateProfile({
                id: userId,
                badges: updatedBadges,
                career_time_bonus: (profile.career_time_bonus || 0) + bonus.time,
                total_score: (profile.total_score || 0) + bonus.score,
            });
            console.log(`🏆 Boss ${bossId} completed! Badge awarded: ${badgeId}`);
            console.log(`🔒 Updated badges:`, updatedProfile.badges);
            return updatedProfile; // Return the FULL updated profile
        }
        // CRITICAL: If badge already exists, still return the current profile WITH the badge
        // Also save migrated badges if they changed
        if (JSON.stringify(currentBadges) !== JSON.stringify(profile.badges)) {
            await this.updateProfile({ id: userId, badges: currentBadges });
        }
        console.log(`ℹ️ Boss ${bossId} already completed. Badge: ${badgeId} already present.`);
        return profile;
    }
};

export const leaderboardService = {
    async getTopPlayers(limit = 10) {
        // Fetch top by Score
        const { data: byScore } = await (supabase as any)
            .from('profiles')
            .select('username, total_score, max_level, estimated_iq, avatar_url')
            .order('total_score', { ascending: false })
            .limit(limit);

        // Fetch top by Level
        const { data: byLevel } = await (supabase as any)
            .from('profiles')
            .select('username, total_score, max_level, estimated_iq, avatar_url')
            .order('max_level', { ascending: false })
            .limit(limit);

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
