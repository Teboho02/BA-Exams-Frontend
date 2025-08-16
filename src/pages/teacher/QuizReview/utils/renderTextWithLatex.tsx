// utils/renderTextWithLatex.tsx
import React from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export const renderTextWithLatex = (text: string) => {
    if (!text) return text;
    
    // Split text by $ delimiters while preserving the delimiters
    const parts = text.split(/(\$[^$]*\$)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
            // This is LaTeX - remove the $ delimiters
            const latex = part.slice(1, -1);
            
            // Handle special cases
            if (latex === 'newline' || latex === '\\newline') {
                return <br key={index} />;
            }
            
            // Clean up common LaTeX formatting issues
            const cleanLatex = latex
                .replace(/\\newline/g, '\\\\')
                .replace(/\s+/g, ' ')
                .trim();
            
            try {
                return <InlineMath key={index} math={cleanLatex} />;
            } catch (error) {
                console.warn(`LaTeX rendering error for: ${cleanLatex}`, error);
                return <span key={index} className="latex-error">$${cleanLatex}$</span>;
            }
        }
        
        // Regular text - handle remaining newlines
        const textParts = part.split(/\\newline|\n/g);
        if (textParts.length > 1) {
            return textParts.map((textPart, textIndex) => (
                <React.Fragment key={`${index}-${textIndex}`}>
                    {textPart}
                    {textIndex < textParts.length - 1 && <br />}
                </React.Fragment>
            ));
        }
        
        return part;
    });
};