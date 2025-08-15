import type { StudentAnswer, Submission, Question } from './TeacherQuizReviewTypes';

// Extended interface for StudentAnswer to support manual grading
export interface ExtendedStudentAnswer extends StudentAnswer {
    // These fields might be added to your existing StudentAnswer interface
    needsManualGrading?: boolean;
    gradedAt?: string | null;
    gradedBy?: string | null;
}

// Extended interface for Submission to support manual grading workflow
export interface ExtendedSubmission extends Submission {
    manualGradingRequired?: boolean;
    manualGradingCompleted?: boolean;
    partiallyGraded?: boolean;
}

// Grading state for the component
export interface GradingState {
    [questionId: string]: {
        points: number;
        feedback: string;
        isEditing: boolean;
    };
}

// API request/response types
export interface GradeUpdateRequest {
    submissionId: string;
    questionId: string;
    points: number;
    feedback?: string;
}

export interface GradeUpdateResponse {
    success: boolean;
    message: string;
    updatedAnswer: {
        questionId: string;
        pointsEarned: number;
        feedback: string;
        isCorrect: boolean;
        isGraded: boolean;
    };
    updatedSubmission: {
        id: string;
        score: number;
        percentage: number;
        letterGrade: string;
        performanceLevel: string;
        status: 'submitted' | 'graded' | 'not_submitted';
    };
}

// Utility functions that work with your existing types
export const isEssayQuestion = (questionType: Question['questionType']): boolean => {
    return questionType === 'essay';
};

export const requiresManualGrading = (questionType: Question['questionType']): boolean => {
    return isEssayQuestion(questionType);
};

export const isAnswerGraded = (answer: StudentAnswer): boolean => {
    // Check the existing isGraded field from your StudentAnswer interface
    return answer.isGraded === true;
};

export const needsGrading = (answer: StudentAnswer, questionType: Question['questionType']): boolean => {
    return requiresManualGrading(questionType) && !isAnswerGraded(answer);
};

export const calculateTotalEarnedPoints = (
    answers: { [questionId: string]: StudentAnswer },
    questions: Question[],
    gradingState?: GradingState
): number => {
    return questions.reduce((total, question) => {
        const answer = answers[question.id];
        if (!answer) return total;

        if (requiresManualGrading(question.questionType) && gradingState?.[question.id]) {
            // Use current grading state if available
            return total + (gradingState[question.id].points || 0);
        }
        
        return total + (answer.pointsEarned || 0);
    }, 0);
};

export const calculateTotalPossiblePoints = (questions: Question[]): number => {
    return questions.reduce((total, question) => total + question.points, 0);
};

export const isSubmissionFullyGraded = (
    answers: { [questionId: string]: StudentAnswer } | null,
    questions: Question[],
    gradingState?: GradingState
): boolean => {
    if (!answers) return true;
    
    return questions.every(question => {
        const answer = answers[question.id];
        if (!answer) return true; // No answer means no grading needed
        
        if (requiresManualGrading(question.questionType)) {
            // Check if it's already graded or currently being graded
            const currentGrading = gradingState?.[question.id];
            return answer.isGraded || (currentGrading?.points !== undefined && currentGrading.points >= 0);
        }
        
        return true; // Non-essay questions are auto-graded
    });
};

export const calculatePercentage = (earnedPoints: number, totalPoints: number): number => {
    return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};

export const calculateLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
};

export const calculatePerformanceLevel = (percentage: number): Submission['performanceLevel'] => {
    if (percentage >= 85) return 'excellent';
    if (percentage >= 75) return 'good';
    if (percentage >= 60) return 'satisfactory';
    return 'needs_attention';
};

// Validation helpers
export const validateGradeInput = (points: number, maxPoints: number): boolean => {
    return !isNaN(points) && points >= 0 && points <= maxPoints;
};

export const formatGradeDisplay = (earnedPoints: number, totalPoints: number): string => {
    return `${earnedPoints}/${totalPoints}`;
};

export const getGradingStatusColor = (answer: StudentAnswer, questionType: Question['questionType']): string => {
    if (!requiresManualGrading(questionType)) return '#6c757d'; // Gray for auto-graded
    if (answer.isGraded) return '#28a745'; // Green for graded
    return '#fd7e14'; // Orange for needs grading
};

export const getGradingStatusText = (answer: StudentAnswer, questionType: Question['questionType']): string => {
    if (!requiresManualGrading(questionType)) return 'Auto-graded';
    if (answer.isGraded) return 'Graded';
    return 'Needs Grading';
};