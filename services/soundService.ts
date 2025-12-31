
class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive'
      });
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * FM Synthesis helper
   * @param carrierFreq Frequenza portante (tono principale)
   * @param modFreq Frequenza modulante (colore del suono)
   * @param modIndex Indice di modulazione (brillantezza)
   */
  private playFMSound(carrierFreq: number, modFreq: number, modIndex: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const carrier = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    const env = this.ctx.createGain();

    carrier.type = type;
    modulator.type = 'sine';

    carrier.frequency.setValueAtTime(carrierFreq, this.ctx.currentTime);
    modulator.frequency.setValueAtTime(modFreq, this.ctx.currentTime);
    modGain.gain.setValueAtTime(modIndex, this.ctx.currentTime);

    env.gain.setValueAtTime(0, this.ctx.currentTime);
    env.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(env);
    env.connect(this.masterGain);

    carrier.start();
    modulator.start();
    
    carrier.stop(this.ctx.currentTime + duration);
    modulator.stop(this.ctx.currentTime + duration);
  }

  // Suono quando si tocca il primo numero
  playSelect() {
    this.playFMSound(880, 440, 200, 0.15, 0.15, 'triangle');
  }

  // Suono per ogni collegamento successivo
  playTick() {
    // Un click secco ad alta frequenza
    this.playFMSound(1760, 220, 100, 0.05, 0.1);
  }

  // Click generico per i pulsanti della UI
  playUIClick() {
    this.playFMSound(440, 880, 50, 0.08, 0.12, 'square');
  }

  playSuccess() {
    this.init();
    const now = this.ctx!.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playFMSound(f, f * 1.5, 300, 0.6, 0.1, 'sine');
      }, i * 100);
    });
  }

  playError() {
    this.init();
    // Suono di "errore" profondo e leggermente distorto
    this.playFMSound(110, 55, 500, 0.4, 0.2, 'sawtooth');
    this.playFMSound(104, 52, 500, 0.4, 0.15, 'sawtooth');
  }

  playReset() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    // Slide discendente
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.frequency.setValueAtTime(660, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.2);
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

export const soundService = new SoundService();
