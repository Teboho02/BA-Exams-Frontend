import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import './TeacherCoursePage.css';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../config/api';


interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  due_date: string | null;
  max_points: number;
  is_published: boolean;
  submission_type: string;
  assignment_type: string;
  assignment_group: string;
  grading_type: string;
  available_from: string | null;
  available_until: string | null;
  allowed_attempts: number;
  has_time_limit: boolean;
  time_limit_minutes: number | null;
  created_at: string;
  updated_at: string;
  submission_count: number;
}

interface CourseInfo {
  id: string;
  title: string;
}

interface ApiResponse {
  success: boolean;
  assignments: Assignment[];
  count: number;
  course: CourseInfo;
}

const TeacherCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStudentView, setIsStudentView] = useState(false);


  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_BASE_URL+`/api/assignments/course/${courseId}`, {
          credentials: 'include',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please login again.');
          }
          throw new Error('Failed to fetch assignments');
        }
        
        const data: ApiResponse = await response.json();
        
        if (data.success) {
          setAssignments(data.assignments);
          setCourse(data.course);
        } else {
          throw new Error('Failed to load assignments');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        // If unauthorized, redirect to login
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          // You might want to redirect to login page
          // navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    
    if (!assignment.is_published) {
      return <span className="badge badge-draft">Draft</span>;
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
    
    if (assignment.available_from) {
      const availableFrom = new Date(assignment.available_from);
      if (now < availableFrom) {
        return <span className="badge badge-locked">Not Available Yet</span>;
      }
    }
    
    if (assignment.available_until) {
      const availableUntil = new Date(assignment.available_until);
      if (now > availableUntil) {
        return <span className="badge badge-closed">Closed</span>;
      }
    }
    
    return <span className="badge badge-available">Available</span>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const handleAssignmentClick = (assignment: Assignment) => {
  if (assignment.assignment_type === 'quiz') {
    // Navigate to quiz review page
    navigate(`/teacher/quiz-review/${assignment.id}`);
  } else {
    // Navigate to assignment detail page
    navigate(`/teacher/courses/${courseId}/assignment/${assignment.id}`);
  }
};
  const handleCreateAssignment = () => {
    // Navigate to create assignment page
  navigate(`/teacher/courses/${courseId}/assignments/create`);
  };

  if (loading) {
    return (
      <Layout role="teacher">
        <div className="loading">Loading course assignments...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="teacher">
        <div className="error">Error: {error}</div>
      </Layout>
    );
  }

  return (
    <Layout role="teacher">
      <div className="course-page">
        <div className="course-header">
          <div className="breadcrumbs">
            <span onClick={() => navigate('/teacher/courses')} className="breadcrumb-link">
              My Courses
            </span>
            <span className="breadcrumb-separator">/</span>
            <span>{course?.title || 'Course'}</span>
          </div>
          
          <div className="course-info">
            <div className="course-title-row">
              <div>
                <h1>{course?.title || 'Course'}</h1>
                <p className="course-code">Course ID: {courseId}</p>
              </div>
              <button 
                className={`view-toggle-btn ${isStudentView ? 'student-view' : 'teacher-view'}`}
                onClick={() => setIsStudentView(!isStudentView)}
              >
                {isStudentView ? '👨‍🎓 Student View' : '👨‍🏫 Teacher View'}
              </button>
            </div>
            
            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Total Assignments:</span>
                <span>{assignments.length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Published:</span>
                <span>{assignments.filter(a => a.is_published).length}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Drafts:</span>
                <span>{assignments.filter(a => !a.is_published).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="assignments-section">
          <div className="section-header-row">
            <h2>Assignments & Quizzes</h2>
            {!isStudentView && (
              <button className="create-assignment-btn" onClick={handleCreateAssignment}>
                + Create New Assignment
              </button>
            )}
          </div>
          
          {assignments.length === 0 ? (
            <div className="no-assignments">
              <p>No assignments or quizzes yet.</p>
              {!isStudentView && (
                <button className="create-first-btn" onClick={handleCreateAssignment}>
                  Create your first assignment
                </button>
              )}
            </div>
          ) : (
            <div className="assignments-list">
              {assignments
                .filter(assignment => !isStudentView || assignment.is_published)
                .sort((a, b) => {
                  // Sort by due date (null dates at the end)
                  if (!a.due_date && !b.due_date) return 0;
                  if (!a.due_date) return 1;
                  if (!b.due_date) return -1;
                  return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                })
                .map((assignment) => (
                  <div 
                    key={assignment.id} 
                    className="assignment-card"
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="assignment-icon">
                      {assignment.assignment_type === 'quiz' ? '📝' : '📋'}
                    </div>
                    
                    <div className="assignment-details">
                      <div className="assignment-header">
                        <h3>{assignment.title}</h3>
                        {getStatusBadge(assignment)}
                      </div>
                      
                      {assignment.description && (
                        <p className="assignment-description">{assignment.description}</p>
                      )}
                      
                      <div className="assignment-meta">
                        <div className="meta-row">
                          <span className="meta-label">Type:</span>
                          <span className="meta-value">
                            {assignment.assignment_type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </span>
                        </div>
                        
                        <div className="meta-row">
                          <span className="meta-label">Points:</span>
                          <span className="meta-value">{assignment.max_points}</span>
                        </div>
                        
                        {assignment.due_date && (
                          <div className="meta-row">
                            <span className="meta-label">Due:</span>
                            <span className="meta-value">{formatDate(assignment.due_date)}</span>
                          </div>
                        )}
                        
                        {assignment.available_from && (
                          <div className="meta-row">
                            <span className="meta-label">Available from:</span>
                            <span className="meta-value">{formatDate(assignment.available_from)}</span>
                          </div>
                        )}
                        
                        {assignment.available_until && (
                          <div className="meta-row">
                            <span className="meta-label">Available until:</span>
                            <span className="meta-value">{formatDate(assignment.available_until)}</span>
                          </div>
                        )}
                        
                        {assignment.has_time_limit && assignment.time_limit_minutes && (
                          <div className="meta-row">
                            <span className="meta-label">Time limit:</span>
                            <span className="meta-value">{assignment.time_limit_minutes} minutes</span>
                          </div>
                        )}
                        
                        {assignment.allowed_attempts > 1 && (
                          <div className="meta-row">
                            <span className="meta-label">Attempts allowed:</span>
                            <span className="meta-value">{assignment.allowed_attempts}</span>
                          </div>
                        )}
                        
                        {!isStudentView && (
                          <div className="meta-row">
                            <span className="meta-label">Submissions:</span>
                            <span className="meta-value">{assignment.submission_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!isStudentView && (
                      <div className="assignment-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/teacher/courses/${courseId}/assignment/${assignment.id}/edit`);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        {!assignment.is_published && (
                          <button 
                            className="action-btn publish-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Handle publish action
                              console.log('Publishing assignment:', assignment.id);
                              fetch(`${API_BASE_URL}/api/assignments/${assignment.id}/publish`, {
                                credentials: 'include',
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                }
                              })
                                .then(res => res.json())
                                .then(data => {
                                  if (data.success) {
                                    setAssignments(prev => 
                                      prev.map(a => a.id === assignment.id ? { ...a, is_published: true } : a)
                                    );
                                  } else {
                                    alert('Failed to publish assignment');
                                  }
                                })
                                .catch(err => console.error('Error publishing assignment:', err));

                              
                            }}
                          >
                            📤 Publish
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherCoursePage;