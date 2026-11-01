/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Breadcrumb } from './components/layout/Breadcrumb';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { BackendIntegrationModal } from './components/layout/BackendIntegrationModal';
import { LoginPage } from './components/auth/LoginPage';

// Module Pages
import { DashboardPage } from './pages/DashboardPage';
import { TimetableManagementPage } from './pages/TimetableManagementPage';
import { FacultyManagementPage } from './pages/FacultyManagementPage';
import { AcademicsManagementPage } from './pages/AcademicsManagementPage';
import { ExamManagementPage } from './pages/ExamManagementPage';
import { VenueManagementPage } from './pages/VenueManagementPage';
import { SmartReschedulingPage } from './pages/SmartReschedulingPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdministrationPage } from './pages/AdministrationPage';
import { NotificationsPage } from './pages/NotificationsPage';

const MainLayout: React.FC = () => {
  const { isAuthenticated, activeModule } = useApp();

  // If not authenticated, always show the Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderModulePage = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage />;
      case 'timetable':
        return <TimetableManagementPage />;
      case 'faculty':
        return <FacultyManagementPage />;
      case 'academics':
      case 'groups':
      case 'courses':
        return <AcademicsManagementPage />;
      case 'exams':
        return <ExamManagementPage />;
      case 'venues':
        return <VenueManagementPage />;
      case 'rescheduling':
        return <SmartReschedulingPage />;
      case 'ai':
        return <AIAssistantPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'admin':
        return <AdministrationPage />;
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Body with Sidebar & Content Area */}
      <div className="flex-1 flex w-full overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-full w-full">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            {renderModulePage()}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal />
      <BackendIntegrationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
