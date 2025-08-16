import { useState, useEffect } from 'react';
import  type { Assignment, Question } from '../types/Assignment';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UseAssignmentDataReturn {
  assignment: Assignment;
  questions: Question[];
  isLoading: boolean;
  loadError: string;
  setAssignment: React.Dispatch<React.SetStateAction<Assignment>>;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

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

export const useAssignmentData = (
  isEditing: boolean, 
  assignmentId: string | undefined
): UseAssignmentDataReturn => {
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

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isEditing);
  const [loadError, setLoadError] = useState<string>('');

  const convertBackendQuestionToFrontend = (backendQuestion: any): Question => {
    const answers = [];
    
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
      imageUrl: backendQuestion.imageUrl || undefined,
      acceptableAnswers: backendQuestion.acceptableAnswers || [''],
      matchType: backendQuestion.matchType || 'exact',
      caseSensitive: backendQuestion.caseSensitive || false
    };
  };

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
            submissionTypes: ['online_quiz'],
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

  return {
    assignment,
    questions,
    isLoading,
    loadError,
    setAssignment,
    setQuestions
  };
};