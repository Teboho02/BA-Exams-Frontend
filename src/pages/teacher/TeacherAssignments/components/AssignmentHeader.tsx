import React, { useState } from 'react';
import { Save, Eye, EyeOff, Lock, Edit, Play } from 'lucide-react';
import type { Assignment, Question } from '../types/Assignment';
import QuizPreviewModal from './QuizPreviewModal';

interface AssignmentHeaderProps {
  assignment: Assignment;
  questions: Question[];  // Add this prop
  totalPoints: number;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (publish?: boolean) => void;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  assignment,
  questions,  // Add this
  totalPoints,
  isEditing,
  isSaving,
  onCancel,
  onSave
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <div>
              <h1 className="title">{assignment.title}</h1>
              <div className="badges">
                <span className={`badge ${assignment.published ? 'badge-published' : 'badge-unpublished'}`}>
                  {assignment.published ? (
                    <>
                      <Eye size={14} />
                      Published
                    </>
                  ) : (
                    <>
                      <EyeOff size={14} />
                      Not Published
                    </>
                  )}
                </span>
                {assignment.password && (
                  <span className="badge badge-locked">
                    <Lock size={14} />
                    Password Protected
                  </span>
                )}
                <span className="points-display">
                  Points: {totalPoints}
                </span>
                {isEditing && (
                  <span className="badge badge-editing">
                    <Edit size={14} />
                    Editing
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              type="button" 
              onClick={() => setShowPreview(true)}
              disabled={questions.length === 0}
              title={questions.length === 0 ? "Add questions to preview the quiz" : "Preview quiz as student"}
            >
              <Play size={16} />
              Preview
            </button>
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button 
              onClick={() => onSave(true)}
              className="btn btn-success"
              type="button"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save & Publish'}
            </button>
            <button 
              onClick={() => onSave(false)}
              className="btn btn-primary"
              type="button"
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>

      {/* Quiz Preview Modal */}
      <QuizPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        assignment={assignment}
        questions={questions}
      />
    </>
  );
};