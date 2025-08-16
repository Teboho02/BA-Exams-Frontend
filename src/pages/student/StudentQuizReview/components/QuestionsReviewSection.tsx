// components/QuestionsReviewSection.tsx
import React from 'react';
import type { QuizQuestion, QuizDetails } from '../types/quiz';
import QuestionReviewCard from './QuestionReviewCard';

interface QuestionsReviewSectionProps {
  questions: QuizQuestion[];
  quizDetails: QuizDetails;
  canViewAnswers: boolean;
}

const QuestionsReviewSection: React.FC<QuestionsReviewSectionProps> = ({
  questions,
  quizDetails,
  canViewAnswers
}) => {
  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h2 className="card-header">Questions Review</h2>
      
      {questions.map((question) => (
        <QuestionReviewCard
          key={question.id}
          question={question}
          quizDetails={quizDetails}
          canViewAnswers={canViewAnswers}
        />
      ))}
    </div>
  );
};

export default QuestionsReviewSection;