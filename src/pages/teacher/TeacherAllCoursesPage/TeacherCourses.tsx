import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import CourseForm from '../../../components/teacher/CourseForm';
import type { Course } from '../../../types/teacher.types';
import './TeacherCourses.css';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../config/api';
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiCourse {
  id: string;
  title: string;
  code: string;
  subject?: string;
  description: string;
  teacher: Teacher;
  isActive: boolean;
  modules: any[];
  createdAt: string;
  updatedAt: string;
  maxStudents?: number;
  credits?: number;
  currentEnrollment?: number;
  students: Student[];
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

  // Student list modal state
  const [studentModal, setStudentModal] = useState<{
    courseId: string | null;
    courseName: string;
    students: Student[];
    isOpen: boolean;
  }>({
    courseId: null,
    courseName: '',
    students: [],
    isOpen: false
  });

  // Student management state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [removingStudents, setRemovingStudents] = useState<Set<string>>(new Set());
  const studentsPerPage = 10;

  // Confirmation modal state
  const [confirmRemoval, setConfirmRemoval] = useState<{
    isOpen: boolean;
    studentId: string | null;
    studentName: string;
    courseId: string | null;
  }>({
    isOpen: false,
    studentId: null,
    studentName: '',
    courseId: null
  });



  // Generate automatic course code
  const generateCourseCode = (title: string, subject: string) => {
    const subjectCode = subject.substring(0, 3).toUpperCase();
    const titleCode = title.split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    return `${subjectCode}${titleCode}${timestamp}`;
  };

  // Get last day of current year
  const getEndOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 11, 31); // December 31st of current year
  };

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_BASE_URL+'/api/courses', {
        credentials: 'include',
        method: 'GET',
        headers: {
      //    'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      const data: ApiResponse = await response.json();

      if (data.success && data.courses) {
        const transformedCourses: Course[] = data.courses.map((apiCourse: ApiCourse) => ({
          id: apiCourse.id,
          title: apiCourse.title,
          description: apiCourse.description,
          code: apiCourse.code,
          subject: apiCourse.subject || 'General',
          teacherId: apiCourse.teacher.id,
          students: apiCourse.students.map(s => s.id),
          enrolledStudents: apiCourse.students, // Store full student objects
          isActive: apiCourse.isActive,
          startDate: new Date(),
          endDate: new Date(), 
          createdAt: new Date(apiCourse.createdAt),
          maxStudents: apiCourse.maxStudents,
          credits: apiCourse.credits,
          currentEnrollment: apiCourse.students.length
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

    // Set automatic values
    const today = new Date();
    const endOfYear = getEndOfYear();
    const autoCode = generateCourseCode(courseData.title, courseData.subject);

    // Prepare data for API with automatic values
    const apiCourseData = {
      title: courseData.title,
      code: autoCode, // Auto-generated
      subject: courseData.subject,
      description: courseData.description,
      maxStudents: 999, // Always 999
      credits: 3, // Always 3
      startDate: today.toISOString(), // Today's date
      endDate: endOfYear.toISOString(), // Last day of year
    };

    const response = await fetch(API_BASE_URL+'/api/courses', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiCourseData),
    });

    const data: ApiResponse = await response.json();

    if (data.success && data.course) {
      // Get the current user's ID from existing courses or use a placeholder
      // Since the API doesn't return teacher info, we'll handle it gracefully
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let teacherId = user.id // Default fallback
      
      // Try to get teacher ID from existing courses if available
      if (courses.length > 0) {
        teacherId = courses[0].teacherId;
      }

      const newCourse: Course = {
        id: data.course.id,
        title: data.course.title,
        description: data.course.description,
        code: data.course.code,
        subject: data.course.subject || 'General',
        teacherId: teacherId, // Use fallback or existing teacher ID
        students: [],
        enrolledStudents: [],
        isActive: data.course.isActive,
        startDate: today,
        endDate: endOfYear,
        createdAt: new Date(data.course.createdAt),
        maxStudents: 999,
        credits: 3,
        currentEnrollment: 0
      };

      setCourses(prev => [newCourse, ...prev]);
      setShowForm(false);
      
      // Show success message instead of console.log
      // You might want to add a success state to show user feedback
      
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
      
   

      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll/email`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

  

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

  // Show student list modal
  const handleViewStudents = (course: Course) => {
    setStudentModal({ 
      courseId: course.id,
      courseName: course.title,
      students: course.enrolledStudents || [],
      isOpen: true
    });
    // Reset search and pagination when opening modal
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Show removal confirmation
  const handleRemoveClick = (courseId: string, student: Student) => {
    setConfirmRemoval({
      isOpen: true,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      courseId: courseId
    });
  };

  // Confirm and remove student from course
  const confirmRemoveStudent = async () => {
    const { courseId, studentId } = confirmRemoval;
    if (!courseId || !studentId) return;

    try {
      setRemovingStudents(prev => new Set(prev).add(studentId));
      


      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unenroll/${studentId}`, {
        credentials: 'include',
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update the student modal list
        setStudentModal(prev => ({
          ...prev,
          students: prev.students.filter(s => s.id !== studentId)
        }));
        
        // Refresh course data
        fetchCourses();
        
        // Close confirmation modal
        setConfirmRemoval({
          isOpen: false,
          studentId: null,
          studentName: '',
          courseId: null
        });
      } else {
        console.error('Failed to remove student:', data.message);
        alert(data.message || 'Failed to remove student');
      }
    } catch (err) {
      console.error('Error removing student:', err);
      alert('Network error. Please try again.');
    } finally {
      setRemovingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Cancel removal
  const cancelRemoveStudent = () => {
    setConfirmRemoval({
      isOpen: false,
      studentId: null,
      studentName: '',
      courseId: null
    });
  };

  // Filter and paginate students
  const getFilteredAndPaginatedStudents = () => {
    const filtered = studentModal.students.filter(student => {
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const email = student.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      
      return fullName.includes(search) || email.includes(search);
    });

    const totalPages = Math.ceil(filtered.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const paginatedStudents = filtered.slice(startIndex, endIndex);

    return {
      students: paginatedStudents,
      totalStudents: filtered.length,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
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

        {/* Confirmation Modal for Student Removal */}
        {confirmRemoval.isOpen && (
          <div className="modal confirmation-modal">
            <div className="modal-content">
              <div className="confirmation-icon">
                ⚠️
              </div>
              <h3>Confirm Student Removal</h3>
              <p>
                Are you sure you want to remove <strong>{confirmRemoval.studentName}</strong> from this course?
              </p>
              <p className="warning-text">
                This action cannot be undone. The student will lose access to all course materials and assignments.
              </p>
              <div className="modal-actions">
                <button 
                  onClick={cancelRemoveStudent}
                  className="btn-secondary"
                  disabled={removingStudents.has(confirmRemoval.studentId!)}
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmRemoveStudent}
                  className="btn-danger"
                  disabled={removingStudents.has(confirmRemoval.studentId!)}
                >
                  {removingStudents.has(confirmRemoval.studentId!) ? 'Removing...' : 'Remove Student'}
                </button>
              </div>
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

        {/* Student List Modal */}
        {studentModal.isOpen && (
          <div className="modal">
            <div className="modal-content student-modal">
              <div className="modal-header">
                <h3>Students in {studentModal.courseName}</h3>
                <button 
                  className="modal-close-btn"
                  onClick={() => {
                    setStudentModal({
                      courseId: null,
                      courseName: '',
                      students: [],
                      isOpen: false
                    });
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                >
                  ×
                </button>
              </div>

              {studentModal.students.length > 0 ? (
                <>
                  {/* Search Bar */}
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Search students by name or email..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page when searching
                      }}
                      className="search-input"
                    />
                  </div>

                  {(() => {
                    const { students, totalStudents, totalPages, hasNextPage, hasPrevPage } = getFilteredAndPaginatedStudents();
                    
                    return (
                      <>
                        {/* Student Count */}
                        <div className="student-count">
                          {searchTerm ? (
                            <span>Showing {students.length} of {totalStudents} students matching "{searchTerm}"</span>
                          ) : (
                            <span>Showing {students.length} of {studentModal.students.length} students</span>
                          )}
                        </div>

                        {/* Students List */}
                        {students.length > 0 ? (
                          <div className="students-list">
                            {students.map((student, index) => {
                              const globalIndex = (currentPage - 1) * studentsPerPage + index + 1;
                              const isRemoving = removingStudents.has(student.id);
                              
                              return (
                                <div key={student.id} className="student-item">
                                  <div className="student-info">
                                    <span className="student-number">{globalIndex}.</span>
                                    <div className="student-details">
                                      <span className="student-name">
                                        {student.firstName} {student.lastName}
                                      </span>
                                      <span className="student-email">{student.email}</span>
                                    </div>
                                    <button
                                      className="remove-student-btn"
                                      onClick={() => handleRemoveClick(studentModal.courseId!, student)}
                                      disabled={isRemoving}
                                      title="Remove student from course"
                                    >
                                      {isRemoving ? '...' : '×'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="no-results">
                            <p>No students found matching "{searchTerm}"</p>
                          </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="pagination">
                            <button
                              className="pagination-btn"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={!hasPrevPage}
                            >
                              Previous
                            </button>
                            
                            <div className="pagination-info">
                              Page {currentPage} of {totalPages}
                            </div>
                            
                            <button
                              className="pagination-btn"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={!hasNextPage}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <p className="no-students">No students enrolled yet.</p>
              )}

              <div className="modal-actions">
                <button 
                  onClick={() => {
                    setStudentModal({
                      courseId: null,
                      courseName: '',
                      students: [],
                      isOpen: false
                    });
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="btn-secondary"
                >
                  Close
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
                <span>👥 {course.students.length} students</span>
                <span>📚 {course.subject}</span>
           
              </div>
              <div className="course-dates">
                <span>📅 Start: {course.startDate.toLocaleDateString()}</span>
                <span>🏁 End: {course.endDate.toLocaleDateString()}</span>
              </div>
              
              {/* Course Actions */}
              <div className="course-footer">
                <button 
                  className="view-students-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewStudents(course);
                  }}
                >
                  View Students ({course.enrolledStudents?.length || 0})
                </button>
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