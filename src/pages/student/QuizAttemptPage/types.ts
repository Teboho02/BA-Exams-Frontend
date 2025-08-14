// Types for Quiz components
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructions?: string;
  assignmentType: string;
  maxPoints: number;
  isPublished: boolean;
  submissionType: string;
  dueDate?: string;
  availableFrom?: string;
  availableUntil?: string;
  allowedAttempts: number;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  oneQuestionAtTime: boolean;
  cantGoBack: boolean;
  requireAccessCode: boolean;
  accessCode?: string;
  password?: string;
  quizInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  assignmentId: string;
  questionNumber: number;
  title: string;
  questionText: string;
  questionType: string;
  points: number;
  imageUrl?: string;
  answers: QuestionAnswer[];
}

export interface QuestionAnswer {
  id: string;
  questionId: string;
  answerText: string;
  isCorrect: boolean;
  feedback?: string;
  answerOrder: number;
}

export interface Answer {
  questionId: string;
  selectedAnswer?: string; // Answer ID instead of index
  textAnswer?: string;
  isAnswered: boolean;  
  flagged: boolean;
}

export interface QuizState {
  assignment: Assignment;
  questions: Question[];
  attemptNumber: number;

  // Add the missing properties
  hasSubmitted: boolean;
  canRetake: boolean;
  submission?: {
    score?: number;
    submittedAt?: string;
    answers?: Answer[];
    [key: string]: any; // Optional extra flexibility
  };
}
