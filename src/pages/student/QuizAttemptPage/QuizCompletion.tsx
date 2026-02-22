import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Assignment, Question } from './types';
import './StudentQuizView.css';
//import { useNavigate } from 'react-router-dom';

interface QuizCompletionProps {
  quiz: Assignment;
  questions: Question[];
  answeredCount: number;
  startTime: Date;
}

const QuizCompletion: React.FC<QuizCompletionProps> = ({
  quiz,
  questions,
  answeredCount,
  startTime
}) => {
  const timeTaken = Math.floor((new Date().getTime() - startTime.getTime()) / 60000);



  return (
    <div className="assignment-creator">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="title">Quiz Completed</h1>
            <div className="badges">
              <span className="badge badge-success">
                <CheckCircle size={14} />
                Submitted
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <CheckCircle size={64} style={{ color: '#10b981', margin: '0 auto 16px' }} />
              <h2 className="card-header" style={{ marginBottom: '8px' }}>Quiz Successfully Submitted!</h2>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Thank you for completing "{quiz.title}"
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div className="info-box" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '4px' }}>
                  {answeredCount}/{questions.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions Answered</div>
              </div>
              
              <div className="info-box" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', marginBottom: '4px' }}>
                  {timeTaken}m
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Time Taken</div>
              </div>
            </div>

            <div className="info-box" style={{ marginBottom: '24px' }}>
              <p className="info-text" style={{ margin: 0 }}>
                Redirecting to results page... Your results will be available once your instructor has reviewed your submission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCompletion;