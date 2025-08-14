// components/QuizHeader.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Submission, GradingStats } from '../types/quiz';

interface QuizHeaderProps {
  submission: Submission;
  gradingStats: GradingStats;
  onBack: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({
  submission,
  gradingStats,
  onBack
}) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="header-left">
          <button onClick={onBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="title">{submission.assignmentTitle} - Review</h1>
          <div className="badges">
            <span className="badge badge-secondary">
              {gradingStats.totalPoints} points total
            </span>
            <span className="badge badge-info">
              Attempt #{submission.attemptNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader;