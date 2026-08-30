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
        className="drop-shadow-[0_0_12px_rgba(140,224,74,0.4)]"
      >
        {/* Left Green Spark Star */}
        <path
          d="M32 20 C32 38 18 50 4 50 C18 50 32 62 32 80 C32 62 46 50 60 50 C46 50 32 38 32 20 Z"
          fill="#8ce04a"
        />
        {/* Right Green Spark Star */}
        <path
          d="M68 20 C68 38 54 50 40 50 C54 50 68 62 68 80 C68 62 82 50 96 50 C82 50 68 38 68 20 Z"
          fill="#a3e635"
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
