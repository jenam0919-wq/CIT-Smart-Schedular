/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RescheduleRequest, TimetableSlot } from '../types';
import {
  RefreshCw,
  AlertOctagon,
  GitCompare,
  Cpu,
  AlertTriangle,
  FileCheck,
  PlusCircle,
  Calendar,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

import { ReschedulingDashboard } from '../components/rescheduling/ReschedulingDashboard';
import { ChangeRequestDirectory } from '../components/rescheduling/ChangeRequestDirectory';
import { TimetableDiffViewer } from '../components/rescheduling/TimetableDiffViewer';
import { MicroSolverEngine } from '../components/rescheduling/MicroSolverEngine';
import { ConflictDetectionView } from '../components/rescheduling/ConflictDetectionView';
import { ApprovalWorkflowView } from '../components/rescheduling/ApprovalWorkflowView';
import { NewRequestModal } from '../components/rescheduling/NewRequestModal';
import { DisruptionLogModal } from '../components/rescheduling/DisruptionLogModal';

export const SmartReschedulingPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    disruptions,
    rescheduleRequests,
    timetableSlots,
    rooms,
    faculty,
    studentGroups,
    courses,
    activeRole,
    currentUser,
    approveRescheduleRequest,
    rejectRescheduleRequest,
    submitRescheduleRequest,
    createDisruptionEvent,
    resolveDisruptionEvent,
  } = useApp();

  // Active sub-page tab state
  const currentTab = activeSubPage || 'requests';

  // Selected request for deep inspection or diff matrix
  const [selectedRequest, setSelectedRequest] = useState<RescheduleRequest | null>(
    rescheduleRequests[0] || null
  );

  // Modals state
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [isLogDisruptionOpen, setIsLogDisruptionOpen] = useState(false);

  // Global toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (id: string) => {
    await approveRescheduleRequest(id);
    showToast('Reschedule request approved and committed to master timetable!', 'success');
  };

  const handleReject = async (id: string, reason?: string) => {
    await rejectRescheduleRequest(id);
    showToast(`Change request rejected. ${reason ? `Reason: ${reason}` : ''}`, 'warning');
  };

  const handleNewRequestSubmit = async (data: any) => {
    await submitRescheduleRequest(data);
    showToast('Reschedule proposal submitted for academic committee review.', 'info');
  };

  const handleDisruptionSubmit = async (data: any) => {
    await createDisruptionEvent(data);
    showToast('Campus disruption event logged. CP-SAT micro-solver prepared.', 'info');
  };

  const handleApplyMicroSolverResolution = async (disruptionId: string, cand: any) => {
    await resolveDisruptionEvent(
      disruptionId,
      `Rescheduled via CP-SAT Micro-Solver to ${cand.day} ${cand.periodId} in ${cand.roomName}`
    );
    showToast(`Disruption resolved! Relocated to ${cand.day} ${cand.periodId} (${cand.roomName}).`, 'success');
  };

  const handleResolveConflictWithSolver = (slot: TimetableSlot) => {
    setActiveNavigation('rescheduling', 'micro-solver');
  };

  const unresolvedDisruptionsCount = disruptions.filter(d => d.status !== 'Rescheduled').length;
  const pendingRequestsCount = rescheduleRequests.filter(r => r.status === 'Pending Admin Review').length;

  const tabs = [
    {
      id: 'requests',
      label: 'Change Requests',
      badge: rescheduleRequests.length,
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    {
      id: 'diff',
      label: 'Before / After Diff',
      icon: <GitCompare className="w-3.5 h-3.5 text-indigo-500" />,
    },
    {
      id: 'micro-solver',
      label: 'Micro-Solver Engine',
      badge: unresolvedDisruptionsCount > 0 ? `${unresolvedDisruptionsCount} active` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
      icon: <Cpu className="w-3.5 h-3.5 text-cyan-600" />,
    },
    {
      id: 'conflicts',
      label: 'Conflict Inspector',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
    },
    {
      id: 'approval',
      label: 'Approval Desk',
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount} review` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: <FileCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="p-6 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Smart Rescheduling Hub</h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  OR-Tools CP-SAT Powered
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated dynamic schedule adjustments, multi-tier approvals, zero-cascade conflict prevention, and disruption handling
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsLogDisruptionOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors shadow-xs"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>Log Disruption</span>
          </button>

          <button
            onClick={() => setIsNewRequestOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Propose Reschedule</span>
          </button>
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 shadow-md animate-in slide-in-from-top-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* KPI Dashboard Strip */}
      <ReschedulingDashboard
        requests={rescheduleRequests}
        disruptions={disruptions}
        timetableSlots={timetableSlots}
        onOpenNewRequest={() => setIsNewRequestOpen(true)}
        onOpenLogDisruption={() => setIsLogDisruptionOpen(true)}
      />

      {/* Glassmorphic Navigation Tabs */}
      <div className="p-1.5 bg-white/70 border border-white/60 shadow-lg shadow-blue-950/5 backdrop-blur-xl rounded-2xl flex flex-wrap items-center gap-1">
        {tabs.map(tab => {
          const isActive = currentTab === tab.id || (tab.id === 'diff' && currentTab === 'comparison');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNavigation('rescheduling', tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    tab.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700')
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: Change Requests Directory */}
      {currentTab === 'requests' && (
        <ChangeRequestDirectory
          requests={rescheduleRequests}
          onSelectRequest={(req) => setSelectedRequest(req)}
          onApprove={handleApprove}
          onReject={handleReject}
          onCompareDiff={(req) => {
            setSelectedRequest(req);
            setActiveNavigation('rescheduling', 'diff');
          }}
          userRole={activeRole}
          userEmail={currentUser?.email || ''}
        />
      )}

      {/* TAB CONTENT 2: Before / After Diff Comparison */}
      {(currentTab === 'diff' || currentTab === 'comparison') && (
        <TimetableDiffViewer
          requests={rescheduleRequests}
          selectedRequest={selectedRequest}
          onSelectRequest={(req) => setSelectedRequest(req)}
          onApprove={handleApprove}
          onReject={handleReject}
          timetableSlots={timetableSlots}
          userRole={activeRole}
          userEmail={currentUser?.email || ''}
        />
      )}

      {/* TAB CONTENT 3: Micro-Solver Engine */}
      {(currentTab === 'micro-solver' || currentTab === 'disruptions') && (
        <MicroSolverEngine
          disruptions={disruptions}
          timetableSlots={timetableSlots}
          rooms={rooms}
          faculty={faculty}
          studentGroups={studentGroups}
          onApplyResolution={handleApplyMicroSolverResolution}
        />
      )}

      {/* TAB CONTENT 4: Conflict Inspector */}
      {currentTab === 'conflicts' && (
        <ConflictDetectionView
          timetableSlots={timetableSlots}
          rooms={rooms}
          faculty={faculty}
          studentGroups={studentGroups}
          onResolveWithMicroSolver={handleResolveConflictWithSolver}
        />
      )}

      {/* TAB CONTENT 5: Admin Approval Desk */}
      {currentTab === 'approval' && (
        <ApprovalWorkflowView
          requests={rescheduleRequests}
          onApprove={handleApprove}
          onReject={handleReject}
          onViewDiff={(req) => {
            setSelectedRequest(req);
            setActiveNavigation('rescheduling', 'diff');
          }}
          userRole={activeRole}
          userEmail={currentUser?.email || ''}
        />
      )}

      {/* Modal: New Reschedule Proposal */}
      <NewRequestModal
        isOpen={isNewRequestOpen}
        onClose={() => setIsNewRequestOpen(false)}
        onSubmit={handleNewRequestSubmit}
        courses={courses}
        faculty={faculty}
        rooms={rooms}
        studentGroups={studentGroups}
        timetableSlots={timetableSlots}
        currentUserName={currentUser?.name || faculty[0]?.name || 'Dr. Debabrata Samal'}
      />

      {/* Modal: Log Academic Disruption */}
      <DisruptionLogModal
        isOpen={isLogDisruptionOpen}
        onClose={() => setIsLogDisruptionOpen(false)}
        onSubmit={handleDisruptionSubmit}
        faculty={faculty}
        rooms={rooms}
      />

    </div>
  );
};