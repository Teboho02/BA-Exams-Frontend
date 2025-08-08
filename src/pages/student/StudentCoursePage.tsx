import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import type { CourseDetails, CourseContent } from '../../types/teacher.types';
import './StudentCoursesPage.css';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ContentViewer {
  isOpen: boolean;
  content: CourseContent | null;
  type: 'pdf' | 'video' | null;
}

interface Assignment {
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

const StudentCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
//  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [contentViewer, setContentViewer] = useState<ContentViewer>({
    isOpen: false,
    content: null,
    type: null
  });

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch assignments for the course
  const fetchAssignments = async (courseId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/assignments/course/${courseId}`, {
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
          // Only show published assignments to students
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

  // Fetch course details from API
  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/courses/${courseId}`, {
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

      console.log('🔍 API Response received:', data);
      console.log('📋 Course data:', data.course);

      if (data.success && data.course) {
        // Transform API response to CourseDetails
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

        // Fetch assignments for this course
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

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      content: null,
      type: null
    });
  };

  const getAssignmentIcon = (assignment: Assignment) => {
    switch (assignment.assignment_type) {
      case 'quiz': return '📝';
      case 'discussion': return '💬';
      case 'external_tool': return '🔗';
      default: return '📋';
    }
  };

  const getAssignmentStatusBadge = (assignment: Assignment) => {
    const now = new Date();

    if (!assignment.is_published) {
      return <span className="badge badge-locked">Not Available</span>;
    }

    if (assignment.due_date) {
      const dueDate = new Date(assignment.due_date);
      if (now > dueDate) {
        return <span className="badge badge-overdue">Past Due</span>;
      } else {
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 3) {
          return <span className="badge badge-urgent">Due Soon</span>;
        }
        return <span className="badge badge-upcoming">Upcoming</span>;
      }
    }

    return <span className="badge badge-available">Available</span>;
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    // Handle different assignment types for students
    console.log('Opening assignment:', assignment);
    
    if (assignment.assignment_type === 'quiz') {
      // Navigate to StudentQuizView page which shows quiz overview
      navigate(`/student/quizAttempt/${assignment.id}`);

    } else {
      // For other assignments, navigate to assignment details
      navigate(`/student/quizAttempt/${assignment.id}`);
    }
  };

  const handleRetry = () => {
    fetchCourseDetails();
  };

  if (loading) {
    return (
      <Layout role="student">
        <div className="course-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading course details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="student">
        <div className="course-page">
          <div className="error-container">
            <h2>Error Loading Course</h2>
            <p>{error}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => navigate('/student/courses')} className="btn-secondary">
                Back to My Courses
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout role="student">
        <div className="course-page">
          <div className="error-container">
            <h2>Course Not Found</h2>
            <p>The requested course could not be found.</p>
            <button onClick={() => navigate('/student/courses')} className="btn-primary">
              Back to My Courses
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="course-page">
        <div className="course-header">
          <div className="breadcrumbs">
            <span onClick={() => navigate('/student/courses')} className="breadcrumb-link">
              My Courses
            </span>
            <span className="breadcrumb-separator">/</span>
            <span>{course.code}</span>
          </div>

          <div className="course-info">
            <div className="course-title-row">
              <div>
                <h1>{course.title}</h1>
                <p className="course-code">{course.code}</p>
              </div>
            </div>
            <p className="course-description">{course.description}</p>

            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Instructor:</span>
                <span>{course.instructor.name}</span>
              </div>
              {course.credits && (
                <div className="meta-item">
                  <span className="meta-label">Credits:</span>
                  <span>{course.credits}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Duration:</span>
                <span>
                  {course.startDate.toLocaleDateString()} - {course.endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Status:</span>
                <span className={`status ${course.isActive ? 'active' : 'inactive'}`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Single Tab for Course Content */}
        <div className="course-tabs">
          <button className="tab active">
            📚 Course Content
          </button>
        </div>

        {/* Course Content */}
        <div className="course-timeline">
          <div className="timeline-header">
            <h2>Course Content</h2>
          </div>

          {/* Assignments Section */}
          <div className="assignments-section">
            <div className="section-header">
              <h3>📋 Assignments ({assignments.length})</h3>
            </div>

            {assignments.length === 0 ? (
              <div className="empty-assignments">
                <div className="empty-icon">📝</div>
                <h4>No assignments available</h4>
                <p>Your instructor hasn't published any assignments yet. Check back later.</p>
              </div>
            ) : (
              <div className="assignments-list">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="assignment-item"
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="assignment-icon">
                      {getAssignmentIcon(assignment)}
                    </div>
                    <div className="assignment-details">
                      <h4>{assignment.title}</h4>
                      {assignment.description && (
                        <p className="assignment-description">{assignment.description}</p>
                      )}
                      <div className="assignment-meta">
                        <span className="assignment-points">
                          {assignment.max_points} points
                        </span>
                        <span className="assignment-type">
                          {assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)}
                        </span>
                        {assignment.due_date && (
                          <span className="assignment-due-date">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="assignment-status">
                      {getAssignmentStatusBadge(assignment)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Viewer Modal */}
        {contentViewer.isOpen && contentViewer.content && (
          <div className="content-viewer-modal" onClick={closeContentViewer}>
            <div className="content-viewer" onClick={(e) => e.stopPropagation()}>
              <div className="viewer-header">
                <h3>{contentViewer.content.title}</h3>
                <button className="close-btn" onClick={closeContentViewer}>✕</button>
              </div>
              <div className="viewer-body">
                {contentViewer.type === 'pdf' && contentViewer.content.file && (
                  <iframe
                    src={contentViewer.content.file}
                    className="pdf-viewer"
                    title={contentViewer.content.title}
                  />
                )}
                {contentViewer.type === 'video' && contentViewer.content.link && (
                  <video
                    src={contentViewer.content.link}
                    className="video-player"
                    controls
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentCoursePage;