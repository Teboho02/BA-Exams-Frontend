// TeacherQuizReviewPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import {
    PageHeader,
    StatisticsSection,
    ControlsSection,
    StudentsSection,
    StudentDetailModal
} from './components';
import type { QuizReviewData, StudentAnswer } from './types/TeacherQuizReviewTypes';
import { API_BASE_URL } from '../../../config/api';
import './TeacherQuizReviewPage.css';

const TeacherQuizReviewPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<QuizReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
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
            } catch (error) {
                console.error('Error fetching quiz data:', error);
                setError(error instanceof Error ? error.message : 'Failed to load quiz data');
            } finally {
                setLoading(false);
            }
        };

        if (quizId) {
            fetchQuizData();
        }
    }, [quizId]);

    useEffect(() => {
        if (selectedStudent) {
            document.body.style.overflow = 'hidden';
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
            // Optional: Send update to backend
            // await fetch(`${API_BASE_URL}/api/teacher-review/assignments/${quizId}/grade`, {
            //     method: 'POST',
            //     credentials: 'include',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({
            //         studentId,
            //         questionId,
            //         points,
            //         totalScore
            //     }),
            // });

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

        } catch (error) {
            console.error('Error updating grade:', error);
            // You might want to show an error message to the user here
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

    const selectedStudentData = selectedStudent
        ? data?.studentReviews.find(review => review.student.id === selectedStudent)
        : null;

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

                {selectedStudentData && (
                    <StudentDetailModal
                        selectedStudentData={selectedStudentData}
                        questions={data.questions}
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