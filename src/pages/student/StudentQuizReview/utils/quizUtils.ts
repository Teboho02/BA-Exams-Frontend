// utils/quizUtils.ts
import type { QuizQuestion, QuizDetails, GradingStats } from '../types/quiz';

export const calculateGradingStats = (questions: QuizQuestion[], quizDetails: QuizDetails): GradingStats => {
  let gradedPoints = 0;
  let totalGradedPossiblePoints = 0;
  let ungradedPoints = 0;
  
  questions.forEach(question => {
    const result = quizDetails.detailedResults[question.id];
    if (result?.requiresManualGrading) {
      ungradedPoints += question.points;
    } else {
      gradedPoints += result?.points || 0;
      totalGradedPossiblePoints += question.points;
    }
  });
  
  return {
    gradedPoints,
    totalGradedPossiblePoints,
    ungradedPoints,
    totalPoints: quizDetails.totalPossiblePoints
  };
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};