/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { auth } from '../../services/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import {
  X,
  User,
  Shield,
  Building,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Save,
  Lock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [isSaved, setIsSaved] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');

  // Notification Preferences state
  const [prefTimetable, setPrefTimetable] = useState(true);
  const [prefExams, setPrefExams] = useState(true);
  const [prefRescheduling, setPrefRescheduling] = useState(true);
  const [prefVenues, setPrefVenues] = useState(true);
  const [prefEmail, setPrefEmail] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name,
        department,
        title,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send password reset email');
    }
  };

  const fbUser = auth.currentUser;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl rounded-3xl border border-white/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <User className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">User Profile & Account Security</h2>
              <p className="text-xs text-sky-200/80">Chilika Institute of Technology Credential Authority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Identity Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl font-black flex items-center justify-center shadow-sm overflow-hidden shrink-0">
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                currentUser?.name.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm truncate">{currentUser?.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase tracking-wide">
                  {currentUser?.role}
                </span>
              </div>
              <div className="text-slate-500 text-[11px] mt-0.5">{currentUser?.email}</div>
              <div className="text-slate-600 font-medium text-[11px] mt-0.5">{currentUser?.department || 'Central Administration'}</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation / Campus Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Note: Institutional roles are protected and verified by backend authority.
              </span>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaved ? 'Saved!' : 'Update Profile'}</span>
              </button>
            </div>
          </form>

          {/* Security & Firebase Auth Status */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Firebase Authentication & Password Security</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active
              </span>
            </div>

            <p className="text-[11px] text-indigo-800 leading-relaxed">
              Your account is authenticated via Google Firebase Identity Services. ID tokens are cryptographically verified by the FastAPI backend on protected endpoints.
            </p>

            <div className="pt-1 flex items-center justify-between">
              <div className="text-[10px] text-slate-500">
                Firebase UID: <span className="font-mono text-slate-700">{fbUser?.uid ? `${fbUser.uid.substring(0, 10)}...` : 'Linked via session'}</span>
              </div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <KeyRound className="w-3 h-3 text-indigo-600" />
                <span>Send Password Reset Email</span>
              </button>
            </div>

            {resetSent && (
              <div className="p-2.5 rounded-lg bg-emerald-100/80 text-emerald-900 text-[11px] font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset link has been dispatched to {currentUser?.email}.</span>
              </div>
            )}
            {resetError && (
              <div className="p-2.5 rounded-lg bg-rose-100 text-rose-900 text-[11px] font-semibold">
                {resetError}
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Bell className="w-4 h-4 text-blue-600" />
              <span>Institutional Notification Preferences</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefTimetable}
                  onChange={(e) => setPrefTimetable(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Timetable Modifications</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefExams}
                  onChange={(e) => setPrefExams(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Examination Announcements</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefRescheduling}
                  onChange={(e) => setPrefRescheduling(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Rescheduling & Swap Alerts</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefVenues}
                  onChange={(e) => setPrefVenues(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">Venue Booking Updates</span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">In-App Live Delivery: <strong className="text-emerald-700">Active</strong></span>
              <span className="text-slate-400">SMTP Email Relay: <strong className="text-slate-600">Sandbox Mode</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

