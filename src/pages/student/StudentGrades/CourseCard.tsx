// components/CourseCard.tsx
import React from 'react';
import type { Course } from './types';

const CourseCard: React.FC<{ course: Course; onClick: (course: Course) => void }> = ({ course, onClick }) => {
  return (
    <div
      onClick={() => onClick(course)}
      style={{
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
      }}
      onMouseEnter={(e) =>
        ((e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'))
      }
      onMouseLeave={(e) =>
        ((e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'))
      }
    >
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827' }}>{course.title}</h2>
      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{course.code}</p>
      <p style={{ marginTop: '0.5rem', color: '#4b5563' }}>{course.description}</p>
    </div>
  );
};

export default CourseCard;
