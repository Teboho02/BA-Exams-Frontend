// components/StudentDetailModal.tsx
import React, { useState } from 'react';
import type { StudentReview, Question, Assignment } from '../types/TeacherQuizReviewTypes';
import { renderTextWithLatex } from '../utils/renderTextWithLatex';
import { formatDateTime } from '../utils/helpers';
import QuestionReview from './QuestionReview';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StudentDetailModalProps {
    selectedStudentData: StudentReview;
    questions: Question[];
    assignment: Assignment;
    closeModal: () => void;
    onGradeUpdate?: (studentId: string, questionId: string, points: number, totalScore: number) => void;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
    selectedStudentData,
    questions,
    assignment,
    closeModal,
    onGradeUpdate
}) => {
    const [gradingState, setGradingState] = useState<{
        [questionId: string]: {
            points: number;
            isEditing: boolean;
        }
    }>({});

    // Initialize grading state for essay questions
    React.useEffect(() => {
        const initialState: typeof gradingState = {};
        questions.forEach(question => {
            if (question.questionType === 'essay' && selectedStudentData.answers?.[question.id]) {
                const answer = selectedStudentData.answers[question.id];
                initialState[question.id] = {
                    points: answer.pointsEarned || 0,
                    isEditing: false
                };
            }
        });
        setGradingState(initialState);
    }, [questions, selectedStudentData]);

    const handleStartGrading = (questionId: string) => {
        setGradingState(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                isEditing: true
            }
        }));
    };

    const handleCancelGrading = (questionId: string) => {
        const answer = selectedStudentData.answers?.[questionId];
        setGradingState(prev => ({
            ...prev,
            [questionId]: {
                points: answer?.pointsEarned || 0,
                isEditing: false
            }
        }));
    };

    const handleSaveGrade = async (questionId: string) => {
        const grading = gradingState[questionId];
        if (!grading) return;

        try {
            // Call the new API endpoint to save the grade
            const response = await fetch(API_BASE_URL + `/api/quiz/submissions/${selectedStudentData.submission?.id}/questions/${questionId}/grade`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    points: grading.points
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save grade');
            }

            const result = await response.json();

            // Update local grading state to reflect the saved grade
            setGradingState(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    isEditing: false
                }
            }));

            // Calculate the new total score from the API response or local calculation
            const newTotalScore = result.data?.totalScore || calculateTotalScore();

            // Call the parent callback to update the main component state
            if (onGradeUpdate) {
                onGradeUpdate(
                    selectedStudentData.student.id,
                    questionId,
                    grading.points,
                    newTotalScore
                );
            }

            console.log('Grade saved successfully:', result.data);

        } catch (error) {
            console.error('Failed to save grade:', error);
            // Optionally show an error message to the user
            alert(`Failed to save grade: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handlePointsChange = (questionId: string, points: number) => {
        setGradingState(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                points: Math.max(0, Math.min(points, questions.find(q => q.id === questionId)?.points || 0))
            }
        }));
    };

    const calculateTotalScore = () => {
        if (!selectedStudentData.answers) return 0;

        return questions.reduce((total, question) => {
            const answer = selectedStudentData.answers![question.id];
            if (!answer) return total;

            if (question.questionType === 'essay') {
                const grading = gradingState[question.id];
                // Use the grading state points if available, otherwise use the answer's points
                return total + (grading?.points ?? answer.pointsEarned) || 0;
            }

            return total + (answer.pointsEarned || 0);
        }, 0);
    };

    const getTotalPossiblePoints = () => {
        return questions.reduce((total, question) => total + question.points, 0);
    };

    const isFullyGraded = () => {
        return questions.every(question => {
            const answer = selectedStudentData.answers?.[question.id];
            if (!answer) return true; // No answer means no grading needed

            if (question.questionType === 'essay') {
                const grading = gradingState[question.id];
                // Check if it's graded (either has been saved or is currently being graded)
                return answer.isGraded || (grading?.points !== undefined && grading.points >= 0);
            }

            return true; // Non-essay questions are auto-graded
        });
    };

    const needsGrading = (questionId: string, questionType: string): boolean => {
        const answer = selectedStudentData.answers?.[questionId];
        if (!answer || questionType !== 'essay') return false;

        return !answer.isGraded;
    };

    console.log(needsGrading);

    // Get the current points for a question (either from grading state or answer data)
    const getCurrentPoints = (questionId: string, questionType: string) => {
        const answer = selectedStudentData.answers?.[questionId];
        if (!answer) return 0;

        if (questionType === 'essay') {
            const grading = gradingState[questionId];
            return (grading?.points ?? answer.pointsEarned) || 0;
        }

        return answer.pointsEarned || 0;
    };

    console.log(assignment);

    return (
        <div className="modal-overlay" onClick={closeModal}
            style={{ display: selectedStudentData ? 'block' : 'none' }}>
            <div className="student-detail-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        Detailed Review - {selectedStudentData.student.name || selectedStudentData.student.email}
                        <span className="close-modal" onClick={closeModal}>&times;</span>
                    </h2>

                    {selectedStudentData.submission && (
                        <div className="score-summary">
                            <div className="score-display">
                                <span className="current-score">
                                    {isFullyGraded() ? (
                                        <>
                                            <span className="score">{calculateTotalScore()}</span>
                                            <span className="total">/{getTotalPossiblePoints()}</span>
                                            <span className="percentage">
                                                ({Math.round((calculateTotalScore() / getTotalPossiblePoints()) * 100)}%)
                                            </span>
                                        </>
                                    ) : (
                                        <span className="ungraded-indicator">
                                            Ungraded ({calculateTotalScore()}/{getTotalPossiblePoints()} partial)
                                        </span>
                                    )}
                                </span>

                                {!isFullyGraded() && (
                                    <span className="grading-status">
                                        Manual grading required
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-content">
                    {selectedStudentData.submission ? (
                        <div className="submission-details">
                            <div className="submission-header">
                                <div className="submission-meta">
                                    <span>
                                        Attempt {selectedStudentData.submission.attemptNumber} of {selectedStudentData.submission.totalAttempts}
                                    </span>
                                    {selectedStudentData.submission.timeSpentMinutes && (
                                        <span>
                                            Time Spent: {selectedStudentData.submission.timeSpentMinutes} minutes
                                        </span>
                                    )}
                                    <span>
                                        Submitted: {formatDateTime(selectedStudentData.submission.submittedAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Render each question review with manual grading for essays */}
                            {questions.map((question) => {
                                const answer = selectedStudentData.answers?.[question.id];
                                const grading = gradingState[question.id];
                                const currentPoints = getCurrentPoints(question.id, question.questionType);

                                return (
                                    <div key={question.id} className="question-review-container">
                                        <div className="question-header">
                                            <div className="question-info">
                                                <span className="question-number">
                                                    Question {question.questionNumber}
                                                </span>
                                                <span className="question-points">
                                                    ({question.points} {question.points === 1 ? 'point' : 'points'})
                                                </span>
                                            </div>

                                            {question.questionType === 'essay' && answer && (
                                                <div className="grading-status-indicator">
                                                    {grading?.points !== undefined && grading.points >= 0 ? (
                                                        <span className="graded">
                                                            Graded: {currentPoints}/{question.points}
                                                        </span>
                                                    ) : answer.isGraded ? (
                                                        <span className="graded">
                                                            Graded: {currentPoints}/{question.points}
                                                        </span>
                                                    ) : (
                                                        <span className="needs-grading">
                                                            Needs Grading
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="question-text">
                                            {renderTextWithLatex(question.questionText)}
                                        </div>

                                        {answer ? (
                                            <div className="student-answer-section">
                                                {question.questionType === 'essay' && (
                                                    <div className="manual-grading-section">
                                                        {grading?.isEditing ? (
                                                            <div className="grading-form">
                                                                <div className="points-input-group">
                                                                    <label htmlFor={`points-${question.id}`}>
                                                                        Points:
                                                                    </label>
                                                                    <input
                                                                        id={`points-${question.id}`}
                                                                        type="number"
                                                                        min="0"
                                                                        max={question.points}
                                                                        step="0.5"
                                                                        value={grading.points}
                                                                        onChange={(e) => handlePointsChange(question.id, parseFloat(e.target.value) || 0)}
                                                                        className="points-input"
                                                                    />
                                                                    <span className="max-points">/ {question.points}</span>
                                                                </div>

                                                                <div className="grading-actions">
                                                                    <button
                                                                        onClick={() => handleSaveGrade(question.id)}
                                                                        className="save-grade-btn"
                                                                    >
                                                                        Save Grade
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancelGrading(question.id)}
                                                                        className="cancel-grade-btn"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="grading-display">
                                                                {(grading?.points !== undefined && grading.points >= 0) || answer.isGraded ? (
                                                                    <div className="grade-summary">
                                                                        <div className="points-awarded">
                                                                            <strong>Points: {currentPoints}/{question.points}</strong>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleStartGrading(question.id)}
                                                                            className="edit-grade-btn"
                                                                        >
                                                                            Edit Grade
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="ungraded-prompt">
                                                                        <span className="ungraded-text">
                                                                            This answer requires manual grading
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleStartGrading(question.id)}
                                                                            className="grade-now-btn"
                                                                        >
                                                                            Grade Now
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <h5>Student Answer:</h5>
                                                <div
                                                    className="student-answer"
                                                    style={{ color: 'black', fontSize: '16px' }}
                                                >                                                    {renderTextWithLatex(answer.studentAnswerText || 'No answer provided')}
                                                </div>

                                                {question.questionType !== 'essay' && (
                                                    <QuestionReview
                                                        question={question}
                                                        studentAnswer={answer}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="no-answer">
                                                <p>No answer provided for this question.</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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