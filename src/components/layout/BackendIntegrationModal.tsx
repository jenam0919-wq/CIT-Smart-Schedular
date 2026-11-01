/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cpu,
  Database,
  CheckCircle2,
  Clock,
  Sparkles,
  Server,
  FileCode2,
  X,
  AlertCircle,
  Key,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const BackendIntegrationModal: React.FC = () => {
  const { isDemoNoticeOpen, setIsDemoNoticeOpen, apiStatus, resetDemoDatabase, isLoadingData } = useApp();

  if (!isDemoNoticeOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1026]/50 backdrop-blur-md">
      <div className="w-full max-w-2xl glass-modal rounded-2xl shadow-2xl border border-white/80 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#101B3C] to-[#14264D] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Backend Architecture & Database Integration</h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Phase 2 Active
                </span>
              </div>
              <p className="text-xs text-slate-300">CIT Smart Scheduler • FastAPI, SQLAlchemy & PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={() => setIsDemoNoticeOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 max-h-[75vh] overflow-y-auto">
          
          {/* Live Status Pill */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${apiStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <div>
                <span className="font-bold text-slate-900">
                  Backend API Engine Status: {apiStatus === 'connected' ? 'FastAPI Connected (Live HTTP)' : 'FastAPI Service Ready (Port 8000)'}
                </span>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Swagger OpenAPI Interactive Docs at <code className="font-mono text-indigo-600 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">/docs</code>
                </div>
              </div>
            </div>

            <button
              onClick={() => resetDemoDatabase()}
              disabled={isLoadingData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>Reset Clean DB</span>
            </button>
          </div>

          {/* Architecture Matrix */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Implemented Backend Components
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-emerald-600" />
                    FastAPI REST Routers
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    Operational
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Modular routers for Auth, Rooms, Faculty, Groups, Courses, Sessions, Bookings, Exams, Rescheduling, and Analytics.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-indigo-600" />
                    JWT Authentication & RBAC
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                    Enforced
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Cryptographic bearer tokens, bcrypt hashing, and strict role permission enforcement with self-approval guards.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-sky-200 bg-sky-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-sky-600" />
                    16 Relational Tables
                  </span>
                  <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded">
                    SQLAlchemy
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  ACID models with foreign keys, many-to-many combined lectures, elective baskets, room maintenance windows, and audit trails.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    Automated Test Suite
                  </span>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                    100% Passing
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  <code className="font-mono text-[10px]">backend/tests/test_api.py</code> tests logins, authorization rejections, booking pipelines, and audit logs.
                </p>
              </div>

            </div>
          </div>

          {/* Database Schema Summary */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 text-xs block">
              Configured PostgreSQL / SQLite Tables:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px] font-mono text-slate-700">
              <span>• users</span>
              <span>• rooms</span>
              <span>• faculty</span>
              <span>• student_groups</span>
              <span>• courses</span>
              <span>• teaching_sessions</span>
              <span>• session_groups</span>
              <span>• room_unavail</span>
              <span>• faculty_unavail</span>
              <span>• booking_requests</span>
              <span>• examinations</span>
              <span>• change_requests</span>
              <span>• approvals</span>
              <span>• notifications</span>
              <span>• timetable_versions</span>
              <span>• audit_logs</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">Chilika Institute of Technology • Phase 2 Backend Architecture</span>
          <button
            onClick={() => setIsDemoNoticeOpen(false)}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Close Overview
          </button>
        </div>

      </div>
    </div>
  );
};
