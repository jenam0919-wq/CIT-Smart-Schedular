/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';
import { GlassCard } from './GlassCard';

export interface DataTableProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  children,
  header,
  footer,
  className = '',
}) => {
  return (
    <GlassCard className={`overflow-hidden ${className}`}>
      {header && (
        <div className="p-4 sm:p-5 border-b border-slate-200/50 bg-white/40">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {children}
        </table>
      </div>
      {footer && (
        <div className="p-3.5 border-t border-slate-200/50 bg-white/30 text-xs text-slate-500">
          {footer}
        </div>
      )}
    </GlassCard>
  );
};

