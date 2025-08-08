import {  useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  ArrowLeft, 
} from 'lucide-react';

import '../StudentQuizView.css'

interface ErrorProps {
    error: string;
}

function Error1({ error }: ErrorProps) {

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
                            <h1 className="title">Error</h1>
                        </div>
                    </div>
                </div>
                <div className="main-content">
                    <div className="card empty-state">
                        <div className="empty-icon">
                            <AlertCircle size={48} style={{ color: '#ef4444' }} />
                        </div>
                        <h3 className="empty-title">Unable to Load Quiz</h3>
                        <p className="empty-description">{error}</p>
                        <button onClick={() => navigate(-1)} className="btn btn-primary">
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );

}

export default Error1;
