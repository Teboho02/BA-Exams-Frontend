// components/QuestionReview.tsx
import React from 'react';
import type { Question, StudentAnswer } from '../types/TeacherQuizReviewTypes';
import { renderTextWithLatex } from '../utils/renderTextWithLatex';

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

                {studentAnswer ? (
                    <div className="answer-comparison">
                        <div className="student-answer">
                            <h5>Student Answer:</h5>
                            <div>{renderTextWithLatex(studentAnswer.studentAnswerText || '<em>No answer submitted</em>')}</div>
                        </div>

                        {question.questionType !== 'short_answer' && question.questionType !== 'essay' && (
                            <div className="correct-answer">
                                <h5>Correct Answer:</h5>
                                <div>{renderTextWithLatex(studentAnswer.correctAnswerText)}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p><em>No answer submitted</em></p>
                )}

                {studentAnswer?.feedback && (
                    <div className="answer-feedback">
                        <h5>Feedback:</h5>
                        <div>{renderTextWithLatex(studentAnswer.feedback)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionReview;
