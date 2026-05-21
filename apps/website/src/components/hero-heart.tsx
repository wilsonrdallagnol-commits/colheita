'use client';

// apps/website/src/components/hero-heart.tsx
//
// Coracao digital — peca central da home da Argho.
// Renderiza video WebM com fundo branco puro (combina com pagina branca).
// Parallax sutil ao mouse. SEM glow/aneis/shimmer decorativos — eles criavam
// halo difuso atras do retangulo do video que parecia "checker pattern" no
// iPhone. Heart fica puro, flutuante, clean.

import { useEffect, useRef, useState } from 'react';

export function HeroHeart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile para servir asset menor
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Parallax: movimenta sutilmente o coracao com o mouse
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
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      setParallax({
        x: Math.max(-1, Math.min(1, dx)) * 12,
        y: Math.max(-1, Math.min(1, dy)) * 12,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Autoplay forcado em browsers que pedem user-gesture
  useEffect(() => {
    const v = videoRef.current;
    if (v) {
      v.play().catch(() => {
        // browsers podem bloquear; o poster fica
      });
    }
  }, []);

  // Dois sources por device: WebM (Chrome/Firefox/Safari >= iOS 17.4) + MP4
  // H.264 baseline (iOS Safari < 17.4, qualquer browser legacy). Browser
  // escolhe o primeiro que suporta — WebM ganha onde possivel (menor).
  const sources = isMobile
    ? { webm: '/argho-heart-hero-mobile.webm', mp4: '/argho-heart-hero-mobile.mp4' }
    : { webm: '/argho-heart-hero.webm', mp4: '/argho-heart-hero.mp4' };

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '560px',
        // padding-bottom hack em vez de aspect-ratio CSS — funciona em qualquer
        // browser desde 2010, incluindo iOS Safari antigo onde aspect-ratio
        // pode falhar e colapsar container pra altura 0 (= video invisivel).
        // 150% = aspect 2/3 (height eh 150% da width).
        paddingBottom: '150%',
        height: 0,
        margin: '0 auto',
        // Poster como background-image garante visibilidade mesmo se video
        // falhar a carregar em qualquer dispositivo legacy.
        backgroundImage: 'url(/argho-heart-poster-hero.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/argho-heart-poster-hero.png"
        aria-label="Coracao digital Argho — tecnologia viva"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
          transition: 'transform 0.6s var(--ease-out-expo)',
          willChange: 'transform',
        }}
      >
        <source src={sources.webm} type="video/webm" />
        <source src={sources.mp4} type="video/mp4" />
      </video>
    </div>
  );
}
