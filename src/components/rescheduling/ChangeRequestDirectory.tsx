/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RescheduleRequest, UserRole } from '../../types';
import {
  RefreshCw,
  LayoutGrid,
  List,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  GitCompare,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Building,
  Users
} from 'lucide-react';

interface ChangeRequestDirectoryProps {
  requests: RescheduleRequest[];
  onSelectRequest: (req: RescheduleRequest) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onCompareDiff: (req: RescheduleRequest) => void;
  userRole?: UserRole;
  userEmail?: string;
}

export const ChangeRequestDirectory: React.FC<ChangeRequestDirectoryProps> = ({
  requests,
  onSelectRequest,
  onApprove,
  onReject,
  onCompareDiff,
  userRole = 'admin',
  userEmail = '',
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDay, setSelectedDay] = useState('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'code'>('date-desc');

  // Loading actions
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter & Sort
  const filteredRequests = useMemo(() => {
    return requests
      .filter(r => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchCode = r.courseCode.toLowerCase().includes(q);
          const matchFaculty = r.facultyName.toLowerCase().includes(q);
          const matchGroup = r.originalSlot.groupName.toLowerCase().includes(q) || r.proposedSlot.groupName.toLowerCase().includes(q);
          const matchRoom = r.originalSlot.roomName.toLowerCase().includes(q) || r.proposedSlot.roomName.toLowerCase().includes(q);
          const matchReason = r.reason.toLowerCase().includes(q);
          if (!matchCode && !matchFaculty && !matchGroup && !matchRoom && !matchReason) return false;
        }

        // Status filter
        if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;

        // Day filter
        if (selectedDay !== 'All' && r.originalSlot.day !== selectedDay && r.proposedSlot.day !== selectedDay) return false;

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return b.submittedDate.localeCompare(a.submittedDate);
          case 'date-asc':
            return a.submittedDate.localeCompare(b.submittedDate);
          case 'code':
            return a.courseCode.localeCompare(b.courseCode);
          default:
            return 0;
        }
      });
  }, [requests, searchQuery, selectedStatus, selectedDay, sortBy]);

  const canApprove = userRole === 'admin' || userRole === 'coordinator';

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setProcessingId(id);
    try {
      await onReject(id);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="p-4 md:p-5 rounded-3xl bg-white/80 border border-white/70 shadow-xl shadow-blue-950/5 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reschedule & Swap Requests Directory
              </h3>
              <p className="text-[11px] text-slate-500">
                Showing {filteredRequests.length} of {requests.length} schedule adjustment requests
              </p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 self-start md:self-auto">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search course, faculty, cohort, room..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Review Statuses</option>
            <option value="Pending Admin Review">Pending Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Day Filter */}
          <select
            value={selectedDay}
            onChange={e => setSelectedDay(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="All">All Days</option>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="code">Course Code (A-Z)</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedStatus !== 'All' || selectedDay !== 'All') && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Filtered to <strong className="text-slate-800">{filteredRequests.length}</strong> matching requests
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('All');
                setSelectedDay('All');
              }}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Directory Content (Table or Grid) */}
      {filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 text-slate-400">
          <RefreshCw className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-800">No Reschedule Requests Found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or filter options to view other requests.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3.5 pl-5">Course & Faculty</th>
                  <th className="p-3.5 min-w-[170px]">Original Class Slot</th>
                  <th className="p-3.5 min-w-[170px]">Proposed Target Slot</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 min-w-[170px]">Conflict Check</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  const isPending = req.status === 'Pending Admin Review';
                  const isApproved = req.status === 'Approved';
                  const isRejected = req.status === 'Rejected';
                  const hasConflict = req.conflictAnalysis?.hasConflicts;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {req.courseCode}
                          </span>
                          <div>
                            <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {req.facultyName}
                            </div>
                            <div className="text-[10px] text-slate-400">ID: {req.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Original Slot */}
                      <td className="p-3.5">
                        <div className="p-2 rounded-xl bg-rose-50/60 border border-rose-100 text-slate-700 space-y-0.5">
                          <span className="font-extrabold text-rose-900 text-[11px] block">
                            {req.originalSlot.day} &bull; {req.originalSlot.periodId}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {req.originalSlot.roomName} &bull; {req.originalSlot.groupName}
                          </span>
                        </div>
                      </td>

                      {/* Proposed Slot */}
                      <td className="p-3.5">
                        <div className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-slate-700 space-y-0.5">
                          <span className="font-extrabold text-emerald-900 text-[11px] block">
                            {req.proposedSlot.day} &bull; {req.proposedSlot.periodId}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {req.proposedSlot.roomName} &bull; {req.proposedSlot.groupName}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="p-3.5 max-w-xs">
                        <span className="text-slate-700 line-clamp-2 text-xs" title={req.reason}>
                          {req.reason}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {req.submittedDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isRejected
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>

                      {/* Conflict check */}
                      <td className="p-3.5">
                        {hasConflict ? (
                          <div className="flex items-center gap-1.5 text-amber-700 font-semibold text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[150px]" title={req.conflictAnalysis?.details}>
                              {req.conflictAnalysis?.details}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Zero Conflicts</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 pr-5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => onCompareDiff(req)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            title="Compare Timetable Diff"
                          >
                            <GitCompare className="w-3 h-3" />
                            Diff
                          </button>

                          {isPending && canApprove && (
                            <>
                              <button
                                onClick={e => handleApprove(e, req.id)}
                                disabled={processingId === req.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={e => handleReject(e, req.id)}
                                disabled={processingId === req.id}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map(req => {
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';
            const isPending = req.status === 'Pending Admin Review';

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req)}
                className="rounded-3xl bg-white/85 border border-white/80 p-5 shadow-xl shadow-blue-950/5 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {req.courseCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 truncate">
                    {req.facultyName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    <strong className="text-slate-700">Reason:</strong> {req.reason}
                  </p>

                  {/* Slot delta cards */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                      <span className="text-[10px] font-bold text-rose-700 block uppercase">Original</span>
                      <div className="font-bold text-slate-900 mt-0.5">{req.originalSlot.day} &bull; {req.originalSlot.periodId}</div>
                      <div className="text-[10px] text-slate-500">{req.originalSlot.roomName}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 block uppercase">Proposed</span>
                      <div className="font-bold text-slate-900 mt-0.5">{req.proposedSlot.day} &bull; {req.proposedSlot.periodId}</div>
                      <div className="text-[10px] text-slate-500">{req.proposedSlot.roomName}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">{req.submittedDate}</span>

                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onCompareDiff(req);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    Inspect Diff
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

