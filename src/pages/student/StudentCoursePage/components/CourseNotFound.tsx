import React from 'react';

interface CourseNotFoundProps {
  onBackToCourses: () => void;
}

const CourseNotFound: React.FC<CourseNotFoundProps> = ({ onBackToCourses }) => {
  return (
    <div className="error-container">
      <h2>Course Not Found</h2>
      <p>The requested course could not be found.</p>
      <button onClick={onBackToCourses} className="btn-primary">
        Back to My Courses
      </button>
    </div>
  );
};

export default CourseNotFound;