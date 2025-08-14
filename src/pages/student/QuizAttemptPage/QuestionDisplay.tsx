import React from 'react';
import { Flag } from 'lucide-react';
import type { Question, Answer } from './types';
import LatexRenderer from './LatexRenderer';
import './StudentQuizView.css';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  answer: Answer | undefined;
  onUpdateAnswer: (questionId: string, selectedAnswer?: string, textAnswer?: string) => void;
  onToggleFlag: (questionId: string) => void;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  question,
  questionNumber,
  answer,
  onUpdateAnswer,
  onToggleFlag
}) => {
  // Sort answers by their order
  const sortedAnswers = question.answers ? [...question.answers].sort((a, b) => a.answerOrder - b.answerOrder) : [];

  const renderAnswerOptions = () => {
    if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
      return (
        <div style={{ display: 'flex', flexDirection: question.questionType === 'true_false' ? 'row' : 'column', gap: question.questionType === 'true_false' ? '16px' : '12px' }}>
          {sortedAnswers.map((answerOption) => (
            <label
              key={answerOption.id}
              className={`answer-option ${answer?.selectedAnswer === answerOption.id ? 'selected' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                border: '2px solid',
                borderColor: answer?.selectedAnswer === answerOption.id ? '#3b82f6' : '#e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: answer?.selectedAnswer === answerOption.id ? '#eff6ff' : '#fff',
                transition: 'all 0.2s ease',
                ...(question.questionType === 'true_false' && {
                  minWidth: '120px',
                  justifyContent: 'center',
                  flex: 1
                })
              }}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={answerOption.id}
                checked={answer?.selectedAnswer === answerOption.id}
                onChange={() => onUpdateAnswer(question.id, answerOption.id)}
                style={{ marginRight: question.questionType === 'true_false' ? '8px' : '12px' }}
              />
              <div style={{ 
                fontSize: '16px', 
                color: '#374151',
                fontWeight: question.questionType === 'true_false' ? '500' : 'normal'
              }}>
                <LatexRenderer content={answerOption.answerText} />
              </div>
            </label>
          ))}
        </div>
      );
    }

    if (question.questionType === 'short_answer') {
      return (
        <input
          type="text"
          value={answer?.textAnswer || ''}
          onChange={(e) => onUpdateAnswer(question.id, undefined, e.target.value)}
          className="form-input"
          placeholder="Enter your answer..."
          style={{ fontSize: '16px', padding: '12px' }}
        />
      );
    }

    if (question.questionType === 'essay') {
      return (
        <textarea
          value={answer?.textAnswer || ''}
          onChange={(e) => onUpdateAnswer(question.id, undefined, e.target.value)}
          className="form-textarea"
          placeholder="Enter your detailed answer..."
          style={{ fontSize: '16px', padding: '12px', minHeight: '200px' }}
        />
      );
    }

    if (question.questionType === 'file_upload') {
      return (
        <div className="info-box">
          <p>File upload questions are not yet supported in this interface.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Question Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h2 className="card-header" style={{ margin: 0 }}>
              Question {questionNumber}
            </h2>
            <span className="badge badge-secondary">
              {question.points} point{question.points !== 1 ? 's' : ''}
            </span>
            <span className="badge badge-info">
              {question.questionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggleFlag(question.id)}
          className={`icon-btn ${answer?.flagged ? 'danger' : ''}`}
          title={answer?.flagged ? 'Remove flag' : 'Flag for review'}
          type="button"
        >
          <Flag size={16} />
        </button>
      </div>

      {/* Question Text */}
      <div className="form-group" style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '18px', fontWeight: '500', lineHeight: '1.6', color: '#374151' }}>
          <LatexRenderer content={question.questionText} />
        </div>
      </div>

      {/* Question Image */}
      {question.imageUrl && (
        <div style={{ marginBottom: '32px' }}>
          <img 
            src={question.imageUrl} 
            alt="Question illustration" 
            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
        </div>
      )}

      {/* Answer Options */}
      <div className="form-group">
        {renderAnswerOptions()}
      </div>
    </>
  );
};

export default QuestionDisplay;