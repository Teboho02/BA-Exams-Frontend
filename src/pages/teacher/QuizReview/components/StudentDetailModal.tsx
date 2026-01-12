// components/StudentDetailModal.tsx
import React, { useState } from 'react';
import type { StudentReview, Question, Assignment } from '../types/TeacherQuizReviewTypes';
import { renderTextWithLatex } from '../utils/renderTextWithLatex';
import { formatDateTime } from '../utils/helpers';
import QuestionReview from './QuestionReview';
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../../config/api';  

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
            manuallyGraded: boolean;
        }
    }>({});


    console.log(assignment);
    console.log("Questions", questions);
    // Initialize grading state for ALL questions (not just essays)
    React.useEffect(() => {
        const initialState: typeof gradingState = {};
        questions.forEach(question => {
            if (selectedStudentData.answers?.[question.id]) {
                const answer = selectedStudentData.answers[question.id];
                initialState[question.id] = {
                    points: answer.pointsEarned || 0,
                    isEditing: false,
                    manuallyGraded: (answer.manuallyGraded ?? false) || question.questionType === 'essay'
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
                isEditing: false,
                manuallyGraded: prev[questionId]?.manuallyGraded || false
            }
        }));
    };

    const handleSaveGrade = async (questionId: string) => {
        const grading = gradingState[questionId];
        if (!grading) return;

        // Show loading state
        const originalButtonText = document.querySelector(`button[data-question-id="${questionId}"]`)?.textContent;
        const saveButton = document.querySelector(`button[data-question-id="${questionId}"]`) as HTMLButtonElement;
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        }

        try {
            const response = await fetch(API_BASE_URL + `/api/quiz/submissions/${selectedStudentData.submission?.id}/questions/${questionId}/grade`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    points: grading.points
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save grade');
            }

            // Update local grading state to reflect the saved grade
            setGradingState(prev => ({
                ...prev,
                [questionId]: {
                    ...prev[questionId],
                    isEditing: false,
                    manuallyGraded: true
                }
            }));

            // Use the total score from the API response if available, otherwise calculate locally
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

            console.log('Grade saved successfully:', {
                questionId,
                points: grading.points,
                totalScore: newTotalScore,
                isFullyGraded: result.data?.isFullyGraded
            });

            // Show success feedback
            if (saveButton) {
                saveButton.textContent = 'Saved!';
                saveButton.style.backgroundColor = '#059669';
                setTimeout(() => {
                    saveButton.textContent = originalButtonText || 'Save Grade';
                    saveButton.style.backgroundColor = '';
                }, 1500);
            }

        } catch (error) {
            console.error('Failed to save grade:', error);
            
            // Show error feedback
            if (saveButton) {
                saveButton.textContent = 'Error!';
                saveButton.style.backgroundColor = '#dc2626';
                setTimeout(() => {
                    saveButton.textContent = originalButtonText || 'Save Grade';
                    saveButton.style.backgroundColor = '';
                }, 2000);
            }

            // Show user-friendly error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to save grade: ${errorMessage}`);
            
            // Reset the grading state on error
            const answer = selectedStudentData.answers?.[questionId];
            setGradingState(prev => ({
                ...prev,
                [questionId]: {
                    points: answer?.pointsEarned || 0,
                    isEditing: false,
                    manuallyGraded: prev[questionId]?.manuallyGraded || false
                }
            }));
        } finally {
            // Re-enable the button
            if (saveButton) {
                saveButton.disabled = false;
            }
        }
    };

    const handleResetToAutoGrade = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || question.questionType === 'essay') return;

        const answer = selectedStudentData.answers?.[questionId];
        if (!answer) return;

        // Reset to original auto-graded score
        const originalPoints = calculateOriginalAutoGradePoints(question, answer);
        
        setGradingState(prev => ({
            ...prev,
            [questionId]: {
                points: originalPoints,
                isEditing: false,
                manuallyGraded: false
            }
        }));

        // Update the parent component
        if (onGradeUpdate) {
            const newTotalScore = calculateTotalScoreWithOverride(questionId, originalPoints);
            onGradeUpdate(
                selectedStudentData.student.id,
                questionId,
                originalPoints,
                newTotalScore
            );
        }
    };

    const calculateOriginalAutoGradePoints = (question: Question, answer: any) => {
        switch (question.questionType) {
            case 'multiple_choice':
            case 'true_false':
                return answer.isCorrect ? question.points : 0;
            case 'short_answer':
                // For short answer, we might need to implement some basic matching logic
                // For now, return the current points or 0
                return answer.isCorrect ? question.points : 0;
            case 'essay':
                return 0; // Essays can't be auto-graded
            default:
                return 0;
        }
    };

    const handlePointsChange = (questionId: string, points: number) => {
        const maxPoints = questions.find(q => q.id === questionId)?.points || 0;
        const clampedPoints = Math.max(0, Math.min(points, maxPoints));
        
        setGradingState(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                points: clampedPoints
            }
        }));
    };

    const calculateTotalScore = () => {
        if (!selectedStudentData.answers) return 0;

        return questions.reduce((total, question) => {
            const answer = selectedStudentData.answers![question.id];
            if (!answer) return total;

            const grading = gradingState[question.id];
            return total + (grading?.points ?? answer.pointsEarned) || 0;
        }, 0);
    };

    const calculateTotalScoreWithOverride = (overrideQuestionId: string, overridePoints: number) => {
        if (!selectedStudentData.answers) return 0;

        return questions.reduce((total, question) => {
            if (question.id === overrideQuestionId) {
                return total + overridePoints;
            }

            const answer = selectedStudentData.answers![question.id];
            if (!answer) return total;

            const grading = gradingState[question.id];
            return total + (grading?.points ?? answer.pointsEarned) || 0;
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
                return answer.isGraded || (grading?.points !== undefined && grading.points >= 0);
            }

            return true; // Non-essay questions are considered graded (either auto or manually)
        });
    };

    const getCurrentPoints = (questionId: string) => {
        const answer = selectedStudentData.answers?.[questionId];
        if (!answer) return 0;

        const grading = gradingState[questionId];
        return (grading?.points ?? answer.pointsEarned) || 0;
    };

    const isManuallyGraded = (questionId: string) => {
        const grading = gradingState[questionId];
        return grading?.manuallyGraded || false;
    };

    const getQuestionTypeLabel = (questionType: string) => {
        switch (questionType) {
            case 'multiple_choice': return 'Multiple Choice';
            case 'true_false': return 'True/False';
            case 'short_answer': return 'Short Answer';
            case 'essay': return 'Essay';
            default: return questionType;
        }
    };

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
                                    <span className="score">{calculateTotalScore()}</span>
                                    <span className="total">/{getTotalPossiblePoints()}</span>
                                    <span className="percentage">
                                        ({Math.round((calculateTotalScore() / getTotalPossiblePoints()) * 100)}%)
                                    </span>
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
                                        Submitted: {formatDateTime(selectedStudentData.submission.submittedAt)}
                                    </span>
                                </div>
                            </div>

                            {/* Render each question review with manual grading capabilities */}
                            {questions.map((question) => {
                                const answer = selectedStudentData.answers?.[question.id];
                                const grading = gradingState[question.id];
                                const currentPoints = getCurrentPoints(question.id);
                                const isManualGrade = isManuallyGraded(question.id);

                                return (
                                    <div key={question.id} className="question-review-container">
                                        <div className="question-header">
                                            <div className="question-info">
                                                <span className="question-number">
                                                    Question {question.questionNumber}
                                                </span>
                                                <span className="question-type">
                                                    [{getQuestionTypeLabel(question.questionType)}]
                                                </span>
                                                <span className="question-points">
                                                    ({question.points} {question.points === 1 ? 'point' : 'points'})
                                                </span>
                                            </div>

                                            {answer && (
                                                <div className="grading-status-indicator">
                                                    {question.questionType === 'essay' ? (
                                                        // Essay grading status
                                                        answer.isGraded || (grading?.points !== undefined && grading.points >= 0) ? (
                                                            <span className="graded">
                                                                Graded: {currentPoints}/{question.points}
                                                            </span>
                                                        ) : (
                                                            <span className="needs-grading">
                                                                Needs Grading
                                                            </span>
                                                        )
                                                    ) : (
                                                        // Non-essay grading status
                                                        <div className="auto-grade-status">
                                                            <span className={`grade-status ${isManualGrade ? 'manually-graded' : 'auto-graded'}`}>
                                                                {isManualGrade ? 'Manual' : 'Auto'}: {currentPoints}/{question.points}
                                                            </span>
                                                            {isManualGrade && (
                                                                <span className="manual-indicator">✏️</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="question-text">
                                            {renderTextWithLatex(question.questionText)}
                                        </div>

                                        {answer ? (
                                            <div className="student-answer-section">
                                                {/* Use enhanced QuestionReview component for all question types */}
                                                {question.questionType !== 'essay' && (
                                                    <div className="question-details-section">
                                                        <QuestionReview
                                                            question={question}
                                                            studentAnswer={answer}
                                                        />
                                                    </div>
                                                )}

                                                {/* For essay questions, show student answer directly */}
                                                {question.questionType === 'essay' && (
                                                    <div className="student-answer-display">
                                                        <h5>Student Answer:</h5>
                                                        <div
                                                            className="student-answer"
                                                            style={{ color: 'black', fontSize: '16px' }}
                                                        >
                                                            {renderTextWithLatex(answer.studentAnswerText || 'No answer provided')}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Manual Grading Section for ALL question types */}
                                                <div className="manual-grading-section">
                                                    <h5>Grading:</h5>
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
                                                                    data-question-id={question.id}
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
                                                            <div className="grade-summary">
                                                                <div className="points-awarded">
                                                                    <strong>Points: {currentPoints}/{question.points}</strong>
                                                                    {isManualGrade && (
                                                                        <span className="manual-grade-badge">Manual Grade</span>
                                                                    )}
                                                                </div>
                                                                <div className="grading-actions-display">
                                                                    <button
                                                                        onClick={() => handleStartGrading(question.id)}
                                                                        className="edit-grade-btn"
                                                                    >
                                                                        {question.questionType === 'essay' ? 'Grade' : 'Override Grade'}
                                                                    </button>
                                                                    {question.questionType !== 'essay' && isManualGrade && (
                                                                        <button
                                                                            onClick={() => handleResetToAutoGrade(question.id)}
                                                                            className="reset-auto-grade-btn"
                                                                            title="Reset to automatic grading"
                                                                        >
                                                                            Reset to Auto
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {isManualGrade && (
                                                                <div className="override-notice">
                                                                    <em>This question has been manually graded and overrides the automatic result.</em>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
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