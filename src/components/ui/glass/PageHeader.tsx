/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  institution?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  institution = 'Chilika Institute of Technology',
  actions,
  className = '',
}) => {
  return (
    <GlassCard className={`p-5 sm:p-6 mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {badge || (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/15 text-blue-700 border border-blue-500/30 uppercase tracking-wider">
                Enterprise Academic SaaS
              </span>
            )}
            <span className="text-slate-400 text-xs">• {institution}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </GlassCard>
  );
};

