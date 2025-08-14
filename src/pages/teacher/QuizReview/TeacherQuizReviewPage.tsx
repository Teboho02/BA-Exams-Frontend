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
import type { QuizReviewData } from './types/TeacherQuizReviewTypes';
import './TeacherQuizReviewPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
                    />
                )}
            </div>
        </Layout>
    );
};

export default TeacherQuizReviewPage;