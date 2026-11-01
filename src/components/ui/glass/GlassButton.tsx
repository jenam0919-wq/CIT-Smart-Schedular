/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  glow?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  glow = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-sm rounded-xl gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 border border-blue-400/30 active:scale-[0.98]',
    secondary:
      'bg-white/80 hover:bg-white text-slate-800 border border-white/90 shadow-sm active:scale-[0.98]',
    glass:
      'bg-white/40 hover:bg-white/60 text-slate-800 backdrop-blur-md border border-white/60 shadow-sm active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-white/40 text-slate-700 border border-slate-300/80 active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md shadow-red-500/20 border border-rose-400/30 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-slate-900/5 text-slate-600 hover:text-slate-900 active:scale-[0.98]',
  };

  const glowStyle = glow && variant === 'primary' ? 'shadow-[0_0_20px_-3px_rgba(37,99,235,0.45)]' : '';

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${glowStyle} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};

