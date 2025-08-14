import React from 'react';
import { AlertCircle } from 'lucide-react';
import './StudentQuizView.css';

interface TimeWarningProps {
  timeRemaining: number;
  formatTime: (seconds: number) => string;
}

const TimeWarning: React.FC<TimeWarningProps> = ({ timeRemaining, formatTime }) => {
  if (timeRemaining > 60 || timeRemaining <= 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 999,
      animation: 'pulse 2s infinite'
    }}>
      <div className="card" style={{ 
        padding: '16px', 
        backgroundColor: '#fef2f2', 
        borderColor: '#ef4444',
        minWidth: '300px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <AlertCircle size={20} style={{ marginRight: '12px', color: '#ef4444' }} />
          <div>
            <div style={{ fontWeight: '600', color: '#ef4444' }}>Time Running Out!</div>
            <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
              Only {formatTime(timeRemaining)} remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeWarning;