// components/LoadingSpinner.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LoadingSpinnerProps {
  onBack: () => void;
  title?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  onBack, 
  title = "Loading...",
  message = "Loading data..."
}) => {
  return (
    <div className="assignment-creator">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={onBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="title">{title}</h1>
          </div>
        </div>
      </div>
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '3px solid #e5e7eb', 
            borderTop: '3px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;