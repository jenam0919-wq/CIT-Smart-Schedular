/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'subtle' | 'dark';
  hoverEffect?: boolean;
  className?: string;
  glow?: 'blue' | 'purple' | 'cyan' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  hoverEffect = false,
  glow = 'none',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card text-slate-900',
    elevated: 'glass-elevated text-slate-900',
    subtle: 'glass-panel text-slate-900',
    dark: 'bg-[#101B3C]/80 backdrop-blur-xl border border-white/10 text-white shadow-xl',
  };

  const glowStyles = {
    none: '',
    blue: 'shadow-[0_0_24px_-4px_rgba(37,99,235,0.25)]',
    purple: 'shadow-[0_0_24px_-4px_rgba(139,92,246,0.25)]',
    cyan: 'shadow-[0_0_24px_-4px_rgba(6,182,212,0.25)]',
  };

  return (
    <div
      className={`rounded-2xl ${variantStyles[variant]} ${
        hoverEffect ? 'glass-card-hover cursor-pointer' : ''
      } ${glowStyles[glow]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

