// TeacherQuizReviewPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import {
    PageHeader,
    StatisticsSection,
    ControlsSection,
    StudentsSection,
    StudentDetailModal
} from './components';
import type { QuizReviewData, StudentAnswer, Question, StudentReview, Answer, ShortAnswerOption } from './types/TeacherQuizReviewTypes';
import { API_BASE_URL } from '../../../config/api';
import './TeacherQuizReviewPage.css';

// Define the API response type for student details
interface StudentDetailAPIResponse {
    assignment: {
        id: string;
        title: string;
        description: string;
        maxPoints: number;
        dueDate: string;
        assignmentType: string;
    };
    course: {
        id: string;
        title: string;
        code: string;
    };
    student: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string | null;
    };
    submission: {
        id: string;
        submittedAt: string;
        status: string;
        score: number;
        percentage: number;
        letterGrade: string;
        performanceLevel: string;
        feedback?: string;
        attemptNumber: number;
        timeStarted: string;
        timeCompleted: string;
        autoSubmitted: boolean;
        gradedAt: string | null;
        gradedBy: string | null;
    } | null;
    questions: Array<{
        id: string;
        questionNumber: number;
        title: string;
        questionText: string;
        questionType: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
        points: number;
        imageUrl?: string;
        answers?: Array<{
            id: string;
            answer_text: string;
            is_correct: boolean;
            feedback?: string;
            answer_order?: number;
        }>;
        shortAnswerOptions?: Array<{
            id: string;
            question_id: string;
            answer_text: string;
            is_case_sensitive: boolean;
            is_exact_match: boolean;
            answer_order: number;
        }>;
        shortAnswerMatchType?: string | null;
        shortAnswerCaseSensitive?: boolean | null;
        studentAnswer?: {
            answer_text?: string;
            correct_answer_text?: string;
            selected_answer_id?: string;
            is_correct: boolean;
            points_earned: number;
            is_graded: boolean;
            manually_graded?: boolean;
        };
    }>;
    hasSubmitted: boolean;
}

const TeacherQuizReviewPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<QuizReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [selectedStudentDetails, setSelectedStudentDetails] = useState<StudentReview & { questions: Question[] } | null>(null);
    const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'not_submitted'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'score' | 'submission_date'>('name');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${API_BASE_URL}/api/teacher-review/assignments/${quizId}/scores`, {
                    credentials: 'include',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch quiz data: ${response.status}`);
                }

                const result = await response.json();
                
                // Transform the API response to match the expected structure
                const transformedData: QuizReviewData = {
                    ...result,
                    // Add empty questions array if missing
                    questions: result.questions || [],
                    // Ensure studentReviews have answers
                    studentReviews: result.studentReviews?.map((review: any) => ({
                        ...review,
                        answers: review.answers || {}
                    })) || []
                };
                
                setData(transformedData);

                console.log("Data at this point is", transformedData);
            } catch (err) {
                console.error('Error fetching quiz data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load quiz data');
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuizData();
        }
    }, [quizId]);


    
    // Fetch detailed student data when a student is selected
    
    // Replace the fetchStudentDetails useEffect in TeacherQuizReviewPage.tsx with this updated version

