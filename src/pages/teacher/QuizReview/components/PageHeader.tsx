// components/PageHeader.tsx
import React from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { Assignment, Course } from '../types/TeacherQuizReviewTypes';
import { renderTextWithLatex } from '../utils/renderTextWithLatex';
import { formatDateTime } from '../utils/helpers';

interface PageHeaderProps {
    assignment: Assignment;
    course: Course;
    navigate: NavigateFunction;
}

const PageHeader: React.FC<PageHeaderProps> = ({ assignment, course, navigate }) => {
    return (
        <div className="page-header">
            <div className="breadcrumbs">
                <span onClick={() => navigate('/teacher/courses')} className="breadcrumb-link">
                    My Courses
                </span>
                <span className="breadcrumb-separator">/</span>
                <span onClick={() => navigate(`/teacher/courses/${course.id}`)} className="breadcrumb-link">
                    {course.code}
                </span>
                <span className="breadcrumb-separator">/</span>
                <span>Quiz Review</span>
            </div>

            <div className="quiz-header">
                <h1>{assignment.title}</h1>
                <div className="quiz-description">{renderTextWithLatex(assignment.description)}</div>
                <div className="quiz-meta">
                    <span className="course-tag">{course.code} - {course.title}</span>
                    <span className="points-tag">{assignment.maxPoints} points</span>
                    <span className="due-date">Due: {formatDateTime(assignment.dueDate)}</span>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;