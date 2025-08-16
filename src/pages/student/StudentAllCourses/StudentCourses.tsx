import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useNavigate } from 'react-router-dom';
import './StudentCourses.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types based on your API response structure
interface EnrolledCourse {
  enrollmentId: string;
  enrolledAt: string;
  enrollmentStatus: 'active' | 'dropped' | 'completed' | 'suspended';
  grade?: string;
  finalScore?: number;
  notes?: string;
  course: {
    id: string;
    title: string;
    code: string;
    subject: string;
    description: string;
    isActive: boolean;
    modules: any[];
    createdAt: string;
    updatedAt: string;
    teacher: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  };
}

interface ApiResponse {
  success: boolean;
  count: number;
  enrollments: EnrolledCourse[];
  message?: string;
}

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'active' as 'active' | 'dropped' | 'completed' | 'suspended' | 'all',
    subject: ''
  });

  const navigate = useNavigate();

  // Get unique subjects for filter dropdown
  const uniqueSubjects = Array.from(new Set(courses.map(enrollment => enrollment.course.subject)));

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (filter.status !== 'all') {
        params.append('status', filter.status);
      }
      if (filter.subject) {
        params.append('subject', filter.subject);
      }

      const queryString = params.toString();

      // Dynamic API URL based on environment
      // const getApiBaseUrl = () => {
      //   // In development, detect ports
      //   if (window.location.hostname === 'localhost') {
      //     const currentPort = window.location.port;

      //     // If React is on 5173 (Vite), API is on 3000
      //     if (currentPort === '5173') {
      //       return 'http://localhost:3000';
      //     }
      //     // If React is on 3001, API is on 3000
      //     if (currentPort === '3001') {
      //       return 'http://localhost:3000';
      //     }
      //     // Default fallback to API on 3000
      //     return 'http://localhost:3000';
      //   }
      //   // In production, assume API is on same domain
      //   return '';
      // };

      const apiBase = API_BASE_URL;
      const url = `${apiBase}/api/courses/user/enrollments${queryString ? `?${queryString}` : ''}`;

      console.log('Fetching from URL:', url);

      // Get token from localStorage - using accessToken
      const token = localStorage.getItem('accessToken');

      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');

      // if (!token) {
      //   throw new Error('No authentication token found. Please login again.');
      // }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('accessToken');
        throw new Error('Authentication expired. Please login again.');
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch courses: ${response.status}`);
        } else {
          throw new Error(`Route not found or authentication failed: ${response.status}`);
        }
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned HTML instead of JSON. Check if the API route exists.');
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setCourses(data.enrollments);
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching enrolled courses:', err);

      // If it's an auth error, you might want to redirect to login
      if (errorMessage.includes('Authentication') || errorMessage.includes('login')) {
        // Uncomment this if you have a login redirect function
        // redirectToLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrolledCourses();
  }, [filter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredCourses = courses.filter(enrollment => {
    const matchesStatus = filter.status === 'all' || enrollment.enrollmentStatus === filter.status;
    const matchesSubject = !filter.subject || enrollment.course.subject === filter.subject;
    return matchesStatus && matchesSubject;
  });

  if (loading) {
    return (
      <Layout role="student">
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="student">
        <div className="error-container">
          <div className="error-content">
            <h3 className="error-title">Error Loading Courses</h3>
            <p className="error-message">{error}</p>
            <button
              onClick={fetchEnrolledCourses}
              className="error-retry-btn"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="student-courses-container">
        {/* Header */}
        <div className="header">
          <div className="header-info">
            <h1 className="page-title">My Courses</h1>
            <p className="course-count">
              {courses.length} course{courses.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={fetchEnrolledCourses}
            className="refresh-btn"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="filters-container">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">
                Status
              </label>
              <select
                id="status-filter"
                value={filter.status}
                onChange={(e) => setFilter(prev => ({
                  ...prev,
                  status: e.target.value as typeof filter.status
                }))}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="subject-filter" className="filter-label">
                Subject
              </label>
              <select
                id="subject-filter"
                value={filter.subject}
                onChange={(e) => setFilter(prev => ({ ...prev, subject: e.target.value }))}
                className="filter-select"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3 className="empty-title">No courses found</h3>
            <p className="empty-message">
              {courses.length === 0
                ? "You're not enrolled in any courses yet."
                : "No courses match your current filters."}
            </p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((enrollment) => (
              <div
                key={enrollment.enrollmentId}
                className="course-card"
              >
                <div className="course-content">
                  {/* Course Header */}
                  <div className="course-header">
                    <div className="course-info">
                      <h3 className="course-title">
                        {enrollment.course.title}
                      </h3>
                      <p className="course-code">
                        {enrollment.course.code} • {enrollment.course.subject}
                      </p>
                    </div>
                    <span className={`status-badge status-${enrollment.enrollmentStatus}`}>
                      {enrollment.enrollmentStatus.charAt(0).toUpperCase() + enrollment.enrollmentStatus.slice(1)}
                    </span>
                  </div>

                  {/* Course Description */}
                  {enrollment.course.description && (
                    <p className="course-description">
                      {enrollment.course.description}
                    </p>
                  )}

                  {/* Teacher Info */}
                  {enrollment.course.teacher && (
                    <div className="teacher-info">
                      <p className="teacher-text">
                        <span className="teacher-label">Instructor:</span>{' '}
                        {enrollment.course.teacher.firstName} {enrollment.course.teacher.lastName}
                      </p>
                    </div>
                  )}

                  {/* Grade Info */}
                  {(enrollment.grade || enrollment.finalScore !== undefined) && (
                    <div className="grade-info">
                      <div className="grade-content">
                        {enrollment.grade && (
                          <span className="grade-text">
                            Grade: {enrollment.grade}
                          </span>
                        )}
                        {enrollment.finalScore !== undefined && (
                          <span className="score-text">
                            Score: {enrollment.finalScore}%
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Enrollment Date */}
                  <div className="enrollment-date">
                    Enrolled: {formatDate(enrollment.enrolledAt)}
                  </div>

                  {/* Actions */}
                  <div className="course-actions">
                    <button
                      className="primary-btn"
                      onClick={() => navigate(`/student/courses/${enrollment.course.id}`)}
                    >
                      View Course
                    </button>
                    {enrollment.course.modules.length > 0 && (
                      <button className="secondary-btn">
                        Modules ({enrollment.course.modules.length})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCourses;