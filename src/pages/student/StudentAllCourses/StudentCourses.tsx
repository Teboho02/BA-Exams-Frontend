import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { useNavigate } from 'react-router-dom';
import CourseRegistrationModal from './CourseRegistrationModal';
import './StudentCourses.css';
import { API_BASE_URL } from '../../../config/api';

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

interface RegistrationRequest {
  id: string;
  courseCode: string;
  courseTitle: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  notes?: string;
  rejectionReason?: string;
  course?: {
    id: string;
    title: string;
    code: string;
    subject: string;
    teacher?: {
      firstName: string;
      lastName: string;
    };
  };
}

interface ApiResponse {
  success: boolean;
  count: number;
  enrollments: EnrolledCourse[];
  message?: string;
}

interface RequestsResponse {
  success: boolean;
  count: number;
  requests: RegistrationRequest[];
  message?: string;
}

const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'requests'>('courses');
  const [filter, _setFilter] = useState({
    status: 'active' as 'active' | 'dropped' | 'completed' | 'suspended' | 'all',
    subject: ''
  });
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const navigate = useNavigate();

  // Get unique subjects for filter dropdown
  const uniqueSubjects = Array.from(new Set(courses.map(enrollment => enrollment.course.subject)));

  console.log('Unique Subjects:', uniqueSubjects);
  
  const fetchEnrolledCourses = async () => {
    try {
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
      const apiBase = API_BASE_URL;
      const url = `${apiBase}/api/courses/user/enrollments${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });


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
    }
  };

  const fetchRegistrationRequests = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/courses/my-requests`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('accessToken');
        throw new Error('Authentication expired. Please login again.');
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to fetch requests: ${response.status}`);
        } else {
          throw new Error(`Route not found: ${response.status}`);
        }
      }

      const data: RequestsResponse = await response.json();

      if (data.success) {
        setRequests(data.requests);
      } else {
        throw new Error(data.message || 'Failed to fetch registration requests');
      }
    } catch (err) {
   //   const errorMessage = err instanceof Error ? err.message : 'An error occurred fetching requests';
      console.error('Error fetching registration requests:', err);
      // Don't set global error for requests, just log it
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchEnrolledCourses(),
      fetchRegistrationRequests()
    ]);
    setLoading(false);
  };

  const handleRegistrationSuccess = () => {
    console.log('Registration request submitted successfully');
    // Refresh the requests to show the new one
    fetchRegistrationRequests();
    // Switch to requests tab to show the new request
    setActiveTab('requests');
  };

  useEffect(() => {
    fetchData();
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

  const pendingRequests = requests.filter(req => req.status === 'pending');

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
              onClick={fetchData}
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
            <h1 className="page-title" style={{margin:10}}>My Courses</h1>
            <p className="course-count" style={{margin:10}}>
              {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
              {pendingRequests.length > 0 && (
                <span className="pending-count">
                  • {pendingRequests.length} request{pendingRequests.length !== 1 ? 's' : ''} pending
                </span>
              )}
            </p>
          </div>
          <button
            className="register-btn"
            onClick={() => setIsRegistrationModalOpen(true)}
          >
            + Register for Course
          </button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            My Courses ({courses.length})
          </button>
          <button
            className={`tab ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Registration Requests ({requests.length})
            {pendingRequests.length > 0 && (
              <span className="pending-badge">{pendingRequests.length}</span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'courses' ? (
          // Courses Grid
          filteredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3 className="empty-title">No courses found</h3>
              <p className="empty-message">
                {courses.length === 0
                  ? "You're not enrolled in any courses yet. Click 'Register for Course' to get started!"
                  : "No courses match your current filters."}
              </p>
              {courses.length === 0 && (
                <button
                  className="empty-action-btn"
                  onClick={() => setIsRegistrationModalOpen(true)}
                >
                  Register for Your First Course
                </button>
              )}
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
                    {(enrollment.grade || enrollment.finalScore) && (
                      <div className="grade-info">
                        {enrollment.grade && (
                          <p className="grade-text">
                            <span className="grade-label">Grade:</span> {enrollment.grade}
                          </p>
                        )}
                        {enrollment.finalScore && (
                          <p className="score-text">
                            <span className="score-label">Score:</span> {enrollment.finalScore}%
                          </p>
                        )}
                      </div>
                    )}

                    {/* Enrollment Date */}
                    <div className="enrollment-info">
                      <p className="enrollment-date">
                        <span className="enrollment-label">Enrolled:</span>{' '}
                        {formatDate(enrollment.enrolledAt)}
                      </p>
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
          )
        ) : (
          // Registration Requests
          requests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No registration requests</h3>
              <p className="empty-message">
                You haven't submitted any course registration requests yet.
              </p>
              <button
                className="empty-action-btn"
                onClick={() => setIsRegistrationModalOpen(true)}
              >
                Submit Your First Request
              </button>
            </div>
          ) : (
            <div className="requests-grid">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="request-card"
                >
                  <div className="request-content">
                    {/* Request Header */}
                    <div className="request-header">
                      <div className="request-info">
                        <h3 className="request-title">
                          {request.courseTitle || `Course ${request.courseCode}`}
                        </h3>
                        <p className="request-code">
                          {request.courseCode}
                          {request.course?.subject && ` • ${request.course.subject}`}
                        </p>
                      </div>
                      <span className={`status-badge status-${request.status}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    {/* Teacher Info */}
                    {request.course?.teacher && (
                      <div className="teacher-info">
                        <p className="teacher-text">
                          <span className="teacher-label">Instructor:</span>{' '}
                          {request.course.teacher.firstName} {request.course.teacher.lastName}
                        </p>
                      </div>
                    )}

                    {/* Request Status Info */}
                    <div className="request-status-info">
                      <p className="request-date">
                        <span className="date-label">Requested:</span>{' '}
                        {formatDate(request.requestedAt)}
                      </p>
                      {request.processedAt && (
                        <p className="processed-date">
                          <span className="date-label">Processed:</span>{' '}
                          {formatDate(request.processedAt)}
                        </p>
                      )}
                    </div>

                    {/* Notes or Rejection Reason */}
                    {request.rejectionReason && (
                      <div className="rejection-reason">
                        <p className="rejection-text">
                          <span className="rejection-label">Reason:</span>{' '}
                          {request.rejectionReason}
                        </p>
                      </div>
                    )}
                    {request.notes && !request.rejectionReason && (
                      <div className="request-notes">
                        <p className="notes-text">
                          <span className="notes-label">Notes:</span>{' '}
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {request.status === 'approved' && (
                      <div className="request-actions">
                        <p className="approval-message">
                          ✅ Request approved! Check your courses tab.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Course Registration Modal */}
        <CourseRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
          onSuccess={handleRegistrationSuccess}
        />
      </div>
    </Layout>
  );
};

export default StudentCourses;