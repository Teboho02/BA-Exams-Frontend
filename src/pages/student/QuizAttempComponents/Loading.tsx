import {  useNavigate } from 'react-router-dom';
import {   ArrowLeft, } from 'lucide-react';
import '../StudentQuizView.css'
9

function Loading() {

        const navigate = useNavigate();

    return (
      <div className="assignment-creator">
        <div className="header">
          <div className="header-content">
            <div className="header-left">
              <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginRight: '16px' }}>
                <ArrowLeft size={16} />
                Back
              </button>
              <h1 className="title">Loading Quiz...</h1>
            </div>
          </div>
        </div>
        <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              border: '3px solid #e5e7eb', 
              borderTop: '3px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#6b7280' }}>Preparing your quiz...</p>
          </div>
        </div>
      </div>
    );

}

export default Loading;
