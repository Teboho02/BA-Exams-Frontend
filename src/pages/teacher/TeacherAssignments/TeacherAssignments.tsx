// TeacherAssignments.tsx - Main Component (Refactored)
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout';
import './TeacherAssignments.css';
import type { Assignment, Question, Answer, ActiveTab } from './types/Assignment';

// Import components
import { AssignmentHeader } from './components/AssignmentHeader';
import { TabNavigation } from './components/TabNavigation';
import { AssignmentDetailsTab } from './components/AssignmentDetailsTab';
import { QuestionsTab } from './components/QuestionsTab';
import { AssignmentBottomActions } from './components/AssignmentBottomActions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AssignmentCreator: React.FC = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId?: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(assignmentId);

  // State
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [loadError, setLoadError] = useState<string>('');

  // Helper functions
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || 
           sessionStorage.getItem('accessToken') || 
           localStorage.getItem('token') || 
           sessionStorage.getItem('token') || 
           '';
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const convertBackendQuestionToFrontend = (backendQuestion: any): Question => {
    const answers: Answer[] = [];
    
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

        const response = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}`, {
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
            showCorrectAnswers: assignmentData.show_correct_answers !== false,
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

  // Event handlers
  const handleInputChange = useCallback(<K extends keyof Assignment>(field: K, value: Assignment[K]): void => {
    setAssignment(prev => ({
      ...prev,
      [field]: value
    }));
    if (saveError) setSaveError('');
  }, [saveError]);

  const handleCancel = () => {
    navigate(`/teacher/courses/${courseId}`);
  };

  // Question management functions
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

  // Save quiz function
  const saveQuiz = useCallback(async (publish: boolean = false) => {
    setIsSaving(true);
    setSaveError('');

    try {
      // Validation
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
              .map((a, _answerIndex) => ({
                text: a.text.trim(),
                correct: a.correct,
                feedback: a.feedback || ''
              }))
          };
        } else if (q.type === 'short_answer') {
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
        ? `${API_BASE_URL}/api/assignments/${assignmentId}`
        : `${API_BASE_URL}/api/assignments`;
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

  // Computed values
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
        <AssignmentHeader
          assignment={assignment}
          totalPoints={totalPoints}
          isEditing={isEditing}
          isSaving={isSaving}
          onCancel={handleCancel}
          onSave={saveQuiz}
        />

        {/* Error Banner */}
        {saveError && (
          <div className="error-banner">
            <p style={{ color: '#dc2626', background: '#fef2f2', padding: '12px', borderRadius: '8px', margin: '16px 0' }}>
              Error: {saveError}
            </p>
          </div>
        )}

        <div className="main-content">
          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            questionCount={questions.length}
          />

          {/* Tab Content */}
          <div>
            {activeTab === 'details' && (
              <AssignmentDetailsTab
                assignment={assignment}
                onInputChange={handleInputChange}
              />
            )}

            {activeTab === 'questions' && (
              <QuestionsTab
                questions={questions}
                editingQuestion={editingQuestion}
                totalPoints={totalPoints}
                onAddQuestion={addQuestion}
                onSetEditingQuestion={setEditingQuestion}
                onUpdateQuestion={updateQuestion}
                onDeleteQuestion={deleteQuestion}
                onAddAnswer={addAnswer}
                onUpdateAnswer={updateAnswer}
                onDeleteAnswer={deleteAnswer}
                onSetCorrectAnswer={setCorrectAnswer}
                onImageUpload={handleImageUpload}
                onRemoveImage={removeImage}
              />
            )}
          </div>

          {/* Bottom Actions */}
          <AssignmentBottomActions
            assignment={assignment}
            isEditing={isEditing}
            isSaving={isSaving}
            onNotifyChange={(notify) => handleInputChange('notifyOfUpdate', notify)}
            onCancel={handleCancel}
            onSave={saveQuiz}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentCreator; 