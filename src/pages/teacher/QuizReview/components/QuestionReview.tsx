    // components/QuestionReview.tsx
    import React from 'react';
    import type { Question, StudentAnswer } from '../types/TeacherQuizReviewTypes';
    import { renderTextWithLatex } from '../utils/renderTextWithLatex';
    import './QuestionReview.css'; // Import the separate CSS file

    interface QuestionReviewProps {
        question: Question;
        studentAnswer?: StudentAnswer | null; // <-- optional now
    }

    const QuestionReview: React.FC<QuestionReviewProps> = ({ question, studentAnswer }) => {
        return (
            <div className="question-review">
                <div className="question-header">
                    <span className="question-number">Question {question.questionNumber}</span>
                    {studentAnswer && (
                        <>
                            <span className="question-points">
                                {studentAnswer.pointsEarned}/{question.points} points
                            </span>
                            <span className={`correctness ${studentAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                                {studentAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                            </span>
                        </>
                    )}
                </div>

                <div className="question-content">
                    <div className="question-text">
                        {renderTextWithLatex(question.questionText)}
                    </div>

                    {/* Enhanced: Show all answer choices for multiple choice */}
                    {question.questionType === 'multiple_choice' && question.answers && question.answers.length > 0 && (
                        <div className="answer-choices">
                            <h5>Answer Choices:</h5>
                            <div className="choices-list">
                                {question.answers.map((choice, index) => (
                                    <div 
                                        key={choice.id} 
                                        className={`choice-item ${choice.isCorrect ? 'correct-choice' : ''} ${
                                            studentAnswer?.studentAnswerId === choice.id ? 'student-selected' : ''
                                        }`}
                                    >
                                        <span className="choice-label">
                                            {String.fromCharCode(65 + index)})
                                        </span>
                                        <span className="choice-text">
                                            {renderTextWithLatex(choice.answerText)}
                                        </span>
                                        <div className="choice-indicators">
                                            {choice.isCorrect && (
                                                <span className="correct-indicator">✓ Correct</span>
                                            )}
                                            {studentAnswer?.studentAnswerId === choice.id && (
                                                <span className="selected-indicator">Student's Choice</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enhanced: Show accepted answers for short answer */}
                    {question.questionType === 'short_answer' && question.shortAnswerOptions && question.shortAnswerOptions.length > 0 && (
                        <div className="short-answer-options">
                            <h5>Accepted Answers:</h5>
                            <div className="short-answers-list">
                                {question.shortAnswerOptions.map((option, index) => (
                                    <div key={option.id} className="short-answer-item">
                                        <span className="option-number">{index + 1}.</span>
                                        <span className="option-text">
                                            {renderTextWithLatex(option.answer_text)}
                                        </span>
                                        <div className="option-settings">
                                            {option.is_exact_match && (
                                                <span className="setting-badge exact-match">Exact Match</span>
                                            )}
                                            {!option.is_case_sensitive && (
                                                <span className="setting-badge case-insensitive">Case Insensitive</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {studentAnswer ? (
                        <div className="answer-comparison">
                            <div className="student-answer">
                                <h5>Student Answer:</h5>
                                <div className={`answer-text ${studentAnswer.isCorrect ? 'correct-answer-text' : 'incorrect-answer-text'}`}>
                                    {renderTextWithLatex(studentAnswer.studentAnswerText || '<em>No answer submitted</em>')}
                                </div>
                            </div>

                            {/* Enhanced: Always show correct answer with better styling */}
                            {studentAnswer.correctAnswerText && (
                                <div className="correct-answer">
                                    <h5>Correct Answer:</h5>
                                    <div className="answer-text correct-reference">
                                        {renderTextWithLatex(studentAnswer.correctAnswerText)}
                                    </div>
                                </div>
                            )}

                            {/* Enhanced: Show comparison summary */}
                            <div className={`answer-summary ${studentAnswer.isCorrect ? 'summary-correct' : 'summary-incorrect'}`}>
                                <div className="summary-content">
                                    <span className="summary-icon">
                                        {studentAnswer.isCorrect ? '✅' : '❌'}
                                    </span>
                                    <span className="summary-text">
                                        {studentAnswer.isCorrect 
                                            ? 'Student answered correctly' 
                                            : 'Student answer is incorrect'
                                        }
                                    </span>
                                    <span className="summary-points">
                                        {studentAnswer.pointsEarned}/{question.points} points
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="no-answer-section">
                            <p><em>No answer submitted</em></p>
                        </div>
                    )}

                    {studentAnswer?.feedback && (
                        <div className="answer-feedback">
                            <h5>Feedback:</h5>
                            <div className="feedback-content">
                                {renderTextWithLatex(studentAnswer.feedback)}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    export default QuestionReview;