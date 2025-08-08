import React from 'react';
import type { Assignment, Question } from './quizAttempt.types';

interface QuizDetailsProps {
  quiz: Assignment;
  questions: Question[];
}

const QuizDetails: React.FC<QuizDetailsProps> = ({ quiz, questions }) => {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: '20px', 
      marginBottom: '32px' 
    }}>
      <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#3b82f6', 
          marginBottom: '8px' 
        }}>
          {questions.length}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Questions</div>
      </div>
      
      <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#10b981', 
          marginBottom: '8px' 
        }}>
          {totalPoints}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</div>
      </div>
      
      <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#f59e0b', 
          marginBottom: '8px' 
        }}>
          {quiz.hasTimeLimit ? `${quiz.timeLimitMinutes} min` : 'No Limit'}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Time Limit</div>
      </div>
      
      <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#8b5cf6', 
          marginBottom: '8px' 
        }}>
          {quiz.allowedAttempts === -1 ? '∞' : quiz.allowedAttempts}
        </div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>Attempts</div>
      </div>
    </div>
  );
};

export default QuizDetails;