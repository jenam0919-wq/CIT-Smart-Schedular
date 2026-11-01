/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FacultyMember } from '../../types';
import {
  X,
  GraduationCap,
  Mail,
  Building,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Sliders
} from 'lucide-react';

interface FacultyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyToEdit: FacultyMember | null;
  onSubmit: (facultyData: any) => Promise<void>;
}

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Basic Sciences & Humanities',
];

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Guest Lecturer',
];

export const FacultyFormModal: React.FC<FacultyFormModalProps> = ({
  isOpen,
  onClose,
  facultyToEdit,
  onSubmit,
}) => {
  const isEditing = !!facultyToEdit;

  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [designation, setDesignation] = useState(DESIGNATIONS[2]); // Assistant Professor
  const [email, setEmail] = useState('');
  const [weeklyWorkloadHours, setWeeklyWorkloadHours] = useState(16);
  const [maxWorkloadHours, setMaxWorkloadHours] = useState(18);
  const [maxDailyHours, setMaxDailyHours] = useState(4);
  const [preferMorning, setPreferMorning] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync form state when modal opens or facultyToEdit changes
  useEffect(() => {
    if (facultyToEdit) {
      setName(facultyToEdit.name || '');
      setDepartment(facultyToEdit.department || DEPARTMENTS[0]);
      setDesignation(facultyToEdit.designation || DESIGNATIONS[2]);
      setEmail(facultyToEdit.email || '');
      setWeeklyWorkloadHours(facultyToEdit.weeklyWorkloadHours || 16);
      setMaxWorkloadHours(facultyToEdit.maxWorkloadHours || 18);
      setMaxDailyHours(4);
      setPreferMorning(true);
    } else {
      setName('');
      setDepartment(DEPARTMENTS[0]);
      setDesignation(DESIGNATIONS[2]);
      setEmail('');
      setWeeklyWorkloadHours(16);
      setMaxWorkloadHours(18);
      setMaxDailyHours(4);
      setPreferMorning(true);
    }
    setError(null);
  }, [facultyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide faculty member name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (maxWorkloadHours < 1 || maxWorkloadHours > 30) {
      setError('Max workload hours must be between 1 and 30 hours per week.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim(),
        department,
        designation,
        email: email.trim(),
        weekly_workload_hours: Number(weeklyWorkloadHours),
        max_workload_hours: Number(maxWorkloadHours),
        max_daily_hours: Number(maxDailyHours),
        prefer_morning: Boolean(preferMorning),
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save faculty record. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl flex flex-col rounded-3xl bg-white border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {isEditing ? 'Update Records' : 'Faculty Onboarding'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? `Edit: ${facultyToEdit.name}` : 'Add New Faculty Member'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-md">
            Enter the instructor’s academic credentials, department affiliation, and AI solver workload limits.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name & Designation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name with Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Debabrata Samal"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Designation <span className="text-rose-500">*</span>
              </label>
              <select
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium cursor-pointer"
              >
                {DESIGNATIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Department & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department Affiliation <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Institutional Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@cit.edu.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Workload Limits & AI Solver Constraints */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900">
                  OR-Tools CP-SAT Scheduling Limits
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Target Workload (hrs/wk)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={28}
                    value={weeklyWorkloadHours}
                    onChange={e => setWeeklyWorkloadHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Max Workload Cap
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={maxWorkloadHours}
                    onChange={e => setMaxWorkloadHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Max Daily Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={maxDailyHours}
                    onChange={e => setMaxDailyHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Preference toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-blue-200/60">
                <div>
                  <span className="text-xs font-semibold text-slate-800">
                    Prefer Morning Schedule (P1 – P4)
                  </span>
                  <p className="text-[10px] text-slate-500">
                    CP-SAT soft constraint will prioritize scheduling lecture classes before 1:00 PM.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferMorning}
                    onChange={e => setPreferMorning(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isEditing ? 'Update Faculty Record' : 'Add to Faculty Directory'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

