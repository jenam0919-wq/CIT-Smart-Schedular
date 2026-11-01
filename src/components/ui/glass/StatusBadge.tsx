/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface StatusBadgeProps {
  children: ReactNode;
  variant?: 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'cyan' | 'slate';
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'blue',
  pulse = false,
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    green: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    orange: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
    blue: 'bg-blue-500/15 text-blue-700 border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-700 border-purple-500/30',
    cyan: 'bg-cyan-500/15 text-cyan-700 border-cyan-500/30',
    slate: 'bg-slate-500/15 text-slate-700 border-slate-400/30',
  };

  const dotColors = {
    green: 'bg-emerald-500',
    orange: 'bg-amber-500',
    red: 'bg-rose-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    slate: 'bg-slate-500',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold border backdrop-blur-xs select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      <span>{children}</span>
    </span>
  );
};

