import React, { useState, useRef } from 'react';
import './MathEditor.css';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MathEditor: React.FC<MathEditorProps> = ({ value, onChange, placeholder }) => {
  const [showSymbols, setShowSymbols] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mathSymbols = [
    { symbol: '∑', latex: '\\sum' },
    { symbol: '∫', latex: '\\int' },
    { symbol: '√', latex: '\\sqrt{}' },
    { symbol: 'π', latex: '\\pi' },
    { symbol: '∞', latex: '\\infty' },
    { symbol: '±', latex: '\\pm' },
    { symbol: '×', latex: '\\times' },
    { symbol: '÷', latex: '\\div' },
    { symbol: '≤', latex: '\\leq' },
    { symbol: '≥', latex: '\\geq' },
    { symbol: '≠', latex: '\\neq' },
    { symbol: '≈', latex: '\\approx' },
    { symbol: 'α', latex: '\\alpha' },
    { symbol: 'β', latex: '\\beta' },
    { symbol: 'γ', latex: '\\gamma' },
    { symbol: 'δ', latex: '\\delta' },
    { symbol: 'θ', latex: '\\theta' },
    { symbol: 'λ', latex: '\\lambda' },
    { symbol: 'μ', latex: '\\mu' },
    { symbol: 'σ', latex: '\\sigma' },
    { symbol: '^', latex: '^{}' },
    { symbol: '_', latex: '_{}' },
    { symbol: '∈', latex: '\\in' },
    { symbol: '∉', latex: '\\notin' },
    { symbol: '⊂', latex: '\\subset' },
    { symbol: '⊃', latex: '\\supset' },
    { symbol: '∪', latex: '\\cup' },
    { symbol: '∩', latex: '\\cap' },
    { symbol: '∀', latex: '\\forall' },
    { symbol: '∃', latex: '\\exists' }
  ];

  const insertSymbol = (symbol: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + symbol + value.substring(end);
    
    onChange(newValue);
    
    // Set cursor position after inserted symbol
    setTimeout(() => {
      textarea.selectionStart = start + symbol.length;
      textarea.selectionEnd = start + symbol.length;
      textarea.focus();
    }, 0);
  };

  return (
    <div className="math-editor">
      <div className="math-toolbar">
        <button
          type="button"
          className="math-symbols-toggle"
          onClick={() => setShowSymbols(!showSymbols)}
        >
          {showSymbols ? 'Hide' : 'Show'} Math Symbols
        </button>
        <span className="math-hint">
          You can use LaTeX notation (e.g., \frac{1}{2}, x^2)
        </span>
      </div>
      
      {showSymbols && (
        <div className="math-symbols-panel">
          {mathSymbols.map((item, index) => (
            <button
              key={index}
              type="button"
              className="math-symbol-btn"
              onClick={() => insertSymbol(item.symbol)}
              title={item.latex}
            >
              {item.symbol}
            </button>
          ))}
        </div>
      )}
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter text with mathematical symbols..."}
        className="math-textarea"
        rows={4}
      />
      
      {value && (
        <div className="math-preview">
          <strong>Preview:</strong>
          <div className="math-preview-content">
            {value}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathEditor;