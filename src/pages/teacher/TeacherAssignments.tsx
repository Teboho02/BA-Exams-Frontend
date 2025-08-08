import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Save, Eye, EyeOff, Plus, Trash2, Edit, HelpCircle, Image, X, Lock, ArrowLeft, Calculator } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout'; // Adjust path as needed
import './TeacherAssignments.css';
import MathSymbolPicker from '../utils/MathSymbolPicker';

// Type definitions
interface Assignment {
  title: string;
  description: string;
  assignmentType: string;
  assignmentGroup: string;
  points: number;
  gradingType: string;
  submissionTypes: string[];
  dueDate: string;
  availableFrom: string;
  availableUntil: string;
  published: boolean;
  allowedAttempts: number;
  timeLimit: string;
  hasTimeLimit: boolean;
  shuffleAnswers: boolean;
  showCorrectAnswers: boolean;
  multipleAttempts: boolean;
  oneQuestionAtTime: boolean;
  cantGoBack: boolean;
  requireAccessCode: boolean;
  accessCode: string;
  ipFiltering: boolean;
  ipFilter: string;
  notifyOfUpdate: boolean;
  password: string;
  quizInstructions: string;
}

interface Answer {
  id: number;
  text: string;
  correct: boolean;
  feedback: string;
}

interface Question {
  id: number;
  title: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'file_upload';
  points: number;
  text: string;
  answers: Answer[];
  imageUrl?: string;
  acceptableAnswers?: string[];
  matchType?: 'exact' | 'contains' | 'regex';
  caseSensitive?: boolean;
}

// interface QuizQuestion {
//   id: string;
//   question: string;
//   options: string[];
//   correctAnswer: number;
//   points: number;
// }

// interface Quiz {
//   id: string;
//   title: string;
//   description: string;
//   questions: QuizQuestion[];
//   timeLimit?: number;
//   attempts: number;
// }

type ActiveTab = 'details' | 'questions';

// Enhanced TextArea component with math symbol picker
const MathTextArea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  rows?: number;
}> = ({ value, onChange, placeholder, className, style, rows }) => {
  const [showMathPicker, setShowMathPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMathSymbol = (symbol: string, latex: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      console.log(latex)
      // Insert the symbol at cursor position
      const newValue = value.substring(0, start) + symbol + value.substring(end);
      onChange(newValue);
      
      // Move cursor after inserted symbol
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + symbol.length;
        textarea.focus();
      }, 0);
    }
    setShowMathPicker(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          style={{ ...style, paddingRight: '50px' }}
          rows={rows}
        />
        <button
          type="button"
          onClick={() => setShowMathPicker(true)}
          className="icon-btn"
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px',
            zIndex: 1
          }}
          title="Insert mathematical symbol"
        >
          <Calculator size={16} />
        </button>
      </div>
      
      {showMathPicker && (
        <MathSymbolPicker
          onInsert={insertMathSymbol}
          onClose={() => setShowMathPicker(false)}
        />
      )}
    </div>
  );
};

// Enhanced Input component with math symbol picker
const MathInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ value, onChange, placeholder, className, style }) => {
  const [showMathPicker, setShowMathPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const insertMathSymbol = (symbol: string, latex: string) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      console.log('Inserting symbol:', latex, 'at position:', start, end);
      // Insert the symbol at cursor position
      const newValue = value.substring(0, start) + symbol + value.substring(end);
      onChange(newValue);
      
      // Move cursor after inserted symbol
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + symbol.length;
        input.focus();
      }, 0);
    }
    setShowMathPicker(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={className}
          style={{ ...style, paddingRight: '50px' }}
        />
        <button
          type="button"
          onClick={() => setShowMathPicker(true)}
          className="icon-btn"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px',
            zIndex: 1
          }}
          title="Insert mathematical symbol"
        >
          <Calculator size={16} />
        </button>
      </div>
      
      {showMathPicker && (
        <MathSymbolPicker
          onInsert={insertMathSymbol}
          onClose={() => setShowMathPicker(false)}
        />
      )}
    </div>
  );
};