useEffect(() => {
    const fetchStudentDetails = async () => {
        if (!selectedStudent) {
            setSelectedStudentDetails(null);
            return;
        }

        try {
            setLoadingStudentDetails(true);
            
            // First, get the submission ID for this student
            const studentReview = data?.studentReviews.find(
                review => review.student.id === selectedStudent
            );
            
            if (!studentReview?.submission?.id) {
                throw new Error('No submission found for this student');
            }

            const submissionId = studentReview.submission.id;

            // Fetch detailed results using the new endpoint
            const response = await fetch(
                `${API_BASE_URL}/api/assignments/submission/${submissionId}/results/${quizId}`,
                {
                    credentials: 'include',
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch student details: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Failed to fetch submission results');
            }

            // Parse the quizData JSON string
            const quizData = JSON.parse(result.submission.quizData);

            // Transform the data to match StudentReview type
            const transformedData: StudentReview = {
                student: studentReview.student,
                submission: {
                    id: result.submission.id,
                    submittedAt: result.submission.submittedAt,
                    score: result.submission.score,
                    percentage: studentReview.submission?.percentage || 0,
                    letterGrade: studentReview.submission?.letterGrade || 'F',
                    performanceLevel: studentReview.submission?.performanceLevel || 'needs_attention',
                    status: result.submission.status,
                    gradedAt: result.submission.submittedAt,
                    timeSpent: null // Can calculate if you have timeStarted and timeCompleted
                },
                answers: {},
                status: 'submitted'
            };

            // Transform questions and build answers object
            const transformedQuestions: Question[] = result.questions.map((q: any, index: number) => {
                const questionId = q.id;
                const studentAnswerData = quizData.answers[questionId];
                const detailedResult = quizData.detailedResults[questionId];

                // Build StudentAnswer object
                if (studentAnswerData && detailedResult) {
                    const correctAnswer = q.quiz_question_answers?.find((a: any) => a.is_correct);
                    const studentSelectedAnswer = q.quiz_question_answers?.find(
                        (a: any) => a.id === studentAnswerData.answerId
                    );

                    transformedData.answers[questionId] = {
                        questionNumber: index + 1,
                        questionText: q.question_text,
                        questionPoints: q.points,
                        studentAnswerId: studentAnswerData.answerId || null,
                        studentAnswerText: studentSelectedAnswer?.answer_text || studentAnswerData.textAnswer || '',
                        correctAnswerId: correctAnswer?.id || '',
                        correctAnswerText: correctAnswer?.answer_text || '',
                        isCorrect: detailedResult.correct || false,
                        pointsEarned: detailedResult.points || 0,
                        feedback: null,
                        isGraded: true,
                        manuallyGraded: detailedResult.requiresManualGrading || false,
                        gradedBy: null,
                        gradingNotes: null
                    };
                }

                // Build Question object
                return {
                    id: q.id,
                    questionNumber: index + 1,
                    title: q.title,
                    questionText: q.question_text,
                    questionType: 'multiple_choice', // You may need to add this field to the API response
                    points: q.points,
                    imageUrl: null,
                    answers: q.quiz_question_answers?.map((a: any) => ({
                        id: a.id,
                        answerText: a.answer_text,
                        isCorrect: a.is_correct,
                        feedback: a.feedback || '',
                        answerOrder: a.answer_order || 0
                    })) || [],
                    shortAnswerMatchType: null,
                    shortAnswerCaseSensitive: null,
                    shortAnswerOptions: []
                };
            });

            setSelectedStudentDetails({
                ...transformedData,
                questions: transformedQuestions
            });

            console.log("Student details loaded:", {
                submission: result.submission,
                quizData,
                transformedQuestions
            });
        } catch (err) {
            console.error('Error fetching student details:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            alert('Failed to load student details: ' + errorMessage);
        } finally {
            setLoadingStudentDetails(false);
        }
    };

    fetchStudentDetails();
}, [selectedStudent, quizId, data?.studentReviews]);

    useEffect(() => {
        if (selectedStudent) {
            document.body.style.overflow = 'hidden';
            console.log("The selected student is:", selectedStudent);
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('modal-open');
        };
    }, [selectedStudent]);

    // Fixed handleGradeUpdate function
    const handleGradeUpdate = async (studentId: string, questionId: string, points: number, totalScore: number) => {
        console.log(totalScore);
        if (!data) return;

        try {
            // Update local state
            setData(prevData => {
                if (!prevData) return prevData;
                
                const updatedStudentReviews = prevData.studentReviews.map(review => {
                    if (review.student.id === studentId) {
                        const updatedAnswers = {
                            ...review.answers,
                            [questionId]: {
                                ...review.answers?.[questionId],
                                pointsEarned: points,
                                isCorrect: points > 0,
                                isGraded: true
                            } as StudentAnswer
                        };

                        // Calculate total score from all answers
                        const calculatedTotalScore = Object.values(updatedAnswers).reduce(
                            (sum, answer) => sum + (answer.pointsEarned || 0), 
                            0
                        );

                        const totalPossiblePoints = prevData.questions.reduce((sum, q) => sum + q.points, 0);
                        const newPercentage = totalPossiblePoints > 0 ? 
                            Math.round((calculatedTotalScore / totalPossiblePoints) * 100) : 0;

                        return {
                            ...review,
                            answers: updatedAnswers,
                            submission: review.submission ? {
                                ...review.submission,
                                score: calculatedTotalScore,
                                percentage: newPercentage,
                                letterGrade: calculateLetterGrade(newPercentage),
                                performanceLevel: calculatePerformanceLevel(newPercentage),
                                status: 'graded' as const,
                                gradedAt: new Date().toISOString()
                            } : review.submission
                        };
                    }
                    return review;
                });

                // Recalculate statistics
                const newStatistics = calculateStatistics(updatedStudentReviews, prevData.questions);

                return {
                    ...prevData,
                    studentReviews: updatedStudentReviews,
                    statistics: newStatistics
                };
            });

        } catch (err) {
            console.error('Error updating grade:', err);
        }
    };

    // Helper function to calculate statistics
    const calculateStatistics = (studentReviews: any[], questions: any[]) => {
        console.log(questions);
        const submittedReviews = studentReviews.filter(review => review.submission);
        const totalStudents = studentReviews.length;
        const submittedCount = submittedReviews.length;
        const notSubmittedCount = totalStudents - submittedCount;
        const gradedCount = submittedReviews.filter(review => 
            review.submission?.status === 'graded'
        ).length;

        // Calculate average score and percentage
        let totalScore = 0;
        let totalPercentage = 0;
        
        submittedReviews.forEach(review => {
            totalScore += review.submission?.score || 0;
            totalPercentage += review.submission?.percentage || 0;
        });

        const averageScore = submittedCount > 0 ? Math.round(totalScore / submittedCount) : 0;
        const averagePercentage = submittedCount > 0 ? Math.round(totalPercentage / submittedCount) : 0;
        const submissionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0;

        return {
            totalStudents,
            submittedCount,
            notSubmittedCount,
            gradedCount,
            averageScore,
            averagePercentage,
            submissionRate
        };
    };

    const calculateLetterGrade = (percentage: number): string => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const calculatePerformanceLevel = (percentage: number): string => {
        if (percentage >= 85) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'satisfactory';
        return 'needs_attention';
    };

    // Filter and sort students
    const filteredStudents = data?.studentReviews.filter(review => {
        const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
        const matchesSearch = 
            review.student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.student.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    }) || [];

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return (a.student.name || a.student.email).localeCompare(b.student.name || b.student.email);
            case 'score':
                const scoreA = a.submission?.score || 0;
                const scoreB = b.submission?.score || 0;
                return scoreB - scoreA;
            case 'submission_date':
                if (!a.submission?.submittedAt && !b.submission?.submittedAt) return 0;
                if (!a.submission?.submittedAt) return 1;
                if (!b.submission?.submittedAt) return -1;
                return new Date(b.submission.submittedAt).getTime() - new Date(a.submission.submittedAt).getTime();
            default:
                return 0;
        }
    });

    const closeModal = () => {
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <Layout role="teacher">
                <div className="loading">Loading quiz review...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout role="teacher">
                <div className="error">
                    <p>Failed to load quiz data</p>
                    <p className="error-detail">{error}</p>
                </div>
            </Layout>
        );
    }

    if (!data) {
        return (
            <Layout role="teacher">
                <div className="error">No quiz data available</div>
            </Layout>
        );
    }

    return (
        <Layout role="teacher">
            <div className="quiz-review-page">
                <PageHeader 
                    assignment={data.assignment}
                    course={data.course}
                    navigate={navigate}
                />

                <StatisticsSection 
                    statistics={data.statistics}
                    assignment={data.assignment}
                />

                <ControlsSection
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />

                <StudentsSection
                    sortedStudents={sortedStudents}
                    selectedStudent={selectedStudent}
                    setSelectedStudent={setSelectedStudent}
                    assignment={data.assignment}
                />

                {selectedStudent && selectedStudentDetails && !loadingStudentDetails && (
                    <StudentDetailModal
                        selectedStudentData={selectedStudentDetails}
                        questions={selectedStudentDetails.questions || []}
                        assignment={data.assignment}
                        closeModal={closeModal}
                        onGradeUpdate={handleGradeUpdate}
                    />
                )}
            </div>
        </Layout>
    );
};

export default TeacherQuizReviewPage;