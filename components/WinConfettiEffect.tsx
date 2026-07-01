import React, { useEffect, useRef } from 'react';

interface WinConfettiEffectProps {
  activeKey: number;
  durationMs?: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  w: number;
  h: number;
  color: string;
  shape: 'rect' | 'diamond';
  sway: number;
  swaySpeed: number;
}

const COLORS = [
  '#ff8800', '#ffaa33', '#ff6600', '#ffd080', '#fff8e8',
  '#ff4400', '#ffb347', '#ffcc66', '#ffffff', '#ff9933',
];

const WinConfettiEffect: React.FC<WinConfettiEffectProps> = ({
  activeKey,
  durationMs = 3000,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeKey) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spawnPiece = (w: number): ConfettiPiece => ({
      x: Math.random() * w,
      y: -10 - Math.random() * 120,
      vx: (Math.random() - 0.5) * 2.2,
      vy: 2.2 + Math.random() * 3.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      w: 5 + Math.random() * 8,
      h: 7 + Math.random() * 11,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.35 ? 'rect' : 'diamond',
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.04 + Math.random() * 0.07,
    });

    let w = canvas.width;
    let h = canvas.height;
    const count = Math.min(140, Math.max(64, Math.floor(w / 4)));
    const pieces: ConfettiPiece[] = Array.from({ length: count }).map(() => spawnPiece(w));

    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', onResize);

    const start = performance.now();
    let lastSpawn = start;

    const draw = (now: number) => {
      const elapsed = now - start;
      if (elapsed >= durationMs) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      if (now - lastSpawn > 90 && pieces.length < count + 30) {
        pieces.push(spawnPiece(w));
        lastSpawn = now;
      }

      ctx.clearRect(0, 0, w, h);

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.65;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.022;

        if (p.y > h + 24) {
          pieces[i] = spawnPiece(w);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = 0.93;
        ctx.fillStyle = p.color;

        if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -p.h * 0.5);
          ctx.lineTo(p.w * 0.45, 0);
          ctx.lineTo(0, p.h * 0.5);
          ctx.lineTo(-p.w * 0.45, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillRect(-p.w * 0.5, -p.h * 0.5, p.w, p.h);
        }

        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeKey, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-[120]"
      aria-hidden
    />
  );
};

export default WinConfettiEffect;
