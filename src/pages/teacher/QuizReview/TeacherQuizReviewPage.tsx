import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import './TeacherQuizReviewPage.css';

interface Answer {
    id: string;
    answerText: string;
    isCorrect: boolean;
    feedback: string;
    answerOrder: number;
}

interface Question {
    id: string;
    questionNumber: number;
    title: string;
    questionText: string;
    questionType: 'true_false' | 'short_answer' | 'multiple_choice';
    points: number;
    imageUrl: string | null;
    answers: Answer[];
}

interface Student {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    enrolledAt: string;
}

interface Submission {
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

interface StudentAnswer {
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
}

interface StudentReview {
    student: Student;
    submission: Submission | null;
    answers: { [questionId: string]: StudentAnswer } | null;
    allAttempts: Submission[];
    status: 'submitted' | 'not_submitted';
}

interface Assignment {
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

interface Course {
    id: string;
    title: string;
    code: string;
    description: string;
}

interface Statistics {
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

interface QuizReviewData {
    success: boolean;
    message: string;
    assignment: Assignment;
    course: Course;
    questions: Question[];
    studentReviews: StudentReview[];
    statistics: Statistics;
    lastUpdated: string;
}

const TeacherQuizReviewPage: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<QuizReviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'not_submitted'>('all');
    const [sortBy, setSortBy] = useState<'name' | 'score' | 'submission_date'>('name');

useEffect(() => {
    const fetchQuizData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/teacher-review/${quizId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();
            setData(result);
            console.log(result); // Use `result` not `data` (data isn't updated immediately)
        } catch (error) {
            console.error('Error fetching quiz data:', error);
            // For demo purposes, use the provided mock data
        } finally {
            setLoading(false);
        }
    };

    if (quizId) {
        fetchQuizData();
    }
}, [quizId]);


