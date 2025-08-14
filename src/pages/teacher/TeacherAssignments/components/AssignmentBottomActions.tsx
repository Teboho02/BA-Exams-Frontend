import React from 'react';
import type { Assignment } from '../types/Assignment';

interface AssignmentBottomActionsProps {
  assignment: Assignment;
  isEditing: boolean;
  isSaving: boolean;
  onNotifyChange: (notify: boolean) => void;
  onCancel: () => void;
  onSave: (publish?: boolean) => void;
}

export const AssignmentBottomActions: React.FC<AssignmentBottomActionsProps> = ({
  assignment,
  isEditing,
  isSaving,
  onNotifyChange,
  onCancel,
  onSave
}) => {
  return (
    <div className="bottom-actions">
      {isEditing && assignment.published && (
        <label className="notify-checkbox">
          <input
            type="checkbox"
            checked={assignment.notifyOfUpdate}
            onChange={(e) => onNotifyChange(e.target.checked)}
            className="checkbox"
          />
          <span className="notify-text">Notify users this quiz has changed</span>
        </label>
      )}
      
      <div className="bottom-buttons">
        <button className="btn btn-secondary btn-large" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button 
          onClick={() => onSave(true)}
          className="btn btn-success btn-large"
          type="button"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save & Publish'}
        </button>
        <button 
          onClick={() => onSave(false)}
          className="btn btn-primary btn-large" 
          type="button"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
        </button>
      </div>
    </div>
  );
};