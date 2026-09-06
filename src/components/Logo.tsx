'use client';

import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export const SlashLogoIcon: React.FC<LogoIconProps> = ({ className = "h-8 w-8", size = 32 }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_0_12px_rgba(124,92,255,0.45)]"
      >
        <defs>
          <linearGradient id="ss-spark-mark" x1="4" y1="20" x2="96" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7c5cff" />
            <stop offset="0.55" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#2fd9f4" />
          </linearGradient>
        </defs>
        {/* Left spark */}
        <path
          d="M32 20 C32 38 18 50 4 50 C18 50 32 62 32 80 C32 62 46 50 60 50 C46 50 32 38 32 20 Z"
          fill="url(#ss-spark-mark)"
        />
        {/* Right spark */}
        <path
          d="M68 20 C68 38 54 50 40 50 C54 50 68 62 68 80 C68 62 82 50 96 50 C82 50 68 38 68 20 Z"
          fill="url(#ss-spark-mark)"
        />
      </svg>
    </div>
  );
};

export const SlashLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  return (
    <div className="flex items-center gap-2.5 group select-none">
      <SlashLogoIcon size={size === 'sm' ? 24 : size === 'lg' ? 36 : 28} />
      <span className="text-base sm:text-lg font-black tracking-tight text-white font-sans">
        SlashSaaS
      </span>
    </div>
  );
};
