export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  due_date?: string;
  max_points: number;
  is_published: boolean;
  submission_type: string;
  assignment_type: string;
  created_at: string;
  updated_at: string;
}

export interface CourseContent {
  id: string;
  title: string;
  description?: string;
  file?: string;
  link?: string;
  content_type: 'pdf' | 'video' | 'text' | 'link';
  order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentViewer {
  isOpen: boolean;
  content: CourseContent | null;
  type: 'pdf' | 'video' | null;
}

export interface CourseDetails {
  id: string;
  title: string;
  code: string;
  subject: string;
  description: string;
  teacherId: string;
  students: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  maxStudents?: number;
  credits?: number;
  currentEnrollment: number;
  instructor: {
    name: string;
    email: string;
  };
  sections: any[];
}