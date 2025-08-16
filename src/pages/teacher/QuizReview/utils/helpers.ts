// utils/helpers.ts

export const getLetterGradeColor = (grade: string): string => {
    switch (grade) {
        case 'A': return '#10b981';
        case 'B': return '#3b82f6';
        case 'C': return '#f59e0b';
        case 'D': return '#f97316';
        case 'F': return '#ef4444';
        default: return '#6b7280';
    }
};

export const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
};