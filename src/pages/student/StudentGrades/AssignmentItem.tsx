import React from 'react';

interface AssignmentItemProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    dueDate?: string | null;
    maxPoints: number;
    type: string;
  };
  marks: {
    latestScore: number | null;
    status: string;
    lastSubmittedAt?: string | null;
  };
}

const AssignmentItem: React.FC<AssignmentItemProps> = ({ assignment, marks }) => {
  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString()
    : 'No due date';

  const submittedAt = marks.lastSubmittedAt
    ? new Date(marks.lastSubmittedAt).toLocaleString()
    : 'Not submitted';

  return (
    <div className="assignment-item" style={{border: '1px solid #ccc', padding: 12, marginBottom: 12, borderRadius: 6}}>
      <h3>{assignment.title}</h3>
      <p>{assignment.description}</p>
      <p><strong>Type:</strong> {assignment.type}</p>
      <p><strong>Max Points:</strong> {assignment.maxPoints}</p>
      <p><strong>Due Date:</strong> {dueDate}</p>
      <p><strong>Status:</strong> {marks.status}</p>
      <p><strong>Latest Score:</strong> {marks.latestScore ?? 'N/A'}</p>
      <p><strong>Last Submitted:</strong> {submittedAt}</p>
    </div>
  );
};

export default AssignmentItem;
