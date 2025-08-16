export interface Assignment {
  title: string;
  description: string;
  assignmentType: string;
  assignmentGroup: string;
  points: number;
  gradingType: string;
  submissionTypes: string[];
  dueDate: string;
  availableFrom: string;
  availableUntil: string;
  published: boolean;
  allowedAttempts: number;
  timeLimit: string;
  hasTimeLimit: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  multipleAttempts: boolean;
  oneQuestionAtTime: boolean;
  cantGoBack: boolean;
  requireAccessCode: boolean;
  accessCode: string;
  ipFiltering: boolean;
  ipFilter: string;
  notifyOfUpdate: boolean;
  password: string;
  quizInstructions: string;
}

export interface Answer {
  id: number;
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Question {
  id: number;
  title: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'file_upload';
  points: number;
  text: string;
  answers: Answer[];
  imageUrl?: string;
  acceptableAnswers?: string[];
  matchType?: 'exact' | 'contains' | 'regex';
  caseSensitive?: boolean;
}

export type ActiveTab = 'details' | 'questions';