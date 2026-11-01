/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export interface CITLogoProps {
  variant?: 'primary' | 'compact' | 'icon';
  theme?: 'color' | 'white' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showSubtitle?: boolean;
  showBadge?: boolean;
  className?: string;
  title?: string;
  onClick?: () => void;
}

export const CITLogo: React.FC<CITLogoProps> = ({
  variant = 'primary',
  theme = 'color',
  size = 'md',
  showTagline = true,
  showSubtitle = true,
  showBadge = true,
  className = '',
  title,
  onClick,
}) => {
  // Determine pixel sizes for icon container
  const iconSizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  // Colors based on theme
  const isWhite = theme === 'white';
  const isDark = theme === 'dark';

  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      role="img"
      aria-label="CIT Smart Scheduler Logo"
    >
      {/* ================= EMBLEM ICON ================= */}
      <div
        className={`relative ${iconSizeClasses} shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${
          isWhite
            ? 'bg-gradient-to-tr from-[#1E293B] to-[#0F172A] border border-white/25 shadow-blue-900/30'
            : isDark
            ? 'bg-gradient-to-tr from-blue-600 via-blue-700 to-indigo-950 border border-blue-400/30 shadow-blue-500/20'
            : 'bg-gradient-to-tr from-[#101B3C] via-[#14264D] to-[#0B1329] border border-white/20 shadow-blue-600/25'
        }`}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full p-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="logo-emblem-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="40%" stop-color="#2563EB" />
              <stop offset="100%" stop-color="#7C3AED" />
            </linearGradient>
            <linearGradient id="logo-cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#67E8F9" />
              <stop offset="100%" stop-color="#06B6D4" />
            </linearGradient>
          </defs>

          {/* 1. Graduation Cap (Mortarboard) */}
          <polygon
            points="32,8 53,17.5 32,27 11,17.5"
            fill="url(#logo-emblem-grad)"
          />
          <polygon
            points="32,8 53,17.5 32,19 11,17.5"
            fill="white"
            fillOpacity="0.22"
          />
          <polyline
            points="11,17.5 32,27 53,17.5"
            fill="none"
            stroke="#67E8F9"
            strokeWidth="0.85"
            strokeOpacity="0.9"
          />

          {/* Cap Skullcap Rim */}
          <path
            d="M 22,23 Q 32,28.5 42,23 L 43,26.5 Q 32,32 21,26.5 Z"
            fill="#0F172A"
            fillOpacity="0.8"
          />

          {/* Cap Tassel */}
          <circle cx="32" cy="17.5" r="1.5" fill="#38BDF8" />
          <path
            d="M 32,17.5 Q 46,18 49,24"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="49" cy="24.5" r="1.2" fill="#67E8F9" />
          <path
            d="M 49,25.5 L 49.5,30.5"
            stroke="#67E8F9"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* 2. Open Book Knowledge Base */}
          <path
            d="M 31,31 Q 20,29 11,32.5 L 11,46 Q 21,42.5 31,45 Z"
            fill="#F8FAFC"
          />
          <path
            d="M 33,31 Q 44,29 53,32.5 L 53,46 Q 43,42.5 33,45 Z"
            fill="#F8FAFC"
          />
          <path
            d="M 31,30.5 L 33,30.5 L 33,45.5 L 31,45.5 Z"
            fill="#94A3B8"
          />

          {/* 3. Calendar Grid Slots */}
          <rect x="15" y="34.5" width="5.5" height="3" rx="0.8" fill="#2563EB" />
          <rect x="22.5" y="34.5" width="5.5" height="3" rx="0.8" fill="#06B6D4" />
          <rect x="15" y="39.5" width="5.5" height="3" rx="0.8" fill="#64748B" fillOpacity="0.6" />
          <rect x="22.5" y="39.5" width="5.5" height="3" rx="0.8" fill="#2563EB" />

          <rect x="36" y="34.5" width="5.5" height="3" rx="0.8" fill="#7C3AED" />
          <rect x="43.5" y="34.5" width="5.5" height="3" rx="0.8" fill="#2563EB" />
          <rect x="36" y="39.5" width="5.5" height="3" rx="0.8" fill="#06B6D4" />
          <rect x="43.5" y="39.5" width="5.5" height="3" rx="0.8" fill="#64748B" fillOpacity="0.6" />

          {/* 4. Tech Horizon Arc & Optimization Center Spark */}
          <path
            d="M 16,49.5 Q 32,53.5 48,49.5"
            fill="none"
            stroke="url(#logo-cyan-grad)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="32" cy="51.5" r="1.5" fill="#67E8F9" />
          <circle cx="16" cy="49.5" r="1" fill="#38BDF8" />
          <circle cx="48" cy="49.5" r="1" fill="#38BDF8" />
        </svg>
      </div>

      {/* ================= TEXT BRANDING (PRIMARY / COMPACT) ================= */}
      {variant !== 'icon' && (
        <div className="flex flex-col justify-center min-w-0">
          {/* Main Title Row */}
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight leading-none ${
                size === 'xs'
                  ? 'text-xs'
                  : size === 'sm'
                  ? 'text-sm'
                  : size === 'md'
                  ? 'text-base'
                  : size === 'lg'
                  ? 'text-xl'
                  : 'text-2xl'
              }`}
            >
              <span className={isWhite ? 'text-sky-400' : 'text-blue-600'}>CIT </span>
              <span className={isWhite ? 'text-white' : 'text-slate-900'}>
                {variant === 'compact' ? 'Scheduler' : 'Smart Scheduler'}
              </span>
            </span>

            {/* CP-SAT Badge */}
            {showBadge && (
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider border leading-none shrink-0 ${
                  isWhite
                    ? 'bg-sky-500/20 text-sky-300 border-sky-400/40'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                CP-SAT
              </span>
            )}
          </div>

          {/* Subtitle: Chilika Institute of Technology */}
          {showSubtitle && (
            <span
              className={`font-semibold tracking-wide truncate mt-0.5 leading-tight ${
                size === 'xs' || size === 'sm' ? 'text-[10px]' : 'text-xs'
              } ${isWhite ? 'text-slate-300' : 'text-slate-500'}`}
            >
              Chilika Institute of Technology
            </span>
          )}

          {/* Tagline: Plan • Manage • Optimize */}
          {showTagline && variant === 'primary' && (
            <span
              className={`font-mono font-semibold tracking-widest uppercase mt-0.5 leading-none text-[9px] ${
                isWhite ? 'text-cyan-300' : 'text-sky-600'
              }`}
            >
              Plan • Manage • Optimize
            </span>
          )}
        </div>
      )}
    </div>
  );
};
