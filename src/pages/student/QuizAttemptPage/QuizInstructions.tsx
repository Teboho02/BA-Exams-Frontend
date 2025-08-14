import React from 'react';
import { ArrowLeft, FileText, Timer, AlertCircle, Save, HelpCircle } from 'lucide-react';
import type { Assignment, Question } from './types';
import './StudentQuizView.css';

interface QuizInstructionsProps {
  quiz: Assignment;
  questions: Question[];
  onBack: () => void;
  onStartQuiz: () => void;
}

const QuizInstructions: React.FC<QuizInstructionsProps> = ({
  quiz,
  questions,
  onBack,
  onStartQuiz
}) => {
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="assignment-creator">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={onBack} className="btn btn-secondary" style={{ marginRight: '16px' }}>
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="title">{quiz.title}</h1>
            <div className="badges">
              <span className="badge badge-info">
                <FileText size={14} />
                Instructions
              </span>
              <span className="points-display">
                {totalPoints} Points • {questions.length} Questions
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h2 className="card-header" style={{ marginBottom: '20px' }}>Quiz Instructions</h2>
            
            <div className="info-box" style={{ marginBottom: '24px' }}>
              <p className="info-text" style={{ fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                {quiz.quizInstructions || quiz.description || 'Please read all questions carefully and select the best answer.'}
              </p>
            </div>

            {/* Quiz Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                  {questions.length}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Questions</div>
              </div>
              
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                  {totalPoints}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Points</div>
              </div>
              
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                  {quiz.hasTimeLimit ? `${quiz.timeLimitMinutes} min` : 'No Limit'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Time Limit</div>
              </div>
              
              <div className="info-box" style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
                  {quiz.allowedAttempts === -1 ? '∞' : quiz.allowedAttempts}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Attempts</div>
              </div>
            </div>

            {/* Important Notes */}
            <div style={{ marginBottom: '32px' }}>
              <h3 className="card-header" style={{ marginBottom: '16px' }}>Important Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {quiz.hasTimeLimit && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                    <Timer size={20} style={{ marginRight: '12px', color: '#f59e0b' }} />
                    <span>This quiz has a time limit of {quiz.timeLimitMinutes} minutes</span>
                  </div>
                )}
                
                {quiz.cantGoBack && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                    <AlertCircle size={20} style={{ marginRight: '12px', color: '#ef4444' }} />
                    <span>You cannot go back to previous questions once answered</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                  <Save size={20} style={{ marginRight: '12px', color: '#10b981' }} />
                  <span>Your answers are automatically saved as you progress</span>
                </div>
                
                {quiz.shuffleAnswers && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', color: '#374151' }}>
                    <HelpCircle size={20} style={{ marginRight: '12px', color: '#3b82f6' }} />
                    <span>Answer choices are randomly shuffled</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={onStartQuiz}
                className="btn btn-primary btn-large"
                style={{ fontSize: '18px', padding: '16px 32px', minWidth: '200px' }}
                type="button"
              >
                <FileText size={20} />
                Begin Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;