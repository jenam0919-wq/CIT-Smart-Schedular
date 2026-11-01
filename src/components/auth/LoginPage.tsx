/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { CITLogo } from '../ui/CITLogo';
import {
  ShieldCheck,
  Layers,
  GraduationCap,
  Users,
  Building,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Cpu,
  KeyRound,
  ExternalLink,
  ChevronRight,
  CalendarDays,
  Shield,
  HelpCircle,
  X
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  // Mode tab: 'credentials' or 'demo'
  const [activeTab, setActiveTab] = useState<'credentials' | 'demo'>('credentials');

  // Form states
  const [email, setEmail] = useState('admin@cit.edu');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const rolePresets: {
    role: UserRole;
    title: string;
    email: string;
    name: string;
    badge: string;
    department: string;
    description: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      role: 'admin',
      title: 'Administrator',
      email: 'admin@cit.edu',
      name: 'Dr. Rameshwar Panda',
      badge: 'Academic Dean',
      department: 'Central Academic Affairs',
      description: 'Master schedule generator, exam supervisor, and campus-wide conflict resolution.',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      role: 'coordinator',
      title: 'Dept Coordinator',
      email: 'coordinator@cit.edu',
      name: 'Dr. Sunita Mohanty',
      badge: 'Coordinator',
      department: 'Computer Science & Engineering',
      description: 'Departmental timetable sync, lab reservations, and faculty workload balancing.',
      icon: <Building className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      role: 'faculty',
      title: 'Faculty Member',
      email: 'faculty@cit.edu',
      name: 'Prof. Arvind Tripathy',
      badge: 'Associate Professor',
      department: 'Computer Science & Engineering',
      description: 'Weekly teaching roster, preference matrix, and emergency slot swap requests.',
      icon: <GraduationCap className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      role: 'club',
      title: 'Club Representative',
      email: 'club@cit.edu',
      name: 'Ananya Dash',
      badge: 'Club President',
      department: 'CIT Robotics & AI Club',
      description: 'Reserve auditorium & seminar halls for workshops, hackathons, and Spectra fest.',
      icon: <Users className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500 to-orange-600',
    },
  ];

  const handleQuickLogin = async (presetEmail: string, preferredRole: UserRole) => {
    setEmail(presetEmail);
    setPassword('demo123');
    setError('');
    setIsLoading(true);

    try {
      const success = await login(presetEmail, 'demo123', preferredRole);
      if (!success) {
        setError('Login failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please select a role from Demo Access or check your email.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Ensure the FastAPI backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
    setTimeout(() => {
      setForgotSubmitted(false);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F1F5F9] relative overflow-hidden">
      
      {/* Soft Blue Atmospheric Gradient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(219,234,254,0.85),_transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_rgba(237,233,254,0.7),_transparent_55%)]" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      {/* =========================================================================
          LEFT PANEL: Dark Navy Branding & Institutional Feature Showcase (45%)
          ========================================================================= */}
      <div className="relative z-10 lg:w-[48%] xl:w-[45%] bg-[#101B3C] text-white flex flex-col justify-between p-8 sm:p-12 lg:p-16 border-r border-white/10 overflow-hidden shadow-2xl">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Top Brand Header */}
        <div className="relative z-10 space-y-4">
          <CITLogo
            variant="primary"
            theme="white"
            size="lg"
            showTagline={true}
            showSubtitle={true}
            showBadge={true}
          />

          <div className="pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold border border-white/15 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>OR-Tools CP-SAT Timetable Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Smarter Scheduling. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300">
                Zero Conflicts.
              </span> <br className="hidden sm:inline" />
              Better Campus Management.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-md leading-relaxed font-normal">
              Autonomous constraint optimization engine serving 27 academic venues, 40 faculty members, and 189 weekly course sessions.
            </p>
          </div>
        </div>

        {/* Three Institutional Feature Highlights */}
        <div className="relative z-10 my-8 space-y-3.5">
          
          {/* Feature 1: Conflict-free scheduling */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all flex items-start gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">
                Conflict-Free Optimization
              </h4>
              <p className="text-[11px] text-slate-300/80 mt-0.5 leading-snug">
                Enforcing 14 hard mathematical constraint classes to guarantee zero overlap across faculty, halls, and student batches.
              </p>
            </div>
          </div>

          {/* Feature 2: Smart venue management */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all flex items-start gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/30 group-hover:scale-105 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">
                Smart Venue Management
              </h4>
              <p className="text-[11px] text-slate-300/80 mt-0.5 leading-snug">
                Automated multi-level booking approvals, live capacity matrix, and dedicated Spectra Tech/Cultural Fest venue blocks.
              </p>
            </div>
          </div>

          {/* Feature 3: Campus-wide visibility */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all flex items-start gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">
                Campus-Wide Visibility
              </h4>
              <p className="text-[11px] text-slate-300/80 mt-0.5 leading-snug">
                Role-tailored dashboards for Deans, Department Coordinators, Professors, and Student Club Executives with live sync.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Trust & Compliance Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>FastAPI & PostgreSQL Ready</span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">Phase 3 Production UI</span>
        </div>

      </div>

      {/* =========================================================================
          RIGHT PANEL: Frosted Glass Login Card & Demo Role Hub (55%)
          ========================================================================= */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 xl:p-16">
        
        <div className="w-full max-w-xl glass-card rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/80 transition-all">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-200/60">
            <div className="flex justify-center mb-3">
              <CITLogo variant="icon" theme="dark" size="lg" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Sign in to manage your campus schedule & venue reservations
            </p>

            {/* Mode Tab Switcher: Credentials vs. Instant Demo Access */}
            <div className="mt-5 p-1 bg-slate-200/60 backdrop-blur-md rounded-2xl flex items-center gap-1 border border-white/70">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('credentials');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'bg-white text-blue-700 shadow-md shadow-slate-200/80 border border-white/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                University Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('demo');
                  setError('');
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'demo'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Demo Access</span>
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  1-Click
                </span>
              </button>
            </div>
          </div>

          {/* TAB 1: University Credentials Form */}
          {activeTab === 'credentials' && (
            <div className="pt-6 space-y-4">
              
              {/* Error Alert Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    University Email Address
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@cit.edu"
                      className="w-full pl-10 pr-4 py-2.5 bg-white/70 hover:bg-white focus:bg-white border border-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide Toggle */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white/70 hover:bg-white focus:bg-white border border-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Remember my session on this device</span>
                  </label>

                  <span className="text-[11px] font-mono text-slate-400">
                    Default: demo123
                  </span>
                </div>

                {/* Sign In Button with Blue-Purple Gradient */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-500/30 border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Fast switch to demo notice */}
              <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span>Want to test without typing?</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('demo')}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Select Demo Account</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: Instant Demo Access (Role Cards) */}
          {activeTab === 'demo' && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px]">
                  Select Pre-Configured Demo Workspace
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Instant Access
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rolePresets.map(preset => {
                  const isSelected = email === preset.email;
                  return (
                    <div
                      key={preset.role}
                      onClick={() => handleQuickLogin(preset.email, preset.role)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-white/80 bg-white/60 hover:bg-white hover:border-blue-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${preset.color} flex items-center justify-center text-white shadow-sm`}>
                            {preset.icon}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-900 block leading-tight">
                              {preset.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {preset.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="font-bold text-slate-800 text-xs truncate">
                        {preset.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                        {preset.email}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-tight">
                        {preset.description}
                      </p>

                      <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-bold text-blue-600 group-hover:text-blue-800">
                        <span>Enter as {preset.title.split(' ')[0]}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200/80 rounded-xl text-center text-xs text-blue-800 font-medium">
                Clicking any card logs you in instantly with pre-seeded campus schedules, bookings, and permissions.
              </div>
            </div>
          )}

          {/* Footer Security Note */}
          <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-[11px] text-slate-400">
            Chilika Institute of Technology Central Authentication Service • Secure JWT Wireup
          </div>

        </div>

      </div>

      {/* =========================================================================
          FORGOT PASSWORD MODAL (Glass Modal)
          ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsForgotModalOpen(false)}
            className="fixed inset-0 bg-[#0A1026]/50 backdrop-blur-md transition-opacity"
          />

          <div className="relative z-10 w-full max-w-md glass-modal rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-400/20">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Institutional Password Reset
                  </h3>
                  <p className="text-[11px] text-slate-500">CIT IT Infrastructure Support</p>
                </div>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-600">
              {forgotSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm">Reset Link Dispatched</h4>
                  <p className="text-[11px]">
                    Instructions have been sent to <strong>{forgotEmail || email}</strong>. Please check your official university inbox.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <p className="leading-relaxed">
                    Enter your Chilika Institute of Technology university email address to receive password recovery instructions.
                  </p>
                  
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      University Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="e.g. yourname@cit.edu"
                      className="w-full px-3.5 py-2.5 bg-white/70 focus:bg-white border border-white/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                    💡 For demo environments, all demo accounts share the password <strong className="text-slate-800 font-mono">demo123</strong>.
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(false)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer"
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
