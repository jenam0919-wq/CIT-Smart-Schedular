/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  rightAction?: ReactNode;
  error?: string;
  helperText?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(({
  label,
  icon,
  rightAction,
  error,
  helperText,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full text-xs sm:text-sm py-2 bg-white/60 hover:bg-white/80 focus:bg-white backdrop-blur-md border rounded-xl text-slate-800 placeholder-slate-400 transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 ${
            icon ? 'pl-10' : 'pl-3.5'
          } ${rightAction ? 'pr-10' : 'pr-3.5'} ${
            error ? 'border-red-400 focus:border-red-500' : 'border-white/80 focus:border-blue-500 shadow-sm'
          } ${className}`}
          {...props}
        />
        {rightAction && (
          <div className="absolute right-3 text-slate-400 flex items-center">
            {rightAction}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500">{helperText}</p>}
    </div>
  );
});

GlassInput.displayName = 'GlassInput';

