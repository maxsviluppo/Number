
class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;
  private initialized: boolean = false;

  /**
   * Tenta di inizializzare l'AudioContext. 
   * Deve essere chiamato all'interno di un evento scatenato dall'utente.
   */
  public async init() {
    if (this.initialized && this.ctx?.state === 'running') return;

    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
          latencyHint: 'interactive'
        });
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        // Imposta il volume iniziale basato sullo stato di mute
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.4, this.ctx.currentTime);
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      
      this.initialized = true;
      console.log("Audio Engine Ready - State:", this.ctx.state);
    } catch (e) {
      console.error("Audio initialization failed:", e);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;

    // Usiamo una transizione fluida del gain invece di suspend()
    // per evitare instabilità del clock e click udibili.
    const targetGain = muted ? 0 : 0.4;
    this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  private playFMSound(carrierFreq: number, modFreq: number, modIndex: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    // Se silenziato non creiamo nemmeno gli oscillatori per risparmiare risorse
    if (this.isMuted || !this.initialized || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    // Offset di sicurezza per evitare glitch su alcuni browser
    const startTime = now + 0.005;

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    carrier.type = type;
    modulator.type = 'sine';

    carrier.frequency.setValueAtTime(carrierFreq, startTime);
    modulator.frequency.setValueAtTime(modFreq, startTime);
    modGain.gain.setValueAtTime(modIndex, startTime);

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(env);
    env.connect(this.masterGain);

    carrier.start(startTime);
    modulator.start(startTime);
    
    carrier.stop(startTime + duration);
    modulator.stop(startTime + duration);
  }

  playSelect() {
    this.playFMSound(880, 440, 200, 0.15, 0.15, 'triangle');
  }

  playTick() {
    this.playFMSound(1760, 220, 100, 0.05, 0.1);
  }

  playUIClick() {
    this.playFMSound(440, 880, 50, 0.08, 0.12, 'square');
  }

  playSuccess() {
    if (this.isMuted || !this.initialized) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => this.playFMSound(f, f * 1.5, 300, 0.6, 0.1, 'sine'), i * 100);
    });
  }

  playError() {
    this.playFMSound(110, 55, 500, 0.4, 0.2, 'sawtooth');
  }

  playReset() {
    if (this.isMuted || !this.initialized || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.2);
    g.gain.setValueAtTime(0.1, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.2);
  }
}

export const soundService = new SoundService();
