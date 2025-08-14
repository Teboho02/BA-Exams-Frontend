// components/QuestionReviewCard.tsx
import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import type { QuizQuestion, QuizDetails } from '../types/quiz';

interface QuestionReviewCardProps {
  question: QuizQuestion;
  quizDetails: QuizDetails;
  canViewAnswers: boolean;
}

const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  question,
  quizDetails,
  canViewAnswers
}) => {
  const questionId = question.id;
  const studentAnswer = quizDetails.answers[questionId];
  const detailedResult = quizDetails.detailedResults[questionId];
  const isCorrect = detailedResult?.correct;
  const pointsAwarded = detailedResult?.points || 0;
  const requiresManualGrading = detailedResult?.requiresManualGrading;

  const renderStudentAnswer = (question: QuizQuestion, studentAnswer: any) => {
    if (!studentAnswer) {
      return <span style={{ color: '#ef4444' }}>No answer provided</span>;
    }
    
    if (question.quiz_question_answers.length > 0) {
      // Multiple choice or true/false
      const selectedAnswerId = studentAnswer.answerId;
      const selectedAnswer = question.quiz_question_answers.find(a => a.id === selectedAnswerId);
      return <span>{selectedAnswer ? selectedAnswer.answer_text : 'Unknown answer'}</span>;
    }
    
    // Short answer or essay
    if (studentAnswer.textAnswer) {
      return <span>{studentAnswer.textAnswer}</span>;
    }
    
    return null;
  };

  const renderCorrectAnswer = (question: QuizQuestion) => {
    if (question.quiz_question_answers.length > 0) {
      const correctAnswers = question.quiz_question_answers.filter(a => a.is_correct);
      return (
        <div>
          {correctAnswers.map(answer => (
            <div key={answer.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} style={{ color: '#16a34a' }} />
              <span>{answer.answer_text}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return <span>Model answer not available</span>;
  };

  return (
    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
          {question.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {requiresManualGrading ? (
            <>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontWeight: '500'
              }}>
                Ungraded / {question.points} pts
              </span>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </>
          ) : (
            <>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                color: isCorrect ? '#166534' : '#991b1b',
                fontWeight: '500'
              }}>
                {pointsAwarded} / {question.points} pts
              </span>
              {isCorrect ? (
                <CheckCircle size={20} style={{ color: '#16a34a' }} />
              ) : (
                <XCircle size={20} style={{ color: '#dc2626' }} />
              )}
            </>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px', color: '#374151' }}>
        <p>{question.question_text}</p>
      </div>
      
      <div style={{ marginBottom: '16px', color: '#374151' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Your Answer:</h4>
        {renderStudentAnswer(question, studentAnswer)}
      </div>
      
      {canViewAnswers && question.quiz_question_answers.length > 0 && !requiresManualGrading && (
        <div style={{ marginBottom: '16px', color: '#374151' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'black' }}>Correct Answer:</h4>
          {renderCorrectAnswer(question)}
        </div>
      )}
      
      {requiresManualGrading && (
        <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} style={{ color: '#f59e0b' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Pending Manual Review</h4>
          </div>
          <p style={{ color: '#92400e', margin: 0 }}>This question requires manual grading by your instructor.</p>
        </div>
      )}
    </div>
  );
};

export default QuestionReviewCard;