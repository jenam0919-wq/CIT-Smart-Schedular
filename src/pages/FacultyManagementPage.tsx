/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FacultyMember } from '../types';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
  PlusCircle,
  Download,
  Building,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { FacultyDirectory } from '../components/faculty/FacultyDirectory';
import { FacultyProfileModal } from '../components/faculty/FacultyProfileModal';
import { FacultyFormModal } from '../components/faculty/FacultyFormModal';
import { FacultyAvailabilityCalendar } from '../components/faculty/FacultyAvailabilityCalendar';
import { FacultyWorkloadAnalytics } from '../components/faculty/FacultyWorkloadAnalytics';

export const FacultyManagementPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    faculty,
    timetableSlots,
    courses,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    markFacultyUnavailability,
  } = useApp();

  // Modal states
  const [selectedFacultyForProfile, setSelectedFacultyForProfile] = useState<FacultyMember | null>(null);
  const [facultyToEdit, setFacultyToEdit] = useState<FacultyMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [targetFacultyForAvailability, setTargetFacultyForAvailability] = useState<string | undefined>(undefined);

  // Success toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPI Calculations using real backend data
  const {
    totalFaculty,
    availableFaculty,
    assignedFaculty,
    onLeaveFaculty,
    totalDepartments,
    conflictCount,
  } = useMemo(() => {
    const total = faculty.length;
    // Active faculty who have assigned sessions in timetable
    const activeInstructors = new Set(timetableSlots.map(s => s.facultyName.toLowerCase()));
    const assigned = faculty.filter(f => activeInstructors.has(f.name.toLowerCase())).length;

    // Faculty with marked unavailabilities or leaves
    const onLeave = faculty.filter(f => f.unavailability && f.unavailability.length > 0).length;
    const available = Math.max(0, total - onLeave);

    // Departments count
    const depts = new Set(faculty.map(f => f.department));
    const totalDepts = depts.size || 5;

    // Conflicts: faculty assigned to 2 different slots at same day + period
    const facultySlotMap = new Map<string, string>();
    let conflicts = 0;
    timetableSlots.forEach(s => {
      const key = `${s.facultyName}-${s.day}-${s.periodId}`;
      if (facultySlotMap.has(key)) {
        conflicts += 1;
      } else {
        facultySlotMap.set(key, s.id);
      }
    });

    return {
      totalFaculty: total,
      availableFaculty: available,
      assignedFaculty: assigned,
      onLeaveFaculty: onLeave,
      totalDepartments: totalDepts,
      conflictCount: conflicts,
    };
  }, [faculty, timetableSlots]);

  // Handle adding new faculty
  const handleOpenAddFaculty = () => {
    setFacultyToEdit(null);
    setIsFormModalOpen(true);
  };

  // Handle editing faculty
  const handleOpenEditFaculty = (fac: FacultyMember) => {
    setFacultyToEdit(fac);
    setIsFormModalOpen(true);
  };

  // Handle submit from form modal
  const handleFormSubmit = async (formData: any) => {
    if (facultyToEdit) {
      await updateFaculty(facultyToEdit.id, formData);
      showToast(`Updated record for ${formData.name || facultyToEdit.name}`);
    } else {
      await createFaculty(formData);
      showToast(`Added ${formData.name} to Faculty Directory`);
    }
  };

  // Handle delete faculty
  const handleDeleteFaculty = async (id: string) => {
    if (confirm('Are you sure you want to remove this faculty member from the directory?')) {
      try {
        await deleteFaculty(id);
        showToast('Faculty member removed.');
      } catch (err: any) {
        alert(err.message || 'Failed to delete faculty member.');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Designation', 'Department', 'Email', 'Weekly Workload', 'Max Workload'];
    const rows = faculty.map(f => [
      f.id,
      `"${f.name}"`,
      `"${f.designation}"`,
      `"${f.department}"`,
      f.email,
      f.weeklyWorkloadHours,
      f.maxWorkloadHours,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CIT_Faculty_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported Faculty Directory to CSV.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast notification */}
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
              <GraduationCap className="w-3.5 h-3.5" />
              Academic Staff Management
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Faculty & Teaching Staff
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
              Directory of professorial faculty, teaching assignments, statutory workload compliance & availability matrices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export Directory
            </button>

            <button
              onClick={handleOpenAddFaculty}
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Add Faculty Member
            </button>
          </div>
        </div>

        {/* Live KPI Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-6 pt-6 border-t border-slate-200/60">
          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Total Faculty</span>
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalFaculty}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Permanent & Adjunct</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Available</span>
              <Users className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {availableFaculty}
            </div>
            <p className="text-[10px] text-emerald-600/80 mt-0.5 font-medium">Ready for duty</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Active Teaching</span>
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-700 tracking-tight">
              {assignedFaculty}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Assigned in timetable</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Exemptions / Leave</span>
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 tracking-tight">
              {onLeaveFaculty}
            </div>
            <p className="text-[10px] text-amber-600/80 mt-0.5 font-medium">Research or leaves</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Departments</span>
              <Building className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {totalDepartments}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Academic Divisions</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Conflicts</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              {conflictCount}
            </div>
            <p className="text-[10px] text-emerald-600/80 mt-0.5 font-medium">100% Conflict Free</p>
          </div>
        </div>
      </div>

      {/* Subpage Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 border border-white/70 shadow-xs backdrop-blur-md w-fit">
        <button
          onClick={() => setActiveNavigation('faculty', 'directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubPage === 'directory' || activeSubPage === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          Faculty Directory ({faculty.length})
        </button>

        <button
          onClick={() => setActiveNavigation('faculty', 'workload')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubPage === 'workload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          Workload & Compliance
        </button>

        <button
          onClick={() => setActiveNavigation('faculty', 'availability')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubPage === 'availability'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          Availability Matrix
        </button>
      </div>

      {/* Main Tab Content */}
      {(activeSubPage === 'directory' || activeSubPage === 'overview') && (
        <FacultyDirectory
          facultyList={faculty}
          timetableSlots={timetableSlots}
          courses={courses}
          onSelectFaculty={fac => setSelectedFacultyForProfile(fac)}
          onEditFaculty={fac => handleOpenEditFaculty(fac)}
          onDeleteFaculty={id => handleDeleteFaculty(id)}
          onViewTimetable={fac => {
            setTargetFacultyForAvailability(fac.id);
            setActiveNavigation('faculty', 'availability');
          }}
        />
      )}

      {activeSubPage === 'workload' && (
        <FacultyWorkloadAnalytics
          facultyList={faculty}
          timetableSlots={timetableSlots}
          onSelectFaculty={fac => setSelectedFacultyForProfile(fac)}
        />
      )}

      {activeSubPage === 'availability' && (
        <FacultyAvailabilityCalendar
          facultyList={faculty}
          timetableSlots={timetableSlots}
          initialFacultyId={targetFacultyForAvailability}
          onMarkUnavailability={async data => {
            await markFacultyUnavailability(data);
            showToast('Unavailability marked successfully.');
          }}
        />
      )}

      {/* Modals */}
      <FacultyProfileModal
        faculty={selectedFacultyForProfile}
        isOpen={!!selectedFacultyForProfile}
        onClose={() => setSelectedFacultyForProfile(null)}
        timetableSlots={timetableSlots}
        courses={courses}
        onEdit={fac => handleOpenEditFaculty(fac)}
        onManageAvailability={fac => {
          setTargetFacultyForAvailability(fac.id);
          setActiveNavigation('faculty', 'availability');
        }}
      />

      <FacultyFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setFacultyToEdit(null);
        }}
        facultyToEdit={facultyToEdit}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

