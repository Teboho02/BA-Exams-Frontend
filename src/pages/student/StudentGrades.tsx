import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  FileText, 
  ChevronRight, 
  Eye, 
  ArrowLeft,
  Target,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Layout from '../../components/Layout';
import './StudentGrades.css';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


// Define interfaces for API response
interface ApiCourse {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: {
    name: string;
    email: string;
  };
  enrolledAt: string;
  enrollmentStatus: string;
  finalScore: number | null;
  grade: string | null;
}

interface ApiAssessment {
  id: string;
  title: string;
  description: string;
  type: string;
  maxPoints: number;
  dueDate: string | null;
  createdAt: string;
}

interface ApiMarks {
  bestScore: number | null;
  latestScore: number | null;
  percentage: number | null;
  totalAttempts: number;
  status: string;
  lastSubmittedAt: string | null;
  lastGradedAt: string | null;
  feedback: string | null;
}

interface ApiCourseData {
  course: ApiCourse;
  assessments: {
    assessment: ApiAssessment;
    marks: ApiMarks;
    allAttempts: any[];
  }[];
  summary: {
    totalAssessments: number;
    completedAssessments: number;
    pendingAssessments: number;
    notSubmittedAssessments: number;
    averageScore: number;
  };
}

interface ApiOverallStats {
  totalCourses: number;
  totalAssessments: number;
  totalCompletedAssessments: number;
  overallAverage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  courses: ApiCourseData[];
  overallStats: ApiOverallStats;
  timestamp: string;
}

// Existing interfaces remain the same
interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: {
    name: string;
    email: string;
  };
  totalPoints: number;
  earnedPoints: number;
  averageGrade: number;
  letterGrade: string;
  enrollmentDate: string;
  completedAssignments: number;
  totalAssignments: number;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  assignmentType: 'quiz' | 'assignment' | 'exam' | 'discussion';
  maxPoints: number;
  earnedPoints: number | null;
  submittedAt: string | null;
  gradedAt: string | null;
  dueDate: string | null;
  status: 'completed' | 'graded' | 'pending' | 'missing' | 'submitted';
  feedback?: string;
  attemptNumber?: number;
  timeSpent?: number;
  percentage: number | null;
}

interface GradeStats {
  totalCourses: number;
  overallGPA: number;
  completedAssignments: number;
  totalAssignments: number;
  averagePercentage: number;
}

// Helper function to calculate letter grade
const getLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
};

// Helper function to calculate GPA from percentage
const getGPAFromPercentage = (percentage: number): number => {
  if (percentage >= 90) return 4.0;
  if (percentage >= 80) return 3.0;
  if (percentage >= 70) return 2.0;
  if (percentage >= 60) return 1.0;
  return 0.0;
};

