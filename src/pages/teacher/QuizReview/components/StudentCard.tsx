// components/StudentCard.tsx
import React from 'react';
import type { StudentReview, Assignment } from '../types/TeacherQuizReviewTypes';
import { getLetterGradeColor, formatDateTime } from '../utils/helpers';

interface StudentCardProps {
    review: StudentReview;
    assignment: Assignment;
    isSelected: boolean;
    onSelect: () => void;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
    review, 
    assignment, 
    isSelected, 
    onSelect 
}) => {
    return (
        <div
            className={`student-card ${isSelected ? 'selected' : ''}`}
            onClick={onSelect}
        >
            <div className="student-info">
                <div className="student-avatar">
                    {review.student.avatarUrl ? (
                        <img src={review.student.avatarUrl} alt="Avatar" />
                    ) : (
                        <div className="avatar-placeholder">
                            {(review.student.name || review.student.email).charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="student-details">
                    <h3>{review.student.name || 'Unknown'}</h3>
                    <p>{review.student.email}</p>
                </div>
            </div>

            <div className="submission-status">
                {review.submission ? (
                    <div className="submitted-info">
                        <div className="score">
                            <span className="score-value">{review.submission.score}/{assignment.maxPoints}</span>
                            <span className="percentage">({review.submission.percentage}%)</span>
                        </div>
                        <div
                            className="letter-grade"
                            style={{ backgroundColor: getLetterGradeColor(review.submission.letterGrade) }}
                        >
                            {review.submission.letterGrade}
                        </div>
                        <div className="submission-time">
                            {formatDateTime(review.submission.submittedAt)}
                        </div>
                    </div>
                ) : (
                    <div className="not-submitted">
                        <span className="status-badge not-submitted">Not Submitted</span>
                    </div>
                )}
            </div>

            <div className="expand-icon">
                {isSelected ? '▲' : '▼'}
            </div>
        </div>
    );
};

export default StudentCard;