// types.ts

export interface Instructor {
  name: string;
  email: string;
}

export interface CourseData {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: Instructor;
  enrolledAt: string;
  enrollmentStatus: string;
  finalScore: number | null;
  grade: string | null;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  maxPoints: number;
  dueDate: string | null;
  createdAt: string;
}

export interface Attempt {
  id: string;
  status: string;
  score: number;
  submitted_at: string;
  graded_at: string | null;
  attempt_number: number;
  feedback: string | null;
}

export interface Marks {
  bestScore: number | null;
  latestScore: number | null;
  percentage: number | null;
  totalAttempts: number;
  status: string;
  lastSubmittedAt: string | null;
  lastGradedAt: string | null;
  feedback: string | null;
}

export interface AssessmentWithMarks {
  assessment: Assessment;
  marks: Marks;
  allAttempts: Attempt[];
}

export interface CourseBlock {
  course: CourseData;
  assessments: AssessmentWithMarks[];
  summary: {
    totalAssessments: number;
    completedAssessments: number;
    pendingAssessments: number;
    notSubmittedAssessments: number;
    averageScore: number;
  };
}

export interface QuizApiResponse {
  success: boolean;
  message: string;
  courses: CourseBlock[];
  overallStats: {
    totalCourses: number;
    totalAssessments: number;
    totalCompletedAssessments: number;
    overallAverage: number;
  };
  timestamp: string;
}
export interface AssessmentDetails {
  id: string;
  title: string;
  description: string;
  type: string;         // e.g., "quiz"
  maxPoints: number;
  dueDate: string | null;    // ISO date string or null
  createdAt: string;         // ISO date string
}

export interface Instructor {
  name: string;
  email: string;
}
export interface Assignment {
  assessment: AssessmentDetails;
  marks: Marks;
  allAttempts: Attempt[];
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: Instructor;
  enrolledAt: string;          // ISO date string
  enrollmentStatus: string;    // e.g., "active"
  finalScore: number | null;
  grade: string | null;
}

