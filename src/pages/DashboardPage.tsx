/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { FacultyDashboard } from '../components/dashboard/FacultyDashboard';
import { CoordinatorDashboard } from '../components/dashboard/CoordinatorDashboard';
import { ClubDashboard } from '../components/dashboard/ClubDashboard';
import { StudentDashboard } from '../components/dashboard/StudentDashboard';
import { WardenDashboard } from '../components/dashboard/WardenDashboard';
import { StaffDashboard } from '../components/dashboard/StaffDashboard';

export const DashboardPage: React.FC = () => {
  const { activeRole } = useApp();

  switch (activeRole) {
    case 'faculty':
      return <FacultyDashboard />;
    case 'coordinator':
      return <CoordinatorDashboard />;
    case 'club':
      return <ClubDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'warden':
      return <WardenDashboard />;
    case 'staff':
      return <StaffDashboard />;
    case 'admin':
    default:
      return <AdminDashboard />;
  }
};
