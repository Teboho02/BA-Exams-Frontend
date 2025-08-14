// components/StudentDetailModal.tsx
import React from 'react';
import type { StudentReview, Question, Assignment } from '../types/TeacherQuizReviewTypes';
import { renderTextWithLatex } from '../utils/renderTextWithLatex';
import { formatDateTime } from '../utils/helpers';
import QuestionReview from './QuestionReview';

interface StudentDetailModalProps {
    selectedStudentData: StudentReview;
    questions: Question[];
    assignment: Assignment;
    closeModal: () => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    selectedStudentData,
    questions,
    assignment,
    closeModal
}) => {
    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        Detailed Review - {selectedStudentData.student.name || selectedStudentData.student.email}
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                    </h2>
                </div>

                <div className="modal-content">
                    {selectedStudentData.submission ? (
                        <div className="submission-details">
                            <div className="submission-header">
                                <div className="submission-meta">
                                    <span>
                                        Attempt {selectedStudentData.submission.attemptNumber} of {selectedStudentData.submission.totalAttempts}
                                    </span>
                                    <span>
                                        Time Spent: {selectedStudentData.submission.timeSpentMinutes} minutes
                                    </span>
                                    <span>
                                        Submitted: {formatDateTime(selectedStudentData.submission.submittedAt)}
                                    </span>
                                </div>
                            </div>

                            {selectedStudentData.submission.feedback && (
                                <div className="teacher-feedback">
                                    <h4>Teacher Feedback:</h4>
                                    <div>{renderTextWithLatex(selectedStudentData.submission.feedback)}</div>
                                </div>
                            )}

                            {/* Render each question review */}
                            {questions.map((q) => (
                                <QuestionReview
                                    key={q.id}
                                    question={q}
                                    studentAnswer={selectedStudentData.answers?.[q.id]} // optional now
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="no-submission">
                            <p>This student has not submitted the quiz yet.</p>
                            <button className="remind-btn">Send Reminder Email</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;
