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
// import type { GradeUpdateRequest, GradeUpdateResponse } from  './types/ManualGradingExtensions';
import './TeacherQuizReviewPage.css';
    
//const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../config/api';

const TeacherQuizReviewPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<QuizReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'not_submitted'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'score' | 'submission_date'>('name');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                setLoading(true);
                const response = await fetch(API_BASE_URL+`/api/teacher-review/${quizId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                });

                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
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

    // Updated handleGradeUpdate to properly update local state
    const handleGradeUpdate = (studentId: string, questionId: string, points: number, totalScore: number) => {
        setData(prevData => {
            if (!prevData) return prevData;
            
            return {
                ...prevData,
                studentReviews: prevData.studentReviews.map(review => {
                    if (review.student.id === studentId && review.answers) {
                        // Update the specific question's answer
                        const updatedAnswers = {
                            ...review.answers,
                            [questionId]: {
                                ...review.answers[questionId],
                                pointsEarned: points,
                                isCorrect: points > 0,
                                isGraded: true
                            } as StudentAnswer
                        };

                        // Calculate new percentage based on total possible points
                        const totalPossiblePoints = prevData.questions.reduce((sum, q) => sum + q.points, 0);
                        const newPercentage = totalPossiblePoints > 0 ? Math.round((totalScore / totalPossiblePoints) * 100) : 0;

                        return {
                            ...review,
                            answers: updatedAnswers,
                            submission: review.submission ? {
                                ...review.submission,
                                score: totalScore,
                                percentage: newPercentage,
                                letterGrade: calculateLetterGrade(newPercentage),
                                performanceLevel: calculatePerformanceLevel(newPercentage),
                                status: 'graded' as const,
                                gradedAt: new Date().toISOString()
                            } : null
                        };
                    }
                    return review;
                }),
                // Update statistics
                statistics: {
                    ...prevData.statistics,
                    // Recalculate statistics based on updated data
                    averageScore: calculateAverageScore(prevData.studentReviews, studentId, totalScore),
                    averagePercentage: calculateAveragePercentage(prevData.studentReviews, studentId, totalScore, prevData.questions)
                }
            };
        });
    };

    // Helper functions for score calculation
    const calculateLetterGrade = (percentage: number): string => {
        if (percentage >= 90) return 'A';
        if (percentage >= 80) return 'B';
        if (percentage >= 70) return 'C';
        if (percentage >= 60) return 'D';
        return 'F';
    };

    const calculatePerformanceLevel = (percentage: number): any => {
        if (percentage >= 85) return 'excellent';
        if (percentage >= 75) return 'good';
        if (percentage >= 60) return 'satisfactory';
        return 'needs_attention';
    };

    const calculateAverageScore = (studentReviews: any[], updatedStudentId: string, newScore: number): number => {
        const submittedReviews = studentReviews.filter(review => review.submission);
        if (submittedReviews.length === 0) return 0;

        const totalScore = submittedReviews.reduce((sum, review) => {
            if (review.student.id === updatedStudentId) {
                return sum + newScore;
            }
            return sum + (review.submission?.score || 0);
        }, 0);

        return Math.round(totalScore / submittedReviews.length);
    };

    const calculateAveragePercentage = (studentReviews: any[], updatedStudentId: string, newScore: number, questions: any[]): number => {
        const submittedReviews = studentReviews.filter(review => review.submission);
        if (submittedReviews.length === 0) return 0;

        const totalPossiblePoints = questions.reduce((sum, q) => sum + q.points, 0);
        
        const totalPercentage = submittedReviews.reduce((sum, review) => {
            let score = review.submission?.score || 0;
            if (review.student.id === updatedStudentId) {
                score = newScore;
            }
            const percentage = totalPossiblePoints > 0 ? (score / totalPossiblePoints) * 100 : 0;
            return sum + percentage;
        }, 0);

        return Math.round(totalPercentage / submittedReviews.length);
    };

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

    if (!data) {
        return (
            <Layout role="teacher">
                <div className="error">Failed to load quiz data</div>
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