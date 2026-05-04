'use client';

// apps/website/src/components/heart-intro.tsx
//
// Landing intro fullscreen — coração digital ARGHO como gateway do site.
// Inspiração: resn.co.nz/#!/about (cinematic intro, click-to-enter).
//
// Comportamento:
// - Primeira visita: overlay fullscreen black com coração centralizado
// - Click em qualquer lugar (ou no coração) → fade + scale + reveal do site
// - sessionStorage guarda flag pra não mostrar de novo na mesma sessão
// - prefers-reduced-motion: skip direto pro site
//
// Hot-swap: quando .glb existir, este componente troca o <video> por <Canvas><HeartGLB />
// sem mexer na lógica de transição.

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'argho-intro-seen';

export function HeartIntro() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'exiting'>('hidden');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip se já viu nesta sessão
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    // Skip se reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }
    // Bloqueia scroll do body enquanto intro está visível
    document.body.style.overflow = 'hidden';
    setPhase('visible');
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (phase === 'visible') {
      videoRef.current?.play().catch(() => {});
    }
  }, [phase]);

  function handleEnter() {
    if (phase !== 'visible') return;
    setPhase('exiting');
    sessionStorage.setItem(SESSION_KEY, '1');
    // Após animação de saída, libera scroll
    setTimeout(() => {
      document.body.style.overflow = '';
      setPhase('hidden');
    }, 1400);
  }

  if (phase === 'hidden') return null;

  const isExiting = phase === 'exiting';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#0a0d18',
        backgroundImage: `
          radial-gradient(ellipse 55% 65% at 50% 50%, oklch(0.20 0.090 266.7 / 0.45) 0%, transparent 65%),
          radial-gradient(ellipse 70% 55% at 50% 100%, oklch(0.18 0.075 138.8 / 0.32) 0%, transparent 70%),
          radial-gradient(ellipse 40% 30% at 50% 0%, oklch(0.14 0.060 266.7 / 0.25) 0%, transparent 70%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 1.2s var(--ease-out-expo)',
        overflow: 'hidden',
      }}
    >
      {/* Click-to-enter — botão invisível cobrindo toda a área (z-index baixo) */}
      <button
        type="button"
        onClick={handleEnter}
        aria-label="Entrar no site Argho"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          zIndex: 1,
        }}
      />
      {/* Grid técnico de fundo */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '88px 88px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* SVG anéis ambientes */}
      <svg
        aria-hidden="true"
        role="presentation"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>Anéis ambientes</title>
        <circle
          cx="500"
          cy="500"
          r="280"
          fill="none"
          stroke="oklch(0.58 0.180 266.7 / 0.30)"
          strokeWidth="0.6"
        />
        <circle
          cx="500"
          cy="500"
          r="380"
          fill="none"
          stroke="oklch(0.586 0.150 138.8 / 0.20)"
          strokeWidth="0.5"
          strokeDasharray="2 4"
        />
        <circle
          cx="500"
          cy="500"
          r="460"
          fill="none"
          stroke="oklch(0.58 0.180 266.7 / 0.12)"
          strokeWidth="0.4"
        />
      </svg>

      {/* Eyebrow superior */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '6vh',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: '40px',
            height: '1px',
            background: 'oklch(0.58 0.180 266.7 / 0.7)',
          }}
        />
        <span
          className="mono anim-fade-in"
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500,
          }}
        >
          Argho Agrosciences · 2026
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '40px',
            height: '1px',
            background: 'oklch(0.58 0.180 266.7 / 0.7)',
          }}
        />
      </div>

      {/* Coração no centro — visual decorativo, clique vai para o botão invisível abaixo */}
      <div
        aria-hidden
        style={{
          position: 'relative',
          height: '70vh',
          maxHeight: '780px',
          aspectRatio: '2 / 3',
          transform: isExiting ? 'scale(1.18) translateY(-4vh)' : 'scale(1)',
          transition: 'transform 1.2s var(--ease-out-expo)',
          willChange: 'transform',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* Glow ambient atrás */}
        <div
          aria-hidden
          className="anim-glow-pulse"
          style={{
            position: 'absolute',
            inset: '-20%',
            background: `
              radial-gradient(ellipse 50% 55% at 50% 45%, oklch(0.45 0.220 266.7 / 0.50) 0%, transparent 60%),
              radial-gradient(ellipse 35% 40% at 50% 60%, oklch(0.586 0.150 138.8 / 0.32) 0%, transparent 65%)
            `,
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/argho-heart-poster.png"
          aria-label="Coração digital Argho"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 2,
          }}
        >
          <source src="/argho-heart.webm" type="video/webm" />
        </video>

        {/* Pontos orbital flutuantes */}
        <span
          aria-hidden
          className="anim-shimmer"
          style={{
            position: 'absolute',
            top: '15%',
            right: '-3%',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'oklch(0.58 0.180 266.7)',
            boxShadow: '0 0 18px oklch(0.58 0.180 266.7)',
            zIndex: 3,
          }}
        />
        <span
          aria-hidden
          className="anim-shimmer"
          style={{
            position: 'absolute',
            bottom: '25%',
            left: '-2%',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'oklch(0.586 0.150 138.8)',
            boxShadow: '0 0 16px oklch(0.586 0.150 138.8)',
            zIndex: 3,
            animationDelay: '1.2s',
          }}
        />
        <span
          aria-hidden
          className="anim-shimmer"
          style={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'oklch(0.66 0.130 78)',
            boxShadow: '0 0 12px oklch(0.66 0.130 78)',
            zIndex: 3,
            animationDelay: '2.4s',
          }}
        />
      </div>

      {/* CTA inferior */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.5s ease',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        {/* Logo Argho oficial (branca para fundo escuro) — discreta */}
        <div
          className="anim-fade-in-up delay-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/argho-logo-white.png"
            alt="Argho Agrosciences"
            width={140}
            height={52}
            priority
            style={{
              width: 'clamp(96px, 9vw, 140px)',
              height: 'auto',
              opacity: 0.85,
            }}
          />
        </div>

        {/* Click hint */}
        <div
          className="anim-fade-in-up delay-3"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'rgba(255,255,255,0.55)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.005em',
          }}
        >
          <span
            className="anim-pulse-ring"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'oklch(0.586 0.150 138.8)',
            }}
          />
          <span>Clique para entrar no ecossistema Argho</span>
        </div>
      </div>

      {/* Skip link — z-index acima do botão invisível */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleEnter();
        }}
        style={{
          position: 'absolute',
          top: '6vh',
          right: '40px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.18)',
          color: 'rgba(255,255,255,0.55)',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-body)',
          letterSpacing: '-0.005em',
          cursor: 'pointer',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.4s ease, color 0.2s, border-color 0.2s',
          zIndex: 3,
        }}
      >
        Pular →
      </button>
    </div>
  );
}
