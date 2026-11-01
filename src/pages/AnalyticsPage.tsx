/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MOCK_ANALYTICS } from '../data/mockData';
import {
  BarChart3,
  Building,
  Users,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  TrendingUp,
  Clock,
  Download,
  AlertTriangle
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { activeSubPage, setActiveNavigation, rooms, faculty } = useApp();

  const tabs = [
    { id: 'utilization', label: 'Room Utilisation', icon: <Building className="w-3.5 h-3.5" /> },
    { id: 'workload', label: 'Faculty Workload', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'solver-stats', label: 'Scheduling Statistics', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'conflicts', label: 'Conflict Reports', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center gap-1.5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveNavigation('analytics', tab.id)}
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

      {/* SUBPAGE 1: Room Utilisation */}
      {activeSubPage === 'utilization' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Campus Average Utilisation</div>
              <div className="text-2xl font-black text-slate-900 mt-1">76.8%</div>
              <div className="text-[11px] text-emerald-700 mt-0.5">Optimal density band (70-85%)</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Peak Demand Hour</div>
              <div className="text-2xl font-black text-indigo-700 mt-1">P4 - P5</div>
              <div className="text-[11px] text-slate-500 mt-0.5">10:45 AM – 12:30 PM (92% booked)</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Idle / Buffer Capacity</div>
              <div className="text-2xl font-black text-slate-700 mt-1">23.2%</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Available for workshops & events</div>
            </div>
          </div>

          {/* Utilization Breakdown Table */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Facility Utilisation Rate by Category</h3>
            <p className="text-xs text-slate-500 mb-4">Total weekly lecture hours mapped to 27 campus spaces</p>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>Lecture Halls (LH-101 to LH-302 • 8 Halls)</span>
                  <span>88.4% Occupancy</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '88.4%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>Computer Laboratories (Turing Complex • 4 Labs)</span>
                  <span>79.2% Occupancy</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '79.2%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>Hardware & Engineering Labs (Bose & Civil • 7 Labs)</span>
                  <span>64.5% Occupancy</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '64.5%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-800 mb-1">
                  <span>Auditoriums & Seminar Halls (4 Venues)</span>
                  <span>42.0% Occupancy</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 2: Faculty Workload */}
      {activeSubPage === 'workload' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Faculty Workload Distribution</h3>
              <p className="text-xs text-slate-500">Weekly teaching load hours per faculty member across 40 instructors</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Policy Compliant (&le; 20 hrs/week)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {faculty.slice(0, 12).map(f => {
              const pct = Math.round((f.weeklyWorkloadHours / f.maxWorkloadHours) * 100);
              return (
                <div key={f.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-slate-900 truncate">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.department}</div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
                      {f.weeklyWorkloadHours}h / wk
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct > 85 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{pct}% Max Load</span>
                    <span>Free Days: Friday PM</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBPAGE 3: Scheduling Statistics */}
      {activeSubPage === 'solver-stats' && (
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md">
            <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1">
              Google OR-Tools CP-SAT Performance Benchmarks
            </div>
            <h2 className="text-xl font-extrabold text-white">Combinatorial Scheduling Complexity</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Mathematical formulation specifications used by the Chilika Institute of Technology scheduling engine.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Decision Variables</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">12,450</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Boolean domain [0,1]</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Linear Constraints</div>
              <div className="text-xl font-black text-slate-900 font-mono mt-1">34,200</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Hard & Soft expressions</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Solve Execution Time</div>
              <div className="text-xl font-black text-teal-600 font-mono mt-1">3.42s</div>
              <div className="text-[10px] text-slate-500 mt-0.5">8 Multithreaded Workers</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Optimality Gap</div>
              <div className="text-xl font-black text-emerald-600 font-mono mt-1">0.0%</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Proven Global Optimum</div>
            </div>
          </div>
        </div>
      )}

      {/* SUBPAGE 4: Conflict Reports */}
      {activeSubPage === 'conflicts' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Conflict & Violation Audit Report</h3>
              <p className="text-xs text-slate-500">Live constraint evaluation across 189 scheduled teaching sessions</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              0 Hard Conflicts Active
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 flex items-start gap-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-emerald-900">Zero Hard Collisions Verified</h4>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  Every lecture and lab satisfies mandatory teacher exclusivity, room capacity boundaries, student group uniqueness, and lunch recess intervals.
                </p>
              </div>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900">2 Soft Preference Trade-Offs (Non-blocking)</h4>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  1. Prof. Manisha Choudhury scheduled for CS304 at Wednesday P2 instead of preferred morning P1.
                  <br />
                  2. CSE-4A has an afternoon theory class on Tuesday P6 following lab session.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
