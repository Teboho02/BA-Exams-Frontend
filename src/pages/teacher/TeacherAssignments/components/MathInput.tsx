import React, { useState, useRef, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import MathSymbolPicker from '../../../utils/MathSymbolPicker';
import katex from 'katex';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const MathInput: React.FC<MathInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  style 
}) => {
  const [showMathPicker, setShowMathPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');

  // Split text into normal text and LaTeX fragments
  const splitMixedContent = (text: string) => {
    const fragments = [];
    let currentIndex = 0;
    const regex = /\$(.*?)\$/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        fragments.push({
          type: 'text',
          content: text.substring(currentIndex, match.index)
        });
      }
      
      fragments.push({
        type: 'latex',
        content: match[1]
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < text.length) {
      fragments.push({
        type: 'text',
        content: text.substring(currentIndex)
      });
    }
    
    return fragments;
  };

  // Render mixed content (normal text + LaTeX)
  useEffect(() => {
    if (!previewRef.current) return;
    
    previewRef.current.innerHTML = '';
    
    if (!value.trim()) return;
    
    try {
      const container = document.createElement('div');
      container.innerHTML = value;
      
      const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const fragments = splitMixedContent(text);
          
          if (fragments.length > 1) {
            const parent = node.parentNode;
            fragments.forEach(fragment => {
              if (fragment.type === 'text') {
                parent?.insertBefore(document.createTextNode(fragment.content), node);
              } else {
                try {
                  const span = document.createElement('span');
                  span.innerHTML = katex.renderToString(fragment.content, {
                    throwOnError: false,
                    displayMode: false,
                    output: 'html'
                  });
                  parent?.insertBefore(span, node);
                } catch (err) {
                  const error = err as katex.ParseError;
                  console.error('LaTeX rendering error:', error);
                  parent?.insertBefore(document.createTextNode(`$${fragment.content}$`), node);
                }
              }
            });
            parent?.removeChild(node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          Array.from(node.childNodes).forEach(processNode);
        }
      };
      
      Array.from(container.childNodes).forEach(processNode);
      
      while (container.firstChild) {
        previewRef.current.appendChild(container.firstChild);
      }
    } catch (err) {
      const error = err as Error;
      setError(`Error rendering content: ${error.message}`);
    }
  }, [value]);

  const insertMathSymbol = (symbol: string, latex: string) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      
      const wrappedLatex = `$${latex}$`;
      
      const newValue = value.substring(0, start) + wrappedLatex + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        input.selectionStart = input.selectionEnd = start + wrappedLatex.length;
        input.focus();
      }, 0);
    }
    setShowMathPicker(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', display: 'flex' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Enter text. Use $...$ for math equations."}
          className={className}
          style={{ ...style, paddingRight: '50px' }}
        />
        <button
          type="button"
          onClick={() => setShowMathPicker(true)}
          className="icon-btn"
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: '#f3f4f6',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px',
            zIndex: 1
          }}
          title="Insert mathematical symbol"
        >
          <Calculator size={16} />
        </button>
      </div>
      
      {value && (
        <div 
          ref={previewRef}
          className="latex-preview"
          style={{
            marginTop: '8px',
            padding: '8px',
            background: '#f8f9fa',
            borderRadius: '4px',
            border: '1px solid #e9ecef',
            color: '#374151',
          }}
        />
      )}
      
      {error && (
        <div style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
          {error}
        </div>
      )}
      
      {showMathPicker && (
        <MathSymbolPicker
          onInsert={insertMathSymbol}
          onClose={() => setShowMathPicker(false)}
        />
      )}
    </div>
  );
};