import React, { useState, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

const LatexRenderer: React.FC<LatexRendererProps> = ({ content, className, style }) => {
  const [tokens, setTokens] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!content.trim()) {
      setTokens([]);
      return;
    }

    // Regular expression to match $$...$$ and $...$ (non-greedy)
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    const rawTokens = content.split(regex).filter(token => token !== '');

    const tokenNodes = rawTokens.map((token, index) => {
      // Check for display math: $$...$$
      if (token.startsWith('$$') && token.endsWith('$$')) {
        const latexContent = token.substring(2, token.length - 2);
        try {
          const html = katex.renderToString(latexContent, { 
            displayMode: true, 
            throwOnError: false 
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (err) {
          return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
        }
      } 
      // Check for inline math: $...$
      else if (token.startsWith('$') && token.endsWith('$')) {
        const latexContent = token.substring(1, token.length - 1);
        try {
          const html = katex.renderToString(latexContent, { 
            displayMode: false, 
            throwOnError: false 
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        } catch (err) {
          return <span key={index} style={{ color: '#ef4444' }}>{token}</span>;
        }
      } 
      // Plain text
      else {
        return <React.Fragment key={index}>{token}</React.Fragment>;
      }
    });

    setTokens(tokenNodes);
  }, [content]);

  return (
    <span className={`latex-renderer ${className || ''}`} style={style}>
      {tokens}
    </span>
  );
};

export default LatexRenderer;