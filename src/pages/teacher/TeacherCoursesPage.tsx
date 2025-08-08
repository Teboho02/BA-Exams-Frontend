import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import './TeacherCoursePage.css';

interface CourseContent {
  id: string;
  type: 'lecture' | 'video' | 'quiz' | 'assignment' | 'forum' | 'resource';
  title: string;
  description?: string;
  dueDate?: Date;
  releaseDate?: Date;
  file?: string;
  link?: string;
  isCompleted?: boolean;
  submissions?: number;
}

interface ContentViewer {
  isOpen: boolean;
  content: CourseContent | null;
  type: 'pdf' | 'video' | null;
}

interface CourseSection {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  content: CourseContent[];
}

interface CourseDetails {
  id: string;
  title: string;
  code: string;
  description: string;
  instructor: {
    name: string;
    email: string;
  };
  students: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  sections: CourseSection[];
}

const TeacherCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isStudentView, setIsStudentView] = useState(false);
  const [contentViewer, setContentViewer] = useState<ContentViewer>({
    isOpen: false,
    content: null,
    type: null
  });

  useEffect(() => {
    // Simulate fetching course data
    const mockCourse: CourseDetails = {
      id: courseId || '1',
      title: 'Grade 12 Mathematics',
      code: 'MATH12',
      description: 'Advanced mathematics covering functions, calculus, and algebra for Grade 12 students',
      instructor: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@school.edu'
      },
      students: 32,
      isActive: true,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-20'),
      sections: [
        {
          id: 'week1',
          title: 'Week 1: Functions Review & Polynomial Functions',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-01-21'),
          content: [
            {
              id: 'lec1',
              type: 'lecture',
              title: 'Lecture Notes: Functions Review',
              description: 'Review of function notation, domain, range, and transformations',
              file: '/notes.pdf',
              releaseDate: new Date('2024-01-15')
            },
            {
              id: 'vid1',
              type: 'video',
              title: 'Video: Graphing Polynomial Functions',
              description: 'Step-by-step guide to sketching polynomial functions',
              link: '/video.mp4',
              releaseDate: new Date('2024-01-16')
            },
            {
              id: 'quiz1',
              type: 'quiz',
              title: 'Quiz 1: Functions and Polynomials',
              description: 'Test your understanding of function properties and polynomial behavior',
              dueDate: new Date('2024-01-21'),
              submissions: 28
            }
          ]
        },
        {
          id: 'week2',
          title: 'Week 2: Exponential and Logarithmic Functions',
          startDate: new Date('2024-01-22'),
          endDate: new Date('2024-01-28'),
          content: [
            {
              id: 'lec2',
              type: 'lecture',
              title: 'Lecture Notes: Exponential Functions',
              description: 'Properties of exponential functions and applications',
              file: 'exponential_functions.pdf',
              releaseDate: new Date('2024-01-22')
            },
            {
              id: 'lec3',
              type: 'lecture',
              title: 'Lecture Notes: Logarithmic Functions',
              description: 'Understanding logarithms and their properties',
              file: 'logarithmic_functions.pdf',
              releaseDate: new Date('2024-01-23')
            },
            {
              id: 'assign1',
              type: 'assignment',
              title: 'Assignment 1: Exponential Growth & Decay',
              description: 'Real-world applications of exponential and logarithmic functions',
              dueDate: new Date('2024-01-28'),
              submissions: 30
            },
            {
              id: 'forum1',
              type: 'forum',
              title: 'Discussion: Applications in Science',
              description: 'Share examples of exponential functions in science and nature',
              releaseDate: new Date('2024-01-22')
            }
          ]
        },
        {
          id: 'week3',
          title: 'Week 3: Introduction to Limits',
          startDate: new Date('2024-01-29'),
          endDate: new Date('2024-02-04'),
          content: [
            {
              id: 'lec4',
              type: 'lecture',
              title: 'Lecture Notes: Understanding Limits',
              description: 'Intuitive approach to limits and limit notation',
              file: 'intro_to_limits.pdf',
              releaseDate: new Date('2024-01-29')
            },
            {
              id: 'vid2',
              type: 'video',
              title: 'Video: Evaluating Limits Graphically',
              description: 'Visual approach to finding limits using graphs',
              link: 'https://example.com/limits-graphically',
              releaseDate: new Date('2024-01-30')
            },
            {
              id: 'res1',
              type: 'resource',
              title: 'Interactive: Limit Calculator',
              description: 'Online tool for visualizing limits',
              link: 'https://example.com/limit-calculator',
              releaseDate: new Date('2024-01-29')
            },
            {
              id: 'quiz2',
              type: 'quiz',
              title: 'Quiz 2: Basic Limits',
              description: 'Evaluate limits using various techniques',
              dueDate: new Date('2024-02-04'),
              submissions: 31
            }
          ]
        },
        {
          id: 'week4',
          title: 'Week 4: Derivatives - The Basics',
          startDate: new Date('2024-02-05'),
          endDate: new Date('2024-02-11'),
          content: [
            {
              id: 'lec5',
              type: 'lecture',
              title: 'Lecture Notes: Introduction to Derivatives',
              description: 'The derivative as a rate of change and slope of tangent line',
              file: 'intro_derivatives.pdf',
              releaseDate: new Date('2024-02-05')
            },
            {
              id: 'vid3',
              type: 'video',
              title: 'Video: Power Rule and Basic Differentiation',
              description: 'Master the fundamental rules of differentiation',
              link: 'https://example.com/power-rule',
              releaseDate: new Date('2024-02-06')
            },
            {
              id: 'assign2',
              type: 'assignment',
              title: 'Assignment 2: Differentiation Practice',
              description: 'Apply differentiation rules to various functions',
              dueDate: new Date('2024-02-11'),
              submissions: 29
            }
          ]
        },
        {
          id: 'week5',
          title: 'Week 5: Advanced Differentiation',
          startDate: new Date('2024-02-12'),
          endDate: new Date('2024-02-18'),
          content: [
            {
              id: 'lec6',
              type: 'lecture',
              title: 'Lecture Notes: Product and Quotient Rules',
              description: 'Differentiation techniques for products and quotients',
              file: 'product_quotient_rules.pdf',
              releaseDate: new Date('2024-02-12')
            },
            {
              id: 'lec7',
              type: 'lecture',
              title: 'Lecture Notes: Chain Rule',
              description: 'Differentiating composite functions',
              file: 'chain_rule.pdf',
              releaseDate: new Date('2024-02-13')
            },
            {
              id: 'vid4',
              type: 'video',
              title: 'Video: Chain Rule Applications',
              description: 'Complex examples using the chain rule',
              link: 'https://example.com/chain-rule-examples',
              releaseDate: new Date('2024-02-14')
            },
            {
              id: 'quiz3',
              type: 'quiz',
              title: 'Quiz 3: Differentiation Techniques',
              description: 'Test all differentiation rules learned so far',
              dueDate: new Date('2024-02-18'),
              submissions: 27
            }
          ]
        },
        {
          id: 'week6',
          title: 'Week 6: Applications of Derivatives',
          startDate: new Date('2024-02-19'),
          endDate: new Date('2024-02-25'),
          content: [
            {
              id: 'lec8',
              type: 'lecture',
              title: 'Lecture Notes: Optimization Problems',
              description: 'Using derivatives to find maximum and minimum values',
              file: 'optimization.pdf',
              releaseDate: new Date('2024-02-19')
            },
            {
              id: 'vid5',
              type: 'video',
              title: 'Video: Curve Sketching with Derivatives',
              description: 'Complete guide to analyzing function behavior',
              link: 'https://example.com/curve-sketching',
              releaseDate: new Date('2024-02-20')
            },
            {
              id: 'assign3',
              type: 'assignment',
              title: 'Assignment 3: Optimization Project',
              description: 'Real-world optimization problem solving',
              dueDate: new Date('2024-02-25'),
              submissions: 26
            },
            {
              id: 'forum2',
              type: 'forum',
              title: 'Discussion: Calculus in Engineering',
              description: 'Explore how derivatives are used in various fields',
              releaseDate: new Date('2024-02-19')
            }
          ]
        },
        {
          id: 'week7',
          title: 'Week 7: Matrices and Linear Algebra',
          startDate: new Date('2024-02-26'),
          endDate: new Date('2024-03-03'),
          content: [
            {
              id: 'lec9',
              type: 'lecture',
              title: 'Lecture Notes: Matrix Operations',
              description: 'Addition, multiplication, and properties of matrices',
              file: 'matrix_operations.pdf',
              releaseDate: new Date('2024-02-26')
            },
            {
              id: 'lec10',
              type: 'lecture',
              title: 'Lecture Notes: Determinants and Inverses',
              description: 'Finding determinants and inverse matrices',
              file: 'determinants_inverses.pdf',
              releaseDate: new Date('2024-02-27')
            },
            {
              id: 'vid6',
              type: 'video',
              title: 'Video: Solving Systems with Matrices',
              description: 'Using matrices to solve linear equations',
              link: 'https://example.com/matrix-systems',
              releaseDate: new Date('2024-02-28')
            },
            {
              id: 'quiz4',
              type: 'quiz',
              title: 'Quiz 4: Matrices and Determinants',
              description: 'Test your matrix manipulation skills',
              dueDate: new Date('2024-03-03'),
              submissions: 30
            }
          ]
        },
        {
          id: 'week8',
          title: 'Week 8: Trigonometric Functions and Identities',
          startDate: new Date('2024-03-04'),
          endDate: new Date('2024-03-10'),
          content: [
            {
              id: 'lec11',
              type: 'lecture',
              title: 'Lecture Notes: Advanced Trigonometric Identities',
              description: 'Double angle, half angle, and sum/difference formulas',
              file: 'trig_identities.pdf',
              releaseDate: new Date('2024-03-04')
            },
            {
              id: 'vid7',
              type: 'video',
              title: 'Video: Solving Trigonometric Equations',
              description: 'Techniques for solving complex trig equations',
              link: 'https://example.com/trig-equations',
              releaseDate: new Date('2024-03-05')
            },
            {
              id: 'assign4',
              type: 'assignment',
              title: 'Assignment 4: Trigonometric Proofs',
              description: 'Prove various trigonometric identities',
              dueDate: new Date('2024-03-10'),
              submissions: 28
            },
            {
              id: 'res2',
              type: 'resource',
              title: 'Resource: Trigonometry Formula Sheet',
              description: 'Comprehensive list of all trig formulas',
              file: 'trig_formula_sheet.pdf',
              releaseDate: new Date('2024-03-04')
            }
          ]
        }
      ]
    };
    
    setCourse(mockCourse);
    // Expand current week by default
    const currentDate = new Date();
    const currentSection = mockCourse.sections.find(
      section => currentDate >= section.startDate && currentDate <= section.endDate
    );
    if (currentSection) {
      setExpandedSections([currentSection.id]);
    }
  }, [courseId]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const getContentIcon = (type: CourseContent['type']) => {
    switch (type) {
      case 'lecture': return '📄';
      case 'video': return '🎥';
      case 'quiz': return '📝';
      case 'assignment': return '📋';
      case 'forum': return '💬';
      case 'resource': return '🔗';
      default: return '📌';
    }
  };

  const getStatusBadge = (content: CourseContent) => {
    const now = new Date();
    
    if (content.dueDate) {
      if (now > content.dueDate) {
        return <span className="badge badge-overdue">Past Due</span>;
      } else {
        const daysUntilDue = Math.ceil((content.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 3) {
          return <span className="badge badge-urgent">Due Soon</span>;
        }
        return <span className="badge badge-upcoming">Upcoming</span>;
      }
    }
    
    if (content.releaseDate && now < content.releaseDate) {
      return <span className="badge badge-locked">Not Available</span>;
    }
    
    return <span className="badge badge-available">Available</span>;
  };

  const handleContentClick = (content: CourseContent) => {
    // Handle different content types
    if (content.type === 'lecture' && content.file) {
      setContentViewer({
        isOpen: true,
        content: content,
        type: 'pdf'
      });
    } else if (content.type === 'video' && content.link) {
      setContentViewer({
        isOpen: true,
        content: content,
        type: 'video'
      });
    } else if (content.type === 'quiz' || content.type === 'assignment') {
      // Navigate to quiz/assignment page
      console.log('Opening quiz/assignment:', content);
    } else if (content.type === 'forum') {
      // Navigate to forum
      console.log('Opening forum:', content);
    } else if (content.type === 'resource' && content.link) {
      // Open external resource
      window.open(content.link, '_blank');
    }
  };

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      content: null,
      type: null
    });
  };

  const handleAddContent = (sectionId: string) => {
    // Navigate to content creation page or open modal
    console.log('Adding content to section:', sectionId);
  };

  if (!course) {
    return (
      <Layout role="teacher">
        <div className="loading">Loading course...</div>
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
            <span>{course.code}</span>
          </div>
          
          <div className="course-info">
            <div className="course-title-row">
              <div>
                <h1>{course.title}</h1>
                <p className="course-code">{course.code}</p>
              </div>
              <button 
                className={`view-toggle-btn ${isStudentView ? 'student-view' : 'teacher-view'}`}
                onClick={() => setIsStudentView(!isStudentView)}
              >
                {isStudentView ? '👨‍🎓 Student View' : '👨‍🏫 Teacher View'}
              </button>
            </div>
            <p className="course-description">{course.description}</p>
            
            <div className="course-meta">
              <div className="meta-item">
                <span className="meta-label">Instructor:</span>
                <span>{course.instructor.name}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Students:</span>
                <span>{course.students}</span>
              </div>
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

        <div className="course-timeline">
          <h2>Course Content</h2>
          
          {course.sections.map((section) => (
            <div key={section.id} className="section">
              <div 
                className="section-header"
                onClick={() => toggleSection(section.id)}
              >
                <span className="section-toggle">
                  {expandedSections.includes(section.id) ? '▼' : '▶'}
                </span>
                <h3>{section.title}</h3>
                <span className="section-dates">
                  {section.startDate.toLocaleDateString()} - {section.endDate.toLocaleDateString()}
                </span>
              </div>
              
              {expandedSections.includes(section.id) && (
                <div className="section-content">
                  {section.content.map((content) => (
                    <div 
                      key={content.id} 
                      className="content-item"
                      onClick={() => handleContentClick(content)}
                    >
                      <div className="content-icon">{getContentIcon(content.type)}</div>
                      <div className="content-details">
                        <h4>{content.title}</h4>
                        {content.description && (
                          <p className="content-description">{content.description}</p>
                        )}
                        <div className="content-meta">
                          {content.dueDate && (
                            <span className="due-date">
                              Due: {content.dueDate.toLocaleDateString()}
                            </span>
                          )}
                          {!isStudentView && content.submissions !== undefined && (
                            <span className="submissions">
                              {content.submissions}/{course.students} submitted
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="content-status">
                        {getStatusBadge(content)}
                      </div>
                    </div>
                  ))}
                  
                  {!isStudentView && (
                    <button 
                      className="add-content-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddContent(section.id);
                      }}
                    >
                      + Add Content
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {!isStudentView && (
            <button className="add-section-btn">
              + Add New Week/Topic
            </button>
          )}
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

export default TeacherCoursePage;