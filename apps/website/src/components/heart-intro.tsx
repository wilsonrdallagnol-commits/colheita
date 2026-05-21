'use client';

// apps/website/src/components/heart-intro.tsx
//
// Landing intro fullscreen — coracao digital ARGHO como gateway do site.
// Inspiracao: resn.co.nz/#!/about (cinematic intro, click-to-enter).
//
// Comportamento:
// - Primeira visita: overlay fullscreen BRANCO com coracao centralizado
// - Click em qualquer lugar (ou no coracao) → fade + scale + reveal do site
// - sessionStorage guarda flag pra nao mostrar de novo na mesma sessao
// - prefers-reduced-motion: skip direto pro site
//
// Decisao editorial 2026-05-21: TUDO BRANCO. Heart com fundo branco no centro
// de uma pagina branca. Sem dark, sem glow, sem grid, sem SVG ambient — clean
// total. Textos em azul Argho pra contraste.

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'argho-intro-seen';

export function HeartIntro() {
  const [phase, setPhase] = useState<'hidden' | 'visible' | 'exiting'>('hidden');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return;
    }
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

  const handleEnter = useCallback(() => {
    setPhase((current) => {
      if (current !== 'visible') return current;
      sessionStorage.setItem(SESSION_KEY, '1');
      setTimeout(() => {
        document.body.style.overflow = '';
        setPhase('hidden');
      }, 1400);
      return 'exiting';
    });
  }, []);

  useEffect(() => {
    if (phase !== 'visible') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, handleEnter]);

  if (phase === 'hidden') return null;

  const isExiting = phase === 'exiting';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isExiting ? 0 : 1,
        transition: 'opacity 1.2s var(--ease-out-expo)',
        overflow: 'hidden',
      }}
    >
      {/* Click-to-enter — botao invisivel cobrindo toda a area */}
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
            background: 'var(--argho-blue, #183090)',
            opacity: 0.6,
          }}
        />
        <span
          className="mono anim-fade-in"
          style={{
            fontSize: '0.6875rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'var(--argho-blue, #183090)',
            fontWeight: 600,
          }}
        >
          Argho Agrosciences · 2026
        </span>
        <span
          style={{
            display: 'inline-block',
            width: '40px',
            height: '1px',
            background: 'var(--argho-blue, #183090)',
            opacity: 0.6,
          }}
        />
      </div>

      {/* Coracao no centro — video com fundo branco, mesmo do hero */}
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
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          poster="/argho-heart-poster-hero.png"
          aria-label="Coracao digital Argho"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            zIndex: 2,
          }}
        >
          {/* Mesmo asset do hero — fundo branco puro casa com a pagina branca */}
          <source src="/argho-heart-hero.webm" type="video/webm" />
        </video>
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
        {/* Logo Argho oficial color (azul + verde) — pagina branca */}
        <div
          className="anim-fade-in-up delay-2"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src="/argho-logo-color.png"
            alt="Argho Agrosciences"
            width={140}
            height={52}
            priority
            style={{
              width: 'clamp(96px, 9vw, 140px)',
              height: 'auto',
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
            color: 'var(--argho-blue, #183090)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-body)',
            letterSpacing: '-0.005em',
            opacity: 0.7,
          }}
        >
          <span
            className="anim-pulse-ring"
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--argho-green, #489030)',
            }}
          />
          <span>Clique para entrar no ecossistema Argho</span>
        </div>
      </div>

      {/* Skip link */}
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
          border: '1px solid rgba(24, 48, 144, 0.25)',
          color: 'var(--argho-blue, #183090)',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-body)',
          letterSpacing: '-0.005em',
          cursor: 'pointer',
          opacity: isExiting ? 0 : 0.85,
          transition: 'opacity 0.4s ease, color 0.2s, border-color 0.2s',
          zIndex: 3,
        }}
      >
        Pular →
      </button>
    </div>
  );
}