// Separate QuestionEditor component to prevent re-renders
const QuestionEditor: React.FC<{
  question: Question;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onDeleteQuestion: () => void;
  onAddAnswer: () => void;
  onUpdateAnswer: (answerId: number, field: keyof Answer, value: string | boolean) => void;
  onDeleteAnswer: (answerId: number) => void;
  onSetCorrectAnswer: (answerId: number) => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}> = React.memo(({
  question,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddAnswer,
  onUpdateAnswer,
  onDeleteAnswer,
  onSetCorrectAnswer,
  onImageUpload,
  onRemoveImage
}) => {
  return (
    <div className="question-editor card">
      <div className="question-editor-header">
        <input
          type="text"
          value={question.title}
          onChange={(e) => onUpdateQuestion({ title: e.target.value })}
          className="question-title-input"
          placeholder="Question title"
        />
        <div className="question-controls">
          <select 
            value={question.type}
            onChange={(e) => onUpdateQuestion({ type: e.target.value as Question['type'] })}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True/False</option>
            <option value="short_answer">Short Answer</option>
            <option value="essay">Essay</option>
            <option value="file_upload">File Upload</option>
          </select>
          <input
            type="number"
            value={question.points}
            onChange={(e) => onUpdateQuestion({ points: parseInt(e.target.value) || 0 })}
            className="points-input"
            min="0"
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>pts</span>
          <button
            onClick={onDeleteQuestion}
            className="icon-btn danger"
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Question Text</label>
        <MathTextArea
          value={question.text}
          onChange={(value) => onUpdateQuestion({ text: value })}
          placeholder="Enter your question..."
          className="form-textarea"
          style={{ height: '96px' }}
        />
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label className="form-label">Question Image (Optional)</label>
        {question.imageUrl ? (
          <div className="image-preview-container">
            <img src={question.imageUrl} alt="Question" className="question-image-preview" />
            <button
              onClick={onRemoveImage}
              className="remove-image-btn"
              type="button"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="image-upload-area">
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="file-input-hidden"
              id={`image-upload-${question.id}`}
            />
            <label htmlFor={`image-upload-${question.id}`} className="image-upload-label">
              <Image size={24} />
              <span>Click to upload an image</span>
              <span className="image-upload-hint">PNG, JPG, GIF up to 10MB</span>
            </label>
          </div>
        )}
      </div>

      {(question.type === 'multiple_choice' || question.type === 'true_false') && (
        <div className="answer-options">
          <label className="form-label">Answer Options</label>
          {question.answers.map((answer, index) => (
            <div key={answer.id} className="answer-item">
              <button
                onClick={() => onSetCorrectAnswer(answer.id)}
                className={`correct-btn ${answer.correct ? 'correct' : ''}`}
                title="Mark as correct answer"
                type="button"
              >
                {answer.correct && <div className="correct-indicator" />}
              </button>
              <div className="answer-inputs">
                <MathInput
                  value={answer.text}
                  onChange={(value) => onUpdateAnswer(answer.id, 'text', value)}
                  placeholder={`Answer ${index + 1}`}
                  className="answer-input"
                />
                <MathInput
                  value={answer.feedback}
                  onChange={(value) => onUpdateAnswer(answer.id, 'feedback', value)}
                  placeholder="Answer feedback (optional)"
                  className="feedback-input"
                />
              </div>
              {question.answers.length > 2 && (
                <button
                  onClick={() => onDeleteAnswer(answer.id)}
                  className="icon-btn danger"
                  style={{ marginTop: '4px' }}
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddAnswer}
            className="add-answer"
            type="button"
          >
            <Plus size={16} />
            Add another answer
          </button>
        </div>
      )}

      {question.type === 'short_answer' && (
        <div className="form-group">
          <label className="form-label">Acceptable Answers</label>
          
          <div style={{ 
            background: '#f3f4f6', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Enter all acceptable answers. Students' responses will be automatically marked correct if they match any of these.
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px', display: 'block' }}>
              Matching Options:
            </label>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <select
                value={question.matchType || 'exact'}
                onChange={(e) => onUpdateQuestion({ 
                  matchType: e.target.value as 'exact' | 'contains' | 'regex' 
                })}
                className="form-select"
                style={{ minWidth: '150px' }}
              >
                <option value="exact">Exact Match</option>
                <option value="contains">Contains Text</option>
                <option value="regex">Regular Expression</option>
              </select>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={question.caseSensitive || false}
                  onChange={(e) => onUpdateQuestion({ caseSensitive: e.target.checked })}
                  className="checkbox"
                />
                <span style={{ fontSize: '14px' }}>Case Sensitive</span>
              </label>
            </div>
          </div>

          {/* Acceptable answers input */}
          {(!question.acceptableAnswers || question.acceptableAnswers.length === 0 ? [''] : question.acceptableAnswers).map((answer, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <MathInput
                value={answer}
                onChange={(value) => {
                  const newAnswers = [...(question.acceptableAnswers || [''])];
                  newAnswers[index] = value;
                  onUpdateQuestion({ acceptableAnswers: newAnswers });
                }}
                placeholder={
                  question.matchType === 'regex' 
                    ? 'Enter regex pattern (e.g., ^\\d{4}$)' 
                    : `Acceptable answer ${index + 1}`
                }
                className="form-input"
                style={{ flex: 1 }}
              />
              {(question.acceptableAnswers?.length || 1) > 1 && (
                <button
                  onClick={() => {
                    const newAnswers = question.acceptableAnswers?.filter((_, i) => i !== index) || [];
                    onUpdateQuestion({ acceptableAnswers: newAnswers });
                  }}
                  className="icon-btn danger"
                  type="button"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          
          <button
            onClick={() => {
              const currentAnswers = question.acceptableAnswers || [''];
              onUpdateQuestion({ acceptableAnswers: [...currentAnswers, ''] });
            }}
            className="add-answer"
            type="button"
          >
            <Plus size={16} />
            Add another acceptable answer
          </button>

          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
            Students will see a text box to type their answer. Their response will be automatically checked against these acceptable answers.
          </p>
        </div>
      )}

      {question.type === 'essay' && (
        <div className="info-box">
          <p className="info-text">
            Students will be given a text area to compose their answer. This question type requires manual grading.
          </p>
        </div>
      )}

      {question.type === 'file_upload' && (
        <div className="info-box">
          <p className="info-text">
            Students will be able to upload a file as their answer. This question type requires manual grading.
          </p>
        </div>
      )}
    </div>
  );
});

const AssignmentCreator: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(assignmentId);

  const [assignment, setAssignment] = useState<Assignment>({
    title: 'Unnamed Quiz',
    description: '',
    assignmentType: 'quiz',
    assignmentGroup: 'quizzes',
    points: 10,
    gradingType: 'points',
    submissionTypes: ['online_quiz'],
    dueDate: '',
    availableFrom: '',
    availableUntil: '',
    published: false,
    allowedAttempts: 1,
    timeLimit: '',
    hasTimeLimit: false,
    shuffleAnswers: false,
    showCorrectAnswers: true,
    multipleAttempts: false,
    oneQuestionAtTime: false,
    cantGoBack: false,
    requireAccessCode: false,
    accessCode: '',
    ipFiltering: false,
    ipFilter: '',
    notifyOfUpdate: false,
    password: '',
    quizInstructions: ''
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
//  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [loadError, setLoadError] = useState<string>('');

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || 
           sessionStorage.getItem('accessToken') || 
           localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           '';
  };

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  };

  // Convert backend question format to frontend Question format
  const convertBackendQuestionToFrontend = (backendQuestion: any): Question => {
    const answers: Answer[] = [];
    
    // Handle different question types
    if (backendQuestion.questionType === 'multiple_choice' || backendQuestion.questionType === 'true_false') {
      if (backendQuestion.answers && Array.isArray(backendQuestion.answers)) {
        backendQuestion.answers.forEach((answer: any, index: number) => {
          answers.push({
            id: index + 1,
            text: answer.text || '',
            correct: answer.correct || false,
            feedback: answer.feedback || ''
          });
        });
      }
      
      // Ensure at least 2 answers for multiple choice/true false
      if (answers.length < 2) {
        answers.push(
          { id: 1, text: '', correct: true, feedback: '' },
          { id: 2, text: '', correct: false, feedback: '' }
        );
      }
    }

    return {
      id: parseInt(backendQuestion.id) || Date.now(),
      title: backendQuestion.title || `Question ${questions.length + 1}`,
      type: backendQuestion.questionType || 'multiple_choice',
      points: backendQuestion.points || 1,
      text: backendQuestion.questionText || '',
      answers: answers,
      imageUrl: backendQuestion.imageUrl || undefined
    };
  };

  // Load existing assignment data when editing
  useEffect(() => {
    const loadAssignmentData = async () => {
      if (!isEditing || !assignmentId) return;

      try {
        setIsLoading(true);
        setLoadError('');

        const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized. Please login again.');
          }
          throw new Error('Failed to load assignment data');
        }

        const data = await response.json();
        
        if (data.success && data.assignment) {
          const assignmentData = data.assignment;
          
          // Map backend assignment data to frontend format
          setAssignment({
            title: assignmentData.title || 'Unnamed Quiz',
            description: assignmentData.description || '',
            assignmentType: assignmentData.assignment_type || 'quiz',
            assignmentGroup: assignmentData.assignment_group || 'quizzes',
            points: assignmentData.max_points || 10,
            gradingType: assignmentData.grading_type || 'points',
            submissionTypes:  ['online_quiz'],
            dueDate: formatDateForInput(assignmentData.due_date),
            availableFrom: formatDateForInput(assignmentData.available_from),
            availableUntil: formatDateForInput(assignmentData.available_until),
            published: assignmentData.is_published || false,
            allowedAttempts: assignmentData.allowed_attempts || 1,
            timeLimit: assignmentData.time_limit_minutes ? assignmentData.time_limit_minutes.toString() : '',
            hasTimeLimit: assignmentData.has_time_limit || false,
            shuffleAnswers: assignmentData.shuffle_answers || false,
            showCorrectAnswers: assignmentData.show_correct_answers !== false, // Default to true
            multipleAttempts: (assignmentData.allowed_attempts || 1) > 1,
            oneQuestionAtTime: assignmentData.one_question_at_time || false,
            cantGoBack: assignmentData.cant_go_back || false,
            requireAccessCode: !!assignmentData.access_code,
            accessCode: assignmentData.access_code || '',
            ipFiltering: assignmentData.ip_filtering || false,
            ipFilter: assignmentData.ip_filter || '',
            notifyOfUpdate: false,
            password: assignmentData.access_code || '',
            quizInstructions: assignmentData.instructions || ''
          });

          // Load questions if available
          if (assignmentData.questions && Array.isArray(assignmentData.questions)) {
            const convertedQuestions = assignmentData.questions.map(convertBackendQuestionToFrontend);
            setQuestions(convertedQuestions);
          }

        } else {
          throw new Error('Invalid assignment data received');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load assignment';
        setLoadError(errorMessage);
        console.error('Error loading assignment:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignmentData();
  }, [isEditing, assignmentId]);

  const handleInputChange = useCallback(<K extends keyof Assignment>(field: K, value: Assignment[K]): void => {
    setAssignment(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous save errors
    if (saveError) setSaveError('');
  }, [saveError]);

  // const handleArrayChange = useCallback((field: keyof Assignment, value: string, checked: boolean): void => {
  //   setAssignment(prev => ({
  //     ...prev,
  //     [field]: checked 
  //       ? [...(prev[field] as string[]), value]
  //       : (prev[field] as string[]).filter(item => item !== value)
  //   }));
  // }, []);

  // Save quiz function (updated for both create and edit)
  const saveQuiz = useCallback(async (publish: boolean = false) => {
    setIsSaving(true);
    setSaveError('');

    try {
      // Validate required fields
      if (!assignment.title.trim()) {
        throw new Error('Quiz title is required');
      }

      if (!assignment.description.trim()) {
        throw new Error('Quiz description is required');
      }

      if (questions.length === 0) {
        throw new Error('At least one question is required');
      }

      // Validate questions
      for (const question of questions) {
        if (!question.text.trim()) {
          throw new Error(`Question "${question.title}" must have question text`);
        }

        if (question.type === 'multiple_choice' || question.type === 'true_false') {
          const validAnswers = question.answers.filter(a => a.text.trim());
          if (validAnswers.length < 2) {
            throw new Error(`Question "${question.title}" must have at least 2 valid answers`);
          }

          const hasCorrectAnswer = question.answers.some(a => a.correct && a.text.trim());
          if (!hasCorrectAnswer) {
            throw new Error(`Question "${question.title}" must have a correct answer selected`);
          }
        }
      }

      // Calculate total points
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

      const formattedQuestions = questions.map((q, index) => {
        const baseQuestion = {
          title: q.title || `Question ${index + 1}`,
          questionText: q.text,
          questionType: q.type,
          points: q.points || 1,
          imageUrl: q.imageUrl || undefined
        };

        if (q.type === 'multiple_choice' || q.type === 'true_false') {
          return {
            ...baseQuestion,
            answers: q.answers
              .filter(a => a.text.trim())
              .map((a, answerIndex) => ({
                text: a.text.trim(),
                correct: a.correct,
                feedback: a.feedback || ''
              }))
          };
        } else if (q.type === 'short_answer') {
          // Add short answer specific data
          return {
            ...baseQuestion,
            acceptableAnswers: q.acceptableAnswers?.filter(a => a.trim()) || [],
            matchType: q.matchType || 'exact',
            caseSensitive: q.caseSensitive || false
          };
        }

        return baseQuestion;
      });

      // Build payload
      const payload: any = {
        courseId: courseId,
        title: assignment.title.trim(),
        description: assignment.description.trim(),
        assignmentType: 'quiz',
        assignmentGroup: 'quizzes',
        gradingType: 'points',
        maxPoints: totalPoints,
        submissionType: 'online_quiz',
        submissionTypes: ['online_quiz'],
        allowedAttempts: assignment.allowedAttempts === -1 ? 999 : assignment.allowedAttempts,
        hasTimeLimit: assignment.hasTimeLimit,
        timeLimitMinutes: assignment.hasTimeLimit && assignment.timeLimit ? parseInt(assignment.timeLimit) : 480,
        shuffleAnswers: assignment.shuffleAnswers,
        showCorrectAnswers: assignment.showCorrectAnswers,
        oneQuestionAtTime: assignment.oneQuestionAtTime,
        cantGoBack: assignment.cantGoBack,
        instructions: assignment.quizInstructions || '',
        quizInstructions: assignment.quizInstructions || '',
        requireAccessCode: !!assignment.password,
        accessCode: assignment.password || '',
        password: assignment.password || '',
        ipFiltering: false,
        ipFilter: '',
        published: publish || assignment.published,
        is_published: publish || assignment.published,
        questions: formattedQuestions
      };

      // Add dates only if they exist
      if (assignment.dueDate) {
        payload.dueDate = new Date(assignment.dueDate).toISOString();
      }
      if (assignment.availableFrom) {
        payload.availableFrom = new Date(assignment.availableFrom).toISOString();
      }
      if (assignment.availableUntil) {
        payload.availableUntil = new Date(assignment.availableUntil).toISOString();
      }

      console.log('Sending payload to API:', JSON.stringify(payload, null, 2));

      // Determine API endpoint and method
      const url = isEditing 
        ? `http://localhost:3000/api/assignments/${assignmentId}`
        : `http://localhost:3000/api/assignments`;
      const method = isEditing ? 'PUT' : 'POST';

      // Make the API call
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Get response text first
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response as JSON:', responseText);
        if (!response.ok) {
          throw new Error(`Server error (${response.status}): ${responseText || response.statusText}`);
        }
        responseData = { success: true, message: responseText };
      }

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData
        });

        let errorMessage = `Failed to ${isEditing ? 'update' : 'save'} quiz`;
        
        if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.errors) {
          if (Array.isArray(responseData.errors)) {
            const validationErrors: string = (responseData.errors as Array<{ msg?: string; message?: string; param?: string }>)
              .map((err: { msg?: string; message?: string; param?: string }) => err.msg || err.message || err.param)
              .join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          }
        }

        throw new Error(errorMessage);
      }

      console.log(`Quiz ${isEditing ? 'updated' : 'saved'} successfully:`, responseData);
      
      // Update the local state with the new published status
      setAssignment(prev => ({ 
        ...prev, 
        published: publish || prev.published 
      }));

      // Show success message
      alert(`Quiz ${publish ? 'published' : (isEditing ? 'updated' : 'saved')} successfully!`);
      
      // Navigate back to the course page
      navigate(`/teacher/courses/${courseId}`);
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'saving'} quiz:`, error);
      setSaveError(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'save'} quiz`);
      alert(`Error: ${error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'save'} quiz`}`);
    } finally {
      setIsSaving(false);
    }
  }, [assignment, questions, courseId, isEditing, assignmentId, navigate]);

  // Handle cancel button
  const handleCancel = () => {
    navigate(`/teacher/courses/${courseId}`);
  };

  const addQuestion = useCallback((): void => {
    const newQuestion: Question = {
      id: Date.now(),
      title: `Question ${questions.length + 1}`,
      type: 'multiple_choice',
      points: 1,
      text: '',
      answers: [
        { id: 1, text: '', correct: true, feedback: '' },
        { id: 2, text: '', correct: false, feedback: '' }
      ],
      // Initialize short answer properties
      acceptableAnswers: [''],
      matchType: 'exact',
      caseSensitive: false
    };
    setQuestions(prev => [...prev, newQuestion]);
    setEditingQuestion(newQuestion.id);
  }, [questions.length]);

  const updateQuestion = useCallback((questionId: number, updates: Partial<Question>): void => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  }, []);

  const deleteQuestion = useCallback((questionId: number): void => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    if (editingQuestion === questionId) {
      setEditingQuestion(null);
    }
  }, [editingQuestion]);

  const addAnswer = useCallback((questionId: number): void => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const newAnswer: Answer = {
          id: Math.max(0, ...q.answers.map(a => a.id)) + 1,
          text: '',
          correct: false,
          feedback: ''
        };
        return { ...q, answers: [...q.answers, newAnswer] };
      }
      return q;
    }));
  }, []);

  const updateAnswer = useCallback((questionId: number, answerId: number, field: keyof Answer, value: string | boolean): void => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(answer => 
          answer.id === answerId ? { ...answer, [field]: value } : answer
        );
        return { ...q, answers: updatedAnswers };
      }
      return q;
    }));
  }, []);

  const deleteAnswer = useCallback((questionId: number, answerId: number): void => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId && q.answers.length > 2) {
        return { ...q, answers: q.answers.filter(answer => answer.id !== answerId) };
      }
      return q;
    }));
  }, []);

  const setCorrectAnswer = useCallback((questionId: number, answerId: number): void => {
    setQuestions(prev => prev.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(answer => ({
          ...answer,
          correct: answer.id === answerId
        }));
        return { ...q, answers: updatedAnswers };
      }
      return q;
    }));
  }, []);

  const handleImageUpload = useCallback((questionId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        updateQuestion(questionId, { imageUrl });
      };
      reader.readAsDataURL(file);
    }
  }, [updateQuestion]);

  const removeImage = useCallback((questionId: number) => {
    updateQuestion(questionId, { imageUrl: undefined });
  }, [updateQuestion]);

  const totalPoints = useMemo(() => questions.reduce((sum, q) => sum + q.points, 0), [questions]);

  // Loading state for editing
  if (isLoading) {
    return (
      <Layout role="teacher">
        <div className="assignment-creator">
          <div className="loading" style={{ textAlign: 'center', padding: '2rem' }}>
            Loading assignment data...
          </div>
        </div>
      </Layout>
    );
  }

  // Error state for loading
  if (loadError) {
    return (
      <Layout role="teacher">
        <div className="assignment-creator">
          <div className="error" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Error loading assignment: {loadError}</p>
            <button 
              onClick={() => navigate(`/teacher/courses/${courseId}`)} 
              className="btn btn-secondary"
              style={{ marginTop: '1rem' }}
            >
              <ArrowLeft size={16} />
              Back to Course
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="teacher">
      <div className="assignment-creator">
        {/* Header */}
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button 
                onClick={() => navigate(`/teacher/courses/${courseId}`)}
                className="btn btn-secondary"
                style={{ marginRight: '1rem' }}
              >
                <ArrowLeft size={16} />
                Back to Course
              </button>
              <div>
                <h1 className="title">{assignment.title}</h1>
                <div className="badges">
                  <span className={`badge ${assignment.published ? 'badge-published' : 'badge-unpublished'}`}>
                    {assignment.published ? (
                      <>
                        <Eye size={14} />
                        Published
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        Not Published
                      </>
                    )}
                  </span>
                  {assignment.password && (
                    <span className="badge badge-locked">
                      <Lock size={14} />
                      Password Protected
                    </span>
                  )}
                  <span className="points-display">
                    Points: {totalPoints}
                  </span>
                  {isEditing && (
                    <span className="badge badge-editing">
                      <Edit size={14} />
                      Editing
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button 
                onClick={() => saveQuiz(true)}
                className="btn btn-success"
                type="button"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save & Publish'}
              </button>
              <button 
                onClick={() => saveQuiz(false)}
                className="btn btn-primary"
                type="button"
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>

        {saveError && (
          <div className="error-banner">
            <p style={{ color: '#dc2626', background: '#fef2f2', padding: '12px', borderRadius: '8px', margin: '16px 0' }}>
              Error: {saveError}
            </p>
          </div>
        )}

        <div className="main-content">
          {/* Tabs */}
          <div className="tabs">
            <nav className="tab-nav">
              <button
                onClick={() => setActiveTab('details')}
                className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                type="button"
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`tab ${activeTab === 'questions' ? 'active' : ''}`}
                type="button"
              >
                Questions ({questions.length})
              </button>
            </nav>
          </div>

          {activeTab === 'details' && (
            <div className="grid grid-3">
              {/* Main Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Basic Information */}
                <div className="card">
                  <h2 className="card-header">Basic Information</h2>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Quiz Title <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={assignment.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="form-input"
                      placeholder="Enter quiz title"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Quiz Description <span className="required">*</span>
                    </label>
                    <MathTextArea
                      value={assignment.description}
                      onChange={(value) => handleInputChange('description', value)}
                      className="form-textarea"
                      style={{ height: '120px' }}
                      placeholder="Provide a detailed description of the quiz, including learning objectives, topics covered, and grading criteria..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quiz Instructions</label>
                    <MathTextArea
                      value={assignment.quizInstructions}
                      onChange={(value) => handleInputChange('quizInstructions', value)}
                      className="form-textarea"
                      style={{ height: '96px' }}
                      placeholder="Enter specific instructions that students will see before taking the quiz (optional)..."
                    />
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      These instructions will be displayed to students before they start the quiz
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quiz Password (Optional)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={assignment.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="form-input"
                        placeholder="Set a password to restrict access"
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="icon-btn"
                        style={{ 
                          position: 'absolute', 
                          right: '8px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                      Leave empty for open access. If set, students will need this password to access the quiz.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Due Date</label>
                    <input
                      type="datetime-local"
                      value={assignment.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available From</label>
                    <input
                      type="datetime-local"
                      value={assignment.availableFrom}
                      onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Available Until</label>
                    <input
                      type="datetime-local"
                      value={assignment.availableUntil}
                      onChange={(e) => handleInputChange('availableUntil', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Quiz Settings */}
                <div className="card">
                  <h3 className="card-header">Quiz Settings</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Time Limit</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={assignment.hasTimeLimit}
                          onChange={(e) => handleInputChange('hasTimeLimit', e.target.checked)}
                          className="checkbox"
                        />
                        Enable time limit
                      </label>
                      {assignment.hasTimeLimit && (
                        <input
                          type="number"
                          value={assignment.timeLimit}
                          onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                          placeholder="Minutes"
                          className="form-input"
                          style={{ width: '100px' }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Attempts</label>
                    <select
                      value={assignment.allowedAttempts}
                      onChange={(e) => handleInputChange('allowedAttempts', parseInt(e.target.value))}
                      className="form-select"
                    >
                      <option value={1}>1 attempt</option>
                      <option value={2}>2 attempts</option>
                      <option value={3}>3 attempts</option>
                      <option value={-1}>Unlimited attempts</option>
                    </select>
                  </div>

                  <div className="checkbox-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
                      <input
                        type="checkbox"
                        checked={assignment.shuffleAnswers}
                        onChange={(e) => handleInputChange('shuffleAnswers', e.target.checked)}
                        className="checkbox"
                      />
                      Shuffle answer choices
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
                      <input
                        type="checkbox"
                        checked={assignment.showCorrectAnswers}
                        onChange={(e) => handleInputChange('showCorrectAnswers', e.target.checked)}
                        className="checkbox"
                      />
                      Show correct answers after submission
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1b1c1dff' }}>
                      <input
                        type="checkbox"
                        checked={assignment.oneQuestionAtTime}
                        onChange={(e) => handleInputChange('oneQuestionAtTime', e.target.checked)}
                        className="checkbox"
                      />
                      Show one question at a time
                    </label>

                    {assignment.oneQuestionAtTime && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '24px', color: '#1b1c1dff' }}>
                        <input
                          type="checkbox"
                          checked={assignment.cantGoBack}
                          onChange={(e) => handleInputChange('cantGoBack', e.target.checked)}
                          className="checkbox"
                        />
                        Lock questions after answering
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Questions Header */}
              <div className="card">
                <div className="questions-header">
                  <div>
                    <h2 className="card-header" style={{ margin: 0 }}>Questions</h2>
                    <p className="questions-info">
                      {questions.length} questions, {totalPoints} points total
                    </p>
                  </div>
                  <button
                    onClick={addQuestion}
                    className="btn btn-primary"
                    type="button"
                  >
                    <Plus size={16} />
                    New Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              {questions.length === 0 ? (
                <div className="card empty-state">
                  <div className="empty-icon">
                    <HelpCircle size={48} />
                  </div>
                  <h3 className="empty-title">No questions yet</h3>
                  <p className="empty-description">Get started by adding your first question.</p>
                  <button
                    onClick={addQuestion}
                    className="btn btn-primary"
                    type="button"
                  >
                    Add Your First Question
                  </button>
                </div>
              ) : (
                <div className="question-list">
                  {questions.map((question) => {
                    if (editingQuestion === question.id) {
                      return (
                        <QuestionEditor
                          key={question.id}
                          question={question}
                          onUpdateQuestion={(updates) => updateQuestion(question.id, updates)}
                          onDeleteQuestion={() => deleteQuestion(question.id)}
                          onAddAnswer={() => addAnswer(question.id)}
                          onUpdateAnswer={(answerId, field, value) => updateAnswer(question.id, answerId, field, value)}
                          onDeleteAnswer={(answerId) => deleteAnswer(question.id, answerId)}
                          onSetCorrectAnswer={(answerId) => setCorrectAnswer(question.id, answerId)}
                          onImageUpload={(event) => handleImageUpload(question.id, event)}
                          onRemoveImage={() => removeImage(question.id)}
                        />
                      );
                    } else {
                      return (
                        <div key={question.id} className="question-item card">
                          <div className="question-header">
                            <div className="question-content">
                              <h3 className="question-title">{question.title}</h3>
                              <p className="question-meta">
                                {question.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {question.points} pts
                              </p>
                              {question.text && (
                                <p className="question-text">{question.text}</p>
                              )}
                              {question.imageUrl && (
                                <img src={question.imageUrl} alt="Question thumbnail" className="question-thumbnail" />
                              )}
                            </div>
                            <div className="question-actions">
                              <button
                                onClick={() => setEditingQuestion(question.id)}
                                className="icon-btn"
                                type="button"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => deleteQuestion(question.id)}
                                className="icon-btn danger"
                                type="button"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="bottom-actions">
            {isEditing && assignment.published && (
              <label className="notify-checkbox">
                <input
                  type="checkbox"
                  checked={assignment.notifyOfUpdate}
                  onChange={(e) => handleInputChange('notifyOfUpdate', e.target.checked)}
                  className="checkbox"
                />
                <span className="notify-text">Notify users this quiz has changed</span>
              </label>
            )}
            
            <div className="bottom-buttons">
              <button className="btn btn-secondary btn-large" type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button 
                onClick={() => saveQuiz(true)}
                className="btn btn-success btn-large"
                type="button"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save & Publish'}
              </button>
              <button 
                onClick={() => saveQuiz(false)}
                className="btn btn-primary btn-large" 
                type="button"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentCreator;