
class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public isMuted: boolean = false;

  private init() {
    if (this.isMuted) return;
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

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    } else if (!muted && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playFMSound(carrierFreq: number, modFreq: number, modIndex: number, duration: number, volume: number, type: OscillatorType = 'sine') {
    if (this.isMuted) return;
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
    if (this.isMuted) return;
    this.init();
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playFMSound(f, f * 1.5, 300, 0.6, 0.1, 'sine');
      }, i * 100);
    });
  }

  playError() {
    this.playFMSound(110, 55, 500, 0.4, 0.2, 'sawtooth');
  }

  playReset() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;
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
