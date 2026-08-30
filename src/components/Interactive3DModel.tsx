'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Zap, Shield, Search, Bot } from 'lucide-react';

export const Interactive3DModel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 15, y: -20 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = (e.clientX - centerX) / (rect.width / 2);
      const mouseY = (e.clientY - centerY) / (rect.height / 2);

      // Smooth 3D tilt tracking
      setRotation({
        x: -mouseY * 25 + 10,
        y: mouseX * 35 - 10,
      });

      setMousePos({ x: mouseX * 20, y: mouseY * 20 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center perspective-[1200px] select-none py-6"
    >
      {/* 3D Ambient Glow Background */}
      <div className="absolute w-72 h-72 rounded-full bg-[#8ce04a]/15 blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-emerald-500/10 blur-[80px] pointer-events-none -z-10" />

      {/* 3D Rotational Scene Container */}
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Outer Gyroscope Ring 1 (Emerald/Lime) */}
        <div
          style={{ transform: 'rotateZ(45deg) translateZ(30px)' }}
          className="absolute inset-0 rounded-full border-2 border-[#8ce04a]/30 border-dashed animate-[spin_20s_linear_infinite]"
        />

        {/* Outer Gyroscope Ring 2 (Counter rotating) */}
        <div
          style={{ transform: 'rotateZ(-30deg) translateZ(-30px)' }}
          className="absolute inset-4 rounded-full border border-emerald-400/25 border-dotted animate-[spin_25s_linear_infinite_reverse]"
        />

        {/* Floating 3D Core Sphere (Holographic Card) */}
        <div
          style={{ transform: 'translateZ(60px)' }}
          className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-3xl border border-white/20 bg-zinc-950/90 backdrop-blur-2xl p-5 shadow-[0_0_50px_rgba(140,224,74,0.25)] flex flex-col justify-between"
        >
          {/* Top Hologram Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8ce04a] animate-ping" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#a3e635]">
                3D Live Radar
              </span>
            </div>
            <span className="text-[9px] font-mono text-zinc-500">60 FPS REALTIME</span>
          </div>

          {/* Center 3D Logo Element */}
          <div className="my-auto flex flex-col items-center justify-center text-center py-2">
            <div className="relative flex items-center justify-center mb-2">
              <svg viewBox="0 0 100 100" className="h-16 w-16 drop-shadow-[0_0_15px_#8ce04a]">
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
            <span className="text-[10px] text-zinc-400">Autonomous FinOps Engine</span>
          </div>

          {/* Bottom Live Metrics */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Zero Waste Mode</span>
            <span className="font-bold text-[#8ce04a]">+100% Protected</span>
          </div>
        </div>

        {/* Satellite Node 1: Figma ($75/mo Saved) */}
        <div
          style={{
            transform: `translate3d(140px, -70px, 90px)`,
          }}
          className="absolute rounded-2xl border border-white/15 bg-zinc-900/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-white block">Figma Seat</span>
            <span className="text-[9px] text-[#8ce04a] font-semibold">-$75/mo Reclaimed</span>
          </div>
        </div>

        {/* Satellite Node 2: Notion ($20/mo Saved) */}
        <div
          style={{
            transform: `translate3d(-130px, 80px, 70px)`,
          }}
          className="absolute rounded-2xl border border-white/15 bg-zinc-900/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-[#8ce04a] animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-white block">Slack Bot Nudge</span>
            <span className="text-[9px] text-cyan-400 font-semibold">1-Click Relinquished</span>
          </div>
        </div>

        {/* Satellite Node 3: OpenAI ($30/mo Saved) */}
        <div
          style={{
            transform: `translate3d(120px, 90px, 40px)`,
          }}
          className="absolute rounded-2xl border border-white/15 bg-zinc-900/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl flex items-center gap-2"
        >
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
          <div>
            <span className="text-[10px] font-bold text-white block">ChatGPT Team</span>
            <span className="text-[9px] text-zinc-400 font-semibold">90d Inactivity Score</span>
          </div>
        </div>

        {/* Satellite Node 4: Google Workspace Verified */}
        <div
          style={{
            transform: `translate3d(-140px, -80px, 50px)`,
          }}
          className="absolute rounded-2xl border border-white/15 bg-zinc-900/90 backdrop-blur-xl px-3.5 py-2 shadow-2xl flex items-center gap-2"
        >
          <Shield className="h-3.5 w-3.5 text-[#8ce04a]" />
          <div>
            <span className="text-[10px] font-bold text-white block">Read-Only OAuth</span>
            <span className="text-[9px] text-emerald-400 font-semibold">SOC2 Certified</span>
          </div>
        </div>
      </div>
    </div>
  );
};
