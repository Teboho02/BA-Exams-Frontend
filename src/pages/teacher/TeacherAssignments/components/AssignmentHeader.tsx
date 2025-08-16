import React from 'react';
import { Save, Eye, EyeOff, Lock, Edit } from 'lucide-react';
import type { Assignment } from '../types/Assignment';

interface AssignmentHeaderProps {
  assignment: Assignment;
  totalPoints: number;
  isEditing: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (publish?: boolean) => void;
}

export const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  assignment,
  totalPoints,
  isEditing,
  isSaving,
  onCancel,
  onSave
}) => {
  return (
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
  );
};