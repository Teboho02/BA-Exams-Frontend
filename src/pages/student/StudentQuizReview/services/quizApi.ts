import type { QuizReviewData } from '../types/quiz';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import { API_BASE_URL } from '../../../../config/api';

export const fetchQuizReviewData = async (submissionId: string, token: string): Promise<QuizReviewData> => {
  const response = await fetch(`${API_BASE_URL}/api/assignments/submission/${submissionId}/results`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED');
  }

  if (!response.ok) {
    throw new Error('Failed to fetch quiz data');
  }

  const data: QuizReviewData = await response.json();
  
  if (!data.success) {
    throw new Error('Failed to fetch quiz data');
  }

  return data;
};