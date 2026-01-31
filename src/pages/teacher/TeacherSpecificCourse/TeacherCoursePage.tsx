import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import './TeacherCoursePage.css';
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

interface RegistrationLink {
  id: string;
  token: string;
  url: string;
  isUsed: boolean;
  expiresAt: string;
  maxUses: number;
  currentUses: number;
  notes?: string;
  createdAt: string;
  usedAt?: string;
  usedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  isExpired: boolean;
  isValid: boolean;
}

interface ApiResponse {
  success: boolean;
  assignments: Assignment[];
  count: number;
  course: CourseInfo;
}

interface RegistrationLinksResponse {
  success: boolean;
  links: RegistrationLink[];
  count: number;
}

interface LinkOptions {
  expiresInDays: number;
  maxUses: number;
  notes: string;
}

const TeacherCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStudentView, setIsStudentView] = useState(false);
  
  // Registration links state
  const [registrationLinks, setRegistrationLinks] = useState<RegistrationLink[]>([]);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [linkOptions, setLinkOptions] = useState<LinkOptions>({
    expiresInDays: 7,
    maxUses: 1,
    notes: ''
  });
  const [generatingLinks, setGeneratingLinks] = useState(false);
  const [showLinksView, setShowLinksView] = useState(false);

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

  const fetchRegistrationLinks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/registration-links`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch registration links');
      }
      
      const data: RegistrationLinksResponse = await response.json();
      if (data.success) {
        setRegistrationLinks(data.links || []);
      }
    } catch (err) {
      console.error('Error fetching registration links:', err);
      setError('Failed to load registration links');
    }
  };

  const generateRegistrationLink = async () => {
    if (linkOptions.expiresInDays < 1 || linkOptions.expiresInDays > 365) {
      alert('Expiration must be between 1 and 365 days');
      return;
    }

    if (linkOptions.maxUses < 1 || linkOptions.maxUses > 1000) {
      alert('Max uses must be between 1 and 1000');
      return;
    }

    setGeneratingLinks(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/registration-links`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(linkOptions)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create registration link');
      }

      const data = await response.json();
      if (data.success) {
        setShowRegistrationModal(false);
        setLinkOptions({ expiresInDays: 7, maxUses: 1, notes: '' });
        setShowLinksView(true);
        // Refresh the links list
        await fetchRegistrationLinks();
        alert('Registration link created successfully!');
      }
    } catch (err) {
      console.error('Error generating registration link:', err);
      alert(err instanceof Error ? err.message : 'Failed to create registration link');
    } finally {
      setGeneratingLinks(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
      alert('Failed to copy link');
    });
  };

  // Load registration links when needed
  useEffect(() => {
    if (courseId && showLinksView) {
      fetchRegistrationLinks();
    }
  }, [courseId, showLinksView]);

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
      navigate(`/teacher/quiz-review/${assignment.id}`);
    } else {
      navigate(`/teacher/courses/${courseId}/assignment/${assignment.id}`);
    }
  };

  const handleCreateAssignment = () => {
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
              <div className="course-controls">
                <button 
                  className={`view-toggle-btn ${isStudentView ? 'student-view' : 'teacher-view'}`}
                  onClick={() => setIsStudentView(!isStudentView)}
                >
                  {isStudentView ? 'Student View' : 'Teacher View'}
                </button>
              </div>
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

        {/* Registration Management Section */}
        {!isStudentView && (
          <div className="enrollment-section">
   

            {/* Registration Links View */}
            {showLinksView && (
              <div className="enrollment-links-container">
                {registrationLinks.length === 0 ? (
                  <p>No registration links generated yet.</p>
                ) : (
                  <div className="enrollment-links-list">
                    <div className="links-summary">
                      <span>Total: {registrationLinks.length} | </span>
                      <span>Used: {registrationLinks.filter(l => l.currentUses >= l.maxUses).length} | </span>
                      <span>Available: {registrationLinks.filter(l => l.isValid).length} | </span>
                      <span>Expired: {registrationLinks.filter(l => l.isExpired).length}</span>
                    </div>
                    {registrationLinks.map((link) => (
                      <div key={link.id} className={`enrollment-link-item ${
                        link.isExpired ? 'expired' : 
                        link.currentUses >= link.maxUses ? 'used' : 
                        'available'
                      }`}>
                        <div className="link-info">
                          <div className="link-url">
                            <code>{link.url}</code>
                          </div>
                          <div className="link-meta">
                            <span>Created: {formatDate(link.createdAt)}</span>
                            <span>Expires: {formatDate(link.expiresAt)}</span>
                            <span>Uses: {link.currentUses}/{link.maxUses}</span>
                            {link.notes && <span>Notes: {link.notes}</span>}
                            {link.isExpired && <span className="status-expired">Expired</span>}
                            {!link.isExpired && link.currentUses >= link.maxUses && (
                              <span className="status-used">Fully Used</span>
                            )}
                            {link.isValid && <span className="status-available">Available</span>}
                            {link.usedBy && (
                              <span>Used by: {link.usedBy.firstName} {link.usedBy.lastName} ({link.usedBy.email})</span>
                            )}
                          </div>
                        </div>
                        <div className="link-actions">
                          {link.isValid && (
                            <button
                              className="action-btn copy-btn"
                              onClick={() => copyToClipboard(link.url)}
                            >
                              Copy
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
                          Edit
                        </button>
                        {!assignment.is_published && (
                          <button 
                            className="action-btn publish-btn"
                            onClick={(e) => {
                              e.stopPropagation();
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
                            Publish
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Registration Link Generation Modal */}
        {showRegistrationModal && (
          <div className="modal-overlay" onClick={() => setShowRegistrationModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Generate Registration Link</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowRegistrationModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="modal-body">
                <p>Create a registration link for students to join this course.</p>
                
                <div className="form-group">
                  <label htmlFor="expiresInDays">Expires in (days):</label>
                  <input
                    type="number"
                    id="expiresInDays"
                    min="1"
                    max="365"
                    value={linkOptions.expiresInDays}
                    onChange={(e) => setLinkOptions({
                      ...linkOptions, 
                      expiresInDays: parseInt(e.target.value) || 1
                    })}
                  />
                  <small>1-365 days</small>
                </div>

                <div className="form-group">
                  <label htmlFor="maxUses">Maximum uses:</label>
                  <input
                    type="number"
                    id="maxUses"
                    min="1"
                    max="1000"
                    value={linkOptions.maxUses}
                    onChange={(e) => setLinkOptions({
                      ...linkOptions, 
                      maxUses: parseInt(e.target.value) || 1
                    })}
                  />
                  <small>1-1000 uses (1 = single-use link)</small>
                </div>

              </div>
              
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowRegistrationModal(false)}
                  disabled={generatingLinks}
                >
                  Cancel
                </button>
                <button
                  className="btn-generate"
                  onClick={generateRegistrationLink}
                  disabled={generatingLinks}
                >
                  {generatingLinks ? 'Generating...' : 'Generate Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherCoursePage;