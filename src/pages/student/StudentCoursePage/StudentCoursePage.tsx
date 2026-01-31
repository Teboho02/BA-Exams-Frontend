import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import CourseHeader from './components/CourseHeader';
import CourseContent from './components/CourseContent';
import ContentViewerModal from './components/ContentViewerModal';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import CourseNotFound from './components/CourseNotFound';
import { useCourseData } from './hooks/useCourseData';
import type { ContentViewer, Assignment } from './types';
import './StudentCoursesPage.css';

const StudentCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { course, assignments, loading, error, refetch } = useCourseData(courseId);
  
  const [contentViewer, setContentViewer] = useState<ContentViewer>({
    isOpen: false,
    content: null,
    type: null
  });

  const closeContentViewer = () => {
    setContentViewer({
      isOpen: false,
      content: null,
      type: null
    });
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    
    if (assignment.assignment_type === 'quiz') {
      navigate(`/student/quizAttempt/${assignment.id}`);
    } else {
      navigate(`/student/quizAttempt/${assignment.id}`);
    }
  };

  const handleBackToCourses = () => {
    navigate('/student/courses');
  };

  if (loading) {
    return (
      <Layout role="student">
        <div className="course-page">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="student">
        <div className="course-page">
          <ErrorDisplay 
            error={error}
            onRetry={refetch}
            onBackToCourses={handleBackToCourses}
          />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout role="student">
        <div className="course-page">
          <CourseNotFound onBackToCourses={handleBackToCourses} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="student">
      <div className="course-page">
        <CourseHeader course={course} />

        <div className="course-tabs">
          <button className="tab active">
            📚 Course Content
          </button>
        </div>

        <CourseContent 
          assignments={assignments}
          onAssignmentClick={handleAssignmentClick}
        />

        <ContentViewerModal 
          contentViewer={contentViewer}
          onClose={closeContentViewer}
        />
      </div>
    </Layout>
  );
};

export default StudentCoursePage;