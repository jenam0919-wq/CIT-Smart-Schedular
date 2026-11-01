/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Play,
  Clock,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ExamSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: any) => Promise<any>;
}

export const ExamSchedulerModal: React.FC<ExamSchedulerModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
}) => {
  const [startDate, setStartDate] = useState('2026-11-18');
  const [endDate, setEndDate] = useState('2026-11-28');
  const [slotMorning, setSlotMorning] = useState('09:30 - 11:30 AM');
  const [slotAfternoon, setSlotAfternoon] = useState('02:00 - 04:00 PM');
  const [alternateSeating, setAlternateSeating] = useState(true);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleRunGenerator = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    try {
      const res = await onGenerate({
        startDate,
        endDate,
        slotMorning,
        slotAfternoon,
        alternateSeating,
      });

      setFeedback({
        type: 'success',
        message: res?.message || 'Examination seating plan recalculated with alternate seating (50% room buffer).',
      });

      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to generate seating plan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg flex flex-col rounded-3xl bg-white border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Automated Seating & Timetable Generator
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Exam Scheduler Engine
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            Configures assessment date windows, morning/afternoon shifts, and 50% capacity alternate seating spacing.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleRunGenerator} className="p-6 space-y-4">
          {feedback && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Window Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Window End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Morning Slot</label>
              <input
                type="text"
                required
                value={slotMorning}
                onChange={e => setSlotMorning(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Afternoon Slot</label>
              <input
                type="text"
                required
                value={slotAfternoon}
                onChange={e => setSlotAfternoon(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-mono"
              />
            </div>
          </div>

          {/* Alternate Seating Buffer Switch */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                50% Alternate Seating Buffer
              </span>
              <p className="text-[11px] text-slate-500">
                Leaves 1 empty buffer seat between students to maintain testing integrity.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={alternateSeating}
                onChange={e => setAlternateSeating(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-400/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Seating Plan...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  Run Seating Generator
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

