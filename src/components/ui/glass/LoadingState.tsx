/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GlassCard } from './GlassCard';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <GlassCard className={`p-8 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-9 h-9 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-600">{message}</p>
    </GlassCard>
  );
};

