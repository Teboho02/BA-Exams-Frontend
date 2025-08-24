// types/TeacherQuizReviewTypes.ts

export interface Answer {
    id: string;
    answerText: string;
    isCorrect: boolean;
    feedback: string;
    answerOrder: number;
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

export interface StudentReview {
    student: Student;
    submission: Submission | null;
    answers: { [questionId: string]: StudentAnswer } | null;
    allAttempts: Submission[];
    status: 'submitted' | 'not_submitted';
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

export interface Statistics {
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
    notSubmittedCount: number;
    averageScore: number;
    averagePercentage: number;
    completionRate: number;
    totalSubmissions: number;
    gradeDistribution: {
        A: number;
        B: number;
        C: number;
        D: number;
        F: number;
        'Not Graded': number;
    };
    highestScore: number;
    lowestScore: number;
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