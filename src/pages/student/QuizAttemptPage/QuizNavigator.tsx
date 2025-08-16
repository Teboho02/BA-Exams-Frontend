import React from 'react';
import { Flag } from 'lucide-react';
import type { Question, Answer, Assignment } from './types';
import './StudentQuizView.css';

interface QuizNavigatorProps {
  quiz: Assignment;
  questions: Question[];
  answers: Answer[];
  currentQuestion: number;
  onNavigateToQuestion: (index: number) => void;
}

const QuizNavigator: React.FC<QuizNavigatorProps> = ({
  quiz,
  questions,
  answers,
  currentQuestion,
  onNavigateToQuestion
}) => {
  const getAnsweredCount = (): number => {
    return answers.filter(answer => answer.isAnswered).length;
  };

  const getFlaggedCount = (): number => {
    return answers.filter(answer => answer.flagged).length;
  };

  return (
    <div className="card" style={{ padding: '24px', height: 'fit-content' }}>
      
      {/* Progress Summary */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
          <span>Progress</span>
          <span>{getAnsweredCount()}/{questions.length}</span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${(getAnsweredCount() / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Question Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {questions.map((q, index) => {
          const answer = answers.find(a => a.questionId === q.id);
          return (
            <button
              key={q.id}
              onClick={() => onNavigateToQuestion(index)}
              disabled={quiz.cantGoBack && index < currentQuestion}
              className={`question-nav-btn ${
                index === currentQuestion ? 'current' : 
                answer?.isAnswered ? 'answered' : 
                answer?.flagged ? 'flagged' : 'unanswered'
              }`}
              style={{
                width: '40px',
                height: '40px',
                border: '2px solid',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: (quiz.cantGoBack && index < currentQuestion) ? 'not-allowed' : 'pointer',
                opacity: (quiz.cantGoBack && index < currentQuestion) ? 0.5 : 1,
                borderColor: 
                  index === currentQuestion ? '#3b82f6' :
                  answer?.isAnswered ? '#10b981' :
                  answer?.flagged ? '#f59e0b' : '#6b7280',
                backgroundColor:
                  index === currentQuestion ? '#eff6ff' :
                  answer?.isAnswered ? '#f0fdf4' :
                  answer?.flagged ? '#fffbeb' : '#fff',
                color:
                  index === currentQuestion ? '#3b82f6' :
                  answer?.isAnswered ? '#10b981' :
                  answer?.flagged ? '#f59e0b' : '#6b7280',
                position: 'relative'
              }}
              type="button"
            >
              {index + 1}
              {answer?.flagged && (
                <Flag size={10} style={{ 
                  position: 'absolute', 
                  top: '2px', 
                  right: '2px',
                  color: '#f59e0b'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '2px', marginRight: '8px' }}></div>
          <span>Current</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f0fdf4', border: '1px solid #10b981', borderRadius: '2px', marginRight: '8px' }}></div>
          <span>Answered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#fffbeb', border: '1px solid #f59e0b', borderRadius: '2px', marginRight: '8px' }}></div>
          <span>Flagged</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '2px', marginRight: '8px' }}></div>
          <span>Unanswered</span>
        </div>
      </div>

      {/* Flagged Questions */}
      {getFlaggedCount() > 0 && (
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <Flag size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
              Flagged for Review ({getFlaggedCount()})
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {answers
              .map((answer, index) => ({ answer, index }))
              .filter(({ answer }) => answer.flagged)
              .map(({ index }) => (
                <button
                  key={index}
                  onClick={() => onNavigateToQuestion(index)}
                  disabled={quiz.cantGoBack && index < currentQuestion}
                  className="btn btn-secondary"
                  style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px',
                    opacity: (quiz.cantGoBack && index < currentQuestion) ? 0.5 : 1
                  }}
                  type="button"
                >
                  Q{index + 1}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizNavigator;