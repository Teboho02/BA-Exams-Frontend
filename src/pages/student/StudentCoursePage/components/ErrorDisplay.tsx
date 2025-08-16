import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onBackToCourses: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry, onBackToCourses }) => {
  return (
    <div className="error-container">
      <h2>Error Loading Course</h2>
      <p>{error}</p>
      <div className="error-actions">
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
        <button onClick={onBackToCourses} className="btn-secondary">
          Back to My Courses
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;