const StudentGrades: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseAssignments, setCourseAssignments] = useState<Assignment[]>([]);
  const [gradeStats, setGradeStats] = useState<GradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [view, setView] = useState<'overview' | 'course-detail'>('overview');
  const [allCourseData, setAllCourseData] = useState<ApiCourseData[]>([]);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch student courses with grades
  const fetchStudentGrades = async () => {
    try {
      setLoading(true);
      setError('');

      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching grades from API...'); // Debug log

      const response = await fetch(API_BASE_URL+'/api/quiz/all-data', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response status:', response.status); // Debug log

      if (response.status === 401) {
        localStorage.clear();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('API Response data:', data); // Debug log

      if (data.success) {
        // Store all course data for later use
        setAllCourseData(data.courses);
        
        // Map API response to courses
        const mappedCourses = data.courses.map((courseData: ApiCourseData) => {
          const course = courseData.course;
          const summary = courseData.summary;
          
          // Calculate total points
          const totalPoints = courseData.assessments.reduce(
            (sum, a) => sum + a.assessment.maxPoints, 0
          );
          
          // Calculate earned points using latestScore (for submitted but ungraded) or bestScore (for graded)
          const earnedPoints = courseData.assessments.reduce(
            (sum, a) => {
              const score = a.marks.bestScore !== null ? a.marks.bestScore : a.marks.latestScore;
              return sum + (score || 0);
            }, 0
          );
          
          // Calculate average grade percentage
          const averageGrade = totalPoints > 0 
            ? (earnedPoints / totalPoints) * 100 
            : 0;
            
          return {
            id: course.id,
            title: course.title,
            code: course.code,
            description: course.description,
            instructor: {
              name: course.instructor.name || "Instructor",
              email: course.instructor.email
            },
            totalPoints,
            earnedPoints,
            averageGrade,
            letterGrade: getLetterGrade(averageGrade),
            enrollmentDate: course.enrolledAt,
            completedAssignments: summary.completedAssessments + summary.pendingAssessments, // Include submitted assignments
            totalAssignments: summary.totalAssessments
          };
        });

        setCourses(mappedCourses);
        
        // Map grade stats
        const overallStats = data.overallStats;
        let totalEarned = 0;
        let totalMax = 0;
        
        mappedCourses.forEach(course => {
          totalEarned += course.earnedPoints;
          totalMax += course.totalPoints;
        });
        
        const overallAverage = totalMax > 0 
          ? (totalEarned / totalMax) * 100 
          : 0;
          
        setGradeStats({
          totalCourses: overallStats.totalCourses,
          overallGPA: getGPAFromPercentage(overallAverage),
          completedAssignments: overallStats.totalCompletedAssessments,
          totalAssignments: overallStats.totalAssessments,
          averagePercentage: overallAverage
        });

        console.log('Grades loaded successfully:', mappedCourses); // Debug log
      } else {
        console.error('API returned error:', data.message); // Debug log
        setError(data.message || 'Failed to fetch grades');
      }
    } catch (err) {
      console.error('Error fetching grades:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Please check your connection.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Load course assignments when a course is selected
  const loadCourseAssignments = (courseId: string) => {
    const courseData = allCourseData.find(cd => cd.course.id === courseId);
    if (!courseData) {
      setCourseAssignments([]);
      return;
    }

    const assignments: Assignment[] = courseData.assessments.map(assessmentData => {
      const assessment = assessmentData.assessment;
      const marks = assessmentData.marks;
      
      // Use latestScore for submitted but ungraded, bestScore for graded
      const earnedPoints = marks.bestScore !== null ? marks.bestScore : marks.latestScore;
      
      // Calculate percentage
      const percentage = earnedPoints !== null && assessment.maxPoints > 0
        ? (earnedPoints / assessment.maxPoints) * 100
        : null;

      // Determine status based on marks data
      let status: Assignment['status'] = 'missing';
      if (marks.lastGradedAt) {
        status = 'graded';
      } else if (marks.lastSubmittedAt) {
        status = 'submitted';
      } else if (marks.status === 'pending') {
        status = 'pending';
      }

      return {
        id: assessment.id,
        courseId: courseId,
        title: assessment.title,
        description: assessment.description,
        assignmentType: assessment.type as Assignment['assignmentType'],
        maxPoints: assessment.maxPoints,
        earnedPoints,
        submittedAt: marks.lastSubmittedAt,
        gradedAt: marks.lastGradedAt,
        dueDate: assessment.dueDate,
        status,
        feedback: marks.feedback || undefined,
        attemptNumber: marks.totalAttempts,
        percentage
      };
    });

    setCourseAssignments(assignments);
  };

  useEffect(() => {
    fetchStudentGrades();
  }, []);

  const getGradeColor = (percentage: number | null): string => {
    if (percentage === null) return '#6b7280';
    if (percentage >= 90) return '#10b981';
    if (percentage >= 80) return '#22c55e';
    if (percentage >= 70) return '#f59e0b';
    if (percentage >= 60) return '#f97316';
    return '#ef4444';
  };

  const getStatusIcon = (status: Assignment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'graded':
        return <Award size={16} style={{ color: '#3b82f6' }} />;
      case 'submitted':
        return <Clock size={16} style={{ color: '#f59e0b' }} />;
      case 'pending':
        return <Clock size={16} style={{ color: '#f59e0b' }} />;
      case 'missing':
        return <XCircle size={16} style={{ color: '#ef4444' }} />;
      default:
        return <AlertCircle size={16} style={{ color: '#6b7280' }} />;
    }
  };

  const getStatusBadge = (status: Assignment['status']) => {
    const statusStyles = {
      completed: { backgroundColor: '#f0fdf4', color: '#16a34a', borderColor: '#22c55e' },
      graded: { backgroundColor: '#eff6ff', color: '#2563eb', borderColor: '#3b82f6' },
      submitted: { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#f59e0b' },
      pending: { backgroundColor: '#fffbeb', color: '#d97706', borderColor: '#f59e0b' },
      missing: { backgroundColor: '#fef2f2', color: '#dc2626', borderColor: '#ef4444' },
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <span 
        className="status-badge" 
        style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          border: '1px solid',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          ...style
        }}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // const formatTimeSpent = (minutes: number | undefined): string => {
  //   if (!minutes) return 'N/A';
  //   if (minutes < 60) return `${minutes}m`;
  //   const hours = Math.floor(minutes / 60);
  //   const remainingMinutes = minutes % 60;
  //   return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  // };

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    loadCourseAssignments(course.id); // Load assignments for this course
    setView('course-detail');
  };

  const handleReviewAssignment = (assignment: Assignment) => {
    if (assignment.assignmentType === 'quiz') {
      navigate(`/student/quiz/${assignment.id}/review`);
    } else {
      navigate(`/student/assignment/${assignment.id}/review`);
    }
  };

  const handleBackToOverview = () => {
    setView('overview');
    setSelectedCourse(null);
    setCourseAssignments([]);
  };

  if (loading) {
    return (
      <Layout role="student">
        <div className="grades-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your grades...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="student">
        <div className="grades-page">
          <div className="error-container">
            <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <h2>Error Loading Grades</h2>
            <p>{error}</p>
            <button onClick={fetchStudentGrades} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Course Detail View
  if (view === 'course-detail' && selectedCourse) {
    return (
      <Layout role="student">
        <div className="grades-page">
          <div className="page-header">
            <div className="header-top">
              <button onClick={handleBackToOverview} className="back-button">
                <ArrowLeft size={20} />
                Back to Overview
              </button>
              <div className="breadcrumbs">
                <span onClick={handleBackToOverview} className="breadcrumb-link">My Grades</span>
                <span className="breadcrumb-separator">/</span>
                <span>{selectedCourse.code}</span>
              </div>
            </div>
            <div className="header-content">
              <h1>{selectedCourse.title}</h1>
              <p className="course-code">{selectedCourse.code}</p>
              <p className="course-instructor">Instructor: {selectedCourse.instructor.name}</p>
            </div>
          </div>

          {/* Course Grade Summary */}
          <div className="course-grade-summary">
            <div className="grade-cards">
              <div className="grade-card primary">
                <div className="grade-value" style={{ color: getGradeColor(selectedCourse.averageGrade) }}>
                  {selectedCourse.averageGrade.toFixed(1)}%
                </div>
                <div className="grade-letter">{selectedCourse.letterGrade}</div>
                <div className="grade-label">Current Grade</div>
              </div>
              <div className="grade-card">
                <div className="grade-value">{selectedCourse.earnedPoints}</div>
                <div className="grade-sublabel">/ {selectedCourse.totalPoints}</div>
                <div className="grade-label">Points Earned</div>
              </div>
              <div className="grade-card">
                <div className="grade-value">{selectedCourse.completedAssignments}</div>
                <div className="grade-sublabel">/ {selectedCourse.totalAssignments}</div>
                <div className="grade-label">Assignments</div>
              </div>
            </div>
          </div>

          {/* Assignments List */}
          <div className="assignments-section">
            <h2>
              <FileText size={24} />
              Assignments & Assessments
            </h2>

            {courseAssignments.length === 0 ? (
              <div className="empty-assignments">
                <FileText size={48} style={{ color: '#9ca3af' }} />
                <h3>No Assignments Found</h3>
                <p>No assignments available for this course yet.</p>
              </div>
            ) : (
              <div className="assignments-list">
                {courseAssignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-item">
                    <div className="assignment-icon">
                      {assignment.assignmentType === 'quiz' ? '📝' : 
                       assignment.assignmentType === 'exam' ? '📋' :
                       assignment.assignmentType === 'discussion' ? '💬' : '📄'}
                    </div>
                    <div className="assignment-details">
                      <h3>{assignment.title}</h3>
                      <p className="assignment-description">{assignment.description}</p>
                      <div className="assignment-meta">
                        <span className="assignment-type">
                          {assignment.assignmentType.charAt(0).toUpperCase() + assignment.assignmentType.slice(1)}
                        </span>
                        <span className="assignment-due">
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                        {assignment.submittedAt && (
                          <span className="assignment-submitted">
                            Submitted: {formatDate(assignment.submittedAt)}
                          </span>
                        )}
                        {assignment.attemptNumber && assignment.attemptNumber > 0 && (
                          <span className="assignment-attempts">
                            Attempts: {assignment.attemptNumber}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="assignment-grade">
                      {assignment.earnedPoints !== null ? (
                        <div className="grade-display">
                          <div className="grade-score" style={{ color: getGradeColor(assignment.percentage) }}>
                            {assignment.earnedPoints}/{assignment.maxPoints}
                          </div>
                          <div className="grade-percentage" style={{ color: getGradeColor(assignment.percentage) }}>
                            {assignment.percentage?.toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <div className="grade-pending">
                          <span>—</span>
                          <div className="grade-percentage">Not Submitted</div>
                        </div>
                      )}
                    </div>
                    <div className="assignment-status">
                      {getStatusBadge(assignment.status)}
                    </div>
                    <div className="assignment-actions">
                      {(assignment.status === 'graded' || assignment.status === 'submitted') && (
                        <button
                          onClick={() => handleReviewAssignment(assignment)}
                          className="btn-secondary btn-small"
                          title="Review Assignment"
                        >
                          <Eye size={16} />
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Overview Page
  return (
    <Layout role="student">
      <div className="grades-page">
        <div className="page-header">
          <h1>My Grades</h1>
          <p>Track your academic performance across all enrolled courses</p>
        </div>

        {/* Grade Statistics */}
        {gradeStats && (
          <div className="grade-statistics">
            <div className="stat-cards">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{gradeStats.overallGPA.toFixed(1)}</div>
                  <div className="stat-label">Overall GPA</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{gradeStats.totalCourses}</div>
                  <div className="stat-label">Enrolled Courses</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{gradeStats.averagePercentage.toFixed(1)}%</div>
                  <div className="stat-label">Average Score</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{gradeStats.completedAssignments}</div>
                  <div className="stat-sublabel">/ {gradeStats.totalAssignments}</div>
                  <div className="stat-label">Assignments</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Courses List */}
        <div className="courses-section">
          <h2>
            <BookOpen size={24} />
            Course Grades
          </h2>

          {courses.length === 0 ? (
            <div className="empty-courses">
              <BookOpen size={48} style={{ color: '#9ca3af' }} />
              <h3>No Courses Found</h3>
              <p>You are not currently enrolled in any courses.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="course-card"
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="course-header">
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      <p className="course-code">{course.code}</p>
                      <p className="course-instructor">
                        <span>Instructor:</span> {course.instructor.name}
                      </p>
                    </div>
                    <div className="course-grade">
                      <div className="grade-circle" style={{ borderColor: getGradeColor(course.averageGrade) }}>
                        <span className="grade-percentage" style={{ color: getGradeColor(course.averageGrade) }}>
                          {course.averageGrade.toFixed(0)}%
                        </span>
                        <span className="grade-letter">{course.letterGrade}</span>
                      </div>
                    </div>
                  </div>

                  <div className="course-stats">
                    <div className="stat-item">
                      <span className="stat-label">Points Earned:</span>
                      <span className="stat-value">{course.earnedPoints} / {course.totalPoints}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Assignments:</span>
                      <span className="stat-value">{course.completedAssignments} / {course.totalAssignments}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Enrolled:</span>
                      <span className="stat-value">{formatDate(course.enrollmentDate)}</span>
                    </div>
                  </div>

                  <div className="course-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(course.completedAssignments / course.totalAssignments) * 100}%`,
                          backgroundColor: getGradeColor(course.averageGrade)
                        }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {Math.round((course.completedAssignments / course.totalAssignments) * 100)}% Complete
                    </span>
                  </div>

                  <div className="course-actions">
                    <button className="view-details-btn">
                      <span>View Details</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentGrades;