import React from 'react';
import AssignmentsList from './AssignmentsList';
import type { Assignment } from '../types';

interface CourseContentProps {
  assignments: Assignment[];
  onAssignmentClick: (assignment: Assignment) => void;
}

const CourseContent: React.FC<CourseContentProps> = ({ assignments, onAssignmentClick }) => {
  return (
    <div className="course-timeline">
      <div className="timeline-header">
        <h2>Course Content</h2>
      </div>

      <div className="assignments-section">
        <div className="section-header">
          <h3>📋 Assignments ({assignments.length})</h3>
        </div>
        
        <AssignmentsList 
          assignments={assignments} 
          onAssignmentClick={onAssignmentClick} 
        />
      </div>
    </div>
  );
};

export default CourseContent;