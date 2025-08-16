// components/FeedbackCard.tsx
import React from 'react';

interface FeedbackCardProps {
  feedback: string;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback }) => {
  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <h2 className="card-header">Feedback</h2>
      <div style={{ padding: '24px' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>{feedback}</p>
      </div>
    </div>
  );
};

export default FeedbackCard;