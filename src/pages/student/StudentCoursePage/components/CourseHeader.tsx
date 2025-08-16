import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { CourseDetails } from '../types';

interface CourseHeaderProps {
  course: CourseDetails;
}

const CourseHeader: React.FC<CourseHeaderProps> = ({ course }) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default CourseHeader;