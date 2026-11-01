/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ExamScheduleItem, Room, FacultyMember, Course, StudentGroup } from '../../types';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Loader2,
  PlusCircle,
  Trash2
} from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  examToEdit: ExamScheduleItem | null;
  rooms: Room[];
  faculty: FacultyMember[];
  courses: Course[];
  studentGroups: StudentGroup[];
  onSubmit: (examData: any) => Promise<void>;
}

const TIME_SLOTS = [
  '09:30 - 11:30 AM',
  '02:00 - 04:00 PM',
  '10:00 - 12:00 PM',
  '03:00 - 05:00 PM',
];

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  examToEdit,
  rooms,
  faculty,
  courses,
  studentGroups,
  onSubmit,
}) => {
  const isEditing = !!examToEdit;

  const [courseCode, setCourseCode] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [examType, setExamType] = useState<'Midsem' | 'Endsem'>('Midsem');
  const [date, setDate] = useState('2026-11-18');
  const [day, setDay] = useState('Wednesday');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [studentGroup, setStudentGroup] = useState('');
  const [enrolledStudents, setEnrolledStudents] = useState(60);

  // Dynamic allocated rooms
  const [allocatedRooms, setAllocatedRooms] = useState<
    { roomId: string; roomName: string; allocatedSeats: number; invigilator: string }[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (examToEdit) {
      setCourseCode(examToEdit.courseCode);
      setCourseTitle(examToEdit.courseTitle);
      setExamType(examToEdit.examType);
      setDate(examToEdit.date);
      setDay(examToEdit.day);
      setTimeSlot(examToEdit.timeSlot);
      setStudentGroup(examToEdit.studentGroup);
      setEnrolledStudents(examToEdit.enrolledStudents);
      setAllocatedRooms(examToEdit.allocatedRooms || []);
    } else {
      const defaultCourse = courses[0];
      setCourseCode(defaultCourse?.code || 'CS301');
      setCourseTitle(defaultCourse?.title || 'Design & Analysis of Algorithms');
      setExamType('Midsem');
      setDate('2026-11-18');
      setDay('Wednesday');
      setTimeSlot(TIME_SLOTS[0]);
      setStudentGroup(studentGroups[0]?.name || 'CSE-3A');
      setEnrolledStudents(studentGroups[0]?.strength || 60);

      const defaultRoom = rooms[0];
      const defaultFaculty = faculty[0];
      setAllocatedRooms([
        {
          roomId: defaultRoom?.id || 'rm-4',
          roomName: defaultRoom?.name || 'LH-201',
          allocatedSeats: 60,
          invigilator: defaultFaculty?.name || 'Prof. Faculty',
        },
      ]);
    }
    setError(null);
  }, [examToEdit, isOpen, courses, studentGroups, rooms, faculty]);

  if (!isOpen) return null;

  const handleAddRoomRow = () => {
    const unallocated = rooms.find(r => !allocatedRooms.some(ar => ar.roomId === r.id)) || rooms[0];
    const defaultFac = faculty.find(f => !allocatedRooms.some(ar => ar.invigilator === f.name)) || faculty[0];

    setAllocatedRooms(prev => [
      ...prev,
      {
        roomId: unallocated?.id || 'rm-5',
        roomName: unallocated?.name || 'LH-202',
        allocatedSeats: Math.floor((unallocated?.capacity || 100) * 0.5),
        invigilator: defaultFac?.name || 'Faculty Invigilator',
      },
    ]);
  };

  const handleRemoveRoomRow = (index: number) => {
    setAllocatedRooms(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRoomRow = (index: number, field: string, val: any) => {
    setAllocatedRooms(prev => {
      const copy = [...prev];
      if (field === 'roomId') {
        const roomObj = rooms.find(r => r.id === val);
        copy[index] = {
          ...copy[index],
          roomId: val,
          roomName: roomObj?.name || copy[index].roomName,
          allocatedSeats: Math.floor((roomObj?.capacity || 100) * 0.5),
        };
      } else {
        copy[index] = { ...copy[index], [field]: val };
      }
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!courseCode.trim()) {
      setError('Please select or specify a course code.');
      return;
    }

    if (!date) {
      setError('Please select an examination date.');
      return;
    }

    if (allocatedRooms.length === 0) {
      setError('Please allocate at least one examination room.');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        courseCode: courseCode.trim().toUpperCase(),
        courseTitle: courseTitle.trim(),
        examType,
        date,
        day,
        timeSlot,
        studentGroup: studentGroup.trim(),
        enrolledStudents: Number(enrolledStudents),
        allocatedRooms,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save examination paper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-white border border-white/80 shadow-2xl shadow-blue-950/20 backdrop-blur-xl overflow-hidden"
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
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {isEditing ? 'Update Examination' : 'Schedule Examination'}
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {isEditing ? `Edit: ${examToEdit.courseCode}` : 'Create Examination Paper'}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-sm">
            Set assessment dates, shifts, student cohorts, and allocate exam halls with invigilators.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Course Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Course Syllabus <span className="text-rose-500">*</span>
              </label>
              <select
                value={courseCode}
                onChange={e => {
                  setCourseCode(e.target.value);
                  const matched = courses.find(c => c.code === e.target.value);
                  if (matched) setCourseTitle(matched.title);
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold font-mono cursor-pointer"
              >
                {courses.map(c => (
                  <option key={c.id || c.code} value={c.code}>
                    [{c.code}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Assessment Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={examType}
                onChange={e => setExamType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold cursor-pointer"
              >
                <option value="Midsem">Midsem Examination</option>
                <option value="Endsem">Endsem Examination</option>
              </select>
            </div>
          </div>

          {/* Date & Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Exam Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => {
                  setDate(e.target.value);
                  const parsed = new Date(e.target.value);
                  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  setDay(days[parsed.getDay()] || 'Wednesday');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Shift Slot
              </label>
              <select
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {TIME_SLOTS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Day of Week
              </label>
              <input
                type="text"
                readOnly
                value={day}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-semibold"
              />
            </div>
          </div>

          {/* Cohort & Headcount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Student Cohort <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CSE-3A & CSE-3B"
                value={studentGroup}
                onChange={e => setStudentGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Enrolled Students <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={300}
                required
                value={enrolledStudents}
                onChange={e => setEnrolledStudents(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Allocated Halls & Invigilators */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Allocated Halls & Invigilators ({allocatedRooms.length})
              </span>
              <button
                type="button"
                onClick={handleAddRoomRow}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3 h-3" />
                + Add Hall
              </button>
            </div>

            <div className="space-y-2">
              {allocatedRooms.map((ar, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Hall {i + 1}</span>
                    {allocatedRooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRoomRow(i)}
                        className="text-rose-500 hover:text-rose-700"
                        title="Remove Hall"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Exam Hall</label>
                      <select
                        value={ar.roomId}
                        onChange={e => handleUpdateRoomRow(i, 'roomId', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name} (Cap: {Math.floor(r.capacity * 0.5)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Allocated Seats</label>
                      <input
                        type="number"
                        min={1}
                        value={ar.allocatedSeats}
                        onChange={e => handleUpdateRoomRow(i, 'allocatedSeats', Number(e.target.value))}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Invigilator</label>
                      <select
                        value={ar.invigilator}
                        onChange={e => handleUpdateRoomRow(i, 'invigilator', e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium"
                      >
                        {faculty.map(f => (
                          <option key={f.id} value={f.name}>
                            {f.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
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
                  {isEditing ? 'Save Changes' : 'Schedule Examination'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

