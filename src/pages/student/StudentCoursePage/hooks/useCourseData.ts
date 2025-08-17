import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseDetails, Assignment } from '../types';

//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../../config/api';

interface ApiCourseResponse {
  success: boolean;
  course?: {
    id: string;
    title: string;
    code: string;
    subject?: string;
    description: string;
    instructor_id: string;
    teacher?: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    enrolledStudents?: any[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    modules?: any[];
    maxStudents?: number;
    credits?: number;
    currentEnrollment?: number;
  };
  message?: string;
}

export const useCourseData = (courseId: string | undefined) => {
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  const fetchAssignments = async (courseId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/assignments/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const publishedAssignments = data.assignments?.filter((assignment: Assignment) => assignment.is_published) || [];
          setAssignments(publishedAssignments);
          console.log('📝 Published assignments loaded:', publishedAssignments.length);
        }
      } else {
        console.log('No assignments found or error fetching assignments');
        setAssignments([]);
      }
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setAssignments([]);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (response.status === 404) {
        setError('Course not found');
        return;
      }

      const data: ApiCourseResponse = await response.json();

      if (data.success && data.course) {
        const courseDetails: CourseDetails = {
          id: data.course.id,
          title: data.course.title,
          code: data.course.code,
          subject: data.course.subject || 'General',
          description: data.course.description,
          teacherId: data.course.instructor_id,
          students: data.course.enrolledStudents?.map(s => s.id) || [],
          isActive: data.course.isActive,
          startDate: new Date(),
          endDate: new Date(),
          createdAt: new Date(data.course.createdAt),
          maxStudents: data.course.maxStudents,
          credits: data.course.credits,
          currentEnrollment: data.course.currentEnrollment || 0,
          instructor: {
            name: data.course.teacher ?
              `${data.course.teacher.firstName} ${data.course.teacher.lastName}` :
              'Unknown',
            email: data.course.teacher?.email || ''
          },
          sections: []
        };

        setCourse(courseDetails);
        await fetchAssignments(data.course.id);
      } else {
        setError(data.message || 'Failed to fetch course details');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const refetch = () => {
    fetchCourseDetails();
  };

  return {
    course,
    assignments,
    loading,
    error,
    refetch
  };
};