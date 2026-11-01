/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  action,
  children,
  footer,
  className = '',
}) => {
  return (
    <GlassCard className={`p-5 flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-200/50 gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
        <div className="pt-4">{children}</div>
      </div>
      {footer && <div className="mt-4 pt-3 border-t border-slate-200/50">{footer}</div>}
    </GlassCard>
  );
};

