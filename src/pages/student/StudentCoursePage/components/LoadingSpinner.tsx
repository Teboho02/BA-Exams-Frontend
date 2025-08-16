import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading course details...</p>
    </div>
  );
};

export default LoadingSpinner;

