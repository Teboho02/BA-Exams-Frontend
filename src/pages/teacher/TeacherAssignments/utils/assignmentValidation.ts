import type{ Assignment, Question } from '../types/Assignment';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateAssignment = (assignment: Assignment, questions: Question[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Basic validation
  if (!assignment.title.trim()) {
    errors.push({ field: 'title', message: 'Quiz title is required' });
  }

  if (!assignment.description.trim()) {
    errors.push({ field: 'description', message: 'Quiz description is required' });
  }

  if (questions.length === 0) {
    errors.push({ field: 'questions', message: 'At least one question is required' });
  }

  // Question validation
  questions.forEach((question, index) => {
    const questionNumber = index + 1;

    if (!question.text.trim()) {
      errors.push({ 
        field: `question_${question.id}`, 
        message: `Question ${questionNumber} must have question text` 
      });
    }

    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      const validAnswers = question.answers.filter(a => a.text.trim());
      if (validAnswers.length < 2) {
        errors.push({ 
          field: `question_${question.id}`, 
          message: `Question ${questionNumber} must have at least 2 valid answers` 
        });
      }

      const hasCorrectAnswer = question.answers.some(a => a.correct && a.text.trim());
      if (!hasCorrectAnswer) {
        errors.push({ 
          field: `question_${question.id}`, 
          message: `Question ${questionNumber} must have a correct answer selected` 
        });
      }
    }

    if (question.type === 'short_answer') {
      const validAnswers = question.acceptableAnswers?.filter(a => a.trim()) || [];
      if (validAnswers.length === 0) {
        errors.push({ 
          field: `question_${question.id}`, 
          message: `Question ${questionNumber} must have at least one acceptable answer` 
        });
      }
    }
  });

  return errors;
};