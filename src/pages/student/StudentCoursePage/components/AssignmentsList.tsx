import React from 'react';
import AssignmentItem from './AssignmentItem';
import type { Assignment } from '../types';

interface AssignmentsListProps {
  assignments: Assignment[];
  onAssignmentClick: (assignment: Assignment) => void;
}

const AssignmentsList: React.FC<AssignmentsListProps> = ({ assignments, onAssignmentClick }) => {
  if (assignments.length === 0) {
    return (
      <div className="empty-assignments">
        <div className="empty-icon">📝</div>
        <h4>No assignments available</h4>
        <p>Your instructor hasn't published any assignments yet. Check back later.</p>
      </div>
    );
  }

  return (
    <div className="assignments-list">
      {assignments.map((assignment) => (
        <AssignmentItem
          key={assignment.id}
          assignment={assignment}
          onAssignmentClick={onAssignmentClick}
        />
      ))}
    </div>
  );
};

export default AssignmentsList;