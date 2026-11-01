/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Upload,
  Download,
  Settings,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Calendar,
  Lock,
  Layers,
  FileText
} from 'lucide-react';
import { TIME_PERIODS } from '../data/mockData';

export const AdministrationPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    faculty,
    academicTerm,
    setAcademicTerm
  } = useApp();

  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleSimulateUpload = (datasetName: string) => {
    setUploadStatus(`Validating and parsing ${datasetName}...`);
    setTimeout(() => {
      setUploadStatus(`${datasetName} parsed successfully: 100% schema match!`);
      setTimeout(() => setUploadStatus(null), 2500);
    }, 1200);
  };

  const handleExport = (format: string) => {
    setExportSuccess(`Master timetable exported to ${format} successfully!`);
    setTimeout(() => setExportSuccess(null), 2000);
  };

  const tabs = [
    { id: 'users', label: 'User Directory (40+)', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'upload', label: 'Dataset CSV Upload', icon: <Upload className="w-3.5 h-3.5" /> },
    { id: 'export', label: 'Import / Export Schedules', icon: <Download className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'System Configuration', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveNavigation('admin', tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubPage === tab.id
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SUBPAGE 1: User Directory */}
      {activeSubPage === 'users' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Campus User & Role Directory</h3>
              <p className="text-xs text-slate-500">Access controls across Admin, Department Coordinators, Faculty, and Student Clubs</p>
            </div>
            <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
              4 Roles Configured
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] font-semibold">
                    <th className="p-3">User Name</th>
                    <th className="p-3">University Email</th>
                    <th className="p-3">Department / Affiliation</th>
                    <th className="p-3">Role Tier</th>
                    <th className="p-3">Demo Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-bold text-slate-900">Dr. Rameshwar Panda</td>
                    <td className="p-3 font-mono text-slate-600">admin@cit.edu</td>
                    <td className="p-3 text-slate-700">Dean of Academic Scheduling</td>
                    <td className="p-3">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px] border border-indigo-200">
                        ADMIN
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">demo123</td>
                  </tr>

                  <tr className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-bold text-slate-900">Dr. Sunita Mohanty</td>
                    <td className="p-3 font-mono text-slate-600">coordinator@cit.edu</td>
                    <td className="p-3 text-slate-700">Computer Science & Engineering</td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">
                        COORDINATOR
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">demo123</td>
                  </tr>

                  <tr className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-bold text-slate-900">Prof. Arvind Tripathy</td>
                    <td className="p-3 font-mono text-slate-600">faculty@cit.edu</td>
                    <td className="p-3 text-slate-700">Computer Science & Engineering</td>
                    <td className="p-3">
                      <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-bold text-[10px] border border-sky-200">
                        FACULTY
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">demo123</td>
                  </tr>

                  <tr className="hover:bg-slate-50 font-medium">
                    <td className="p-3 font-bold text-slate-900">Ananya Dash</td>
                    <td className="p-3 font-mono text-slate-600">club@cit.edu</td>
                    <td className="p-3 text-slate-700">CIT Robotics & AI Club</td>
                    <td className="p-3">
                      <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-bold text-[10px] border border-amber-200">
                        CLUB REP
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-400">demo123</td>
                  </tr>

                  {faculty.slice(2, 8).map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 text-slate-600">
                      <td className="p-3 font-semibold text-slate-900">{f.name}</td>
                      <td className="p-3 font-mono text-[11px]">{f.email}</td>
                      <td className="p-3">{f.department}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">
                          FACULTY
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400">demo123</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 2: Dataset Upload */}
      {activeSubPage === 'upload' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm">Academic Catalog Ingestion</h3>
            <p className="text-xs text-slate-500">
              Drag and drop CSV or Excel files containing faculty lists, course syllabi, student cohorts, and room catalogs
            </p>
          </div>

          {uploadStatus && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{uploadStatus}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-2 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Faculty & Workload Roster</div>
              <p className="text-[11px] text-slate-500">Columns: ID, Name, Department, MaxHours, AvailabilityPreferences</p>
              <button
                onClick={() => handleSimulateUpload('Faculty Roster CSV')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Upload Faculty CSV
              </button>
            </div>

            <div className="p-5 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-2 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Course Offerings & Curricula</div>
              <p className="text-[11px] text-slate-500">Columns: CourseCode, Title, Department, Credits, WeeklyLectures, LabHours</p>
              <button
                onClick={() => handleSimulateUpload('Courses Offering CSV')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Upload Courses CSV
              </button>
            </div>

            <div className="p-5 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-2 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Campus Room & Laboratory Catalog</div>
              <p className="text-[11px] text-slate-500">Columns: RoomID, Name, Type, Capacity, ExamCapacity, Equipment, Block</p>
              <button
                onClick={() => handleSimulateUpload('Room Inventory CSV')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Upload Rooms CSV
              </button>
            </div>

            <div className="p-5 bg-white rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-2 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Student Cohort Enrolments</div>
              <p className="text-[11px] text-slate-500">Columns: GroupID, Name, Department, Semester, EnrolledCount, ClassRep</p>
              <button
                onClick={() => handleSimulateUpload('Cohort Enrolments CSV')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Upload Batches CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 3: Import / Export */}
      {activeSubPage === 'export' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm">Export Master Academic Schedules</h3>
            <p className="text-xs text-slate-500">Export formatted timetables for printing, ERP integration, and student calendar sync</p>
          </div>

          {exportSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{exportSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
              <FileSpreadsheet className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Excel Master Timetable (.XLSX)</div>
              <p className="text-[11px] text-slate-500">Contains individual sheets for each of the 14 student cohorts and 40 faculty</p>
              <button
                onClick={() => handleExport('Excel XLSX')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg"
              >
                Export Excel
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
              <FileText className="w-8 h-8 text-rose-600 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">Printable PDF Grid (.PDF)</div>
              <p className="text-[11px] text-slate-500">A3 / A4 high-resolution PDF for department notice boards and laboratory doors</p>
              <button
                onClick={() => handleExport('PDF')}
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg"
              >
                Export PDF
              </button>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs text-center space-y-2">
              <Calendar className="w-8 h-8 text-indigo-600 mx-auto" />
              <div className="font-bold text-slate-900 text-xs">iCal Calendar Feed (.ICS)</div>
              <p className="text-[11px] text-slate-500">Compatible with Google Calendar, Apple Calendar, and Microsoft Outlook</p>
              <button
                onClick={() => handleExport('iCal Calendar')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg"
              >
                Export iCal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 4: System Settings */}
      {activeSubPage === 'settings' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm border-b pb-2">Academic Operational Rules</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Active Term</label>
                <input
                  type="text"
                  value={academicTerm}
                  onChange={e => setAcademicTerm(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Period 1 Opening Time</label>
                <input
                  type="text"
                  disabled
                  value="08:00 AM (Mandatory prompt constraint)"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Lunch Break Boundary</label>
                <input
                  type="text"
                  disabled
                  value="12:30 - 13:30 (Between P5 and P6)"
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">CP-SAT Solver Timeout (Seconds)</label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
