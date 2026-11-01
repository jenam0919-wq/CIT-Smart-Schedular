/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChevronRight, Home } from 'lucide-react';

const MODULE_TITLES: Record<string, string> = {
  dashboard: 'Executive Dashboard',
  timetable: 'Timetable Management',
  faculty: 'Faculty Management',
  academics: 'Groups & Courses',
  exams: 'Examination Management',
  venues: 'Venue Management',
  rescheduling: 'Smart Rescheduling',
  ai: 'AI Assistant',
  analytics: 'Analytics & Reports',
  admin: 'Administration',
};

const SUBPAGE_TITLES: Record<string, string> = {
  overview: 'Overview',
  directory: 'Faculty Directory',
  groups: 'Student Cohorts',
  courses: 'Course Catalog',
  generator: 'CP-SAT Solver Generator',
  weekly: 'Weekly Master Timetable',
  group: 'Group Timetable',
  faculty: 'Faculty Timetable',
  room: 'Room Timetable',
  scheduler: 'Exam Scheduler',
  timetable: 'Midsem Schedule',
  allocation: 'Room & Invigilators',
  booking: 'Venue Catalog & Booking',
  requests: 'Booking Requests',
  spectra: 'Spectra Week Bookings',
  approvals: 'Approval Centre',
  availability: 'Live Room Matrix',
  disruptions: 'Disruption Log',
  comparison: 'Before / After Comparison',
  approval: 'Admin Review & Approval',
  explanations: 'Decision Explanations',
  utilization: 'Room Utilisation',
  workload: 'Faculty Workload',
  'solver-stats': 'Scheduling Statistics',
  conflicts: 'Conflict Reports',
  users: 'User Directory',
  upload: 'Dataset Upload',
  export: 'Export Schedules',
  settings: 'System Configuration',
};

export const Breadcrumb: React.FC = () => {
  const { activeModule, activeSubPage, setActiveNavigation } = useApp();

  const moduleName = MODULE_TITLES[activeModule] || activeModule;
  const subPageName = SUBPAGE_TITLES[activeSubPage] || activeSubPage;

  return (
    <nav className="inline-flex items-center text-xs text-slate-500 mb-4 px-3 py-1.5 rounded-xl bg-white/50 backdrop-blur-md border border-white/70 shadow-2xs" aria-label="Breadcrumb">
      <button
        onClick={() => setActiveNavigation('dashboard', 'overview')}
        className="flex items-center hover:text-blue-600 font-medium transition-colors cursor-pointer"
      >
        <Home className="w-3.5 h-3.5 mr-1 text-slate-400" />
        <span>CIT Central</span>
      </button>

      <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 shrink-0" />

      <button
        onClick={() => setActiveNavigation(activeModule, 'overview')}
        className={`hover:text-blue-600 transition-colors cursor-pointer ${
          activeSubPage === 'overview' ? 'font-bold text-slate-900' : 'font-medium'
        }`}
      >
        {moduleName}
      </button>

      {activeSubPage !== 'overview' && (
        <>
          <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-400 shrink-0" />
          <span className="font-extrabold text-blue-700 capitalize truncate max-w-xs">
            {subPageName}
          </span>
        </>
      )}
    </nav>
  );
};
