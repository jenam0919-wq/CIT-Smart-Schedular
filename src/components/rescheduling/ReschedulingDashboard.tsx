/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { RescheduleRequest, DisruptionEvent, TimetableSlot } from '../../types';
import {
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

interface ReschedulingDashboardProps {
  requests: RescheduleRequest[];
  disruptions: DisruptionEvent[];
  timetableSlots: TimetableSlot[];
  onOpenNewRequest?: () => void;
  onOpenLogDisruption?: () => void;
}

export const ReschedulingDashboard: React.FC<ReschedulingDashboardProps> = ({
  requests,
  disruptions,
  timetableSlots,
  onOpenNewRequest,
  onOpenLogDisruption,
}) => {
  const metrics = useMemo(() => {
    const totalRequests = requests.length;
    const pending = requests.filter(r => r.status === 'Pending Admin Review').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;

    // Active disruptions
    const activeDisruptions = disruptions.filter(d => d.status !== 'Rescheduled').length;
    const totalImpactedSlots = disruptions
      .filter(d => d.status !== 'Rescheduled')
      .reduce((acc, d) => acc + (d.affectedSlotsCount || 0), 0);

    // Timetable conflicts check
    const slotMap = new Map<string, string>();
    let conflicts = 0;
    timetableSlots.forEach(s => {
      const key = `${s.day}-${s.periodId}-${s.roomName}`;
      if (slotMap.has(key)) conflicts += 1;
      else slotMap.set(key, s.id);
    });

    return {
      totalRequests,
      pending,
      approved,
      rejected,
      activeDisruptions,
      totalImpactedSlots,
      conflicts,
    };
  }, [requests, disruptions, timetableSlots]);

  return (
    <div className="space-y-4">
      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Requests */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Total Requests</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.totalRequests}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Submitted Changes</p>
        </div>

        {/* Pending Approval */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Pending Review</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${metrics.pending > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
            {metrics.pending}
          </div>
          <p className="text-[10px] text-amber-600/80 mt-1 font-medium">Awaiting Endorsement</p>
        </div>

        {/* Approved Changes */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Approved</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {metrics.approved}
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Committed to Database</p>
        </div>

        {/* Rejected Requests */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Rejected</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics.rejected}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Declined Proposals</p>
        </div>

        {/* Unresolved Disruptions */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Active Disruptions</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-2xl font-black tracking-tight ${metrics.activeDisruptions > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            {metrics.activeDisruptions}
          </div>
          <p className="text-[10px] text-rose-600/80 mt-1 font-medium">{metrics.totalImpactedSlots} Periods Impacted</p>
        </div>

        {/* Conflicts */}
        <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
            <span>Timetable Conflicts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {metrics.conflicts}
          </div>
          <p className="text-[10px] text-emerald-600/80 mt-1 font-medium">Zero Cascade Errors</p>
        </div>
      </div>

      {/* Disruption & Solver Overview Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white border border-white/10 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" />
              Dynamic Rescheduling Engine
            </span>
            <span className="text-xs text-slate-300">
              OR-Tools CP-SAT Solver Integration
            </span>
          </div>
          <h3 className="text-base font-extrabold tracking-tight text-white">
            Zero-Disruption Micro-Solver Ready
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Automatically relocates impacted lectures to empty halls or alternate free slots without disturbing uninvolved cohorts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenLogDisruption && (
            <button
              onClick={onOpenLogDisruption}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              Report Disruption
            </button>
          )}
          {onOpenNewRequest && (
            <button
              onClick={onOpenNewRequest}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              Propose Reschedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

