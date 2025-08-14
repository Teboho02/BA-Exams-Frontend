import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Flag, HelpCircle, ArrowLeft } from 'lucide-react';

//import LatexRenderer from '../components/LatexRenderer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface QuizResultsProps {
  submission: any;
  assignment: any;
  questions: any[];
  canRetake: boolean;
  attemptsRemaining: number;
  // Add other necessary fields
}

const QuizResultsPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResultsProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!submissionId) return;

      try {
        setLoading(true);
        setError('');

        const token = getAuthToken();
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch submission results
        const response = await fetch(`${API_BASE_URL}/api/submissions/${submissionId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }

        const data = await response.json();

        if (data.success) {
          setResults({
            submission: data.submission,
            assignment: data.assignment,
            questions: data.questions,
            canRetake: data.canRetake,
            attemptsRemaining: data.attemptsRemaining,
            // Add other necessary fields
          });
        } else {
          setError(data.message || 'Failed to fetch results');
        }
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Network error. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    // If we have state from navigation, use it
    if (location.state) {
      setResults(location.state);
      setLoading(false);
    } else {
      fetchResults();
    }
  }, [submissionId, navigate, location.state]);

  if (loading) {
    return <div style={{ color: '#333333', padding: '20px', fontSize: '16px' }}>Loading results...</div>;
  }

  if (error) {
    return <div style={{ color: '#dc3545', padding: '20px', fontSize: '16px', fontWeight: 'bold' }}>Error: {error}</div>;
  }

  if (!results) {
    return <div style={{ color: '#333333', padding: '20px', fontSize: '16px' }}>No results found</div>;
  }

  const { submission, assignment, questions, canRetake, attemptsRemaining } = results;

  // Format score
  const scorePercentage = Math.round((submission.score / assignment.maxPoints) * 100);

  return (
    <div className="assignment-creator">
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px', color: '#333333' }}>
              <ArrowLeft size={16} />
              <span style={{ color: '#333333' }}>Back</span>
            </button>
            <h1 className="title" style={{ color: '#212529', fontSize: '28px', fontWeight: 'bold' }}>Quiz Results: {assignment.title}</h1>
            <div className="badges">
              <span className="badge badge-success" style={{ color: '#155724', backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
                <CheckCircle size={14} />
                <span style={{ color: '#155724' }}>Completed</span>
              </span>
              <span className="points-display" style={{ color: '#495057', fontSize: '16px', fontWeight: '600' }}>
                Score: {submission.score} / {assignment.maxPoints} ({scorePercentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '32px', backgroundColor: '#ffffff', border: '1px solid #dee2e6' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#212529' }}>
                {scorePercentage >= 70 ? 'Quiz Passed! 🎉' : 'Quiz Completed'}
              </h2>
              <div style={{ fontSize: '18px', marginBottom: '24px', color: '#495057' }}>
                You scored <strong style={{ color: '#212529', fontSize: '20px' }}>{submission.score}</strong> out of <strong style={{ color: '#212529', fontSize: '20px' }}>{assignment.maxPoints}</strong> points.
              </div>
              
              {/* Score percentage with color coding */}
              <div style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: scorePercentage >= 70 ? '#28a745' : '#dc3545',
                marginBottom: '24px'
              }}>
                {scorePercentage}%
              </div>
              
              {/* NEW: Show review button when no attempts remaining */}
              {attemptsRemaining === 0 && !canRetake && (
                <div>
                  <p style={{ marginBottom: '16px', color: '#6c757d', fontSize: '16px' }}>
                    You have no attempts remaining.
                  </p>
                  <button
                    onClick={() => {
                      // Navigate to detailed review page
                      navigate(`/quiz/review/${submission.id}`);
                    }}
                    className="btn btn-primary"
                    style={{ color: '#ffffff', backgroundColor: '#007bff', border: '1px solid #007bff' }}
                  >
                    Review Answers
                  </button>
                </div>
              )}
              
              {/* Show retake button if allowed */}
              {canRetake && attemptsRemaining > 0 && (
                <div>
                  <p style={{ marginBottom: '16px', color: '#6c757d', fontSize: '16px' }}>
                    Attempts remaining: <strong style={{ color: '#212529' }}>{attemptsRemaining}</strong>
                  </p>
                  <button
                    onClick={() => navigate(`/quiz/${assignment.id}`)}
                    className="btn btn-primary"
                    style={{ color: '#ffffff', backgroundColor: '#007bff', border: '1px solid #007bff', padding: '10px 20px', fontSize: '16px' }}
                  >
                    Retake Quiz
                  </button>
                </div>
              )}
            </div>

            {/* Detailed results per question would go here */}
            <div style={{ textAlign: 'left', marginTop: '32px', borderTop: '1px solid #dee2e6', paddingTop: '24px' }}>
              <h3 style={{ color: '#212529', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Quiz Summary
              </h3>
              <div style={{ color: '#495057', fontSize: '14px', lineHeight: '1.5' }}>
                <p style={{ margin: '8px 0', color: '#6c757d' }}>
                  <strong style={{ color: '#212529' }}>Assignment:</strong> {assignment.title}
                </p>
                <p style={{ margin: '8px 0', color: '#6c757d' }}>
                  <strong style={{ color: '#212529' }}>Submitted:</strong> {new Date(submission.submittedAt).toLocaleString()}
                </p>
                <p style={{ margin: '8px 0', color: '#6c757d' }}>
                  <strong style={{ color: '#212529' }}>Total Questions:</strong> {questions.length}
                </p>
                <p style={{ margin: '8px 0', color: '#6c757d' }}>
                  <strong style={{ color: '#212529' }}>Status:</strong> 
                  <span style={{ color: scorePercentage >= 70 ? '#28a745' : '#dc3545', fontWeight: 'bold', marginLeft: '8px' }}>
                    {scorePercentage >= 70 ? 'PASSED' : 'FAILED'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;