    const getPerformanceLevelColor = (level: string) => {
        switch (level) {
            case 'excellent': return '#10b981';
            case 'good': return '#3b82f6';
            case 'satisfactory': return '#f59e0b';
            case 'needs_attention': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getLetterGradeColor = (grade: string) => {
        switch (grade) {
            case 'A': return '#10b981';
            case 'B': return '#3b82f6';
            case 'C': return '#f59e0b';
            case 'D': return '#f97316';
            case 'F': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const filteredStudents = data?.studentReviews.filter(review => {
        if (filterStatus === 'all') return true;
        return review.status === filterStatus;
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
                {/* Header */}
                <div className="page-header">
                    <div className="breadcrumbs">
                        <span onClick={() => navigate('/teacher/courses')} className="breadcrumb-link">
                            My Courses
                        </span>
                        <span className="breadcrumb-separator">/</span>
                        <span onClick={() => navigate(`/teacher/courses/${data.course.id}`)} className="breadcrumb-link">
                            {data.course.code}
                        </span>
                        <span className="breadcrumb-separator">/</span>
                        <span>Quiz Review</span>
                    </div>

                    <div className="quiz-header">
                        <h1>{data.assignment.title}</h1>
                        <p className="quiz-description">{data.assignment.description}</p>
                        <div className="quiz-meta">
                            <span className="course-tag">{data.course.code} - {data.course.title}</span>
                            <span className="points-tag">{data.assignment.maxPoints} points</span>
                            <span className="due-date">Due: {formatDateTime(data.assignment.dueDate)}</span>
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="statistics-section">
                    <h2>Overview</h2>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>Total Students</h3>
                            <div className="stat-value">{data.statistics.totalStudents}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Submitted</h3>
                            <div className="stat-value">{data.statistics.submittedCount}</div>
                            <div className="stat-subtitle">{data.statistics.completionRate}% completion</div>
                        </div>
                        <div className="stat-card">
                            <h3>Average Score</h3>
                            <div className="stat-value">{data.statistics.averageScore}/{data.assignment.maxPoints}</div>
                            <div className="stat-subtitle">{data.statistics.averagePercentage}%</div>
                        </div>
                        <div className="stat-card">
                            <h3>Grade Distribution</h3>
                            <div className="grade-distribution">
                                {Object.entries(data.statistics.gradeDistribution).map(([grade, count]) => (
                                    <div key={grade} className="grade-item">
                                        <span className="grade-letter" style={{ color: getLetterGradeColor(grade) }}>
                                            {grade}
                                        </span>
                                        <span className="grade-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="controls-section">
                    <div className="filters">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="filter-select"
                        >
                            <option value="all">All Students</option>
                            <option value="submitted">Submitted Only</option>
                            <option value="not_submitted">Not Submitted</option>
                        </select>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="sort-select"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="score">Sort by Score</option>
                            <option value="submission_date">Sort by Submission Date</option>
                        </select>
                    </div>

                    <div className="action-buttons">
                        <button className="export-btn">📊 Export Results</button>
                        <button className="email-btn">📧 Email Students</button>
                    </div>
                </div>

                {/* Student List */}
                <div className="students-section">
                    <h2>Student Submissions ({sortedStudents.length})</h2>

                    <div className="students-list">
                        {sortedStudents.map((review) => (
                            <div
                                key={review.student.id}
                                className={`student-card ${selectedStudent === review.student.id ? 'selected' : ''}`}
                                onClick={() => setSelectedStudent(
                                    selectedStudent === review.student.id ? null : review.student.id
                                )}
                            >
                                <div className="student-info">
                                    <div className="student-avatar">
                                        {review.student.avatarUrl ? (
                                            <img src={review.student.avatarUrl} alt="Avatar" />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {(review.student.name || review.student.email).charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="student-details">
                                        <h3>{review.student.name || 'Unknown'}</h3>
                                        <p>{review.student.email}</p>
                                    </div>
                                </div>

                                <div className="submission-status">
                                    {review.submission ? (
                                        <div className="submitted-info">
                                            <div className="score">
                                                <span className="score-value">{review.submission.score}/{data.assignment.maxPoints}</span>
                                                <span className="percentage">({review.submission.percentage}%)</span>
                                            </div>
                                            <div
                                                className="letter-grade"
                                                style={{ backgroundColor: getLetterGradeColor(review.submission.letterGrade) }}
                                            >
                                                {review.submission.letterGrade}
                                            </div>
                                            <div className="submission-time">
                                                {formatDateTime(review.submission.submittedAt)}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="not-submitted">
                                            <span className="status-badge not-submitted">Not Submitted</span>
                                        </div>
                                    )}
                                </div>

                                <div className="expand-icon">
                                    {selectedStudent === review.student.id ? '▲' : '▼'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Student Detail View */}
                {selectedStudentData && (
                    <div className="student-detail-section">
                        <h2>Detailed Review - {selectedStudentData.student.name || selectedStudentData.student.email}</h2>

                        {selectedStudentData.submission ? (
                            <div className="submission-details">
                                <div className="submission-header">
                                    <div className="submission-meta">
                                        <span>Attempt {selectedStudentData.submission.attemptNumber} of {selectedStudentData.submission.totalAttempts}</span>
                                        <span>Time Spent: {selectedStudentData.submission.timeSpentMinutes} minutes</span>
                                        <span>Submitted: {formatDateTime(selectedStudentData.submission.submittedAt)}</span>
                                    </div>

                                    {selectedStudentData.submission.feedback && (
                                        <div className="teacher-feedback">
                                            <h4>Teacher Feedback:</h4>
                                            <p>{selectedStudentData.submission.feedback}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="answers-review">
                                    <h3>Question Breakdown</h3>
                                    {data.questions.map((question) => {
                                        const studentAnswer = selectedStudentData.answers?.[question.id];
                                        if (!studentAnswer) return null;

                                        return (
                                            <div key={question.id} className="question-review">
                                                <div className="question-header">
                                                    <span className="question-number">Question {question.questionNumber}</span>
                                                    <span className="question-points">
                                                        {studentAnswer.pointsEarned}/{question.points} points
                                                    </span>
                                                    <span className={`correctness ${studentAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
                                                        {studentAnswer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                                    </span>
                                                </div>

                                                <div className="question-content">
                                                    <p className="question-text">{question.questionText}</p>

                                                    <div className="answer-comparison">
                                                        <div className="student-answer">
                                                            <h5>Student Answer:</h5>
                                                            <p>{studentAnswer.studentAnswerText}</p>
                                                        </div>

                                                        {question.questionType !== 'short_answer' && (
                                                            <div className="correct-answer">
                                                                <h5>Correct Answer:</h5>
                                                                <p>{studentAnswer.correctAnswerText}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {studentAnswer.feedback && (
                                                        <div className="answer-feedback">
                                                            <h5>Feedback:</h5>
                                                            <p>{studentAnswer.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="no-submission">
                                <p>This student has not submitted the quiz yet.</p>
                                <button className="remind-btn">Send Reminder Email</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};


export default TeacherQuizReviewPage;