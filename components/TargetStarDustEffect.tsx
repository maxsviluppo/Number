import React, { useEffect, useRef } from 'react';

interface TargetStarDustEffectProps {
  activeKey: number;
  durationMs?: number;
}

interface OrbitParticle {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
  size: number;
  color: string;
  twinkle: number;
  wobbleFreq: number;
  wobbleAmp: number;
  eccentricY: number;
  drift: number;
  pulse: number;
}

interface TrailDot {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface SparkBurst {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const COLORS = ['#00ff88', '#00ff66', '#34d399', '#bbf7d0', '#ffffff', '#6ee7b7', '#a7f3d0'];
const PARTICLE_COUNT = 38; // +5% rispetto a 36

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

const TargetStarDustEffect: React.FC<TargetStarDustEffectProps> = ({
  activeKey,
  durationMs = 1800,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeKey) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = 148;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;

    const particles: OrbitParticle[] = Array.from({ length: PARTICLE_COUNT }).map(() => {
      const dir = Math.random() > 0.22 ? 1 : -1;
      const baseRadius = 18 + Math.random() * 32;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: baseRadius,
        baseRadius,
        speed: dir * (0.08 + Math.random() * 0.22),
        size: 0.45 + Math.random() * 1.75,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        twinkle: Math.random() * Math.PI * 2,
        wobbleFreq: 0.003 + Math.random() * 0.009,
        wobbleAmp: 2 + Math.random() * 9,
        eccentricY: 0.55 + Math.random() * 0.65,
        drift: (Math.random() - 0.5) * 0.06,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    const trails: TrailDot[] = [];
    const bursts: SparkBurst[] = [];
    const start = performance.now();
    let nextBurstAt = 120 + Math.random() * 180;

    const spawnBurst = () => {
      const count = 4 + Math.floor(Math.random() * 6);
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const dist = 8 + Math.random() * 18;
        const speed = 0.4 + Math.random() * 1.6;
        bursts.push({
          x: cx + Math.cos(ang) * dist,
          y: cy + Math.sin(ang) * dist,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed,
          life: 14 + Math.floor(Math.random() * 10),
          maxLife: 24,
          size: 0.45 + Math.random() * 1.35,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const draw = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= durationMs) {
        ctx.clearRect(0, 0, size, size);
        return;
      }

      const progress = elapsed / durationMs;
      const fadeOut = elapsed > durationMs - 450 ? (durationMs - elapsed) / 450 : 1;
      const zoom = 0.42 + easeOutCubic(Math.min(1, progress * 1.15)) * 0.78;

      if (bloomRef.current) {
        const bloomScale = 0.5 + easeOutCubic(Math.min(1, progress * 1.2)) * 0.72;
        bloomRef.current.style.opacity = String(fadeOut * (0.35 + Math.sin(now * 0.011) * 0.08));
        bloomRef.current.style.transform = `translate(-50%, -50%) scale(${bloomScale})`;
      }

      if (elapsed >= nextBurstAt) {
        spawnBurst();
        nextBurstAt = elapsed + 140 + Math.random() * 220;
      }

      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.translate(-cx, -cy);
      ctx.globalCompositeOperation = 'lighter';

      for (const p of particles) {
        p.angle += p.speed + (Math.random() - 0.5) * 0.018;
        p.radius += p.drift + Math.sin(now * p.wobbleFreq + p.pulse) * 0.08;
        p.radius = Math.max(12, Math.min(58, p.radius * 0.992 + p.baseRadius * 0.008));

        const wobble = Math.sin(now * p.wobbleFreq * 2.4 + p.twinkle) * p.wobbleAmp;
        const rx = p.radius + wobble;
        const ry = p.radius * p.eccentricY + wobble * 0.35;
        const x = cx + Math.cos(p.angle) * rx;
        const y = cy + Math.sin(p.angle) * ry;

        if (Math.random() > 0.55) {
          trails.push({
            x: x + (Math.random() - 0.5) * 2.5,
            y: y + (Math.random() - 0.5) * 2.5,
            life: 10 + Math.floor(Math.random() * 14),
            maxLife: 24,
            size: p.size * (0.55 + Math.random() * 0.55),
            color: p.color,
          });
        }
        if (trails.length > 168) trails.shift();

        const twinkle = 0.35 + Math.sin(now * (0.012 + p.wobbleFreq * 2) + p.twinkle) * 0.45 + Math.random() * 0.2;
        ctx.globalAlpha = fadeOut * Math.min(1, twinkle);
        ctx.shadowBlur = 4 + Math.random() * 5;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.85 + Math.sin(now * 0.02 + p.pulse) * 0.25), 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.life -= 0.8 + Math.random() * 0.4;
        if (t.life <= 0) {
          trails.splice(i, 1);
          continue;
        }
        const alpha = (t.life / t.maxLife) * fadeOut * (0.25 + Math.random() * 0.35);
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 3;
        ctx.shadowColor = t.color;
        ctx.fillStyle = t.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size * (t.life / t.maxLife), 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.92;
        b.vy *= 0.92;
        b.life -= 1;
        if (b.life <= 0) {
          bursts.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = (b.life / b.maxLife) * fadeOut * 0.75;
        ctx.shadowBlur = 6;
        ctx.shadowColor = b.color;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeKey, durationMs]);

  if (!activeKey) return null;

  return (
    <>
      <div
        ref={bloomRef}
        className="absolute pointer-events-none z-[18]"
        style={{
          width: 118,
          height: 118,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) scale(0.5)',
          background: 'radial-gradient(circle, rgba(0,255,120,0.24) 0%, rgba(0,255,100,0.09) 42%, transparent 72%)',
          filter: 'blur(2px)',
          transition: 'opacity 0.2s ease',
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute pointer-events-none z-[19]"
        style={{
          width: 148,
          height: 148,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
};

export default TargetStarDustEffect;
