import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import  type { Assignment } from '../types/Assignment';
import { MathTextArea } from './MathTextArea';

interface AssignmentDetailsTabProps {
  assignment: Assignment;
  onInputChange: <K extends keyof Assignment>(field: K, value: Assignment[K]) => void;
}

export const AssignmentDetailsTab: React.FC<AssignmentDetailsTabProps> = ({
  assignment,
  onInputChange
}) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  return (
    <div className="grid grid-3">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Basic Information */}
        <div className="card">
          <h2 className="card-header">Basic Information</h2>
          
          <div className="form-group">
            <label className="form-label">
              Quiz Title <span className="required">*</span>
            </label>
            <input
              type="text"
              value={assignment.title}
              onChange={(e) => onInputChange('title', e.target.value)}
              className="form-input"
              placeholder="Enter quiz title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Quiz Description <span className="required">*</span>
            </label>
            <MathTextArea
              value={assignment.description}
              onChange={(value) => onInputChange('description', value)}
              className="form-textarea"
              style={{ height: '120px' }}
              placeholder="Provide a detailed description of the quiz, including learning objectives, topics covered, and grading criteria..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quiz Instructions</label>
            <MathTextArea
              value={assignment.quizInstructions}
              onChange={(value) => onInputChange('quizInstructions', value)}
              className="form-textarea"
              style={{ height: '96px' }}
              placeholder="Enter specific instructions that students will see before taking the quiz (optional)..."
            />
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              These instructions will be displayed to students before they start the quiz
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Quiz Password (Optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={assignment.password}
                onChange={(e) => onInputChange('password', e.target.value)}
                className="form-input"
                placeholder="Set a password to restrict access"
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn"
                style={{ 
                  position: 'absolute', 
                  right: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Leave empty for open access. If set, students will need this password to access the quiz.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input
              type="datetime-local"
              value={assignment.dueDate}
              onChange={(e) => onInputChange('dueDate', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available From</label>
            <input
              type="datetime-local"
              value={assignment.availableFrom}
              onChange={(e) => onInputChange('availableFrom', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Available Until</label>
            <input
              type="datetime-local"
              value={assignment.availableUntil}
              onChange={(e) => onInputChange('availableUntil', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {/* Quiz Settings */}
        <div className="card">
          <h3 className="card-header">Quiz Settings</h3>
          
          <div className="form-group">
            <label className="form-label">Time Limit</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={assignment.hasTimeLimit}
                  onChange={(e) => onInputChange('hasTimeLimit', e.target.checked)}
                  className="checkbox"
                />
                Enable time limit
              </label>
              {assignment.hasTimeLimit && (
                <input
                  type="number"
                  value={assignment.timeLimit}
                  onChange={(e) => onInputChange('timeLimit', e.target.value)}
                  placeholder="Minutes"
                  className="form-input"
                  style={{ width: '100px' }}
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Attempts</label>
            <select
              value={assignment.allowedAttempts}
              onChange={(e) => onInputChange('allowedAttempts', parseInt(e.target.value))}
              className="form-select"
            >
              <option value={1}>1 attempt</option>
              <option value={2}>2 attempts</option>
              <option value={3}>3 attempts</option>
              <option value={-1}>Unlimited attempts</option>
            </select>
          </div>

          <div className="checkbox-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
              <input
                type="checkbox"
                checked={assignment.shuffleAnswers}
                onChange={(e) => onInputChange('shuffleAnswers', e.target.checked)}
                className="checkbox"
              />
              Shuffle answer choices
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
              <input
                type="checkbox"
                checked={assignment.showCorrectAnswers}
                onChange={(e) => onInputChange('showCorrectAnswers', e.target.checked)}
                className="checkbox"
              />
              Show correct answers after submission
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
              <input
                type="checkbox"
                checked={assignment.oneQuestionAtTime}
                onChange={(e) => onInputChange('oneQuestionAtTime', e.target.checked)}
                className="checkbox"
              />
              Show one question at a time
            </label>

            {assignment.oneQuestionAtTime && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px', color: '#1b1c1dff' }}>
                <input
                  type="checkbox"
                  checked={assignment.cantGoBack}
                  onChange={(e) => onInputChange('cantGoBack', e.target.checked)}
                  className="checkbox"
                />
                Lock questions after answering
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};