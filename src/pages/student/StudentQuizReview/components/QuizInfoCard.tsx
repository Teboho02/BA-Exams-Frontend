// components/QuizInfoCard.tsx
import React from 'react';
import { Calendar, Award, Target } from 'lucide-react';
import type { QuizQuestion, Submission, GradingStats } from '../types/quiz';

interface QuizInfoCardProps {
  submission: Submission;
  questions: QuizQuestion[];
  gradingStats: GradingStats;
}

const QuizInfoCard: React.FC<QuizInfoCardProps> = ({
  submission,
  questions,
  gradingStats
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <h2 className="card-header">Quiz Information</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Target size={16} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Questions</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
            {questions.length}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={16} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</span>
          </div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>
            {gradingStats.totalPoints}
          </div>
        </div>

        <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Award size={16} style={{ color: '#6b7280' }} />
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Graded Score</span>
          </div>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: '600',
            color: gradingStats.totalGradedPossiblePoints > 0 && gradingStats.gradedPoints >= gradingStats.totalGradedPossiblePoints * 0.7 ? '#10b981' : '#ef4444'
          }}>
            {gradingStats.gradedPoints}/{gradingStats.totalGradedPossiblePoints}
            {gradingStats.totalGradedPossiblePoints > 0 && (
              <span style={{ fontSize: '16px', marginLeft: '8px' }}>
                ({((gradingStats.gradedPoints / gradingStats.totalGradedPossiblePoints) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          {gradingStats.ungradedPoints > 0 && (
            <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '4px' }}>
              +{gradingStats.ungradedPoints} pts pending review
            </div>
          )}
        </div>

        {submission.submittedAt && (
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Calendar size={16} style={{ color: '#6b7280' }} />
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Submitted At</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
              {formatDate(submission.submittedAt)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInfoCard;