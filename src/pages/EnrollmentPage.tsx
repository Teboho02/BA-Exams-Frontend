import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './EnrollmentPage.css';

interface CourseInfo {
  id: string;
  title: string;
  description?: string;
}

interface EnrollmentLink {
  id: string;
  token: string;
  is_used: boolean;
  created_at: string;
  used_at: string | null;
  used_by: string | null;
  course_id: string;
}

type EnrollmentStatus = 'loading' | 'success' | 'already_enrolled' | 'link_expired' | 'error';

const EnrollmentPage: React.FC = () => {
  const { courseName, token } = useParams<{ courseName: string; token: string }>();
  const [status, setStatus] = useState<EnrollmentStatus>('loading');
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (token) {
      handleEnrollment(token);
    }
  }, [token]);

  const handleEnrollment = (enrollmentToken: string) => {
    try {
      // For demo purposes, we'll check localStorage for enrollment links
      // In a real app, this would be an API call
      
      // Find all enrollment links across all courses
      let foundLink: EnrollmentLink | null = null;
      let foundCourse: CourseInfo | null = null;

      // Check localStorage for enrollment links (searching across all course IDs)
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith('enrollmentLinks_')) {
          const courseId = key.replace('enrollmentLinks_', '');
          try {
            const linksData = localStorage.getItem(key);
            if (linksData) {
              const links: EnrollmentLink[] = JSON.parse(linksData);
              const matchingLink = links.find(link => link.token === enrollmentToken);
              
              if (matchingLink) {
                foundLink = { ...matchingLink, course_id: courseId };
                
                // Get course info (in real app, this would be from API)
                foundCourse = {
                  id: courseId,
                  title: courseName ? courseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Course',
                  description: 'Course description would be loaded from the database'
                };
                break;
              }
            }
          } catch (err) {
            console.error('Error parsing enrollment links:', err);
          }
        }
      }

      if (!foundLink) {
        setStatus('link_expired');
        setErrorMessage('This enrollment link is invalid or has expired.');
        return;
      }

      if (foundLink.is_used) {
        setStatus('link_expired');
        setErrorMessage('This enrollment link has already been used.');
        return;
      }

      setCourseInfo(foundCourse);

      // Check if user is already enrolled (in real app, check via API)
      // For demo, we'll simulate this check
      const currentUser = 'current.user@example.com'; // This would come from authentication
      const isAlreadyEnrolled = Math.random() < 0.2; // 20% chance for demo

      if (isAlreadyEnrolled) {
        setStatus('already_enrolled');
        return;
      }

      // Process enrollment
      setTimeout(() => {
        // Mark link as used (in real app, this would be an API call)
        const courseId = foundLink!.course_id;
        const storageKey = `enrollmentLinks_${courseId}`;
        const linksData = localStorage.getItem(storageKey);
        
        if (linksData) {
          const links: EnrollmentLink[] = JSON.parse(linksData);
          const updatedLinks = links.map(link => 
            link.token === enrollmentToken 
              ? { 
                  ...link, 
                  is_used: true, 
                  used_at: new Date().toISOString(), 
                  used_by: currentUser 
                }
              : link
          );
          localStorage.setItem(storageKey, JSON.stringify(updatedLinks));
        }

        setStatus('success');
      }, 1500); // Simulate API delay

    } catch (error) {
      setStatus('error');
      setErrorMessage('An error occurred while processing your enrollment.');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="enrollment-status loading">
            <div className="status-icon">
              <div className="spinner"></div>
            </div>
            <h2>Processing Your Enrollment...</h2>
            <p>Please wait while we verify your enrollment link.</p>
          </div>
        );

      case 'success':
        return (
          <div className="enrollment-status success">
            <div className="status-icon">🎉</div>
            <h2>Successfully Enrolled!</h2>
            <p>
              You have been successfully registered for{' '}
              <strong>{courseInfo?.title}</strong>
            </p>
            <div className="enrollment-actions">
              <Link to="/student/courses" className="btn primary">
                View My Courses
              </Link>
              <Link to="/login" className="btn secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        );

      case 'already_enrolled':
        return (
          <div className="enrollment-status already-enrolled">
            <div className="status-icon">✓</div>
            <h2>Already Enrolled</h2>
            <p>
              You are already registered for{' '}
              <strong>{courseInfo?.title}</strong>
            </p>
            <div className="enrollment-actions">
              <Link to="/student/courses" className="btn primary">
                View My Courses
              </Link>
              <Link to="/login" className="btn secondary">
                Go to Dashboard
              </Link>
            </div>
          </div>
        );

      case 'link_expired':
        return (
          <div className="enrollment-status expired">
            <div className="status-icon">⚠️</div>
            <h2>Link Expired</h2>
            <p>{errorMessage}</p>
            <p>Please contact your instructor for a new enrollment link.</p>
            <div className="enrollment-actions">
              <Link to="/" className="btn primary">
                Return Home
              </Link>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="enrollment-status error">
            <div className="status-icon">❌</div>
            <h2>Enrollment Failed</h2>
            <p>{errorMessage}</p>
            <p>Please try again or contact support if the problem persists.</p>
            <div className="enrollment-actions">
              <button 
                onClick={() => handleEnrollment(token!)} 
                className="btn primary"
              >
                Try Again
              </button>
              <Link to="/" className="btn secondary">
                Return Home
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="enrollment-page">
      <div className="enrollment-container">
        <div className="enrollment-header">
          <h1>Course Enrollment</h1>
          {courseName && (
            <p className="course-name">
              {courseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
          )}
        </div>
        
        {renderContent()}
        
        <div className="enrollment-footer">
          <p className="help-text">
            Need help? <a href="/contact">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPage;