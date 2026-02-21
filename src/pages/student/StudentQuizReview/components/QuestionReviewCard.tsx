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

const extractDisplaylines = (content: string): string => {
  const keyword = '\\displaylines{';
  let result = content;
  let searchFrom = 0;

  while (true) {
    const idx = result.indexOf(keyword, searchFrom);
    if (idx === -1) break;

    const openBrace = idx + keyword.length - 1;
    let depth = 0;
    let closeIdx = -1;

    for (let i = openBrace; i < result.length; i++) {
      if (result[i] === '{') depth++;
      else if (result[i] === '}') {
        depth--;
        if (depth === 0) {
          closeIdx = i;
          break;
        }
      }
    }

    if (closeIdx === -1) break;

    const before = result.slice(0, idx);
    const after = result.slice(closeIdx + 1);
    const beforeMatch = before.match(/^([\s\S]*?)(\$\$?)\s*$/);
    const afterMatch = after.match(/^\s*(\$\$?)([\s\S]*)$/);

    let prefix = before;
    let suffix = after;

    if (beforeMatch && afterMatch && beforeMatch[2] === afterMatch[1]) {
      prefix = beforeMatch[1];
      suffix = afterMatch[2];
    }

    const inner = result.slice(openBrace + 1, closeIdx);
    const lines = inner.split(/\\\\/).map(l => l.trim()).join(' \\\\ ');
    const replacement = `$$\\begin{aligned}${lines}\\end{aligned}$$`;

    result = prefix + replacement + suffix;
    searchFrom = prefix.length + replacement.length;
  }

  return result;
};

const renderTextWithLatex = (text: string): React.ReactElement => {
  if (!text) return <span></span>;

  const processedText = extractDisplaylines(text);
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  const rawTokens = processedText.split(regex).filter(Boolean);

  const tokens = rawTokens.map((token, index) => {
    if (token.startsWith('$$') && token.endsWith('$$')) {
      const latex = token.slice(2, -2).trim();
      try {
        const html = katex.renderToString(latex, { displayMode: true, throwOnError: false, strict: false });
        return <div key={index} dangerouslySetInnerHTML={{ __html: html }} style={{ margin: '10px 0', textAlign: 'center' }} />;
      } catch {
        return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
      }
    }

    if (token.startsWith('$') && token.endsWith('$') && token.length > 1) {
      const latex = token.slice(1, -1).trim();
      if (!latex) return <React.Fragment key={index}>{token}</React.Fragment>;
      try {
        const html = katex.renderToString(latex, { displayMode: false, throwOnError: false, strict: false });
        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
      }
    }

    return <React.Fragment key={index}>{token}</React.Fragment>;
  });

  return <>{tokens}</>;
};

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

  const isCorrect = detailedResult?.correct !== undefined
    ? detailedResult.correct
    : pointsAwarded === question.points;

  const renderStudentAnswer = (question: QuizQuestion, studentAnswer: any) => {
    if (!studentAnswer) {
      return <span style={{ color: '#ef4444' }}>No answer provided</span>;
    }

    if (question.quiz_question_answers.length > 0) {
      const selectedAnswerId = studentAnswer.answerId;
      const selectedAnswer = question.quiz_question_answers.find(a => a.id === selectedAnswerId);
      return selectedAnswer ? renderTextWithLatex(selectedAnswer.answer_text) : <span>Unknown answer</span>;
    }

    if (studentAnswer.textAnswer) {
      return renderTextWithLatex(studentAnswer.textAnswer);
    }

    return null;
  };

  const renderCorrectAnswer = (question: QuizQuestion) => {
    if (question.quiz_question_answers.length > 0) {
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

  const extractExpectedAnswer = (questionText: string): string | null => {
    const patterns = [
      /answer\s+"?([^"?\n]+)"?/i,
      /type\s+"?([^"?\n]+)"?/i,
      /enter\s+"?([^"?\n]+)"?/i,
      /form\s+\(([^)]+)\)/i,
      /answer.*\(([^)]+)\)/i,
    ];

    for (const pattern of patterns) {
      const match = questionText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    if (questionText.toLowerCase().includes('turning point') ||
      questionText.toLowerCase().includes('form (x,y)')) {
      return null;
    }

    if (questionText.includes('$') || questionText.includes('\\newline')) {
      return null;
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