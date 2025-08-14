import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { QuizReviewData, QuizDetails } from './types/quiz';
import { calculateGradingStats, getAuthToken } from './utils/quizUtils';
import { fetchQuizReviewData } from './services/quizApi';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorState from './components/ErrorState';
import QuizHeader from './components/QuizHeader';
import QuizInfoCard from './components/QuizInfoCard';
import QuestionsReviewSection from './components/QuestionsReviewSection';
import FeedbackCard from './components/FeedbackCard';

const StudentQuizReview: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const navigate = useNavigate();
  
  const [reviewData, setReviewData] = useState<QuizReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [quizDetails, setQuizDetails] = useState<QuizDetails | null>(null);

  const handleBack = () => navigate(-1);

  // Fetch quiz review data
  const fetchQuizData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      console.log("the submissionID is", submissionId);

      if (!submissionId) {
        setError('No submission ID provided');
        return;
      }

      const data = await fetchQuizReviewData(submissionId, token);

      console.log("Fetched quiz review data:", data);
      
      setReviewData(data);
      // Parse the quizData string
      if (data.submission.quizData) {
        const parsedData: QuizDetails = JSON.parse(data.submission.quizData);
        setQuizDetails(parsedData);
      }
    } catch (err) {
      console.error('Error fetching quiz:', err);
      if (err instanceof Error && err.message === 'UNAUTHORIZED') {
        localStorage.clear();
        navigate('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (submissionId) {
      fetchQuizData();
    }
  }, [submissionId]);

  if (loading) {
    return (
      <LoadingSpinner 
        onBack={handleBack}
        title="Loading Quiz Review..."
        message="Loading quiz data..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState 
        onBack={handleBack}
        error={error}
      />
    );
  }

  if (!reviewData || !reviewData.submission || !quizDetails) {
    return null;
  }

  const submission = reviewData.submission;
  const questions = reviewData.questions;
  const gradingStats = calculateGradingStats(questions, quizDetails);

  return (
    <div className="assignment-creator">
      <QuizHeader 
        submission={submission}
        gradingStats={gradingStats}
        onBack={handleBack}
      />

      <div className="main-content">
        <QuizInfoCard 
          submission={submission}
          questions={questions}
          gradingStats={gradingStats}
        />

        <QuestionsReviewSection 
          questions={questions}
          quizDetails={quizDetails}
          canViewAnswers={reviewData.canViewAnswers}
        />

        {submission.feedback && (
          <FeedbackCard feedback={submission.feedback} />
        )}
      </div>
    </div>
  );
};

export default StudentQuizReview;