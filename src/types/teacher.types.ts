// types/teacher.types.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  code: string;
  subject: string; // Changed from union type to allow any string
  teacherId: string;
  students: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  // Added missing properties
  maxStudents?: number;
  credits?: number;
  currentEnrollment?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  enrolledCourses: string[];
  createdAt: Date;
}

export interface Grade {
  id: string;
  studentId: string;
  assignmentId: string;
  score: number;
  feedback?: string;
  submittedAt?: Date;
  gradedAt?: Date;
}

export interface CourseContent {
  id: string;
  type: 'lecture' | 'video' | 'quiz' | 'assignment' | 'forum' | 'resource';
  title: string;
  description?: string;
  dueDate?: Date;
  releaseDate?: Date;
  file?: string;
  link?: string;
  isCompleted?: boolean;
  submissions?: number;
}

export interface CourseSection {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  content: CourseContent[];
}

export interface CourseDetails extends Course {
  instructor: {
    name: string;
    email: string;
  };
  sections: CourseSection[];
}

// Additional useful types for your educational platform:

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  status: 'active' | 'dropped' | 'completed' | 'suspended';
  grade?: string;
  finalScore?: number;
  notes?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  maxAttempts: number;
  isPublished: boolean;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer?: string | number;
  points: number;
  explanation?: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content?: string;
  fileUrl?: string;
  submittedAt: Date;
  status: 'draft' | 'submitted' | 'graded' | 'late';
  score?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
}

export interface Announcement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  isPublished: boolean;
  publishAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseStats {
  totalStudents: number;
  activeStudents: number;
  completedAssignments: number;
  pendingAssignments: number;
  averageGrade: number;
  engagementRate: number;
}

export interface TeacherDashboardData {
  courses: Course[];
  totalStudents: number;
  totalCourses: number;
  recentSubmissions: Submission[];
  upcomingDeadlines: Assignment[];
  courseStats: { [courseId: string]: CourseStats };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

// Form types
export interface CourseFormData {
  title: string;
  code: string;
  subject: string;
  description: string;
  maxStudents: number;
  credits: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface AssignmentFormData {
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  isPublished: boolean;
  instructions?: string;
  submissionType: 'file' | 'text' | 'url' | 'none';
}

// Utility types
export type CourseStatus = 'active' | 'inactive' | 'archived';
export type UserRole = 'admin' | 'teacher' | 'student';
export type EnrollmentStatus = 'active' | 'dropped' | 'completed' | 'suspended';
export type SubmissionStatus = 'draft' | 'submitted' | 'graded' | 'late';
export type ContentType = 'lecture' | 'video' | 'quiz' | 'assignment' | 'forum' | 'resource';

// Filter and sorting types
export interface CourseFilters {
  subject?: string;
  status?: CourseStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface StudentFilters {
  courseId?: string;
  status?: EnrollmentStatus;
  search?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}