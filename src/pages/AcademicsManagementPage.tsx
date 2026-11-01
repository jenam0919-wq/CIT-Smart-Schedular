/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StudentGroup, Course } from '../types';
import {
  Users,
  BookOpen,
  GraduationCap,
  PlusCircle,
  Download,
  CalendarCheck,
  Building,
  Sparkles,
  CheckCircle2,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import { GroupDashboard } from '../components/academics/GroupDashboard';
import { GroupDirectory } from '../components/academics/GroupDirectory';
import { GroupDetailsModal } from '../components/academics/GroupDetailsModal';
import { GroupFormModal } from '../components/academics/GroupFormModal';
import { CourseDashboard } from '../components/academics/CourseDashboard';
import { CourseDirectory } from '../components/academics/CourseDirectory';
import { CourseDetailsModal } from '../components/academics/CourseDetailsModal';
import { CourseFormModal } from '../components/academics/CourseFormModal';
import { CurriculumAssignmentModal } from '../components/academics/CurriculumAssignmentModal';
import { AcademicsAnalytics } from '../components/academics/AcademicsAnalytics';

export const AcademicsManagementPage: React.FC = () => {
  const {
    activeSubPage,
    setActiveNavigation,
    studentGroups,
    courses,
    faculty,
    timetableSlots,
    createStudentGroup,
    updateStudentGroup,
    deleteStudentGroup,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useApp();

  // Selected modals
  const [selectedGroupForDetails, setSelectedGroupForDetails] = useState<StudentGroup | null>(null);
  const [groupToEdit, setGroupToEdit] = useState<StudentGroup | null>(null);
  const [isGroupFormOpen, setIsGroupFormOpen] = useState(false);

  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<Course | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Group Handlers
  const handleOpenAddGroup = () => {
    setGroupToEdit(null);
    setIsGroupFormOpen(true);
  };

  const handleOpenEditGroup = (grp: StudentGroup) => {
    setGroupToEdit(grp);
    setIsGroupFormOpen(true);
  };

  const handleGroupFormSubmit = async (formData: any) => {
    if (groupToEdit) {
      await updateStudentGroup(groupToEdit.id, formData);
      showToast(`Updated cohort ${formData.name}`);
    } else {
      await createStudentGroup(formData);
      showToast(`Created cohort section ${formData.name}`);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (confirm('Are you sure you want to remove this cohort section from the registry?')) {
      try {
        await deleteStudentGroup(id);
        showToast('Cohort removed from registry.');
      } catch (err: any) {
        alert(err.message || 'Failed to delete student group.');
      }
    }
  };

  // Course Handlers
  const handleOpenAddCourse = () => {
    setCourseToEdit(null);
    setIsCourseFormOpen(true);
  };

  const handleOpenEditCourse = (crs: Course) => {
    setCourseToEdit(crs);
    setIsCourseFormOpen(true);
  };

  const handleCourseFormSubmit = async (formData: any) => {
    if (courseToEdit) {
      await updateCourse(courseToEdit.id || courseToEdit.code, formData);
      showToast(`Updated course ${formData.code}`);
    } else {
      await createCourse(formData);
      showToast(`Added ${formData.code} to course catalog`);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course from the catalog?')) {
      try {
        await deleteCourse(id);
        showToast('Course deleted from catalog.');
      } catch (err: any) {
        alert(err.message || 'Failed to delete course.');
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (activeSubPage === 'courses') {
      const headers = ['Code', 'Title', 'Department', 'Credits', 'Type', 'Weekly Hours'];
      const rows = courses.map(c => [
        c.code,
        `"${c.title}"`,
        c.department,
        c.credits,
        c.type,
        c.weeklyHours,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `CIT_Courses_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported Course Catalog to CSV.');
    } else {
      const headers = ['ID', 'Name', 'Department', 'Semester', 'Strength', 'Class Representative'];
      const rows = studentGroups.map(g => [
        g.id,
        g.name,
        `"${g.department}"`,
        g.semester,
        g.strength,
        `"${g.classRepresentative || ''}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `CIT_Student_Groups_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exported Student Cohorts to CSV.');
    }
  };

  // Determine current effective subpage (default to 'groups' if not 'courses' or 'analytics')
  const currentTab = activeSubPage === 'courses' ? 'courses' : activeSubPage === 'analytics' ? 'analytics' : 'groups';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-white/70 border border-white/60 shadow-xl shadow-blue-950/5 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 via-indigo-400/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              Academic Operations & Curriculum
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Groups & Course Management
            </h1>
            <p className="text-xs md:text-sm text-slate-500 max-w-2xl">
              Academic cohort registry, course syllabi catalog, curriculum mapping, and timetable schedule distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-white/80 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export {currentTab === 'courses' ? 'Courses' : 'Cohorts'}
            </button>

            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Assign Curriculum
            </button>

            {currentTab === 'courses' ? (
              <button
                onClick={handleOpenAddCourse}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Add Course
              </button>
            ) : (
              <button
                onClick={handleOpenAddGroup}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Create Cohort
              </button>
            )}
          </div>
        </div>

        {/* Live KPI Dashboard strip */}
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          {currentTab === 'courses' ? (
            <CourseDashboard courses={courses} timetableSlots={timetableSlots} />
          ) : (
            <GroupDashboard groups={studentGroups} timetableSlots={timetableSlots} />
          )}
        </div>
      </div>

      {/* Subpage Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 border border-white/70 shadow-xs backdrop-blur-md w-fit">
        <button
          onClick={() => setActiveNavigation('academics', 'groups')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'groups'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Student Cohorts ({studentGroups.length})
        </button>

        <button
          onClick={() => setActiveNavigation('academics', 'courses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'courses'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Course Catalog ({courses.length})
        </button>

        <button
          onClick={() => setActiveNavigation('academics', 'analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            currentTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Academic Analytics
        </button>
      </div>

      {/* Main Tab Content */}
      {currentTab === 'groups' && (
        <GroupDirectory
          groups={studentGroups}
          timetableSlots={timetableSlots}
          courses={courses}
          onSelectGroup={grp => setSelectedGroupForDetails(grp)}
          onEditGroup={grp => handleOpenEditGroup(grp)}
          onDeleteGroup={id => handleDeleteGroup(id)}
          onViewTimetable={grp => {
            setActiveNavigation('timetable', 'group');
          }}
        />
      )}

      {currentTab === 'courses' && (
        <CourseDirectory
          courses={courses}
          timetableSlots={timetableSlots}
          facultyList={faculty}
          studentGroups={studentGroups}
          onSelectCourse={crs => setSelectedCourseForDetails(crs)}
          onEditCourse={crs => handleOpenEditCourse(crs)}
          onDeleteCourse={id => handleDeleteCourse(id)}
        />
      )}

      {currentTab === 'analytics' && (
        <AcademicsAnalytics
          groups={studentGroups}
          courses={courses}
          timetableSlots={timetableSlots}
          facultyList={faculty}
          onSelectGroup={grp => setSelectedGroupForDetails(grp)}
          onSelectCourse={crs => setSelectedCourseForDetails(crs)}
        />
      )}

      {/* Modals */}
      <GroupDetailsModal
        group={selectedGroupForDetails}
        isOpen={!!selectedGroupForDetails}
        onClose={() => setSelectedGroupForDetails(null)}
        timetableSlots={timetableSlots}
        courses={courses}
        onEdit={grp => handleOpenEditGroup(grp)}
        onViewTimetable={() => {
          setActiveNavigation('timetable', 'group');
        }}
      />

      <GroupFormModal
        isOpen={isGroupFormOpen}
        onClose={() => {
          setIsGroupFormOpen(false);
          setGroupToEdit(null);
        }}
        groupToEdit={groupToEdit}
        onSubmit={handleGroupFormSubmit}
      />

      <CourseDetailsModal
        course={selectedCourseForDetails}
        isOpen={!!selectedCourseForDetails}
        onClose={() => setSelectedCourseForDetails(null)}
        timetableSlots={timetableSlots}
        facultyList={faculty}
        studentGroups={studentGroups}
        onEdit={crs => handleOpenEditCourse(crs)}
      />

      <CourseFormModal
        isOpen={isCourseFormOpen}
        onClose={() => {
          setIsCourseFormOpen(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
        onSubmit={handleCourseFormSubmit}
      />

      <CurriculumAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        groups={studentGroups}
        courses={courses}
        facultyList={faculty}
        timetableSlots={timetableSlots}
        onAssignSuccess={() => showToast('Course successfully mapped to cohort section.')}
      />
    </div>
  );
};

