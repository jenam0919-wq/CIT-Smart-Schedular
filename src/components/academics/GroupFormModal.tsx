/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StudentGroup } from '../../types';
import {
  X,
  Users,
  GraduationCap,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  Hash
} from 'lucide-react';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit: StudentGroup | null;
  onSubmit: (groupData: any) => Promise<void>;
}

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Comm',
  'Mechanical Eng',
  'Civil Engineering',
  'Electrical Engineering',
  'Basic Sciences & Humanities',
];

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
  onSubmit,
}) => {
  const isEditing = !!groupToEdit;

  const [name, setName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [semester, setSemester] = useState(1);
  const [strength, setStrength] = useState(60);
  const [classRepresentative, setClassRepresentative] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name || '');
      setDepartment(groupToEdit.department || DEPARTMENTS[0]);
      setSemester(groupToEdit.semester || 1);
      setStrength(groupToEdit.strength || 60);
      setClassRepresentative(groupToEdit.classRepresentative || '');
    } else {
      setName('');
      setDepartment(DEPARTMENTS[0]);
      setSemester(1);
      setStrength(60);
      setClassRepresentative('');
    }
    setError(null);
  }, [groupToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a cohort section name (e.g. CSE-3A).');
      return;
    }

    if (strength < 1 || strength > 200) {
      setError('Class strength must be between 1 and 200 students.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: name.trim().toUpperCase(),
        department,
        semester: Number(semester),
        strength: Number(strength),
        classRepresentative: classRepresentative.trim(),
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save student group. Please retry.');
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {isEditing ? 'Cohort Settings' : 'New Academic Section'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? `Edit: ${groupToEdit.name}` : 'Create Student Cohort'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            Define the student cohort group, department affiliation, semester level, and enrolled student count.
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

          {/* Group Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Cohort Code / Section <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CSE-3A"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-bold uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Academic Department <span className="text-rose-500">*</span>
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-semibold cursor-pointer"
              >
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Semester (Term Level) <span className="text-rose-500">*</span>
              </label>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-semibold cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>
                    Semester {s} (Year {Math.ceil(s / 2)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student Headcount (Strength) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={200}
                value={strength}
                onChange={e => setStrength(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-bold"
              />
            </div>
          </div>

          {/* Class Representative */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Class Representative (CR)
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Rohan Sharma"
                value={classRepresentative}
                onChange={e => setClassRepresentative(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium"
              />
            </div>
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
                  {isEditing ? 'Save Changes' : 'Create Section'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

