// components/StudentsSection.tsx
import React from 'react';
import type { StudentReview, Assignment } from '../types/TeacherQuizReviewTypes';
import StudentCard from './StudentCard';

interface StudentsSectionProps {
    sortedStudents: StudentReview[];
    selectedStudent: string | null;
    setSelectedStudent: (studentId: string) => void;
    assignment: Assignment;
}

const StudentsSection: React.FC<StudentsSectionProps> = ({
    sortedStudents,
    selectedStudent,
    setSelectedStudent,
    assignment
}) => {
    return (
        <div className="students-section">
            <h2>Student Submissions ({sortedStudents.length})</h2>

            <div className="students-list">
                {sortedStudents.map((review) => (
                    <StudentCard
                        key={review.student.id}
                        review={review}
                        assignment={assignment}
                        isSelected={selectedStudent === review.student.id}
                        onSelect={() => setSelectedStudent(review.student.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default StudentsSection;