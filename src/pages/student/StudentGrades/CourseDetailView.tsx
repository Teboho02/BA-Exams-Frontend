import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AssignmentItem from './AssignmentItem';
import type { Course, Assignment } from './types';

const CourseDetailView: React.FC<{
  course: Course;
  onBack: () => void;
  onSelectAssignment: (assignment: Assignment) => void;
}> = ({ course, onBack, onSelectAssignment }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <ArrowLeft onClick={onBack} style={{ cursor: 'pointer', marginRight: '1rem' }} />
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>{course.title}</h1>
      </div>
      <p style={{ marginBottom: '1rem', color: '#4b5563' }}>{course.description}</p>

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
          Upcoming Assignments
        </h2>
        {course.assignments.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No assignments available.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {course.assignments.map((assignment) => (
              <AssignmentItem
                key={assignment.id}
                assignment={assignment}
                onSelect={() => onSelectAssignment(assignment)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CourseDetailView;
