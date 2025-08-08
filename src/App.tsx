// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';

// Teacher Pages
import TeacherDashboard from './pages/teacher/teacherDashboard/TeacherDashboard';
import TeacherCourses from './pages/teacher/TeacherCourses';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
//import TeacherGrades from './pages/teacher/TeacherGrades';
import TeacherCoursePage from './pages/teacher/TeacherCoursePage';
import AddContentPage from './pages/teacher/AddContentPage';
import TeacherQuizReviewPage from './pages/teacher/QuizReview/TeacherQuizReviewPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentCourses from './pages/student/StudentCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentGrades from './pages/student/StudentGrades';
import StudentQuizView from './pages/student/StudentQuizView';
import QuizAttemptPage from './pages/student/QuizAttemptPage';
import StudentCoursePage from './pages/student/StudentCoursePage';
import QuizReviewPage from './pages/student/QuizReviewPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/reports" element={<AdminReports />} />

        {/* Teacher Routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/courses" element={<TeacherCourses />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/courses/:courseId" element={<TeacherCoursePage />} />
        <Route path="/teacher/courses/:courseId/add-content" element={<AddContentPage />} />
        
        <Route path="/teacher/courses/:courseId/assignments/create" element={<TeacherAssignments />} />
        <Route path="/teacher/courses/:courseId/assignment/:assignmentId/edit" element={<TeacherAssignments />} />
        
        {/* Quiz Review */}
        <Route path="/teacher/quiz-review/:quizId" element={<TeacherQuizReviewPage />} />

        {/* Student Routes */}
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/assignments1" element={<StudentAssignments />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/assignments/:assignmentId" element={<StudentQuizView />} />
        <Route path="/student/quizAttempt/:assignmentId" element={<QuizAttemptPage />} />
        <Route path="/student/courses/:courseId" element={<StudentCoursePage />} />
        
        {/* Student Quiz Review Routes */}
        <Route path="/student/quiz/review/:submissionId" element={<QuizReviewPage />} />
        <Route path="/quiz/review/:submissionId" element={<QuizReviewPage />} />
        <Route path="/quiz/results/:submissionId" element={<QuizReviewPage />} />

        {/* Catch-all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;