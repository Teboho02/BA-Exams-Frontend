import { useState, useCallback } from 'react';
import type { Question, Answer } from '../types/Assignment';

interface UseQuestionManagerReturn {
  editingQuestion: number | null;
  setEditingQuestion: (questionId: number | null) => void;
  addQuestion: (questions: Question[]) => Question;
  updateQuestion: (questions: Question[], questionId: number, updates: Partial<Question>) => Question[];
  deleteQuestion: (questions: Question[], questionId: number) => Question[];
  addAnswer: (questions: Question[], questionId: number) => Question[];
  updateAnswer: (questions: Question[], questionId: number, answerId: number, field: keyof Answer, value: string | boolean) => Question[];
  deleteAnswer: (questions: Question[], questionId: number, answerId: number) => Question[];
  setCorrectAnswer: (questions: Question[], questionId: number, answerId: number) => Question[];
  handleImageUpload: (questions: Question[], questionId: number, event: React.ChangeEvent<HTMLInputElement>) => Promise<Question[]>;
  removeImage: (questions: Question[], questionId: number) => Question[];
}

export const useQuestionManager = (): UseQuestionManagerReturn => {
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  const addQuestion = useCallback((questions: Question[]): Question => {
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
    return newQuestion;
  }, []);

  const updateQuestion = useCallback((questions: Question[], questionId: number, updates: Partial<Question>): Question[] => {
    return questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
  }, []);

  const deleteQuestion = useCallback((questions: Question[], questionId: number): Question[] => {
    return questions.filter(q => q.id !== questionId);
  }, []);

  const addAnswer = useCallback((questions: Question[], questionId: number): Question[] => {
    return questions.map(q => {
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
    });
  }, []);

  const updateAnswer = useCallback((questions: Question[], questionId: number, answerId: number, field: keyof Answer, value: string | boolean): Question[] => {
    return questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(answer => 
          answer.id === answerId ? { ...answer, [field]: value } : answer
        );
        return { ...q, answers: updatedAnswers };
      }
      return q;
    });
  }, []);

  const deleteAnswer = useCallback((questions: Question[], questionId: number, answerId: number): Question[] => {
    return questions.map(q => {
      if (q.id === questionId && q.answers.length > 2) {
        return { ...q, answers: q.answers.filter(answer => answer.id !== answerId) };
      }
      return q;
    });
  }, []);

  const setCorrectAnswer = useCallback((questions: Question[], questionId: number, answerId: number): Question[] => {
    return questions.map(q => {
      if (q.id === questionId) {
        const updatedAnswers = q.answers.map(answer => ({
          ...answer,
          correct: answer.id === answerId
        }));
        return { ...q, answers: updatedAnswers };
      }
      return q;
    });
  }, []);

  const handleImageUpload = useCallback(async (questions: Question[], questionId: number, event: React.ChangeEvent<HTMLInputElement>): Promise<Question[]> => {
    const file = event.target.files?.[0];
    if (!file) return questions;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        const updatedQuestions = updateQuestion(questions, questionId, { imageUrl });
        resolve(updatedQuestions);
      };
      reader.readAsDataURL(file);
    });
  }, [updateQuestion]);

  const removeImage = useCallback((questions: Question[], questionId: number): Question[] => {
    return updateQuestion(questions, questionId, { imageUrl: undefined });
  }, [updateQuestion]);

  return {
    editingQuestion,
    setEditingQuestion,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addAnswer,
    updateAnswer,
    deleteAnswer,
    setCorrectAnswer,
    handleImageUpload,
    removeImage
  };
};