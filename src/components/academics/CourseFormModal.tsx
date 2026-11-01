/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Course } from '../../types';
import {
  X,
  BookOpen,
  Layers,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Palette,
  Clock,
  Award,
  Hash
} from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseToEdit: Course | null;
  onSubmit: (courseData: any) => Promise<void>;
}

const DEPARTMENTS = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'BS'];
const COURSE_TYPES: ('Lecture' | 'Lab' | 'Tutorial')[] = ['Lecture', 'Lab', 'Tutorial'];
const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  courseToEdit,
  onSubmit,
}) => {
  const isEditing = !!courseToEdit;

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [credits, setCredits] = useState(4);
  const [type, setType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');
  const [weeklyHours, setWeeklyHours] = useState(3);
  const [colorTag, setColorTag] = useState(PRESET_COLORS[0]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseToEdit) {
      setCode(courseToEdit.code || '');
      setTitle(courseToEdit.title || '');
      setDepartment(courseToEdit.department || DEPARTMENTS[0]);
      setCredits(courseToEdit.credits || 4);
      setType(courseToEdit.type || 'Lecture');
      setWeeklyHours(courseToEdit.weeklyHours || 3);
      setColorTag(courseToEdit.colorTag || PRESET_COLORS[0]);
    } else {
      setCode('');
      setTitle('');
      setDepartment(DEPARTMENTS[0]);
      setCredits(4);
      setType('Lecture');
      setWeeklyHours(3);
      setColorTag(PRESET_COLORS[0]);
    }
    setError(null);
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError('Please provide a course code (e.g. CS301).');
      return;
    }

    if (!title.trim()) {
      setError('Please provide a course title.');
      return;
    }

    if (credits < 1 || credits > 10) {
      setError('Credits must be between 1 and 10.');
      return;
    }

    if (weeklyHours < 1 || weeklyHours > 10) {
      setError('Weekly contact hours must be between 1 and 10.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        department,
        credits: Number(credits),
        type,
        weekly_hours: Number(weeklyHours),
        weeklyHours: Number(weeklyHours),
        color_tag: colorTag,
        colorTag,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save course. Please retry.');
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {isEditing ? 'Syllabus Editor' : 'Course Catalog Onboarding'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? `Edit: ${courseToEdit.code}` : 'Add New Academic Course'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            Configure course curriculum, credits, required weekly hours, and timetable calendar color tagging.
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

          {/* Course Code & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. CS301"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-bold uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Department Affiliation <span className="text-rose-500">*</span>
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

          {/* Course Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Course Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design & Analysis of Algorithms"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-medium"
            />
          </div>

          {/* Type, Credits, Weekly Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 font-semibold cursor-pointer"
              >
                {COURSE_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={credits}
                onChange={e => setCredits(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Weekly Hours
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={weeklyHours}
                onChange={e => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Color Tag Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-blue-600" />
              Calendar Highlight Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorTag(c)}
                  className={`w-7 h-7 rounded-xl transition-all cursor-pointer ${
                    colorTag === c ? 'ring-2 ring-offset-2 ring-blue-600 scale-110 shadow-md' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
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
                  {isEditing ? 'Save Changes' : 'Add to Catalog'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

