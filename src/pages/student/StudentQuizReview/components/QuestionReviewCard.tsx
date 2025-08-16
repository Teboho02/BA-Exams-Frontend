import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import type { QuizQuestion, QuizDetails } from '../types/quiz';

interface QuestionReviewCardProps {
  question: QuizQuestion;
  quizDetails: QuizDetails;
  canViewAnswers: boolean;
}

const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  question,
  quizDetails,
  canViewAnswers
}) => {
  const questionId = question.id;
  const studentAnswer = quizDetails.answers[questionId];
  const detailedResult = quizDetails.detailedResults[questionId];
  const pointsAwarded = detailedResult?.points || 0;
  const requiresManualGrading = detailedResult?.requiresManualGrading;
  
  // Fix: Determine if answer is correct based on points earned vs total points
  // For manually graded questions, check if points earned equals total points
  // For auto-graded questions, use the 'correct' property if available, otherwise fall back to points comparison
  const isCorrect = detailedResult?.correct !== undefined 
    ? detailedResult.correct 
    : pointsAwarded === question.points;

  // Helper function to render text with LaTeX support
  const renderTextWithLatex = (text: string): React.ReactElement => {
    if (!text) return <span></span>;

    // Split text by $ patterns for display math and $ patterns for inline math
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // First handle display math ($...$)
    const displayMathRegex = /\$\$(.*?)\$\$/g;
    let match;
    
    while ((match = displayMathRegex.exec(text)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index);
        parts.push(...renderInlineMath(beforeText, parts.length));
      }
      
      // Render display math
      try {
        const mathHtml = katex.renderToString(match[1], {
          displayMode: true,
          throwOnError: false,
          strict: false
        });
        parts.push(
          <div 
            key={parts.length} 
            dangerouslySetInnerHTML={{ __html: mathHtml }}
            style={{ margin: '10px 0', textAlign: 'center' }}
          />
        );
      } catch (e) {
        // Fallback for invalid LaTeX
        parts.push(<span key={parts.length} style={{ color: '#ef4444' }}>$${match[1]}$$</span>);
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex);
      parts.push(...renderInlineMath(remainingText, parts.length));
    }
    
    return <>{parts}</>;
  };

  // Helper function to handle inline math ($...$) in text
  const renderInlineMath = (text: string, startKey: number): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Handle inline math ($...$) but not double dollars
    const inlineMathRegex = /(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)/g;
    let match;
    
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add text before the math
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      // Render inline math
      try {
        const mathHtml = katex.renderToString(match[1], {
          displayMode: false,
          throwOnError: false,
          strict: false
        });
        parts.push(
          <span 
            key={startKey + parts.length} 
            dangerouslySetInnerHTML={{ __html: mathHtml }}
          />
        );
      } catch (e) {
        // Fallback for invalid LaTeX
        parts.push(<span key={startKey + parts.length} style={{ color: '#ef4444' }}>${match[1]}$</span>);
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      // Handle $\\newline$ patterns
      const remaining = text.slice(currentIndex).replace(/\$\\newline\$/g, '\n');
      parts.push(remaining);
    }
    
    return parts;
  };

  const renderStudentAnswer = (question: QuizQuestion, studentAnswer: any) => {
    if (!studentAnswer) {
      return <span style={{ color: '#ef4444' }}>No answer provided</span>;
    }
    
    if (question.quiz_question_answers.length > 0) {
      // Multiple choice or true/false
      const selectedAnswerId = studentAnswer.answerId;
      const selectedAnswer = question.quiz_question_answers.find(a => a.id === selectedAnswerId);
      return selectedAnswer ? renderTextWithLatex(selectedAnswer.answer_text) : <span>Unknown answer</span>;
    }
    
    // Short answer or essay
    if (studentAnswer.textAnswer) {
      return renderTextWithLatex(studentAnswer.textAnswer);
    }
    
    return null;
  };

  const renderCorrectAnswer = (question: QuizQuestion) => {
    if (question.quiz_question_answers.length > 0) {
      // Multiple choice questions - show correct answers
      const correctAnswers = question.quiz_question_answers.filter(a => a.is_correct);
      return (
        <div>
          {correctAnswers.map(answer => (
            <div key={answer.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
              <CheckCircle size={16} style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }} />
              <div>{renderTextWithLatex(answer.answer_text)}</div>
            </div>
          ))}
        </div>
      );
    } else {
      // Short answer questions - extract expected answer from question text or show a message
      const expectedAnswer = extractExpectedAnswer(question.question_text);
      if (expectedAnswer) {
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <CheckCircle size={16} style={{ color: '#16a34a', marginTop: '2px', flexShrink: 0 }} />
            <div>{renderTextWithLatex(expectedAnswer)}</div>
          </div>
        );
      }
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Multiple acceptable answers possible</span>;
    }
  };

  // Helper function to extract expected answer from question text
  const extractExpectedAnswer = (questionText: string): string | null => {
    // Common patterns for short answer questions
    const patterns = [
      // "Answer michael" -> "michael"
      /answer\s+"?([^"?\n]+)"?/i,
      // "Type hello" -> "hello"  
      /type\s+"?([^"?\n]+)"?/i,
      // "Enter the value" -> look for specific formats
      /enter\s+"?([^"?\n]+)"?/i,
      // "Write the coordinates in the form (x,y)" -> look for coordinate format
      /form\s+\(([^)]+)\)/i,
      // Look for mathematical expressions in parentheses
      /answer.*\(([^)]+)\)/i,
    ];

    for (const pattern of patterns) {
      const match = questionText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // For coordinate questions, if we see "turning point" or "form (x,y)", 
    // we know it expects coordinates but can't determine the exact answer
    if (questionText.toLowerCase().includes('turning point') || 
        questionText.toLowerCase().includes('form (x,y)')) {
      return null; // Will show "Multiple acceptable answers possible"
    }

    // For mathematical questions, check if there's a specific expected format
    if (questionText.includes('$') || questionText.includes('\\newline')) {
      return null; // Mathematical expressions need manual review
    }

    return null;
  };

  const isShortAnswer = question.quiz_question_answers.length === 0;

  return (
    <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
          {question.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {requiresManualGrading ? (
            <>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: '#fef3c7',
                color: '#92400e',
                fontWeight: '500'
              }}>
                Ungraded / {question.points} pts
              </span>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </>
          ) : (
            <>
              <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px', 
                backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2',
                color: isCorrect ? '#166534' : '#991b1b',
                fontWeight: '500'
              }}>
                {pointsAwarded} / {question.points} pts
              </span>
              {isCorrect ? (
                <CheckCircle size={20} style={{ color: '#16a34a' }} />
              ) : (
                <XCircle size={20} style={{ color: '#dc2626' }} />
              )}
            </>
          )}
        </div>
      </div>
      
      <div style={{ marginBottom: '16px', color: '#374151' }}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{renderTextWithLatex(question.question_text)}</div>
      </div>
      
      <div style={{ marginBottom: '16px', color: '#374151' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Your Answer:</h4>
        {renderStudentAnswer(question, studentAnswer)}
      </div>
      
      {/* Show correct answers for both multiple choice AND short answer questions when allowed */}
      {canViewAnswers && !requiresManualGrading && (
        <div style={{ marginBottom: '16px', color: '#374151' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'black' }}>
            {isShortAnswer ? 'Expected Answer:' : 'Correct Answer:'}
          </h4>
          {renderCorrectAnswer(question)}
        </div>
      )}
      
      {requiresManualGrading && (
        <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Clock size={16} style={{ color: '#f59e0b' }} />
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Pending Manual Review</h4>
          </div>
          <p style={{ color: '#92400e', margin: 0 }}>This question requires manual grading by your instructor.</p>
        </div>
      )}
    </div>
  );
};

export default QuestionReviewCard;