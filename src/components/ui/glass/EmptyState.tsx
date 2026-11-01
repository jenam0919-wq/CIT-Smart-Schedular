/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <GlassCard className={`p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-400/20">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
        {description && <p className="text-xs text-slate-500 max-w-sm">{description}</p>}
      </div>
      {action && <div className="pt-2">{action}</div>}
    </GlassCard>
  );
};

