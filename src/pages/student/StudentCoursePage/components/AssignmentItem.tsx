import React from 'react';
import type { Assignment } from '../types';

interface AssignmentItemProps {
  assignment: Assignment;
  onAssignmentClick: (assignment: Assignment) => void;
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment, onAssignmentClick }) => {
  const getAssignmentIcon = (assignment: Assignment) => {
    switch (assignment.assignment_type) {
      case 'quiz': return '📝';
      case 'discussion': return '💬';
      case 'external_tool': return '🔗';
      default: return '📋';
    }
  };

  const getAssignmentStatusBadge = (assignment: Assignment) => {
    const now = new Date();

    if (!assignment.is_published) {
      return <span className="badge badge-locked">Not Available</span>;
    }

    if (assignment.due_date) {
      const dueDate = new Date(assignment.due_date);
      if (now > dueDate) {
        return <span className="badge badge-overdue">Past Due</span>;
      } else {
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 3) {
          return <span className="badge badge-urgent">Due Soon</span>;
        }
        return <span className="badge badge-upcoming">Upcoming</span>;
      }
    }

    return <span className="badge badge-available">Available</span>;
  };

  return (
    <div
      className="assignment-item"
      onClick={() => onAssignmentClick(assignment)}
    >
      <div className="assignment-icon">
        {getAssignmentIcon(assignment)}
      </div>
      <div className="assignment-details">
        <h4>{assignment.title}</h4>
        {assignment.description && (
          <p className="assignment-description">{assignment.description}</p>
        )}
        <div className="assignment-meta">
          <span className="assignment-points">
            {assignment.max_points} points
          </span>
          <span className="assignment-type">
            {assignment.assignment_type.charAt(0).toUpperCase() + assignment.assignment_type.slice(1)}
          </span>
          {assignment.due_date && (
            <span className="assignment-due-date">
              Due: {new Date(assignment.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="assignment-status">
        {getAssignmentStatusBadge(assignment)}
      </div>
    </div>
  );
};

export default AssignmentItem;