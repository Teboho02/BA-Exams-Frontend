import React from 'react';
import type { ContentViewer } from '../types';

interface ContentViewerModalProps {
  contentViewer: ContentViewer;
  onClose: () => void;
}

const ContentViewerModal: React.FC<ContentViewerModalProps> = ({ contentViewer, onClose }) => {
  if (!contentViewer.isOpen || !contentViewer.content) {
    return null;
  }

  return (
    <div className="content-viewer-modal" onClick={onClose}>
      <div className="content-viewer" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-header">
          <h3>{contentViewer.content.title}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="viewer-body">
          {contentViewer.type === 'pdf' && contentViewer.content.file && (
            <iframe
              src={contentViewer.content.file}
              className="pdf-viewer"
              title={contentViewer.content.title}
            />
          )}
          {contentViewer.type === 'video' && contentViewer.content.link && (
            <video
              src={contentViewer.content.link}
              className="video-player"
              controls
              controlsList="nodownload"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentViewerModal;