/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  TimePeriod,
  Room,
  Course,
  StudentGroup,
  FacultyMember,
  TimetableSlot,
  VenueBookingRequest,
  ExamScheduleItem,
  DisruptionEvent,
  RescheduleRequest,
  AnalyticsSummary,
  User
} from '../types';

export const TIME_PERIODS: TimePeriod[] = [
  { id: 'P1', periodNumber: 1, startTime: '08:00', endTime: '08:50' },
  { id: 'P2', periodNumber: 2, startTime: '08:55', endTime: '09:45' },
  { id: 'P3', periodNumber: 3, startTime: '09:50', endTime: '10:40' },
  { id: 'P4', periodNumber: 4, startTime: '10:45', endTime: '11:35' },
  { id: 'P5', periodNumber: 5, startTime: '11:40', endTime: '12:30' },
  // Lunch between P5 and P6: 12:30 - 13:30
  { id: 'P6', periodNumber: 6, startTime: '13:30', endTime: '14:20' },
  { id: 'P7', periodNumber: 7, startTime: '14:25', endTime: '15:15' },
  { id: 'P8', periodNumber: 8, startTime: '15:20', endTime: '16:10' },
  { id: 'P9', periodNumber: 9, startTime: '16:15', endTime: '17:05' },
];

export const DEMO_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Dr. Rameshwar Panda',
    email: 'admin@cit.edu',
    role: 'admin',
    title: 'Dean of Academic Scheduling & Operations',
    department: 'Central Academic Affairs',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-coord',
    name: 'Dr. Sunita Mohanty',
    email: 'coordinator@cit.edu',
    role: 'coordinator',
    title: 'Department Timetable Coordinator (CSE)',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-faculty',
    name: 'Prof. Arvind Tripathy',
    email: 'faculty@cit.edu',
    role: 'faculty',
    title: 'Associate Professor, Distributed Systems',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-club',
    name: 'Ananya Dash',
    email: 'club@cit.edu',
    role: 'club',
    title: 'President, CIT Robotics & AI Club',
    clubName: 'CIT Robotics & AI Club',
    department: 'Student Activity Center',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-student',
    name: 'Rohan Sen',
    email: 'student@cit.edu',
    role: 'student',
    title: 'Undergraduate Scholar (CSE-3A)',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-warden',
    name: 'Dr. Bimalendra Rout',
    email: 'warden@cit.edu',
    role: 'warden',
    title: 'Chief Hostel Warden & Hall Operations',
    department: 'Hostel & Campus Life Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-staff',
    name: 'Rajesh Kumar Sahu',
    email: 'staff@cit.edu',
    role: 'staff',
    title: 'Senior Laboratory & Venue Operations Staff',
    department: 'Campus Estate & Venue Support',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  },
];

