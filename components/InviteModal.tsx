import React, { useState } from 'react';
import { Gift, Copy, Share2, CheckCircle2, Sparkles, X, User, ExternalLink, Zap } from 'lucide-react';
import { profileService, UserProfile } from '../services/supabaseClient';
import { soundService } from '../services/soundService';

interface InviteModalProps {
  currentUser: any;
  userProfile: UserProfile | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({
  currentUser,
  userProfile,
  onClose,
  onOpenAuth,
  onUpdateProfile,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const referralCode = userProfile?.referral_code || '';
  const inviteLink = referralCode
    ? `https://www.numbergame.it/invite?ref=${referralCode}`
    : 'https://www.numbergame.it/invite';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = async () => {
    soundService.playUIClick();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(inviteLink);
      } else {
        const input = document.createElement('textarea');
        input.value = inviteLink;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      showToast('Link di invito copiato negli appunti!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      showToast('Impossibile copiare il link.');
    }
  };

  const handleCopyCode = async () => {
    soundService.playUIClick();
    if (!referralCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralCode);
      } else {
        const input = document.createElement('textarea');
        input.value = referralCode;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedCode(true);
      showToast('Codice amico copiato!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      showToast('Impossibile copiare il codice.');
    }
  };

  const handleShare = async () => {
    soundService.playUIClick();
    const shareData = {
      title: 'Gioca a NumberGame!',
      text: 'Ricevi +60s EXTRA! Usa il mio link per ricevere subito 60 secondi di bonus extra nella tua prima partita!',
      url: inviteLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRedeemReferral = async () => {
    if (!referralInput.trim()) return;
    soundService.playUIClick();
    setRedeemLoading(true);
    setRedeemStatus({ type: 'idle', message: '' });

    try {
      const { error } = await profileService.redeemReferral(referralInput.trim().toUpperCase());
      if (error) {
        setRedeemStatus({
          type: 'error',
          message: error.message || 'Codice non valido o già riscattato.',
        });
      } else {
        soundService.playSuccess();
        setRedeemStatus({
          type: 'success',
          message: 'Codice riscattato! Ricevuti +60 secondi di bonus!',
        });
        setReferralInput('');
        if (onUpdateProfile && userProfile) {
          const updated = await profileService.getProfile(userProfile.id);
          if (updated) onUpdateProfile(updated);
        }
      }
    } catch (err) {
      setRedeemStatus({
        type: 'error',
        message: 'Errore durante il riscatto del codice.',
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4 modal-overlay bg-black/85 backdrop-blur-md animate-fadeIn"
      onPointerDown={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 rounded-[2.5rem] border-2 border-[#FF8800]/40 shadow-[0_0_50px_rgba(255,136,0,0.25)] flex flex-col max-h-[90vh] overflow-hidden relative backdrop-blur-xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF8800]/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#FF8800] text-black font-black text-xs font-orbitron px-6 py-2.5 rounded-full shadow-2xl animate-bounce">
            {toastMessage}
          </div>
        )}

        {/* Header */}
        <div className="relative z-10 p-6 pb-4 flex justify-between items-center border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FF8800]/20 border border-[#FF8800]/40 flex items-center justify-center text-[#FF8800] shadow-[0_0_15px_rgba(255,136,0,0.3)]">
              <Gift size={26} className="animate-bounce" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8800]">Programma Referral</span>
              <h2 className="text-xl md:text-2xl font-black font-orbitron text-white uppercase tracking-wider leading-none">
                Invita un Amico
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              soundService.playUIClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            aria-label="Chiudi"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6 custom-scroll">
          {/* Reward Hero Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-[#FF8800]/15 to-purple-500/10 border border-[#FF8800]/30 rounded-3xl p-5 text-center">
            <div className="inline-block px-3 py-1 rounded-full bg-[#FF8800]/20 border border-[#FF8800]/40 text-[#FF8800] text-[10px] font-black tracking-widest uppercase mb-2">
              🎁 +60 SECONDI EXTRA
            </div>
            <h3 className="text-lg md:text-xl font-black font-orbitron text-white mb-2">
              Regala & Ricevi <span className="text-[#FF8800]">+60s di Bonus!</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed max-w-md mx-auto">
              Condividi il tuo link o codice con gli amici. Quando un nuovo giocatore si registra, entrambi ricevete{' '}
              <strong className="text-amber-400 font-bold">+60 secondi extra</strong> per le vostre partite!
            </p>
          </div>

          {/* User Referral Section (If Logged In) */}
          {currentUser ? (
            <div className="space-y-4">
              {/* Personal Code Display */}
              {referralCode && (
                <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Il Tuo Codice Amico</span>
                    {userProfile?.bonus_charges !== undefined && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                        <Zap size={10} /> {userProfile.bonus_charges} Cariche Bonus
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-3">
                    <span className="text-xl md:text-2xl font-black font-orbitron text-[#FF8800] tracking-widest">
                      {referralCode}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="bg-white/10 hover:bg-[#FF8800] hover:text-black text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      {copiedCode ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                      {copiedCode ? 'Copiato!' : 'Copia'}
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Link & Actions */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                  Link di Invito Diretto
                </label>
                <div className="flex items-center bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 truncate select-all">
                  {inviteLink}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleShare}
                    className="py-3.5 bg-gradient-to-r from-[#FF8800] to-amber-500 hover:brightness-110 active:scale-95 text-black font-black font-orbitron uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,136,0,0.3)] flex items-center justify-center gap-2"
                  >
                    <Share2 size={16} /> CONDIVIDI
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="py-3.5 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-white/10 text-white font-black font-orbitron uppercase text-xs tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {copiedLink ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                    {copiedLink ? 'COPIATO!' : 'COPIA LINK'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Guest / Not Logged In Section */
            <div className="bg-slate-800/40 border border-white/10 rounded-2xl p-5 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400">
                <User size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm mb-1">Accedi per il tuo Codice Personale</h4>
                <p className="text-slate-400 text-xs">
                  Crea un account gratuito per avere un codice referral univoco e accumulare cariche bonus ad ogni amico invitato!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="flex-1 py-3 bg-[#FF8800] hover:bg-[#FF8800]/90 active:scale-95 text-black font-black font-orbitron uppercase text-xs tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,136,0,0.3)]"
                >
                  ACCEDI / REGISTRATI
                </button>
                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 bg-slate-700/60 hover:bg-slate-700 active:scale-95 border border-white/10 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {copiedLink ? <CheckCircle2 size={14} className="text-green-400" /> : <Copy size={14} />}
                  {copiedLink ? 'Link Copiato' : 'Copia Link Base'}
                </button>
              </div>
            </div>
          )}

          {/* Redeem Code Section (Available if logged in and not referred yet) */}
          {currentUser && !userProfile?.referred_by && (
            <div className="bg-slate-800/30 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#FF8800]" />
                <h4 className="text-white font-bold text-sm">Hai ricevuto un Codice da un amico?</h4>
              </div>
              <p className="text-slate-400 text-xs">
                Inserisci qui il codice referral del tuo amico per riscattare subito i tuoi 60 secondi bonus!
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value)}
                  placeholder="Es: NUM-XYZ123"
                  className="flex-1 bg-black/50 border border-white/15 rounded-xl px-4 py-2.5 text-sm font-mono text-white placeholder-slate-600 focus:border-[#FF8800] focus:outline-none uppercase"
                  disabled={redeemLoading}
                />
                <button
                  onClick={handleRedeemReferral}
                  disabled={redeemLoading || !referralInput.trim()}
                  className="bg-[#FF8800] hover:bg-[#FF8800]/90 disabled:opacity-50 text-black font-black text-xs px-5 py-2.5 rounded-xl transition-all font-orbitron uppercase"
                >
                  {redeemLoading ? '...' : 'Riscatta'}
                </button>
              </div>

              {redeemStatus.type !== 'idle' && (
                <p
                  className={`text-xs font-bold mt-1 ${
                    redeemStatus.type === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {redeemStatus.message}
                </p>
              )}
            </div>
          )}

          {currentUser && userProfile?.referred_by && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 text-center">
              <span className="text-xs text-green-400 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} /> Bonus di benvenuto già riscattato!
              </span>
            </div>
          )}

          {/* Footer Link to Web Page */}
          <div className="text-center pt-2">
            <a
              href="/invite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FF8800] transition-colors"
            >
              <span>Leggi tutte le FAQ e dettagli sulla pagina ufficiale</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
