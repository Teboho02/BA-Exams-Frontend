export interface QuizQuestion {
    id?: string;
    question: string;
    options: string[];
    correctAnswer: number;
    points?: number;
}

export interface Quiz {
    id?: string;
    title: string;
    description: string;
    password?: string;
    questions: QuizQuestion[];
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: string;
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
    imageUrl?: string;
    answers: Answer[];
}

export interface Assignment {
    title: string;
    description: string;
    assignmentType: 'assignment' | 'quiz' | 'discussion' | 'external_tool';
    assignmentGroup: string;
    points: number;
    gradingType: 'points' | 'percent' | 'letter_grade' | 'gpa_scale' | 'pass_fail';
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
    password?: string;
    quizInstructions: string;
}
