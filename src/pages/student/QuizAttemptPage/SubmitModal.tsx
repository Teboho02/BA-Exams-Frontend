import React from 'react';
import { X, Send, AlertCircle, Flag } from 'lucide-react';
import type { Question, Answer } from './types';
import './StudentQuizView.css';

interface SubmitModalProps {
  isOpen: boolean;
  questions: Question[];
  answers: Answer[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const SubmitModal: React.FC<SubmitModalProps> = ({
  isOpen,
  questions,
  answers,
  isSubmitting,
  onClose,
  onSubmit
}) => {
  const getAnsweredCount = (): number => {
    return answers.filter(answer => answer.isAnswered).length;
  };

  const getFlaggedCount = (): number => {
    return answers.filter(answer => answer.flagged).length;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="card-header" style={{ margin: 0 }}>Submit Quiz</h3>
          <button
            onClick={onClose}
            className="icon-btn"
            disabled={isSubmitting}
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
            Are you sure you want to submit your quiz? This action cannot be undone.
          </p>
          
          {/* Submission Summary */}
          <div className="info-box" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getAnsweredCount() === questions.length ? '#10b981' : '#f59e0b' }}>
                  {getAnsweredCount()}/{questions.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Questions Answered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getFlaggedCount() > 0 ? '#f59e0b' : '#6b7280' }}>
                  {getFlaggedCount()}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Flagged for Review</div>
              </div>
            </div>
          </div>

          {getAnsweredCount() < questions.length && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fffbeb', 
              border: '1px solid #f9d71c', 
              borderRadius: '6px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircle size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                <span style={{ fontSize: '14px', color: '#92400e' }}>
                  You have {questions.length - getAnsweredCount()} unanswered question{questions.length - getAnsweredCount() !== 1 ? 's' : ''}.
                </span>
              </div>
            </div>
          )}

          {getFlaggedCount() > 0 && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fef3c7', 
              border: '1px solid #f59e0b', 
              borderRadius: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Flag size={16} style={{ color: '#f59e0b', marginRight: '8px' }} />
                <span style={{ fontSize: '14px', color: '#92400e' }}>
                  You have {getFlaggedCount()} question{getFlaggedCount() !== 1 ? 's' : ''} flagged for review.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bottom-buttons" style={{ marginTop: '24px' }}>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-success"
            disabled={isSubmitting}
            type="button"
          >
            {isSubmitting ? (
              <>
                <span style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block',
                  marginRight: '8px'
                }}></span>
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;