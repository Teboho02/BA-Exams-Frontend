// types/TeacherQuizReviewTypes.ts

export interface Answer {
    id: string;
    answerText: string;
    isCorrect: boolean;
    feedback: string;
    answerOrder: number;
}

export interface ShortAnswerOption {
    id: string;
    question_id: string;
    answer_text: string;
    is_case_sensitive: boolean;
    is_exact_match: boolean;
    answer_order: number;
}

export interface Question {
    id: string;
    questionNumber: number;
    title: string;
    questionText: string;
    questionType: 'true_false' | 'short_answer' | 'multiple_choice' | 'essay';
    points: number;
    imageUrl: string | null;
    answers: Answer[];
    // Add short answer properties from your API
    shortAnswerMatchType?: string | null;
    shortAnswerCaseSensitive?: boolean | null;
    shortAnswerOptions?: ShortAnswerOption[];
}

export interface Student {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    enrolledAt: string;
}

export interface Submission {
    id: string;
    status: 'submitted' | 'graded' | 'not_submitted';
    score: number;
    percentage: number;
    letterGrade: string;
    performanceLevel: 'excellent' | 'good' | 'satisfactory' | 'needs_attention';
    submittedAt: string;
    gradedAt: string | null;
    gradedBy: string | null;
    attemptNumber: number;
    totalAttempts: number;
    timeSpentMinutes: number;
    feedback: string | null;
    content: string | null;
    fileUrl: string | null;
    autoSubmitted: boolean;
}

export interface StudentAnswer {
    questionNumber: number;
    questionText: string;
    questionPoints: number;
    studentAnswerId: string | null;
    studentAnswerText: string;
    correctAnswerId?: string;
    correctAnswerText: string;
    isCorrect: boolean;
    pointsEarned: number;
    feedback: string | null;
    isGraded: boolean;
    // New properties for manual grading support
    manuallyGraded?: boolean;
    gradedBy?: string | null;
    gradingNotes?: string | null;
}

// types/TeacherQuizReviewTypes.ts
export interface StudentReview {
    student: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
    };
    status: 'submitted' | 'not_submitted';
    submission: {
        id: string;
        submittedAt: string;
        score: number;
        percentage: number;
        letterGrade: string;
        performanceLevel: string;
        status: string;
        gradedAt: string;
        timeSpent: number | null;
    } | null;
    answers: Record<string, any>; // Flexible for now
}

export interface Assignment {
    id: string;
    title: string;
    description: string;
    type: 'quiz' | 'assignment';
    maxPoints: number;
    dueDate: string;
    availableFrom: string;
    availableUntil: string;
    isPublished: boolean;
    allowedAttempts: number;
    hasTimeLimit: boolean;
    timeLimitMinutes: number;
    showCorrectAnswers: boolean;
    shuffleAnswers: boolean;
    oneQuestionAtTime: boolean;
    cantGoBack: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Course {
    id: string;
    title: string;
    code: string;
    description: string;
}

// types/TeacherQuizReviewTypes.ts

// ... your other interfaces remain the same ...

export interface Statistics {
    totalStudents: number;
    submittedCount: number;
    notSubmittedCount: number;
    gradedCount: number;
    averageScore: number;
    averagePercentage: number;
    submissionRate: number; // Fixed typo: was "submisionRate"
    // Remove these properties since they're not in your API response
    // completionRate?: number;
    // totalSubmissions?: number;
    // gradeDistribution?: {
    //     A: number;
    //     B: number;
    //     C: number;
    //     D: number;
    //     F: number;
    //     'Not Graded': number;
    // };
    // highestScore?: number;
    // lowestScore?: number;
}

export interface QuizReviewData {
    success: boolean;
    message: string;
    assignment: Assignment;
    course: Course;
    questions: Question[];
    studentReviews: StudentReview[];
    statistics: Statistics;
    lastUpdated: string;
    maxPoints: number;
}

// ... rest of your interfaces ...

// Additional types for manual grading functionality
export interface GradeUpdateRequest {
    questionId: string;
    studentId: string;
    submissionId: string;
    points: number;
    manuallyGraded: boolean;
    gradingNotes?: string;
}

export interface GradeUpdateResponse {
    success: boolean;
    data: {
        questionId: string;
        pointsEarned: number;
        totalScore: number;
        percentage: number;
        letterGrade: string;
        isGraded: boolean;
        manuallyGraded: boolean;
        gradedAt: string;
    };
    message?: string;
}