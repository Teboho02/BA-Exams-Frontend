import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCourses from './pages/admin/AdminCourses';
import AdminReports from './pages/admin/AdminReports';

// Teacher Pages
import TeacherCourses from './pages/teacher/TeacherAllCoursesPage/TeacherCourses';
import TeacherAssignments from './pages/teacher/TeacherAssignments/TeacherAssignments';
import TeacherCoursePage from './pages/teacher/TeacherSpecificCourse/TeacherCoursePage';
import TeacherQuizReviewPage from './pages/teacher/QuizReview/TeacherQuizReviewPage';

// Student Pages
import StudentCourses from './pages/student/StudentAllCourses/StudentCourses';
import QuizAttemptPage from './pages/student/QuizAttemptPage/QuizAttemptPage';
import StudentCoursePage from './pages/student/StudentCoursePage/StudentCoursePage';
import StudentQuizReview from './pages/student/StudentQuizReview/StudentQuizReview';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes - redirect if already logged in */}
        <Route path="/" element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Admin Routes - only accessible by admins */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCourses />
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        } />

        {/* Teacher Routes - only accessible by teachers */}
        <Route path="/teacher/courses" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCourses />
          </ProtectedRoute>
        } />
        <Route path="/teacher/assignments" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAssignments />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses/:courseId" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherCoursePage />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses/:courseId/assignments/create" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAssignments />
          </ProtectedRoute>
        } />
        <Route path="/teacher/courses/:courseId/assignment/:assignmentId/edit" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAssignments />
          </ProtectedRoute>
        } />
        <Route path="/teacher/quiz-review/:quizId" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherQuizReviewPage />
          </ProtectedRoute>
        } />

        {/* Student Routes - only accessible by students */}
        <Route path="/student/courses" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCourses />
          </ProtectedRoute>
        } />
        <Route path="/student/quizAttempt/:assignmentId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizAttemptPage />
          </ProtectedRoute>
        } />
        <Route path="/student/courses/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentCoursePage />
          </ProtectedRoute>
        } />
        <Route path="/student/quiz/review/:submissionId" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentQuizReview />
          </ProtectedRoute>
        } />

        {/* Mixed Access Routes - if you have routes accessible by multiple roles */}
        {/* Example: A route accessible by both teachers and admins */}
        {/*
        <Route path="/shared-route" element={
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            <SharedComponent />
          </ProtectedRoute>
        } />
        */}

        {/* Catch-all - redirect to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;