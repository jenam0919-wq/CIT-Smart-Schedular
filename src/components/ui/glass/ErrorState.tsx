/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <GlassCard className={`p-6 border-red-200/80 bg-red-50/50 text-center flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div className="w-11 h-11 rounded-2xl bg-red-500/15 text-red-600 flex items-center justify-center border border-red-300">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="space-y-1">
        <h4 className="font-bold text-red-950 text-sm">{title}</h4>
        <p className="text-xs text-red-700 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<RotateCcw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Retry
        </GlassButton>
      )}
    </GlassCard>
  );
};

