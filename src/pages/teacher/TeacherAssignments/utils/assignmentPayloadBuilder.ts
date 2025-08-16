
import type{ Assignment, Question } from '../types/Assignment';

export const buildAssignmentPayload = (
  assignment: Assignment, 
  questions: Question[], 
  courseId: string | undefined,
  publish: boolean
) => {
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
          .map((a) => ({
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

  return payload;
};