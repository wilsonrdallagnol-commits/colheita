'use client';

// apps/website/src/components/hero-heart.tsx
//
// Coração digital — peça central da home da Argho.
// Renderiza video WebM (VP9 + alpha) com fallback PNG estático,
// glow ambient teal/verde por trás, e parallax sutil ao mouse.
//
// Arquitetado para hot-swap: quando .glb estiver disponível,
// trocar este componente por <HeroHeart3D /> (R3F) sem mexer na página.

import { useEffect, useId, useRef, useState } from 'react';

export function HeroHeart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const ringGradId = useId();

  // Detecta mobile para servir asset menor
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Parallax: movimenta sutilmente o coração com o mouse
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onMove = (e: MouseEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // delta normalizado (-1 a 1) com ganho baixo
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      // Limita a 12px de translação total
      setParallax({
        x: Math.max(-1, Math.min(1, dx)) * 12,
        y: Math.max(-1, Math.min(1, dy)) * 12,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Garante autoplay em browsers que pedem user-gesture
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        // silently ignore — browsers podem bloquear; o poster fica
      });
    }
  }, []);

  // Versao com fundo branco (combina com pagina branca do hero). Resolve o bug
  // do iOS Safari que ignora canal alpha em VP9-alpha. Pra intro (pagina dark)
  // existe argho-heart-intro.webm com composite sobre #0a0d18.
  const videoSrc = isMobile ? '/argho-heart-hero-mobile.webm' : '/argho-heart-hero.webm';

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        aspectRatio: '2 / 3',
        margin: '0 auto',
      }}
    >
      {/* Glow ambient — teal/verde por trás */}
      <div
        aria-hidden
        className="anim-glow-pulse"
        style={{
          position: 'absolute',
          inset: '-15%',
          background: `
            radial-gradient(ellipse 50% 55% at 50% 45%, oklch(0.45 0.220 266.7 / 0.28) 0%, transparent 60%),
            radial-gradient(ellipse 35% 40% at 50% 60%, oklch(0.586 0.150 138.8 / 0.20) 0%, transparent 65%)
          `,
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Anéis decorativos sutis */}
      <svg
        role="presentation"
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          inset: 0,
          width: '110%',
          height: '110%',
          left: '-5%',
          top: '-5%',
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.5,
        }}
      >
        <title>Anéis decorativos do coração digital Argho</title>
        <defs>
          <radialGradient id={ringGradId} cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="oklch(0.362 0.160 266.7 / 0)" />
            <stop offset="100%" stopColor="oklch(0.362 0.160 266.7 / 0.18)" />
          </radialGradient>
        </defs>
        <circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={`url(#${ringGradId})`}
          strokeWidth="0.15"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="oklch(0.586 0.150 138.8 / 0.12)"
          strokeWidth="0.1"
          strokeDasharray="0.8 1.2"
        />
      </svg>

      {/* Heart video */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 2,
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          transition: 'transform 0.6s var(--ease-out-expo)',
          willChange: 'transform',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/argho-heart-poster-hero.png"
          aria-label="Coração digital Argho — tecnologia viva"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            // Bg branco do video casa com a pagina (que tambem eh branca onde o
            // grid pattern foi removido pra evitar checker visivel atras).
            mixBlendMode: 'normal',
          }}
        >
          <source src={videoSrc} type="video/webm" />
        </video>
      </div>

      {/* Pequenos pontos orbital decorativos */}
      <span
        aria-hidden
        className="anim-shimmer"
        style={{
          position: 'absolute',
          top: '12%',
          right: '8%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--argho-blue)',
          boxShadow: '0 0 12px var(--argho-blue)',
          zIndex: 3,
        }}
      />
      <span
        aria-hidden
        className="anim-shimmer"
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '6%',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: 'var(--argho-green)',
          boxShadow: '0 0 10px var(--argho-green)',
          zIndex: 3,
          animationDelay: '1.5s',
        }}
      />
      <span
        aria-hidden
        className="anim-shimmer"
        style={{
          position: 'absolute',
          top: '50%',
          right: '2%',
          width: '3px',
          height: '3px',
          borderRadius: '50%',
          backgroundColor: 'var(--gold)',
          boxShadow: '0 0 8px var(--gold)',
          zIndex: 3,
          animationDelay: '2.2s',
        }}
      />
    </div>
  );
}
