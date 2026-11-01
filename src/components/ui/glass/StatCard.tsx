/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconColor?: 'blue' | 'purple' | 'cyan' | 'green' | 'orange' | 'red' | 'navy';
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'blue',
  trend,
  onClick,
  className = '',
}) => {
  const iconGradients = {
    blue: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25',
    purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/25',
    cyan: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25',
    green: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25',
    orange: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-500/25',
    red: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25',
    navy: 'bg-gradient-to-br from-[#101B3C] to-[#14264D] text-white shadow-md',
  };

  return (
    <GlassCard
      hoverEffect={Boolean(onClick)}
      onClick={onClick}
      className={`p-4 sm:p-5 relative overflow-hidden transition-all duration-300 group ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-500 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300 ${iconGradients[iconColor]}`}>
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-1.5 text-[11px]">
          <span className={`font-bold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-500">{trend.label}</span>}
        </div>
      )}
    </GlassCard>
  );
};

