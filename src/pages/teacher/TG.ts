// types/teacherGrades.ts

// Base interfaces matching API response structure
export interface ApiCourse {
  id: string;
  title: string;
  code: string;
  description: string;
  subject: string;
  credits: number;
  created_at: string;
  is_active: boolean;
}

export interface ApiStudent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

export interface ApiAssignment {
  id: string;
  title: string;
  description: string;
  assignment_type: 'quiz' | 'assignment' | 'exam' | 'discussion';
  max_points: number;
  due_date: string | null;
  available_from: string | null;
  available_until: string | null;
  is_published: boolean;
  allowed_attempts: number | null;
  has_time_limit: boolean;
  time_limit_minutes: number | null;
  created_at: string;
}

export interface ApiSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  status: 'submitted' | 'graded' | 'pending' | 'draft' | 'late';
  score: number | null;
  submitted_at: string | null;
  graded_at: string | null;
  attempt_number: number;
  feedback: string | null;
  content?: string;
  file_url?: string;
  auto_submitted: boolean;
  quiz_data?: Record<string, any>;
  time_started: string | null;
  time_completed: string | null;
  time_spent_minutes: number | null;
  graded_by?: string;
}

// Component-specific interfaces
export interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'exam' | 'discussion';
  maxPoints: number;
  dueDate: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  isPublished: boolean;
  allowedAttempts: number | null;
  hasTimeLimit: boolean;
  timeLimitMinutes: number | null;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  subject?: string;
  credits?: number;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
  enrolledAt: string;
  enrollmentStatus: 'active' | 'dropped' | 'completed' | 'suspended';
}

export interface Submission {
  id: string;
  status: 'submitted' | 'graded' | 'pending' | 'draft' | 'late';
  score: number | null;
  percentage: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
  attemptNumber: number;
  totalAttempts: number;
  timeSpentMinutes: number | null;
  feedback: string | null;
  content?: string;
  fileUrl?: string;
  autoSubmitted: boolean;
  quizData?: Record<string, any>;
}

export interface AttemptData {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  percentage: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
  timeSpentMinutes: number | null;
  feedback: string | null;
}

export interface StudentData {
  student: Student;
  submission: Submission | null;
  allAttempts: AttemptData[];
  assignmentStatus: 'submitted' | 'graded' | 'pending' | 'not_started' | 'missing';
  performanceLevel: 'excellent' | 'good' | 'average' | 'needs_attention' | 'not_attempted';
}

export interface Statistics {
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  pendingCount: number;
  notStartedCount: number;
  averageScore: number;
  averagePercentage: number;
  highestScore: number;
  lowestScore: number;
  submissionRate: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  totalSubmissions: number;
}

export interface AssessmentData {
  assignment: Assignment;
  course: Course;
  students: StudentData[];
  statistics: Statistics;
  lastUpdated: string;
}

// API Response interfaces
export interface AssessmentApiResponse {
  success: boolean;
  message: string;
  assignment: Assignment;
  course: Course;
  students: StudentData[];
  statistics: Statistics;
  lastUpdated: string;
}

export interface CourseOverviewData {
  course: Course;
  students: StudentData[];
  assignments: Assignment[];
  statistics: {
    totalStudents: number;
    totalAssignments: number;
    averageScore: number;
    completionRate: number;
    submissionRate: number;
  };
}

export interface TeacherOverviewStats {
  totalCourses: number;
  totalStudents: number;
  totalAssessments: number;
  totalCompletedAssessments: number;
  overallAverageScore: number;
}

export interface TeacherOverviewApiResponse {
  success: boolean;
  message: string;
  courses: Array<{
    course: Course;
    students: Student[];
    assessments: Array<{
      assessment: Assignment;
      studentMarks: any[];
    }>;
    summary: {
      totalStudents: number;
      totalAssessments: number;
      averageCompletionRate: number;
      averageScore: number;
    };
  }>;
  overallStats: TeacherOverviewStats;
  timestamp: string;
}

// Student performance interfaces
export interface StudentPerformance {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  completedAssignments: number;
  totalAssignments: number;
  status: 'excellent' | 'good' | 'average' | 'needs_attention';
}

export interface StudentAssignmentPerformance {
  assignmentId: string;
  assignmentTitle: string;
  assignmentType: string;
  maxPoints: number;
  earnedPoints: number | null;
  percentage: number | null;
  status: 'submitted' | 'graded' | 'pending' | 'not_started' | 'missing';
  submittedAt: string | null;
  gradedAt: string | null;
  attempts: number;
  feedback: string | null;
  dueDate: string | null;
  allAttempts: AttemptData[];
}

export interface StudentCoursePerformanceResponse {
  success: boolean;
  message: string;
  course: Course;
  student: Student & {
    finalScore: number | null;
    grade: string | null;
  };
  performance: {
    totalScore: number;
    maxScore: number;
    percentage: number;
    letterGrade: string;
    completedAssignments: number;
    totalAssignments: number;
    status: 'excellent' | 'good' | 'average' | 'needs_attention';
  };
  assignments: StudentAssignmentPerformance[];
}

// Grading interfaces
export interface GradeSubmissionRequest {
  score: number;
  feedback?: string;
  attemptId?: string;
}

export interface GradeSubmissionResponse {
  success: boolean;
  message: string;
  submission: {
    id: string;
    score: number;
    percentage: number;
    feedback: string | null;
    status: string;
    gradedAt: string;
    attemptNumber: number;
    submittedAt: string;
  };
  assignment: {
    id: string;
    title: string;
    maxPoints: number;
  };
}

// Pending submissions interface
export interface PendingSubmission {
  id: string;
  submittedAt: string;
  attemptNumber: number;
  assignment: {
    id: string;
    title: string;
    type: string;
    maxPoints: number;
    dueDate: string | null;
  };
  course: {
    id: string;
    title: string;
    code: string;
  };
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export interface PendingSubmissionsResponse {
  success: boolean;
  message: string;
  submissions: PendingSubmission[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

// Component prop interfaces
export interface GradeSubmissionModalProps {
  student: Student | null;
  assignment: Assignment | null;
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onGradeSubmitted: () => void;
}

export interface StudentCardProps {
  studentData: StudentData;
  assignment: Assignment;
  onGradeStudent: (studentData: StudentData) => void;
  onViewSubmission: (studentData: StudentData) => void;
}

// Utility types
export type SortBy = 'name' | 'score' | 'status' | 'submitted';
export type SortOrder = 'asc' | 'desc';
export type StatusFilter = 'all' | 'graded' | 'submitted' | 'pending' | 'not_started' | 'missing';
export type PerformanceFilter = 'all' | 'excellent' | 'good' | 'average' | 'needs_attention';

// Error handling
export interface ApiError {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}

export type ApiResponse<T> = T | ApiError;

// Helper type guards
export const isApiError = (response: any): response is ApiError => {
  return response && response.success === false;
};

export const isSuccessResponse = <T>(response: ApiResponse<T>): response is T => {
  return response && (response as any).success !== false;
};