// Reference dataset counts required by prompt:
// Total Rooms: 27
export const MOCK_ROOMS: Room[] = [
  { id: 'rm-1', name: 'LH-101', code: 'LH-101', block: 'Aryabhata Academic Block', floor: 1, type: 'Lecture Hall', capacity: 90, examCapacity: 45, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-2', name: 'LH-102', code: 'LH-102', block: 'Aryabhata Academic Block', floor: 1, type: 'Lecture Hall', capacity: 90, examCapacity: 45, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-3', name: 'LH-103', code: 'LH-103', block: 'Aryabhata Academic Block', floor: 1, type: 'Lecture Hall', capacity: 75, examCapacity: 38, hasProjector: true, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-4', name: 'LH-201', code: 'LH-201', block: 'Aryabhata Academic Block', floor: 2, type: 'Lecture Hall', capacity: 120, examCapacity: 60, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-5', name: 'LH-202', code: 'LH-202', block: 'Aryabhata Academic Block', floor: 2, type: 'Lecture Hall', capacity: 120, examCapacity: 60, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-6', name: 'LH-203', code: 'LH-203', block: 'Aryabhata Academic Block', floor: 2, type: 'Lecture Hall', capacity: 80, examCapacity: 40, hasProjector: true, hasAudioSystem: false, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-7', name: 'LH-301', code: 'LH-301', block: 'Aryabhata Academic Block', floor: 3, type: 'Lecture Hall', capacity: 80, examCapacity: 40, hasProjector: true, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-8', name: 'LH-302', code: 'LH-302', block: 'Aryabhata Academic Block', floor: 3, type: 'Lecture Hall', capacity: 80, examCapacity: 40, hasProjector: true, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-9', name: 'CS-Lab-1 (AI/ML)', code: 'CSL-1', block: 'Turing Computing Complex', floor: 1, type: 'Computer Lab', capacity: 60, examCapacity: 30, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-10', name: 'CS-Lab-2 (Systems)', code: 'CSL-2', block: 'Turing Computing Complex', floor: 1, type: 'Computer Lab', capacity: 60, examCapacity: 30, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-11', name: 'CS-Lab-3 (Cloud & IoT)', code: 'CSL-3', block: 'Turing Computing Complex', floor: 2, type: 'Computer Lab', capacity: 50, examCapacity: 25, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-12', name: 'CS-Lab-4 (Data Eng)', code: 'CSL-4', block: 'Turing Computing Complex', floor: 2, type: 'Computer Lab', capacity: 50, examCapacity: 25, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-13', name: 'ECE-Lab-1 (VLSI)', code: 'ECL-1', block: 'Bose Electronics Wing', floor: 1, type: 'Hardware Lab', capacity: 45, examCapacity: 22, hasProjector: true, hasAudioSystem: false, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-14', name: 'ECE-Lab-2 (Signals)', code: 'ECL-2', block: 'Bose Electronics Wing', floor: 1, type: 'Hardware Lab', capacity: 45, examCapacity: 22, hasProjector: true, hasAudioSystem: false, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-15', name: 'ECE-Lab-3 (Robotics)', code: 'ECL-3', block: 'Bose Electronics Wing', floor: 2, type: 'Hardware Lab', capacity: 40, examCapacity: 20, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-16', name: 'Mech-CAD Lab', code: 'MCL-1', block: 'Visvesvaraya Engineering Centre', floor: 1, type: 'Computer Lab', capacity: 50, examCapacity: 25, hasProjector: true, hasAudioSystem: false, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-17', name: 'Mech-Fluids Lab', code: 'MFL-1', block: 'Visvesvaraya Engineering Centre', floor: 1, type: 'Hardware Lab', capacity: 35, examCapacity: 18, hasProjector: false, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-18', name: 'Central Workshop', code: 'CWS-1', block: 'Visvesvaraya Engineering Centre', floor: 1, type: 'Workshop', capacity: 70, examCapacity: 35, hasProjector: false, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-19', name: 'Civil Surveying Lab', code: 'CVL-1', block: 'Visvesvaraya Engineering Centre', floor: 2, type: 'Hardware Lab', capacity: 40, examCapacity: 20, hasProjector: true, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-20', name: 'Physics & Optics Lab', code: 'BSL-1', block: 'Raman Basic Sciences Block', floor: 1, type: 'Hardware Lab', capacity: 50, examCapacity: 25, hasProjector: true, hasAudioSystem: false, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-21', name: 'Chemistry & Materials Lab', code: 'BSL-2', block: 'Raman Basic Sciences Block', floor: 2, type: 'Hardware Lab', capacity: 50, examCapacity: 25, hasProjector: false, hasAudioSystem: false, hasAirConditioning: false, isAvailableNow: true },
  { id: 'rm-22', name: 'Chilika Auditorium', code: 'AUD-MAIN', block: 'Student & Cultural Complex', floor: 1, type: 'Auditorium', capacity: 650, examCapacity: 300, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-23', name: 'Mini Auditorium', code: 'AUD-MINI', block: 'Student & Cultural Complex', floor: 2, type: 'Auditorium', capacity: 250, examCapacity: 120, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-24', name: 'Seminar Hall A', code: 'SEM-A', block: 'Aryabhata Academic Block', floor: 3, type: 'Seminar Hall', capacity: 150, examCapacity: 75, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-25', name: 'Seminar Hall B', code: 'SEM-B', block: 'Turing Computing Complex', floor: 3, type: 'Seminar Hall', capacity: 140, examCapacity: 70, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: false },
  { id: 'rm-26', name: 'Executive Council Room', code: 'EC-RM', block: 'Administrative Block', floor: 2, type: 'Seminar Hall', capacity: 40, examCapacity: 20, hasProjector: true, hasAudioSystem: true, hasAirConditioning: true, isAvailableNow: true },
  { id: 'rm-27', name: 'Open Amphitheatre', code: 'AMPHI', block: 'Central Campus Plaza', floor: 1, type: 'Auditorium', capacity: 800, examCapacity: 0, hasProjector: false, hasAudioSystem: true, hasAirConditioning: false, isAvailableNow: true },
];

// Student Groups: 14
export const MOCK_STUDENT_GROUPS: StudentGroup[] = [
  { id: 'grp-1', name: 'CSE-1A', department: 'Computer Science', semester: 1, strength: 68, classRepresentative: 'Rohan Sharma' },
  { id: 'grp-2', name: 'CSE-1B', department: 'Computer Science', semester: 1, strength: 65, classRepresentative: 'Shreya Jena' },
  { id: 'grp-3', name: 'CSE-2A', department: 'Computer Science', semester: 3, strength: 64, classRepresentative: 'Amitav Mishra' },
  { id: 'grp-4', name: 'CSE-2B', department: 'Computer Science', semester: 3, strength: 66, classRepresentative: 'Pooja Nayak' },
  { id: 'grp-5', name: 'CSE-3A', department: 'Computer Science', semester: 5, strength: 62, classRepresentative: 'Vikram Sethi' },
  { id: 'grp-6', name: 'CSE-3B', department: 'Computer Science', semester: 5, strength: 60, classRepresentative: 'Niharika Behera' },
  { id: 'grp-7', name: 'CSE-4A', department: 'Computer Science', semester: 7, strength: 58, classRepresentative: 'Sourav Rout' },
  { id: 'grp-8', name: 'ECE-1A', department: 'Electronics & Comm', semester: 1, strength: 60, classRepresentative: 'Tanmay Das' },
  { id: 'grp-9', name: 'ECE-2A', department: 'Electronics & Comm', semester: 3, strength: 58, classRepresentative: 'Madhusmita Paul' },
  { id: 'grp-10', name: 'ECE-3A', department: 'Electronics & Comm', semester: 5, strength: 55, classRepresentative: 'Aditya Barik' },
  { id: 'grp-11', name: 'ME-1A', department: 'Mechanical Eng', semester: 1, strength: 56, classRepresentative: 'Subrat Pradhan' },
  { id: 'grp-12', name: 'ME-2A', department: 'Mechanical Eng', semester: 3, strength: 54, classRepresentative: 'Kalyan Mohapatra' },
  { id: 'grp-13', name: 'ME-3A', department: 'Mechanical Eng', semester: 5, strength: 50, classRepresentative: 'Ritesh Swain' },
  { id: 'grp-14', name: 'CE-2A', department: 'Civil Engineering', semester: 3, strength: 52, classRepresentative: 'Ananya Sahu' },
];

// Faculty Members: 40 (Key faculty detailed, list represents 40)
export const MOCK_FACULTY: FacultyMember[] = [
  { id: 'fac-1', name: 'Prof. Arvind Tripathy', designation: 'Associate Professor', department: 'Computer Science', email: 'faculty@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  { id: 'fac-2', name: 'Dr. Sunita Mohanty', designation: 'Professor & Coordinator', department: 'Computer Science', email: 'coordinator@cit.edu', weeklyWorkloadHours: 12, maxWorkloadHours: 16 },
  { id: 'fac-3', name: 'Dr. Debabrata Samal', designation: 'Assistant Professor', department: 'Computer Science', email: 'd.samal@cit.edu', weeklyWorkloadHours: 18, maxWorkloadHours: 20 },
  { id: 'fac-4', name: 'Prof. Manisha Choudhury', designation: 'Associate Professor', department: 'Computer Science', email: 'm.choudhury@cit.edu', weeklyWorkloadHours: 15, maxWorkloadHours: 18 },
  { id: 'fac-5', name: 'Dr. Rajesh K. Padhi', designation: 'Assistant Professor', department: 'Computer Science', email: 'r.padhi@cit.edu', weeklyWorkloadHours: 17, maxWorkloadHours: 20 },
  { id: 'fac-6', name: 'Prof. Ipsita Nayak', designation: 'Assistant Professor', department: 'Computer Science', email: 'i.nayak@cit.edu', weeklyWorkloadHours: 14, maxWorkloadHours: 18 },
  { id: 'fac-7', name: 'Dr. Pradeep K. Sahoo', designation: 'Professor & Head', department: 'Electronics & Comm', email: 'p.sahoo@cit.edu', weeklyWorkloadHours: 12, maxWorkloadHours: 16 },
  { id: 'fac-8', name: 'Prof. Swati Biswal', designation: 'Associate Professor', department: 'Electronics & Comm', email: 's.biswal@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  { id: 'fac-9', name: 'Dr. Bijay K. Swain', designation: 'Assistant Professor', department: 'Electronics & Comm', email: 'b.swain@cit.edu', weeklyWorkloadHours: 18, maxWorkloadHours: 20 },
  { id: 'fac-10', name: 'Prof. Smita Mohapatra', designation: 'Assistant Professor', department: 'Electronics & Comm', email: 's.mohapatra@cit.edu', weeklyWorkloadHours: 15, maxWorkloadHours: 18 },
  { id: 'fac-11', name: 'Dr. Tarun K. Das', designation: 'Professor & Head', department: 'Mechanical Eng', email: 't.das@cit.edu', weeklyWorkloadHours: 14, maxWorkloadHours: 16 },
  { id: 'fac-12', name: 'Prof. Deepak Senapati', designation: 'Associate Professor', department: 'Mechanical Eng', email: 'd.senapati@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  { id: 'fac-13', name: 'Dr. Ashis Kumar Panda', designation: 'Assistant Professor', department: 'Mechanical Eng', email: 'a.panda@cit.edu', weeklyWorkloadHours: 18, maxWorkloadHours: 20 },
  { id: 'fac-14', name: 'Prof. Chinmayee Hota', designation: 'Assistant Professor', department: 'Mechanical Eng', email: 'c.hota@cit.edu', weeklyWorkloadHours: 15, maxWorkloadHours: 18 },
  { id: 'fac-15', name: 'Dr. Bibhuti B. Mishra', designation: 'Professor & Head', department: 'Civil Engineering', email: 'b.mishra@cit.edu', weeklyWorkloadHours: 12, maxWorkloadHours: 16 },
  { id: 'fac-16', name: 'Prof. Lopamudra Rath', designation: 'Assistant Professor', department: 'Civil Engineering', email: 'l.rath@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  { id: 'fac-17', name: 'Dr. Anupama Satpathy', designation: 'Associate Professor', department: 'Basic Sciences', email: 'a.satpathy@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  { id: 'fac-18', name: 'Prof. Rakesh Mallick', designation: 'Assistant Professor', department: 'Basic Sciences', email: 'r.mallick@cit.edu', weeklyWorkloadHours: 17, maxWorkloadHours: 20 },
  { id: 'fac-19', name: 'Dr. Geeta Pattnaik', designation: 'Assistant Professor', department: 'Basic Sciences', email: 'g.pattnaik@cit.edu', weeklyWorkloadHours: 15, maxWorkloadHours: 18 },
  { id: 'fac-20', name: 'Prof. Alok Ray', designation: 'Associate Professor', department: 'Computer Science', email: 'a.ray@cit.edu', weeklyWorkloadHours: 16, maxWorkloadHours: 18 },
  // Generate remaining up to 40 for complete dataset compliance
  ...Array.from({ length: 20 }, (_, idx) => ({
    id: `fac-${21 + idx}`,
    name: [
      'Dr. Sudhanshu Sekhar', 'Prof. Priyadarshini Dey', 'Dr. Niranjan Behera',
      'Prof. Monalisa Jena', 'Dr. Harekrushna Sahu', 'Prof. Tapasvi Tripathy',
      'Dr. Satyabrata Das', 'Prof. Rashmi Rekha', 'Dr. Biswaranjan Rout',
      'Prof. Archana Nayak', 'Dr. Sarat Chandra Das', 'Prof. Subhashree Dash',
      'Dr. Jagannath Lenka', 'Prof. Bhabani Sankar', 'Dr. Pritam Panda',
      'Prof. Sandeep Mohanty', 'Dr. Minati Barik', 'Prof. Gouranga Charan',
      'Dr. Santosh K. Prusty', 'Prof. Madhuchhanda Sen'
    ][idx],
    designation: idx % 3 === 0 ? 'Associate Professor' : 'Assistant Professor',
    department: idx % 4 === 0 ? 'Computer Science' : idx % 4 === 1 ? 'Electronics & Comm' : idx % 4 === 2 ? 'Mechanical Eng' : 'Basic Sciences',
    email: `faculty${21 + idx}@cit.edu`,
    weeklyWorkloadHours: 14 + (idx % 5),
    maxWorkloadHours: 18 + (idx % 3),
  }))
];

// Courses: 62 (Key course offerings catalog)
export const MOCK_COURSES: Course[] = [
  { id: 'crs-1', code: 'CS301', title: 'Design & Analysis of Algorithms', department: 'CSE', credits: 4, type: 'Lecture', colorTag: '#3B82F6', weeklyHours: 3 },
  { id: 'crs-2', code: 'CS302', title: 'Database Management Systems', department: 'CSE', credits: 4, type: 'Lecture', colorTag: '#10B981', weeklyHours: 3 },
  { id: 'crs-3', code: 'CS303', title: 'Computer Organization & Architecture', department: 'CSE', credits: 4, type: 'Lecture', colorTag: '#8B5CF6', weeklyHours: 3 },
  { id: 'crs-4', code: 'CS304', title: 'Formal Language & Automata', department: 'CSE', credits: 3, type: 'Lecture', colorTag: '#EC4899', weeklyHours: 3 },
  { id: 'crs-5', code: 'CS391', title: 'Algorithms Lab', department: 'CSE', credits: 2, type: 'Lab', colorTag: '#06B6D4', weeklyHours: 2 },
  { id: 'crs-6', code: 'CS392', title: 'DBMS Laboratory', department: 'CSE', credits: 2, type: 'Lab', colorTag: '#14B8A6', weeklyHours: 2 },
  { id: 'crs-7', code: 'CS401', title: 'Distributed Systems & Cloud', department: 'CSE', credits: 4, type: 'Lecture', colorTag: '#F59E0B', weeklyHours: 3 },
  { id: 'crs-8', code: 'CS402', title: 'Artificial Intelligence & ML', department: 'CSE', credits: 4, type: 'Lecture', colorTag: '#6366F1', weeklyHours: 3 },
  { id: 'crs-9', code: 'CS491', title: 'AI & Deep Learning Lab', department: 'CSE', credits: 2, type: 'Lab', colorTag: '#84CC16', weeklyHours: 2 },
  { id: 'crs-10', code: 'EC301', title: 'Digital Signal Processing', department: 'ECE', credits: 4, type: 'Lecture', colorTag: '#E11D48', weeklyHours: 3 },
  { id: 'crs-11', code: 'EC302', title: 'Microprocessors & Microcontrollers', department: 'ECE', credits: 4, type: 'Lecture', colorTag: '#D97706', weeklyHours: 3 },
  { id: 'crs-12', code: 'EC391', title: 'DSP Laboratory', department: 'ECE', credits: 2, type: 'Lab', colorTag: '#0D9488', weeklyHours: 2 },
  { id: 'crs-13', code: 'ME301', title: 'Heat & Mass Transfer', department: 'ME', credits: 4, type: 'Lecture', colorTag: '#EF4444', weeklyHours: 3 },
  { id: 'crs-14', code: 'ME302', title: 'Kinematics of Machinery', department: 'ME', credits: 4, type: 'Lecture', colorTag: '#F97316', weeklyHours: 3 },
  { id: 'crs-15', code: 'BS101', title: 'Engineering Mathematics III', department: 'BS', credits: 4, type: 'Lecture', colorTag: '#475569', weeklyHours: 4 },
  // Generate remaining up to 62 courses
  ...Array.from({ length: 47 }, (_, i) => ({
    id: `crs-${16 + i}`,
    code: ['CS', 'EC', 'ME', 'CE', 'BS'][i % 5] + (100 + i * 5),
    title: [
      'Operating Systems', 'Compiler Design', 'Computer Networks', 'Software Engineering',
      'Information Security', 'Web Technologies', 'Digital Electronics', 'VLSI Design',
      'Analog Communication', 'Fluid Mechanics', 'Thermodynamics', 'Strength of Materials',
      'Structural Analysis', 'Geotechnical Eng', 'Engineering Physics', 'Discrete Mathematics'
    ][i % 16] + ` ${(i % 3) + 1}`,
    department: ['CSE', 'ECE', 'ME', 'CE', 'BS'][i % 5],
    credits: 3 + (i % 2),
    type: (i % 4 === 0 ? 'Lab' : 'Lecture') as 'Lecture' | 'Lab' | 'Tutorial',
    colorTag: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1'][i % 7],
    weeklyHours: i % 4 === 0 ? 2 : 3,
  }))
];

// Reference dataset counts required by prompt:
// Teaching Sessions: 189 total (185 scheduled, 4 unscheduled / in review)
// Midsem Exams: 41
// Pending Booking Requests: 25

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalRooms: 27,
  facultyMembers: 40,
  studentGroups: 14,
  courses: 62,
  teachingSessions: 189,
  midsemExams: 41,
  pendingBookingRequests: 25,
  scheduledSessions: 185,
  unscheduledSessions: 4,
  currentConflicts: 0,
  solverSatisfactionRate: 99.4,
  averageRoomUtilization: 76.8,
  peakHour: '10:45 - 12:30 (P4-P5)',
};

// Weekly Timetable Slots (representative sample across 5 days, P1 to P9)
export const MOCK_TIMETABLE_SLOTS: TimetableSlot[] = [
  // MONDAY
  { id: 'tt-1', day: 'Monday', periodId: 'P1', courseId: 'crs-1', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#3B82F6' },
  { id: 'tt-2', day: 'Monday', periodId: 'P2', courseId: 'crs-2', courseCode: 'CS302', courseName: 'Database Management Systems', facultyId: 'fac-2', facultyName: 'Dr. Sunita Mohanty', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#10B981' },
  { id: 'tt-3', day: 'Monday', periodId: 'P3', courseId: 'crs-3', courseCode: 'CS303', courseName: 'Computer Organization & Arch', facultyId: 'fac-3', facultyName: 'Dr. Debabrata Samal', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#8B5CF6' },
  { id: 'tt-4', day: 'Monday', periodId: 'P4', courseId: 'crs-4', courseCode: 'CS304', courseName: 'Formal Language & Automata', facultyId: 'fac-4', facultyName: 'Prof. Manisha Choudhury', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#EC4899' },
  { id: 'tt-5', day: 'Monday', periodId: 'P5', courseId: 'crs-15', courseCode: 'BS101', courseName: 'Engineering Mathematics III', facultyId: 'fac-17', facultyName: 'Dr. Anupama Satpathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#475569' },
  // Lab in afternoon
  { id: 'tt-6', day: 'Monday', periodId: 'P6', courseId: 'crs-5', courseCode: 'CS391', courseName: 'Algorithms Lab', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-9', roomName: 'CS-Lab-1 (AI/ML)', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lab', durationPeriods: 2, colorTag: '#06B6D4' },
  { id: 'tt-7', day: 'Monday', periodId: 'P7', courseId: 'crs-5', courseCode: 'CS391', courseName: 'Algorithms Lab (Contd)', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-9', roomName: 'CS-Lab-1 (AI/ML)', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lab', durationPeriods: 1, colorTag: '#06B6D4' },
  { id: 'tt-8', day: 'Monday', periodId: 'P8', courseId: 'crs-7', courseCode: 'CS401', courseName: 'Distributed Systems & Cloud', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-4', roomName: 'LH-201', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#F59E0B' },

  // TUESDAY
  { id: 'tt-9', day: 'Tuesday', periodId: 'P1', courseId: 'crs-2', courseCode: 'CS302', courseName: 'Database Management Systems', facultyId: 'fac-2', facultyName: 'Dr. Sunita Mohanty', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#10B981' },
  { id: 'tt-10', day: 'Tuesday', periodId: 'P2', courseId: 'crs-1', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#3B82F6' },
  { id: 'tt-11', day: 'Tuesday', periodId: 'P3', courseId: 'crs-8', courseCode: 'CS402', courseName: 'Artificial Intelligence & ML', facultyId: 'fac-5', facultyName: 'Dr. Rajesh K. Padhi', roomId: 'rm-4', roomName: 'LH-201', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#6366F1' },
  { id: 'tt-12', day: 'Tuesday', periodId: 'P4', courseId: 'crs-10', courseCode: 'EC301', courseName: 'Digital Signal Processing', facultyId: 'fac-7', facultyName: 'Dr. Pradeep K. Sahoo', roomId: 'rm-5', roomName: 'LH-202', groupId: 'grp-10', groupName: 'ECE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#E11D48' },
  { id: 'tt-13', day: 'Tuesday', periodId: 'P6', courseId: 'crs-6', courseCode: 'CS392', courseName: 'DBMS Laboratory', facultyId: 'fac-2', facultyName: 'Dr. Sunita Mohanty', roomId: 'rm-10', roomName: 'CS-Lab-2 (Systems)', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lab', durationPeriods: 2, colorTag: '#14B8A6' },
  { id: 'tt-14', day: 'Tuesday', periodId: 'P7', courseId: 'crs-6', courseCode: 'CS392', courseName: 'DBMS Laboratory (Contd)', facultyId: 'fac-2', facultyName: 'Dr. Sunita Mohanty', roomId: 'rm-10', roomName: 'CS-Lab-2 (Systems)', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lab', durationPeriods: 1, colorTag: '#14B8A6' },

  // WEDNESDAY
  { id: 'tt-15', day: 'Wednesday', periodId: 'P1', courseId: 'crs-3', courseCode: 'CS303', courseName: 'Computer Organization & Arch', facultyId: 'fac-3', facultyName: 'Dr. Debabrata Samal', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#8B5CF6' },
  { id: 'tt-16', day: 'Wednesday', periodId: 'P2', courseId: 'crs-4', courseCode: 'CS304', courseName: 'Formal Language & Automata', facultyId: 'fac-4', facultyName: 'Prof. Manisha Choudhury', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#EC4899' },
  { id: 'tt-17', day: 'Wednesday', periodId: 'P3', courseId: 'crs-1', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#3B82F6' },
  { id: 'tt-18', day: 'Wednesday', periodId: 'P4', courseId: 'crs-15', courseCode: 'BS101', courseName: 'Engineering Mathematics III', facultyId: 'fac-17', facultyName: 'Dr. Anupama Satpathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#475569' },
  { id: 'tt-19', day: 'Wednesday', periodId: 'P6', courseId: 'crs-7', courseCode: 'CS401', courseName: 'Distributed Systems & Cloud', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-4', roomName: 'LH-201', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#F59E0B' },
  { id: 'tt-20', day: 'Wednesday', periodId: 'P7', courseId: 'crs-13', courseCode: 'ME301', courseName: 'Heat & Mass Transfer', facultyId: 'fac-11', facultyName: 'Dr. Tarun K. Das', roomId: 'rm-6', roomName: 'LH-203', groupId: 'grp-13', groupName: 'ME-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#EF4444' },

  // THURSDAY
  { id: 'tt-21', day: 'Thursday', periodId: 'P1', courseId: 'crs-2', courseCode: 'CS302', courseName: 'Database Management Systems', facultyId: 'fac-2', facultyName: 'Dr. Sunita Mohanty', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#10B981' },
  { id: 'tt-22', day: 'Thursday', periodId: 'P2', courseId: 'crs-3', courseCode: 'CS303', courseName: 'Computer Organization & Arch', facultyId: 'fac-3', facultyName: 'Dr. Debabrata Samal', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#8B5CF6' },
  { id: 'tt-23', day: 'Thursday', periodId: 'P3', courseId: 'crs-1', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#3B82F6' },
  { id: 'tt-24', day: 'Thursday', periodId: 'P4', courseId: 'crs-4', courseCode: 'CS304', courseName: 'Formal Language & Automata', facultyId: 'fac-4', facultyName: 'Prof. Manisha Choudhury', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#EC4899' },
  { id: 'tt-25', day: 'Thursday', periodId: 'P6', courseId: 'crs-8', courseCode: 'CS402', courseName: 'Artificial Intelligence & ML', facultyId: 'fac-5', facultyName: 'Dr. Rajesh K. Padhi', roomId: 'rm-4', roomName: 'LH-201', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#6366F1' },

  // FRIDAY
  { id: 'tt-26', day: 'Friday', periodId: 'P1', courseId: 'crs-15', courseCode: 'BS101', courseName: 'Engineering Mathematics III', facultyId: 'fac-17', facultyName: 'Dr. Anupama Satpathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#475569' },
  { id: 'tt-27', day: 'Friday', periodId: 'P2', courseId: 'crs-7', courseCode: 'CS401', courseName: 'Distributed Systems & Cloud', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-4', roomName: 'LH-201', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#F59E0B' },
  { id: 'tt-28', day: 'Friday', periodId: 'P3', courseId: 'crs-11', courseCode: 'EC302', courseName: 'Microprocessors & Microcontrollers', facultyId: 'fac-8', facultyName: 'Prof. Swati Biswal', roomId: 'rm-5', roomName: 'LH-202', groupId: 'grp-10', groupName: 'ECE-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#D97706' },
  { id: 'tt-29', day: 'Friday', periodId: 'P4', courseId: 'crs-14', courseCode: 'ME302', courseName: 'Kinematics of Machinery', facultyId: 'fac-12', facultyName: 'Prof. Deepak Senapati', roomId: 'rm-6', roomName: 'LH-203', groupId: 'grp-13', groupName: 'ME-3A', sessionType: 'Lecture', durationPeriods: 1, colorTag: '#F97316' },
  { id: 'tt-30', day: 'Friday', periodId: 'P6', courseId: 'crs-9', courseCode: 'CS491', courseName: 'AI & Deep Learning Lab', facultyId: 'fac-5', facultyName: 'Dr. Rajesh K. Padhi', roomId: 'rm-9', roomName: 'CS-Lab-1 (AI/ML)', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lab', durationPeriods: 2, colorTag: '#84CC16' },

  // SATURDAY (Remedial, Project Labs & Industry Sessions)
  { id: 'tt-31', day: 'Saturday', periodId: 'P2', courseId: 'crs-1', courseCode: 'CS301', courseName: 'Design & Analysis of Algorithms (Tutorial)', facultyId: 'fac-1', facultyName: 'Prof. Arvind Tripathy', roomId: 'rm-1', roomName: 'LH-101', groupId: 'grp-5', groupName: 'CSE-3A', sessionType: 'Tutorial', durationPeriods: 1, colorTag: '#3B82F6' },
  { id: 'tt-32', day: 'Saturday', periodId: 'P3', courseId: 'crs-10', courseCode: 'EC301', courseName: 'Digital Signal Processing (Remedial)', facultyId: 'fac-7', facultyName: 'Dr. Pradeep K. Sahoo', roomId: 'rm-5', roomName: 'LH-202', groupId: 'grp-10', groupName: 'ECE-3A', sessionType: 'Tutorial', durationPeriods: 1, colorTag: '#E11D48' },
  { id: 'tt-33', day: 'Saturday', periodId: 'P6', courseId: 'crs-9', courseCode: 'CS491', courseName: 'Capstone Project Lab', facultyId: 'fac-5', facultyName: 'Dr. Rajesh K. Padhi', roomId: 'rm-11', roomName: 'CS-Lab-3 (Cloud & IoT)', groupId: 'grp-7', groupName: 'CSE-4A', sessionType: 'Lab', durationPeriods: 2, colorTag: '#84CC16' },
];

// Pending Booking Requests: exactly 25
export const MOCK_BOOKING_REQUESTS: VenueBookingRequest[] = [
  {
    id: 'req-01',
    eventTitle: 'Autonomous Rover Workshop 2026',
    requestedBy: 'Ananya Dash',
    requesterRole: 'club',
    requesterEmail: 'club@cit.edu',
    clubOrDept: 'CIT Robotics & AI Club',
    roomId: 'rm-24',
    roomName: 'Seminar Hall A',
    date: '2026-11-06',
    startTime: '14:00',
    endTime: '17:00',
    periodIds: ['P7', 'P8', 'P9'],
    expectedAttendees: 110,
    purpose: 'Hands-on ROS2 simulation and hardware kit demonstration for 2nd and 3rd year students.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-30 10:15',
    priorityScore: 78,
  },
  {
    id: 'req-02',
    eventTitle: 'Spectra Tech Fest: National Hackathon Pitch',
    requestedBy: 'Tanmay Mohanty',
    requesterRole: 'club',
    requesterEmail: 'techfest@cit.edu',
    clubOrDept: 'CIT Tech Council',
    roomId: 'rm-22',
    roomName: 'Chilika Auditorium',
    date: '2026-11-14',
    startTime: '09:00',
    endTime: '18:00',
    periodIds: ['P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'],
    expectedAttendees: 520,
    purpose: 'Final jury presentations and keynote addresses by Google & Microsoft alumni.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: true,
    submittedAt: '2026-10-29 16:40',
    priorityScore: 95,
  },
  {
    id: 'req-03',
    eventTitle: 'Google Developer Student Clubs: Cloud Sprint',
    requestedBy: 'Priyanka Sen',
    requesterRole: 'club',
    requesterEmail: 'gdsc@cit.edu',
    clubOrDept: 'GDSC CIT Chapter',
    roomId: 'rm-9',
    roomName: 'CS-Lab-1 (AI/ML)',
    date: '2026-11-08',
    startTime: '13:30',
    endTime: '16:30',
    periodIds: ['P6', 'P7', 'P8'],
    expectedAttendees: 55,
    purpose: 'Kubernetes hands-on lab on Google Cloud Platform with live voucher redemptions.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-29 14:20',
    priorityScore: 82,
  },
  {
    id: 'req-04',
    eventTitle: 'Guest Lecture: Emerging Quantum Computing Architectures',
    requestedBy: 'Dr. Sunita Mohanty',
    requesterRole: 'coordinator',
    requesterEmail: 'coordinator@cit.edu',
    clubOrDept: 'Dept of Computer Science & Engineering',
    roomId: 'rm-25',
    roomName: 'Seminar Hall B',
    date: '2026-11-05',
    startTime: '10:45',
    endTime: '12:30',
    periodIds: ['P4', 'P5'],
    expectedAttendees: 125,
    purpose: 'Distinguished lecture by Dr. S. Rao, Senior Research Fellow at TIFR Mumbai.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-30 08:30',
    priorityScore: 88,
  },
  {
    id: 'req-05',
    eventTitle: 'E-Cell Founder Stories: From Campus to Pre-Series A',
    requestedBy: 'Vivek Jena',
    requesterRole: 'club',
    requesterEmail: 'ecell@cit.edu',
    clubOrDept: 'Entrepreneurship Cell',
    roomId: 'rm-23',
    roomName: 'Mini Auditorium',
    date: '2026-11-07',
    startTime: '15:00',
    endTime: '17:30',
    periodIds: ['P8', 'P9'],
    expectedAttendees: 180,
    purpose: 'Fireside chat with 2021 alumni founder who raised $1.2M in seed funding.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-28 11:00',
    priorityScore: 74,
  },
  {
    id: 'req-06',
    eventTitle: 'Annual Classical Dance & Music Auditions',
    requestedBy: 'Megha Pattnayak',
    requesterRole: 'club',
    requesterEmail: 'spicmacay@cit.edu',
    clubOrDept: 'CIT Cultural Guild',
    roomId: 'rm-27',
    roomName: 'Open Amphitheatre',
    date: '2026-11-09',
    startTime: '16:00',
    endTime: '19:30',
    periodIds: ['P8', 'P9'],
    expectedAttendees: 300,
    purpose: 'Annual cultural society inductions for vocalists, instrumentalists, and dancers.',
    requiresAV: true,
    requiresAC: false,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-27 15:10',
    priorityScore: 65,
  },
  {
    id: 'req-07',
    eventTitle: 'Industry 4.0 IoT Gateway Hardware Workshop',
    requestedBy: 'Dr. Pradeep K. Sahoo',
    requesterRole: 'coordinator',
    requesterEmail: 'coordinator.ece@cit.edu',
    clubOrDept: 'Dept of Electronics & Communication',
    roomId: 'rm-15',
    roomName: 'ECE-Lab-3 (Robotics)',
    date: '2026-11-10',
    startTime: '13:30',
    endTime: '17:00',
    periodIds: ['P6', 'P7', 'P8', 'P9'],
    expectedAttendees: 38,
    purpose: 'Hardware lab interfacing ESP32 and LoRaWAN gateways with Schneider Electric trainers.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-30 09:00',
    priorityScore: 84,
  },
  {
    id: 'req-08',
    eventTitle: 'Rotaract Blood Donation & Health Camp',
    requestedBy: 'Sidharth Panda',
    requesterRole: 'club',
    requesterEmail: 'rotaract@cit.edu',
    clubOrDept: 'Rotaract Club of CIT',
    roomId: 'rm-26',
    roomName: 'Executive Council Room',
    date: '2026-11-12',
    startTime: '09:00',
    endTime: '15:00',
    periodIds: ['P2', 'P3', 'P4', 'P5', 'P6', 'P7'],
    expectedAttendees: 150,
    purpose: 'Voluntary blood donation camp in association with Red Cross Regional Blood Bank.',
    requiresAV: false,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-26 12:45',
    priorityScore: 79,
  },
  {
    id: 'req-09',
    eventTitle: 'Spectra RoboWars Arena Construction & Testing',
    requestedBy: 'Ananya Dash',
    requesterRole: 'club',
    requesterEmail: 'club@cit.edu',
    clubOrDept: 'CIT Robotics & AI Club',
    roomId: 'rm-18',
    roomName: 'Central Workshop',
    date: '2026-11-13',
    startTime: '14:00',
    endTime: '19:00',
    periodIds: ['P7', 'P8', 'P9'],
    expectedAttendees: 45,
    purpose: 'Arena poly-carbonate welding and impact testing for 15kg/30kg combat bots.',
    requiresAV: false,
    requiresAC: false,
    status: 'Pending',
    isSpectraWeek: true,
    submittedAt: '2026-10-25 17:30',
    priorityScore: 91,
  },
  {
    id: 'req-10',
    eventTitle: 'Literary & Debating Society: Parliamentary Debate Finals',
    requestedBy: 'Shlok Mishra',
    requesterRole: 'club',
    requesterEmail: 'litsoc@cit.edu',
    clubOrDept: 'CIT Literary Society',
    roomId: 'rm-24',
    roomName: 'Seminar Hall A',
    date: '2026-11-11',
    startTime: '15:00',
    endTime: '18:00',
    periodIds: ['P8', 'P9'],
    expectedAttendees: 90,
    purpose: 'Asian Parliamentary format debating championship finals.',
    requiresAV: true,
    requiresAC: true,
    status: 'Pending',
    isSpectraWeek: false,
    submittedAt: '2026-10-24 14:15',
    priorityScore: 68,
  },
  // Additional pending requests to total 25
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `req-${11 + i}`,
    eventTitle: [
      'Alumni Mentorship Round Table', 'Civil Engineering Structural Bridge Model Showcase',
      'Spectra Music Night Sound Check', 'IEEE Student Branch Paper Writing Clinic',
      'Department Board of Studies Meeting', 'Kavita & Poetry Evening',
      'Aeromodelling Drone Flight Simulation', 'Placement Cell Mock Technical Interviews',
      'Baja SAE Vehicle Tuning & Inspection', 'Open Source Contributor Sprint',
      'Finance & FinTech Trading Simulation', 'Clean Campus Green Drive Briefing',
      'Competitive Programming Weekly Contest', 'Photography & Media Guild Exhibition',
      'TEDxChilikaInstitute Stage Rehearsals'
    ][i],
    requestedBy: ['Aditi Roy', 'Rakesh Swain', 'Devika Sen', 'Harish Babu', 'Dr. Bibhuti Mishra', 'Pooja Nayak'][i % 6],
    requesterRole: (i % 3 === 0 ? 'coordinator' : 'club') as 'coordinator' | 'club',
    requesterEmail: `requester${11 + i}@cit.edu`,
    clubOrDept: ['SAE CIT Club', 'ASCE Student Chapter', 'Spectra Core Team', 'IEEE CIT Branch', 'Civil Dept', 'Media Club'][i % 6],
    roomId: MOCK_ROOMS[(10 + i) % 27].id,
    roomName: MOCK_ROOMS[(10 + i) % 27].name,
    date: `2026-11-${15 + (i % 10)}`,
    startTime: '14:00',
    endTime: '16:30',
    periodIds: ['P7', 'P8'],
    expectedAttendees: 30 + (i * 12),
    purpose: 'Scheduled academic or co-curricular initiative awaiting administrative review.',
    requiresAV: i % 2 === 0,
    requiresAC: true,
    status: 'Pending' as const,
    isSpectraWeek: i % 4 === 0,
    submittedAt: `2026-10-${20 + (i % 10)} 11:${(10 + i * 3) % 60}`,
    priorityScore: 60 + (i * 2),
  }))
];

// Midsem Exams: 41 (Catalog of scheduled and planned midsem examination papers)
export const MOCK_EXAM_SCHEDULE: ExamScheduleItem[] = [
  {
    id: 'ex-01',
    examType: 'Midsem',
    date: '2026-11-18',
    day: 'Wednesday',
    timeSlot: '09:30 - 11:30 AM',
    courseCode: 'CS301',
    courseTitle: 'Design & Analysis of Algorithms',
    studentGroup: 'CSE-3A & CSE-3B',
    enrolledStudents: 122,
    allocatedRooms: [
      { roomId: 'rm-4', roomName: 'LH-201', allocatedSeats: 60, invigilator: 'Prof. Arvind Tripathy' },
      { roomId: 'rm-5', roomName: 'LH-202', allocatedSeats: 62, invigilator: 'Dr. Debabrata Samal' },
    ]
  },
  {
    id: 'ex-02',
    examType: 'Midsem',
    date: '2026-11-18',
    day: 'Wednesday',
    timeSlot: '02:00 - 04:00 PM',
    courseCode: 'EC301',
    courseTitle: 'Digital Signal Processing',
    studentGroup: 'ECE-3A',
    enrolledStudents: 55,
    allocatedRooms: [
      { roomId: 'rm-1', roomName: 'LH-101', allocatedSeats: 45, invigilator: 'Prof. Swati Biswal' },
      { roomId: 'rm-3', roomName: 'LH-103', allocatedSeats: 10, invigilator: 'Dr. Bijay K. Swain' },
    ]
  },
  {
    id: 'ex-03',
    examType: 'Midsem',
    date: '2026-11-19',
    day: 'Thursday',
    timeSlot: '09:30 - 11:30 AM',
    courseCode: 'CS302',
    courseTitle: 'Database Management Systems',
    studentGroup: 'CSE-3A & CSE-3B',
    enrolledStudents: 122,
    allocatedRooms: [
      { roomId: 'rm-4', roomName: 'LH-201', allocatedSeats: 60, invigilator: 'Dr. Sunita Mohanty' },
      { roomId: 'rm-5', roomName: 'LH-202', allocatedSeats: 62, invigilator: 'Prof. Manisha Choudhury' },
    ]
  },
  {
    id: 'ex-04',
    examType: 'Midsem',
    date: '2026-11-19',
    day: 'Thursday',
    timeSlot: '02:00 - 04:00 PM',
    courseCode: 'ME301',
    courseTitle: 'Heat & Mass Transfer',
    studentGroup: 'ME-3A',
    enrolledStudents: 50,
    allocatedRooms: [
      { roomId: 'rm-2', roomName: 'LH-102', allocatedSeats: 45, invigilator: 'Dr. Tarun K. Das' },
      { roomId: 'rm-3', roomName: 'LH-103', allocatedSeats: 5, invigilator: 'Prof. Deepak Senapati' },
    ]
  },
  {
    id: 'ex-05',
    examType: 'Midsem',
    date: '2026-11-20',
    day: 'Friday',
    timeSlot: '09:30 - 11:30 AM',
    courseCode: 'CS401',
    courseTitle: 'Distributed Systems & Cloud',
    studentGroup: 'CSE-4A',
    enrolledStudents: 58,
    allocatedRooms: [
      { roomId: 'rm-4', roomName: 'LH-201', allocatedSeats: 58, invigilator: 'Prof. Arvind Tripathy' },
    ]
  },
  // Generating remaining up to 41 items for full compliance
  ...Array.from({ length: 36 }, (_, i) => ({
    id: `ex-${6 + i}`,
    examType: 'Midsem' as const,
    date: `2026-11-${21 + (i % 10)}`,
    day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i % 5],
    timeSlot: i % 2 === 0 ? '09:30 - 11:30 AM' : '02:00 - 04:00 PM',
    courseCode: ['CS', 'EC', 'ME', 'CE', 'BS'][i % 5] + (200 + i * 4),
    courseTitle: [
      'Operating Systems & Kernel Architecture', 'Microprocessor Interfacing',
      'Theory of Machines', 'Structural Dynamics', 'Applied Statistics',
      'Cryptography & Network Security', 'Embedded Systems', 'Finite Element Methods',
      'Hydraulics & Water Resources', 'Linear Algebra & Optimization'
    ][i % 10],
    studentGroup: ['CSE-2A', 'ECE-2A', 'ME-2A', 'CE-2A', 'CSE-4A'][i % 5],
    enrolledStudents: 48 + (i % 15),
    allocatedRooms: [
      {
        roomId: MOCK_ROOMS[i % 8].id,
        roomName: MOCK_ROOMS[i % 8].name,
        allocatedSeats: 48 + (i % 15),
        invigilator: MOCK_FACULTY[(i + 5) % 30].name,
      }
    ]
  }))
];

// Disruptions & Rescheduling Data
export const MOCK_DISRUPTIONS: DisruptionEvent[] = [
  {
    id: 'dis-1',
    title: 'Dr. Debabrata Samal Medical Leave',
    type: 'Faculty Leave',
    affectedDate: '2026-11-04 (Tuesday)',
    affectedEntity: 'Dr. Debabrata Samal',
    affectedSlotsCount: 3,
    status: 'Unresolved',
    reportedAt: '2026-10-30 18:20',
    proposedResolution: 'Substitute CS303 lecture slot with Prof. Manisha Choudhury or swap with Friday tutorial.'
  },
  {
    id: 'dis-2',
    title: 'Turing Block CS-Lab-2 Power Distribution Maintenance',
    type: 'Room Maintenance',
    affectedDate: '2026-11-05 (Wednesday)',
    affectedEntity: 'CS-Lab-2 (Systems)',
    affectedSlotsCount: 4,
    status: 'Under Optimization',
    reportedAt: '2026-10-30 11:00',
    proposedResolution: 'Shift DBMS Lab session of CSE-3A to Turing CS-Lab-3 (Cloud & IoT) during P6-P7.'
  },
  {
    id: 'dis-3',
    title: 'State Governor Academic Convocation Visit',
    type: 'Campus Event',
    affectedDate: '2026-11-17 (Tuesday)',
    affectedEntity: 'Chilika Auditorium & Aryabhata Block 1st Floor',
    affectedSlotsCount: 12,
    status: 'Unresolved',
    reportedAt: '2026-10-29 09:15',
    proposedResolution: 'Relocate LH-101 and LH-102 morning lectures to Bose Wing & Virtual Classroom.'
  }
];

export const MOCK_RESCHEDULE_REQUESTS: RescheduleRequest[] = [
  {
    id: 'resch-01',
    facultyName: 'Prof. Arvind Tripathy',
    courseCode: 'CS301',
    originalSlot: {
      day: 'Monday',
      periodId: 'P1',
      roomName: 'LH-101',
      groupName: 'CSE-3A',
    },
    proposedSlot: {
      day: 'Wednesday',
      periodId: 'P5',
      roomName: 'LH-101',
      groupName: 'CSE-3A',
    },
    reason: 'Attending IEEE AI Workshop Steering Committee remote session at 08:00 AM Monday.',
    status: 'Pending Admin Review',
    conflictAnalysis: {
      hasConflicts: false,
      studentConflict: false,
      facultyConflict: false,
      roomConflict: false,
      details: 'Zero conflicts detected. All 62 students in CSE-3A, LH-101 and Prof. Tripathy are free at Wednesday P5.'
    },
    submittedDate: '2026-10-30 14:10'
  },
  {
    id: 'resch-02',
    facultyName: 'Dr. Rajesh K. Padhi',
    courseCode: 'CS402',
    originalSlot: {
      day: 'Tuesday',
      periodId: 'P3',
      roomName: 'LH-201',
      groupName: 'CSE-4A',
    },
    proposedSlot: {
      day: 'Friday',
      periodId: 'P5',
      roomName: 'LH-201',
      groupName: 'CSE-4A',
    },
    reason: 'Invigilator duty conflict with PhD comprehensive viva exam.',
    status: 'Pending Admin Review',
    conflictAnalysis: {
      hasConflicts: true,
      studentConflict: true,
      facultyConflict: false,
      roomConflict: false,
      details: 'Warning: 24 students in CSE-4A have Elective CS512 in LH-203 during Friday P5.'
    },
    submittedDate: '2026-10-29 16:45'
  }
];

// Spectra Week Bookings (Annual Tech & Cultural Festival)
export const MOCK_SPECTRA_WEEK_EVENTS = [
  {
    id: 'spec-1',
    title: 'Spectra Inauguration & Keynote by ISRO Scientist',
    venue: 'Chilika Auditorium',
    date: '2026-11-13',
    time: '10:00 - 12:30',
    expectedFootfall: 650,
    status: 'Approved',
    organizer: 'Central Student Council'
  },
  {
    id: 'spec-2',
    title: 'All-India Inter-College Hackathon (36-Hour Hack)',
    venue: 'CS-Lab-1 & CS-Lab-2 Complex',
    date: '2026-11-13 to 2026-11-14',
    time: 'Continuous 36 hrs',
    expectedFootfall: 220,
    status: 'Pending Admin Override',
    organizer: 'CIT Tech Club'
  },
  {
    id: 'spec-3',
    title: 'RoboWars National Championship',
    venue: 'Central Workshop Arena',
    date: '2026-11-14',
    time: '14:00 - 19:30',
    expectedFootfall: 400,
    status: 'Approved',
    organizer: 'CIT Robotics & AI Club'
  },
  {
    id: 'spec-4',
    title: 'Battle of the Bands & Pro-Nite Concert',
    venue: 'Open Amphitheatre',
    date: '2026-11-15',
    time: '18:00 - 22:00',
    expectedFootfall: 1500,
    status: 'Approved',
    organizer: 'CIT Cultural Guild'
  }
];
