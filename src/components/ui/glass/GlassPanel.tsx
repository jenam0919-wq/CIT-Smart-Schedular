/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode } from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-2xl p-4 sm:p-5 text-slate-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

