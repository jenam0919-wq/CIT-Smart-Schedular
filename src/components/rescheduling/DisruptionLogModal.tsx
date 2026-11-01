/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DisruptionEvent, FacultyMember, Room } from '../../types';
import {
  AlertOctagon,
  X,
  Calendar,
  Building,
  User,
  AlertTriangle,
  CheckCircle2,
  Send,
  Sparkles
} from 'lucide-react';

interface DisruptionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  faculty: FacultyMember[];
  rooms: Room[];
}

export const DisruptionLogModal: React.FC<DisruptionLogModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  faculty,
  rooms,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DisruptionEvent['type']>('Faculty Leave');
  const [affectedDate, setAffectedDate] = useState('2026-11-04');
  const [affectedEntity, setAffectedEntity] = useState(faculty[0]?.name || 'Dr. Debabrata Samal');
  const [affectedSlotsCount, setAffectedSlotsCount] = useState<number>(2);
  const [proposedResolution, setProposedResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a descriptive title for this disruption.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        title,
        type,
        affected_date: affectedDate,
        affectedDate: affectedDate,
        affected_entity: affectedEntity,
        affectedEntity: affectedEntity,
        affected_slots_count: affectedSlotsCount,
        affectedSlotsCount: affectedSlotsCount,
        status: 'Unresolved',
        proposed_resolution: proposedResolution || 'Pending OR-Tools micro-solver optimization',
        proposedResolution: proposedResolution || 'Pending OR-Tools micro-solver optimization',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record disruption event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Log Academic Disruption Event</h3>
              <p className="text-[11px] text-slate-500">
                Record unplanned instructor leave, venue repairs, or campus relocations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Disruption Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Prof. Sengupta Emergency Medical Leave"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Disruption Category
              </label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as DisruptionEvent['type'];
                  setType(newType);
                  if (newType === 'Room Maintenance' && rooms.length > 0) {
                    setAffectedEntity(rooms[0].name);
                  } else if (newType === 'Faculty Leave' && faculty.length > 0) {
                    setAffectedEntity(faculty[0].name);
                  }
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="Faculty Leave">Faculty Leave</option>
                <option value="Room Maintenance">Room Maintenance</option>
                <option value="Campus Event">Campus Event</option>
                <option value="Equipment Failure">Equipment Failure</option>
              </select>
            </div>

            {/* Affected Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Affected Date
              </label>
              <input
                type="date"
                required
                value={affectedDate}
                onChange={(e) => setAffectedDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Affected Entity */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Impacted Entity (Faculty / Venue)
              </label>
              {type === 'Room Maintenance' ? (
                <select
                  value={affectedEntity}
                  onChange={(e) => setAffectedEntity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.block})</option>
                  ))}
                </select>
              ) : type === 'Faculty Leave' ? (
                <select
                  value={affectedEntity}
                  onChange={(e) => setAffectedEntity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {faculty.map(f => (
                    <option key={f.id} value={f.name}>{f.name} ({f.department})</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={affectedEntity}
                  onChange={(e) => setAffectedEntity(e.target.value)}
                  placeholder="e.g. Main Auditorium or Campus Grounds"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              )}
            </div>

            {/* Impacted Slots Count */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Estimated Affected Periods
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={affectedSlotsCount}
                onChange={(e) => setAffectedSlotsCount(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Proposed Resolution Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Initial Proposed Resolution / Notes
            </label>
            <textarea
              rows={2}
              value={proposedResolution}
              onChange={(e) => setProposedResolution(e.target.value)}
              placeholder="e.g., Substitute lecturer requested or relocate afternoon practicals to Saturday..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record & Prepare Solver'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};