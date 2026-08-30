'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export const Interactive3DModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 15, y: -20 });
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // IntersectionObserver to pause when off-screen (saves battery/CPU)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Mouse tilt tracking (only if visible and reduced motion is false)
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = (e.clientX - centerX) / (rect.width / 2);
      const mouseY = (e.clientY - centerY) / (rect.height / 2);

      // Smooth 3D tilt tracking
      setRotation({
        x: -mouseY * 20 + 8,
        y: mouseX * 30 - 10,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isVisible, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="relative w-full h-[360px] sm:h-[420px] flex items-center justify-center perspective-[1200px] select-none py-4 overflow-hidden"
    >
      {/* 3D Ambient Glow Background */}
      <div className="absolute w-72 h-72 rounded-full bg-[#8ce04a]/15 blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />

      {/* 3D Rotational Scene Container */}
      <div
        style={{
          transform: prefersReducedMotion
            ? 'rotateX(8deg) rotateY(-10deg)'
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.2s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Outer Gyroscope Ring 1 (Emerald/Lime) */}
        {!prefersReducedMotion && (
          <div
            style={{ transform: 'rotateZ(45deg) translateZ(30px)' }}
            className="absolute inset-0 rounded-full border-2 border-[#8ce04a]/30 border-dashed animate-[spin_20s_linear_infinite]"
          />
        )}

        {/* Outer Gyroscope Ring 2 (Counter rotating) */}
        {!prefersReducedMotion && (
          <div
            style={{ transform: 'rotateZ(-30deg) translateZ(-30px)' }}
            className="absolute inset-4 rounded-full border border-emerald-400/25 border-dotted animate-[spin_25s_linear_infinite_reverse]"
          />
        )}

        {/* Floating 3D Core Sphere (Holographic Card with solid fallback) */}
        <div
          style={{ transform: 'translateZ(60px)' }}
          className="relative w-48 h-48 sm:w-60 sm:h-60 rounded-3xl border border-white/20 bg-zinc-950/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_0_50px_rgba(140,224,74,0.25)] flex flex-col justify-between"
        >
          {/* Top Hologram Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#8ce04a] animate-ping" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3e635]">
                3D Live Radar
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">REALTIME</span>
          </div>

          {/* Center 3D Logo Element */}
          <div className="my-auto flex flex-col items-center justify-center text-center py-1">
            <div className="relative flex items-center justify-center mb-1.5">
              <svg viewBox="0 0 100 100" className="h-12 w-12 sm:h-14 sm:w-14 drop-shadow-[0_0_15px_#8ce04a]">
                <path
                  d="M32 20 C32 38 18 50 4 50 C18 50 32 62 32 80 C32 62 46 50 60 50 C46 50 32 38 32 20 Z"
                  fill="#8ce04a"
                />
                <path
                  d="M68 20 C68 38 54 50 40 50 C54 50 68 62 68 80 C68 62 82 50 96 50 C82 50 68 38 68 20 Z"
                  fill="#a3e635"
                />
              </svg>
            </div>
            <span className="text-xs font-black text-white tracking-wider">SlashSaaS</span>
            <span className="text-[9px] sm:text-[10px] text-zinc-400">Autonomous FinOps Engine</span>
          </div>

          {/* Bottom Live Metrics */}
          <div className="rounded-xl border border-white/10 bg-zinc-900/90 px-3 py-1.5 flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Zero Waste Mode</span>
            <span className="font-bold text-[#8ce04a]">+100% Protected</span>
          </div>
        </div>

        {/* Satellite Node 1: Figma */}
        <div
          style={{
            transform: `translate3d(120px, -60px, 80px)`,
          }}
          className="hidden sm:flex absolute rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl px-3 py-1.5 shadow-2xl items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-rose-500" />
          <div>
            <span className="text-[10px] font-bold text-white block">Figma Seat</span>
            <span className="text-[9px] text-[#8ce04a] font-semibold">-$75/mo Reclaimed</span>
          </div>
        </div>

        {/* Satellite Node 2: Slack Bot */}
        <div
          style={{
            transform: `translate3d(-110px, 70px, 70px)`,
          }}
          className="hidden sm:flex absolute rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl px-3 py-1.5 shadow-2xl items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-[#8ce04a]" />
          <div>
            <span className="text-[10px] font-bold text-white block">Slack Bot Nudge</span>
            <span className="text-[9px] text-cyan-400 font-semibold">1-Click Relinquished</span>
          </div>
        </div>

        {/* Satellite Node 3: OpenAI */}
        <div
          style={{
            transform: `translate3d(100px, 75px, 40px)`,
          }}
          className="hidden sm:flex absolute rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl px-3 py-1.5 shadow-2xl items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div>
            <span className="text-[10px] font-bold text-white block">ChatGPT Team</span>
            <span className="text-[9px] text-zinc-400 font-semibold">90d Inactivity Score</span>
          </div>
        </div>

        {/* Satellite Node 4: Read-Only OAuth */}
        <div
          style={{
            transform: `translate3d(-120px, -70px, 50px)`,
          }}
          className="hidden sm:flex absolute rounded-2xl border border-white/15 bg-zinc-950/95 backdrop-blur-xl px-3 py-1.5 shadow-2xl items-center gap-2"
        >
          <Shield className="h-3.5 w-3.5 text-[#8ce04a]" />
          <div>
            <span className="text-[10px] font-bold text-white block">Read-Only OAuth</span>
            <span className="text-[9px] text-emerald-400 font-semibold">SOC 2 Controls</span>
          </div>
        </div>
      </div>
    </div>
  );
};
