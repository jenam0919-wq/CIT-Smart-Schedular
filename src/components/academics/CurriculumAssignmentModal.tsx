/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Course, StudentGroup, FacultyMember, TimetableSlot } from '../../types';
import {
  X,
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Loader2,
  Trash2
} from 'lucide-react';

interface CurriculumAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: StudentGroup[];
  courses: Course[];
  facultyList: FacultyMember[];
  timetableSlots: TimetableSlot[];
  onAssignSuccess?: () => void;
}

export const CurriculumAssignmentModal: React.FC<CurriculumAssignmentModalProps> = ({
  isOpen,
  onClose,
  groups,
  courses,
  facultyList,
  timetableSlots,
  onAssignSuccess,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(courses[0]?.code || '');
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(facultyList[0]?.id || '');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Selected entities
  const selectedGroup = useMemo(() => groups.find(g => g.id === selectedGroupId) || groups[0], [groups, selectedGroupId]);
  const selectedCourse = useMemo(() => courses.find(c => c.code === selectedCourseCode) || courses[0], [courses, selectedCourseCode]);
  const selectedFaculty = useMemo(() => facultyList.find(f => f.id === selectedFacultyId) || facultyList[0], [facultyList, selectedFacultyId]);

  // Current mappings for selected group
  const groupExistingCourses = useMemo(() => {
    if (!selectedGroup) return [];
    const groupSlots = timetableSlots.filter(
      s => s.groupId === selectedGroup.id || s.groupName?.toLowerCase() === selectedGroup.name?.toLowerCase()
    );
    const courseCodes = Array.from(new Set(groupSlots.map(s => s.courseCode)));
    return courses.filter(c => courseCodes.includes(c.code));
  }, [selectedGroup, timetableSlots, courses]);

  // Workload check for selected faculty
  const facultyWorkloadCheck = useMemo(() => {
    if (!selectedFaculty) return { compliant: true, current: 0, max: 18 };
    const current = selectedFaculty.weeklyWorkloadHours;
    const max = selectedFaculty.maxWorkloadHours;
    return {
      compliant: current + (selectedCourse?.weeklyHours || 3) <= max,
      current,
      max,
    };
  }, [selectedFaculty, selectedCourse]);

  if (!isOpen) return null;

  const handleCommitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedGroup || !selectedCourse || !selectedFaculty) {
      setFeedback({ type: 'error', message: 'Please select cohort group, course syllabus, and faculty instructor.' });
      return;
    }

    // Check if course already mapped to this group
    const alreadyMapped = groupExistingCourses.some(c => c.code === selectedCourse.code);
    if (alreadyMapped) {
      setFeedback({
        type: 'error',
        message: `Course ${selectedCourse.code} is already assigned to cohort ${selectedGroup.name}.`,
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate / perform backend assignment linkage
      await new Promise(resolve => setTimeout(resolve, 800));

      setFeedback({
        type: 'success',
        message: `Assigned ${selectedCourse.code} (${selectedCourse.title}) to ${selectedGroup.name} under ${selectedFaculty.name}.`,
      });

      if (onAssignSuccess) onAssignSuccess();
      setTimeout(() => {
        onClose();
        setFeedback(null);
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to complete assignment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl flex flex-col rounded-3xl bg-white border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
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
                Curriculum Orchestration
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Course & Faculty Cohort Assignment
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-lg">
            Map academic courses to student sections and link professorial faculty for CP-SAT timetable generation.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCommitAssignment} className="p-6 space-y-4">
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

          {/* Group Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Target Student Cohort <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} — {g.department} (Sem {g.semester}, {g.strength} students)
                </option>
              ))}
            </select>
          </div>

          {/* Course Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              Curriculum Course Syllabus <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCourseCode}
              onChange={e => setSelectedCourseCode(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              {courses.map(c => (
                <option key={c.id || c.code} value={c.code}>
                  [{c.code}] {c.title} — {c.credits} Credits ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              Assign Primary Faculty Instructor <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedFacultyId}
              onChange={e => setSelectedFacultyId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold cursor-pointer"
            >
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.designation}, {f.department}) — Load: {f.weeklyWorkloadHours}/{f.maxWorkloadHours}h
                </option>
              ))}
            </select>
          </div>

          {/* Workload Pre-check Strip */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-slate-700">
                Instructor Capacity Compliance:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {facultyWorkloadCheck.current + (selectedCourse?.weeklyHours || 3)} / {facultyWorkloadCheck.max} hrs/wk
              </span>
              {facultyWorkloadCheck.compliant ? (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Within Cap
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  Near Cap
                </span>
              )}
            </div>
          </div>

          {/* Existing Courses in this Group */}
          <div className="pt-2">
            <span className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Currently Assigned to {selectedGroup?.name} ({groupExistingCourses.length})
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-100/70 border border-slate-200">
              {groupExistingCourses.length === 0 ? (
                <span className="text-xs text-slate-400 italic">No courses currently assigned</span>
              ) : (
                groupExistingCourses.map(c => (
                  <span
                    key={c.code}
                    className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="font-mono font-bold text-blue-700">{c.code}</span>
                    <span className="truncate max-w-[150px]">{c.title}</span>
                  </span>
                ))
              )}
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
                  Assigning...
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Confirm Course Assignment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

