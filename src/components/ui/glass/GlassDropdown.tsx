/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { SelectHTMLAttributes, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface GlassDropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: ReactNode;
  options?: { value: string; label: string }[];
  children?: ReactNode;
}

export const GlassDropdown: React.FC<GlassDropdownProps> = ({
  label,
  icon,
  options,
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none shrink-0">
            {icon}
          </div>
        )}
        <select
          className={`w-full text-xs sm:text-sm py-2 bg-white/70 hover:bg-white/90 focus:bg-white backdrop-blur-md border border-white/80 rounded-xl text-slate-800 shadow-sm appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer ${
            icon ? 'pl-9' : 'pl-3.5'
          } pr-9 ${className}`}
          {...props}
        >
          {options
            ? options.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <div className="absolute right-3 pointer-events-none text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

