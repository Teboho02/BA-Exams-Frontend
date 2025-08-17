import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import CourseForm from '../../components/teacher/CourseForm';
import type { Course } from '../../types/teacher.types';
import './TeacherCourses.css';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../config/api';
interface ApiCourse {
  id: string;
  title: string;
  code: string;
  subject?: string;
  description: string;
  teacher: string;
  isActive: boolean;
  modules: any[];
  createdAt: string;
  updatedAt: string;
  maxStudents?: number;
  credits?: number;
  currentEnrollment?: number;
  enrolledStudents?: any[];
}

interface ApiResponse {
  success: boolean;
  message?: string;
  courses?: ApiCourse[];
  course?: ApiCourse;
  count?: number;
}

const TeacherCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [creating, setCreating] = useState(false);
  
  // Enrollment state
  const [enrollModal, setEnrollModal] = useState<{ 
    courseId: string | null; 
    isOpen: boolean 
  }>({ 
    courseId: null, 
    isOpen: false 
  });
  const [emailInput, setEmailInput] = useState('');
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(API_BASE_URL+'/api/courses', {
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

      const data: ApiResponse = await response.json();

      if (data.success && data.courses) {
        const transformedCourses: Course[] = data.courses.map((apiCourse: ApiCourse) => ({
          id: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description,
          code: apiCourse.code,
          subject: apiCourse.subject || 'General',
          teacherId: apiCourse.teacher,
          students: apiCourse.enrolledStudents?.map(s => s.id) || [],
          isActive: apiCourse.isActive,
          startDate: new Date(),
          endDate: new Date(), 
          createdAt: new Date(apiCourse.createdAt),
          maxStudents: apiCourse.maxStudents,
          credits: apiCourse.credits,
          currentEnrollment: apiCourse.currentEnrollment || 0
        }));

        setCourses(transformedCourses);
      } else {
        setError(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Create new course
  const handleCreateCourse = async (courseData: Omit<Course, 'id' | 'teacherId' | 'students' | 'createdAt'>) => {
    try {
      setCreating(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare data for API
      const apiCourseData = {
        title: courseData.title,
        code: courseData.code,
        subject: courseData.subject,
        description: courseData.description,
        maxStudents: courseData.maxStudents || 50,
        credits: courseData.credits || 3,
        startDate: courseData.startDate?.toISOString(),
        endDate: courseData.endDate?.toISOString(),
      };

      const response = await fetch(API_BASE_URL+'/api/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiCourseData),
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data: ApiResponse = await response.json();

      if (data.success && data.course) {
        const newCourse: Course = {
          id: data.course.id,
          title: data.course.title,
          description: data.course.description,
          code: data.course.code,
          subject: data.course.subject || 'General',
          teacherId: data.course.teacher,
          students: [],
          isActive: data.course.isActive,
          startDate: courseData.startDate || new Date(),
          endDate: courseData.endDate || new Date(),
          createdAt: new Date(data.course.createdAt),
          maxStudents: data.course.maxStudents,
          credits: data.course.credits,
          currentEnrollment: 0
        };

        setCourses(prev => [newCourse, ...prev]);
        setShowForm(false);
        console.log('Course created successfully!');
      } else {
        setError(data.message || 'Failed to create course');
      }
    } catch (err) {
      console.error('Error creating course:', err);
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Enroll student by email
  const handleEnrollStudent = async (courseId: string, email: string) => {
    try {
      setEnrollmentError('');
      setEnrollmentLoading(true);
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      const data = await response.json();

      if (data.success) {
        fetchCourses(); // Refresh course data
        setEnrollModal({ courseId: null, isOpen: false });
        setEmailInput('');
      } else {
        setEnrollmentError(data.message || 'Failed to enroll student');
      }
    } catch (err) {
      console.error('Error enrolling student:', err);
      setEnrollmentError('Network error. Please try again.');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Load courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Retry function for error states
  const handleRetry = () => {
    fetchCourses();
  };

  if (loading) {
    return (
      <Layout role="teacher">
        <div className="teacher-courses-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your courses...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="teacher">
      <div className="teacher-courses-page">
        <div className="page-header">
          <h1>My Courses</h1>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(true)}
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create New Course'}
          </button>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={handleRetry} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {showForm && (
          <div className="form-modal">
            <div className="modal-content">
              <CourseForm
                onSubmit={handleCreateCourse}
                onCancel={() => setShowForm(false)}
                isLoading={creating}
              />
            </div>
          </div>
        )}

        {/* Enrollment Modal */}
        {enrollModal.isOpen && (
          <div className="modal">
            <div className="modal-content">
              <h3>Enroll Student by Email</h3>
              <p>Enter the student's email address:</p>
              <input 
                type="email" 
                value={emailInput} 
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="student@example.com"
                disabled={enrollmentLoading}
              />
              {enrollmentError && (
                <p className="error-text">{enrollmentError}</p>
              )}
              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setEnrollModal({ courseId: null, isOpen: false });
                    setEnrollmentError('');
                  }} 
                  disabled={enrollmentLoading}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleEnrollStudent(enrollModal.courseId!, emailInput)}
                  disabled={enrollmentLoading || !emailInput}
                  className="btn-primary"
                >
                  {enrollmentLoading ? 'Enrolling...' : 'Enroll'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="courses-grid">
          {courses.map(course => (
            <div 
              key={course.id} 
              className="course-card clickable"
              onClick={() => handleCourseClick(course.id)}
            >
              <div className="course-header">
                <h3>{course.title}</h3>
                <span className={`status ${course.isActive ? 'active' : 'inactive'}`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="course-code">{course.code}</p>
              <p className="course-description">{course.description}</p>
              <div className="course-meta">
                <span>👥 {course.currentEnrollment || course.students.length} students</span>
                <span>📚 {course.subject}</span>
                {course.maxStudents && (
                  <span>🎯 Max: {course.maxStudents}</span>
                )}
                {course.credits && (
                  <span>⭐ {course.credits} credits</span>
                )}
              </div>
              <div className="course-dates">
                <span>📅 Start: {course.startDate.toLocaleDateString()}</span>
                <span>🏁 End: {course.endDate.toLocaleDateString()}</span>
              </div>
              
              {/* Enrollment Button */}
              <div className="course-footer">
                <button 
                  className="enroll-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnrollModal({ courseId: course.id, isOpen: true });
                  }}
                >
                  Enroll Student
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && !loading && !error && (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses created yet</h3>
            <p>Start by creating your first course to manage your students and content.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Create Your First Course
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherCourses;