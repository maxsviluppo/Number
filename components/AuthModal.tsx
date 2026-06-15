
import React, { useState } from 'react';
import { authService, supabase } from '../services/supabaseClient';
import { X, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle, Loader2, Eye, EyeOff, Gift } from 'lucide-react';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
    showToast: (msg: string) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'referral-success';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, showToast }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [registeredUser, setRegisteredUser] = useState<any>(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            if (mode === 'signup') {
                // Check if username exists FIRST
                const { data: existingUser } = await (supabase as any)
                    .from('profiles')
                    .select('username')
                    .ilike('username', username)
                    .maybeSingle();

                if (existingUser) {
                    showToast(`Il nome "${username}" è già in uso. Scegline un altro!`);
                    setError('Username non disponibile');
                    setLoading(false);
                    return;
                }

                const pendingRef = localStorage.getItem('pending_referral');
                const { data, error } = await authService.signUp(email, username, password);
                if (error) throw error;
                if (data.user) {
                    if (pendingRef) {
                        setRegisteredUser(data.user);
                        setMode('referral-success');
                    } else {
                        setSuccessMsg('Account creato! Controlla la tua email per confermare.');
                        if (data.session) onSuccess(data.user);
                    }
                }
            } else if (mode === 'login') {
                const { data, error } = await authService.signIn(username, password);
                if (error) throw error;
                if (data.user && data.session) {
                    onSuccess(data.user);
                    onClose();
                }
            } else if (mode === 'forgot-password') {
                const { error } = await authService.resetPassword(username);
                if (error) throw error;
                setSuccessMsg('Ti abbiamo inviato una email per reimpostare la password.');
            }
        } catch (err: any) {
            let msg = err.message || 'Si è verificato un errore.';

            // Supabase specific error translations
            if (msg.includes('error sending recovery email')) {
                msg = 'Errore nell\'invio dell\'email. Probabilmente hai raggiunto il limite orario di Supabase (3 email/ora) o il servizio SMTP non è configurato correttamente nel Dashboard.';
            } else if (msg.includes('User already registered')) {
                msg = 'Utente già registrato. Prova ad accedere!';
            } else if (msg.includes('Invalid login credentials')) {
                msg = 'Credenziali non valide.';
            } else if (msg.includes('Password should be at least')) {
                msg = 'La password deve avere almeno 6 caratteri.';
            } else if (msg.includes('Email not confirmed')) {
                msg = 'Email non confermata. Controlla la posta o chiedi all\'admin di disabilitare la conferma.';
            }

            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError(null);
        setSuccessMsg(null);
        setShowPassword(false);
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 modal-overlay bg-black/80 backdrop-blur-sm" onPointerDown={onClose}>
            <div
                className="w-full max-w-md p-8 rounded-[2.5rem] border-[3px] border-cyan-500/50 shadow-[0_0_60px_rgba(6,182,212,0.4)] bg-slate-900/95 relative overflow-hidden backdrop-blur-xl"
                onPointerDown={e => e.stopPropagation()}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse z-20"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {mode === 'referral-success' ? (
                    <div className="flex flex-col items-center text-center space-y-6 py-4 animate-fadeIn">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
                            <Gift className="w-10 h-10 text-green-400 animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-wider font-orbitron">Bonus Sbloccato!</h3>
                        <p className="text-slate-300 text-sm font-medium leading-relaxed">
                            Ti sei registrato tramite invito.<br/>
                            Hai ottenuto <strong className="text-cyan-400 text-lg font-black block mt-1">+60 Secondi di Bonus</strong> per la tua prima partita!
                        </p>
                        
                        <div className="w-full space-y-3 mt-4">
                            <a 
                                href="https://play.google.com/store/apps/details?id=com.max.numbergame" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full relative overflow-hidden bg-cyan-500 text-white py-4 rounded-xl font-black font-orbitron uppercase tracking-widest text-xs border-[3px] border-white hover:scale-105 active:translate-y-1 transition-all flex justify-center items-center gap-2 group cursor-pointer"
                                style={{
                                  boxShadow: '0 4px 0 rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.45)'
                                }}
                                onClick={() => {
                                    if (registeredUser) onSuccess(registeredUser);
                                }}
                            >
                                {/* Glass layout elements */}
                                <div className="absolute inset-0 pointer-events-none z-10" style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 30%, transparent 30.1%, transparent 70%, rgba(255,255,255,0.05) 70.1%, rgba(255,255,255,0.15) 100%)'
                                }}></div>
                                <div className="absolute top-0 inset-x-0 h-[45%] pointer-events-none rounded-t-xl z-10" style={{
                                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)'
                                }}></div>
                                <span className="relative z-20 flex items-center gap-2">
                                    SCARICA DA PLAY STORE
                                </span>
                            </a>

                            <button 
                                onClick={() => {
                                    if (registeredUser) onSuccess(registeredUser);
                                }}
                                className="w-full relative overflow-hidden bg-slate-800 hover:bg-slate-700 text-cyan-400 py-4 rounded-xl font-black font-orbitron uppercase tracking-widest text-xs border-[3px] border-cyan-500/50 hover:border-cyan-400 hover:scale-105 active:translate-y-1 transition-all flex justify-center items-center gap-2 group cursor-pointer"
                                style={{
                                  boxShadow: '0 4px 0 rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.45)'
                                }}
                            >
                                {/* Glass layout elements */}
                                <div className="absolute inset-0 pointer-events-none z-10" style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 30%, transparent 75%, rgba(255,255,255,0.05) 100%)'
                                }}></div>
                                <span className="relative z-20 flex items-center gap-2">
                                    GIOCA SUL WEB
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-black font-orbitron text-center mb-2 text-white uppercase tracking-wider">
                            {mode === 'login' && 'ACCESSO'}
                            {mode === 'signup' && 'REGISTRAZIONE'}
                            {mode === 'forgot-password' && 'RECUPERO'}
                        </h2>

                        <p className="text-slate-400 text-center text-xs font-bold mb-8 uppercase tracking-widest">
                            {mode === 'login' && 'Bentornato Operatore'}
                            {mode === 'signup' && 'Unisciti al network'}
                            {mode === 'forgot-password' && 'Ripristina credenziali'}
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* USERNAME FIELD - ALWAYS VISIBLE (Keys: Login, Signup, Recovery via Username) */}
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-cyan-400 ml-2">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full bg-slate-900/50 border-2 border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-colors font-bold"
                                        placeholder={mode === 'forgot-password' ? "Username o Email" : "Il tuo nome in codice"}
                                        required
                                    />
                                </div>
                            </div>

                            {/* EMAIL FIELD - ONLY FOR REGISTRATION */}
                            {mode === 'signup' && (
                                <div className="space-y-1 animate-fadeIn">
                                    <label className="text-[10px] uppercase font-bold text-cyan-400 ml-2">Email (Personale)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-slate-900/50 border-2 border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-colors font-bold"
                                            placeholder="Per il recupero password"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {mode !== 'forgot-password' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-cyan-400 ml-2">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-slate-900/50 border-2 border-slate-700/50 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-600 focus:border-cyan-400 focus:outline-none transition-colors font-bold"
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                    {error}
                                </div>
                            )}

                            {successMsg && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-200 text-xs flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    {successMsg}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative overflow-hidden bg-cyan-500 text-white py-4 rounded-xl font-black font-orbitron uppercase tracking-widest text-xs border-[3px] border-white hover:scale-105 active:translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none mt-6 group"
                                style={{
                                  boxShadow: '0 4px 0 rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.45)'
                                }}
                            >
                                {/* Glass layout elements */}
                                <div className="absolute inset-0 pointer-events-none z-10" style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 30%, transparent 30.1%, transparent 70%, rgba(255,255,255,0.05) 70.1%, rgba(255,255,255,0.15) 100%)'
                                }}></div>
                                <div className="absolute top-0 inset-x-0 h-[45%] pointer-events-none rounded-t-xl z-10" style={{
                                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.22), transparent)'
                                }}></div>
                                <div className="absolute top-[8%] left-[4%] w-[20%] h-[20%] rounded-full filter blur-[1px] pointer-events-none z-10" style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.01))'
                                }}></div>
                                <div className="absolute top-[8%] right-[4%] w-[20%] h-[20%] rounded-full filter blur-[1px] pointer-events-none z-10" style={{
                                  background: 'linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.01))'
                                }}></div>
                                <div className="absolute bottom-0 inset-x-0 h-[25%] pointer-events-none z-10" style={{
                                  background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)'
                                }}></div>

                                {loading && <Loader2 className="w-5 h-5 animate-spin relative z-20" />}
                                <span className="relative z-20">
                                    {mode === 'login' && 'ENTRA NEL SISTEMA'}
                                    {mode === 'signup' && 'REGISTRATI'}
                                    {mode === 'forgot-password' && 'RIPRISTINA PASSWORD'}
                                </span>
                            </button>

                        </form>

                        <div className="mt-6 flex flex-col items-center gap-3 text-xs font-bold text-slate-400">
                            {mode === 'login' && (
                                <>
                                    <button onClick={() => switchMode('signup')} className="hover:text-white transition-colors uppercase tracking-wider">
                                        Non hai un account? <span className="text-cyan-400">Registrati</span>
                                    </button>
                                </>
                            )}

                            {mode === 'signup' && (
                                <button onClick={() => switchMode('login')} className="hover:text-white transition-colors uppercase tracking-wider">
                                    Hai già un account? <span className="text-cyan-400">Accedi</span>
                                </button>
                            )}
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default AuthModal;
