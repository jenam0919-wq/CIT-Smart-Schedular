/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wrench,
  Building,
  CheckCircle2,
  AlertTriangle,
  Monitor,
  Volume2,
  Wind,
  Calendar,
  Layers,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const { rooms, examinations, timetableSlots, setActiveNavigation } = useApp();

  const totalVenues = rooms.length;
  const projectorReady = rooms.filter(r => r.hasProjector).length;
  const acReady = rooms.filter(r => r.hasAirConditioning).length;
  const audioReady = rooms.filter(r => r.hasAudioSystem).length;

  return (
    <div className="space-y-6">
      
      {/* Staff Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-emerald-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-teal-200 border border-white/15">
            <Wrench className="w-3.5 h-3.5 text-teal-300" />
            <span>Campus Operations & Venue Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Classroom & Equipment Readiness
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Monitor physical facility readiness across all <strong className="text-white">{totalVenues} academic venues</strong>. Coordinate projector maintenance, PA audio systems, and examination desk arrangements.
          </p>
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveNavigation('venues')}
              className="px-4 py-2 rounded-xl bg-white text-teal-800 font-bold text-xs hover:bg-teal-50 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Building className="w-3.5 h-3.5" />
              <span>Inspect All Venues</span>
            </button>
            <button
              onClick={() => setActiveNavigation('exams')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-3.5 h-3.5 text-teal-200" />
              <span>Exam Seating Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Rooms</span>
            <Building className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalVenues}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Aryabhata & Turing Blocks</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Projectors Active</span>
            <Monitor className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-1">{projectorReady}/{totalVenues}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">100% Operational</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">AC & Climate</span>
            <Wind className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-sky-700 mt-1">{acReady}/{totalVenues}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Climate Controlled</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">PA Audio Systems</span>
            <Volume2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-1">{audioReady}/{totalVenues}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Acoustic Checked</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Venue Readiness Matrix */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Venue Infrastructure Status</h3>
              <p className="text-xs text-slate-500">Live hardware readiness across instructional venues</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              All Systems Nominal
            </span>
          </div>

          <div className="space-y-2.5">
            {rooms.slice(0, 8).map(r => (
              <div
                key={r.id}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-teal-200 bg-slate-50/50 hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900">{r.name} ({r.code})</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.block} • Floor {r.floor} • Type: <strong className="text-slate-700">{r.type}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.hasProjector ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    Projector {r.hasProjector ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.hasAirConditioning ? 'bg-sky-50 text-sky-700' : 'bg-slate-100 text-slate-400'}`}>
                    AC {r.hasAirConditioning ? '✓' : '✗'}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.hasAudioSystem ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                    Audio {r.hasAudioSystem ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Upcoming Exam Seating Prep */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Exam Seating Setup</h3>
            <button
              onClick={() => setActiveNavigation('exams')}
              className="text-xs font-bold text-teal-600 hover:text-teal-800"
            >
              Exams Roster
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {examinations.slice(0, 5).map(ex => (
              <div key={ex.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-900">{ex.courseCode}</span>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                    {ex.allocatedRooms?.[0]?.roomName || 'LH-101'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Date: {ex.date} • {ex.enrolledStudents || 60} Desks (Alternate Seating)
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

