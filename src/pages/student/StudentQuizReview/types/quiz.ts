// types/quiz.ts
export interface QuizQuestionAnswer {
  id: string;
  feedback: string;
  created_at: string;
  is_correct: boolean;
  answer_text: string;
  question_id: string;
  answer_order: number;
}

export interface QuizQuestion {
  id: string;
  title: string;
  question_text: string;
  points: number;
  quiz_question_answers: QuizQuestionAnswer[];
}

export interface QuizDetails {
  answers: { 
    [questionId: string]: {
      answerId?: string;
      textAnswer?: string;
    } 
  };
  detailedResults: { 
    [questionId: string]: {
      correct?: boolean;
      points: number;
      requiresManualGrading?: boolean;
    } 
  };
  autoGradedScore: number;
  totalPossiblePoints: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  attemptNumber: number;
  submittedAt: string;
  quizData: string; // This will be parsed to QuizDetails
  status: string;
  feedback?: string;
}

export interface QuizReviewData {
  success: boolean;
  submission: Submission;
  questions: QuizQuestion[];
  canViewAnswers: boolean;
}

export interface GradingStats {
  gradedPoints: number;
  totalGradedPossiblePoints: number;
  ungradedPoints: number;
  totalPoints: number;
}