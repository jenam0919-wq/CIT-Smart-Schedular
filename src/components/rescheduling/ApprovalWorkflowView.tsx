/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RescheduleRequest, UserRole } from '../../types';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  UserCheck,
  History,
  Calendar,
  Building,
  Users
} from 'lucide-react';

interface ApprovalWorkflowViewProps {
  requests: RescheduleRequest[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
  onViewDiff: (req: RescheduleRequest) => void;
  userRole?: UserRole;
  userEmail?: string;
}

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  requests,
  onApprove,
  onReject,
  onViewDiff,
  userRole = 'admin',
  userEmail = '',
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Reject Modal state
  const [rejectingReq, setRejectingReq] = useState<RescheduleRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Split requests
  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.status === 'Pending Admin Review');
  }, [requests]);

  const historyRequests = useMemo(() => {
    return requests.filter(r => r.status !== 'Pending Admin Review');
  }, [requests]);

  const displayedRequests = useMemo(() => {
    const list = activeTab === 'pending' ? pendingRequests : historyRequests;
    return list.filter(r => {
      const matchSearch =
        searchQuery === '' ||
        r.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.facultyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [activeTab, pendingRequests, historyRequests, searchQuery]);

  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      await onApprove(id);
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingReq) return;
    try {
      setIsSubmittingReject(true);
      await onReject(rejectingReq.id, rejectReason || 'Administrative decision');
      setRejectingReq(null);
      setRejectReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const canApproveRole = userRole === 'admin' || userRole === 'coordinator';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">Admin & Coordinator Approval Desk</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {pendingRequests.length} Pending Actions
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict multi-tier review queue preventing self-approval and enforcing zero cascade disruptions
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pending ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-1.5 rounded-xl font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Audit History ({historyRequests.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by faculty, course, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-xs text-slate-400 hidden sm:block">
          Showing {displayedRequests.length} of {activeTab === 'pending' ? pendingRequests.length : historyRequests.length} requests
        </div>
      </div>

      {/* Requests List */}
      {displayedRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'pending' ? 'All Clear! No Pending Requests' : 'No Reschedule History Found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {activeTab === 'pending'
              ? 'All reschedule submissions have been verified and processed by the academic committee.'
              : 'Requests that have been approved or rejected will appear here in the audit log.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedRequests.map(req => {
            const isProcessing = processingId === req.id;
            const isSelf = userEmail && req.facultyName.toLowerCase().includes(userEmail.split('@')[0].toLowerCase());
            const canAct = canApproveRole && !isSelf;

            return (
              <div
                key={req.id}
                className="p-6 rounded-3xl bg-white/90 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl space-y-4 hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/20">
                      {req.courseCode.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {req.courseCode}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{req.facultyName}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Submitted: {req.submittedDate} • Request ID: {req.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : req.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>

                    {req.status === 'Pending Admin Review' && isSelf && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-purple-500" />
                        Awaiting Peer Endorsement
                      </span>
                    )}
                  </div>
                </div>

                {/* Slot Diff Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                        Current Slot (Vacating)
                      </span>
                      <span className="font-mono font-bold text-rose-800 text-[11px]">
                        {req.originalSlot.periodId}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      <span>{req.originalSlot.day}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                      <span>Venue: <strong className="text-slate-800">{req.originalSlot.roomName}</strong></span>
                      <span>Cohort: <strong className="text-slate-800">{req.originalSlot.groupName}</strong></span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Proposed Slot (Relocation)
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-[11px]">
                        {req.proposedSlot.periodId}
                      </span>
                    </div>
                    <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{req.proposedSlot.day}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 text-[11px] pt-1">
                      <span>Venue: <strong className="text-emerald-950 font-bold">{req.proposedSlot.roomName}</strong></span>
                      <span>Cohort: <strong className="text-slate-800">{req.proposedSlot.groupName}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Reason & Conflict Note */}
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p>
                    <strong className="text-slate-800">Reason: </strong>
                    {req.reason}
                  </p>
                  <p className="text-[11px] text-emerald-700 flex items-center gap-1 pt-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{req.conflictAnalysis.details}</span>
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => onViewDiff(req)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
                  >
                    <span>View Full Side-by-Side Diff Matrix</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {req.status === 'Pending Admin Review' && canAct && (
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setRejectingReq(req)}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(req.id)}
                        disabled={isProcessing}
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>Committing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve & Commit</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Reject Reschedule Request</h3>
              </div>
              <button
                onClick={() => setRejectingReq(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are rejecting the schedule change request for <strong>{rejectingReq.courseCode}</strong> ({rejectingReq.facultyName}). Please provide a reason to notify the instructor.
            </p>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Rejection Justification
              </label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Requested slot conflicts with departmental seminar..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isSubmittingReject}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {isSubmittingReject ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
