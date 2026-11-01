/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExamScheduleItem } from '../types';
import {
  FileSpreadsheet,
  CalendarDays,
  Building2,
  Sliders,
  PlusCircle,
  Download,
  Printer,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ExamDashboard } from '../components/exams/ExamDashboard';
import { ExamDirectory } from '../components/exams/ExamDirectory';
import { ExamTimetableCalendar } from '../components/exams/ExamTimetableCalendar';
import { ExamAllocationView } from '../components/exams/ExamAllocationView';
import { ExamDetailsModal } from '../components/exams/ExamDetailsModal';
import { ExamFormModal } from '../components/exams/ExamFormModal';
import { ExamSchedulerModal } from '../components/exams/ExamSchedulerModal';

export const ExamManagementPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    examinations,
    rooms,
    faculty,
    courses,
    studentGroups,
    createExamination,
    updateExamination,
    deleteExamination,
    generateExamSchedule,
  } = useApp();

  // Modals
  const [selectedExamForDetails, setSelectedExamForDetails] = useState<ExamScheduleItem | null>(null);
  const [examToEdit, setExamToEdit] = useState<ExamScheduleItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSchedulerModalOpen, setIsSchedulerModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Actions
  const handleOpenAddExam = () => {
    setExamToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditExam = (exam: ExamScheduleItem) => {
    setExamToEdit(exam);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    if (examToEdit) {
      await updateExamination(examToEdit.id, formData);
      showToast(`Updated examination paper for ${formData.courseCode}`);
    } else {
      await createExamination(formData);
      showToast(`Scheduled new examination paper for ${formData.courseCode}`);
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm('Are you sure you want to remove this examination session?')) {
      try {
        await deleteExamination(id);
        showToast('Examination session removed.');
      } catch (err: any) {
        alert(err.message || 'Failed to delete examination paper.');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Type', 'Date', 'Day', 'Time Slot', 'Course Code', 'Course Title', 'Cohort', 'Students', 'Allocated Halls'];
    const rows = examinations.map(e => [
      e.id,
      e.examType,
      e.date,
      e.day,
      `"${e.timeSlot}"`,
      e.courseCode,
      `"${e.courseTitle}"`,
      `"${e.studentGroup}"`,
      e.enrolledStudents,
      `"${(e.allocatedRooms || []).map(r => `${r.roomName} (${r.allocatedSeats}s, ${r.invigilator})`).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIT_Examination_Schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Examination Schedule to CSV.');
  };

  // Current tab helper
  const currentTab = activeSubPage === 'calendar' ? 'calendar' : activeSubPage === 'allocation' ? 'allocation' : 'timetable';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/70 border border-white/60 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Central Examination Cell
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Examination & Assessment Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
              Midsem and endsem schedules, 50% alternate-seating compliance, room allocations, and invigilation rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export Schedule
            </button>

            <button
              onClick={() => setIsSchedulerModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sliders className="w-4 h-4 text-amber-600" />
              Seating Engine
            </button>

            <button
              onClick={handleOpenAddExam}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Schedule Paper
            </button>
          </div>
        </div>

        {/* Live Examination Dashboard Strip */}
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <ExamDashboard
            examinations={examinations}
            rooms={rooms}
            faculty={faculty}
            onOpenScheduler={() => setIsSchedulerModalOpen(true)}
          />
        </div>
      </div>

      {/* Navigation Subpage Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 border border-white/70 shadow-xs backdrop-blur-md w-fit">
        <button
          onClick={() => setActiveNavigation('exams', 'timetable')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'timetable'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          Examination Papers ({examinations.length})
        </button>

        <button
          onClick={() => setActiveNavigation('exams', 'calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'calendar'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Timetable & Shifts
        </button>

        <button
          onClick={() => setActiveNavigation('exams', 'allocation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'allocation'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Room & Invigilator Allocation
        </button>
      </div>

      {/* Main Tab Content */}
      {currentTab === 'timetable' && (
        <ExamDirectory
          examinations={examinations}
          rooms={rooms}
          faculty={faculty}
          onSelectExam={ex => setSelectedExamForDetails(ex)}
          onEditExam={ex => handleOpenEditExam(ex)}
          onDeleteExam={id => handleDeleteExam(id)}
        />
      )}

      {currentTab === 'calendar' && (
        <ExamTimetableCalendar
          examinations={examinations}
          rooms={rooms}
          onSelectExam={ex => setSelectedExamForDetails(ex)}
        />
      )}

      {currentTab === 'allocation' && (
        <ExamAllocationView
          examinations={examinations}
          rooms={rooms}
          faculty={faculty}
          onSelectExam={ex => setSelectedExamForDetails(ex)}
        />
      )}

      {/* Modals */}
      <ExamDetailsModal
        exam={selectedExamForDetails}
        isOpen={!!selectedExamForDetails}
        onClose={() => setSelectedExamForDetails(null)}
        onEdit={ex => handleOpenEditExam(ex)}
        onDelete={id => handleDeleteExam(id)}
      />

      <ExamFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setExamToEdit(null);
        }}
        examToEdit={examToEdit}
        rooms={rooms}
        faculty={faculty}
        courses={courses}
        studentGroups={studentGroups}
        onSubmit={handleFormSubmit}
      />

      <ExamSchedulerModal
        isOpen={isSchedulerModalOpen}
        onClose={() => setIsSchedulerModalOpen(false)}
        onGenerate={async config => {
          const res = await generateExamSchedule(config);
          showToast('Seating engine verified with alternate seating.');
          return res;
        }}
      />
    </div>
  );
};
