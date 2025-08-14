// MathSymbolPicker.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './MathSymbolPicker.css';

// ... MATH_SYMBOLS constant remains the same ...

const MATH_SYMBOLS = {
  Basic: [
    { symbol: 'x₁', latex: 'x_{1}', name: 'Subscript' },
    { symbol: 'x²', latex: 'x^{2}', name: 'Superscript' },
    { symbol: '½', latex: '\\frac{1}{2}', name: 'Fraction' },
    { symbol: '√', latex: '\\sqrt{}', name: 'Square Root' },
    { symbol: '∛', latex: '\\sqrt[3]{}', name: 'Cube Root' },
    { symbol: '⟨', latex: '\\langle', name: 'Left Angle' },
    { symbol: '⟩', latex: '\\rangle', name: 'Right Angle' },
    { symbol: 'ƒ', latex: 'f', name: 'Function' },
    { symbol: '′', latex: '\\prime', name: 'Prime' },
    { symbol: '+', latex: '+', name: 'Plus' },
    { symbol: '−', latex: '-', name: 'Minus' },
    { symbol: '±', latex: '\\pm', name: 'Plus/Minus' },
    { symbol: '∓', latex: '\\mp', name: 'Minus/Plus' },
    { symbol: '·', latex: '\\cdot', name: 'Dot' },
    { symbol: '=', latex: '=', name: 'Equals' },
    { symbol: '×', latex: '\\times', name: 'Times' },
    { symbol: '÷', latex: '\\div', name: 'Division' },
    { symbol: '∗', latex: '\\ast', name: 'Asterisk' },
    { symbol: '∴', latex: '\\therefore', name: 'Therefore' },
    { symbol: '∵', latex: '\\because', name: 'Because' },
    { symbol: '∑', latex: '\\sum', name: 'Sum' },
    { symbol: '∏', latex: '\\prod', name: 'Product' },
    { symbol: '∐', latex: '\\coprod', name: 'Coproduct' },
    { symbol: '∫', latex: '\\int', name: 'Integral' },
    { symbol: 'ℕ', latex: '\\mathbb{N}', name: 'Natural' },
    { symbol: 'ℙ', latex: '\\mathbb{P}', name: 'Prime' },
    { symbol: 'ℤ', latex: '\\mathbb{Z}', name: 'Integer' },
    { symbol: 'ℚ', latex: '\\mathbb{Q}', name: 'Rational' },
    { symbol: 'ℝ', latex: '\\mathbb{R}', name: 'Real' },
    { symbol: 'ℂ', latex: '\\mathbb{C}', name: 'Complex' },
  ],
  Greek: [
    { symbol: 'α', latex: '\\alpha', name: 'Alpha' },
    { symbol: 'β', latex: '\\beta', name: 'Beta' },
    { symbol: 'γ', latex: '\\gamma', name: 'Gamma' },
    { symbol: 'δ', latex: '\\delta', name: 'Delta' },
    { symbol: 'ε', latex: '\\epsilon', name: 'Epsilon' },
    { symbol: 'ζ', latex: '\\zeta', name: 'Zeta' },
    { symbol: 'η', latex: '\\eta', name: 'Eta' },
    { symbol: 'θ', latex: '\\theta', name: 'Theta' },
    { symbol: 'ι', latex: '\\iota', name: 'Iota' },
    { symbol: 'κ', latex: '\\kappa', name: 'Kappa' },
    { symbol: 'λ', latex: '\\lambda', name: 'Lambda' },
    { symbol: 'μ', latex: '\\mu', name: 'Mu' },
    { symbol: 'ν', latex: '\\nu', name: 'Nu' },
    { symbol: 'ξ', latex: '\\xi', name: 'Xi' },
    { symbol: 'π', latex: '\\pi', name: 'Pi' },
    { symbol: 'ρ', latex: '\\rho', name: 'Rho' },
    { symbol: 'σ', latex: '\\sigma', name: 'Sigma' },
    { symbol: 'τ', latex: '\\tau', name: 'Tau' },
    { symbol: 'φ', latex: '\\phi', name: 'Phi' },
    { symbol: 'χ', latex: '\\chi', name: 'Chi' },
    { symbol: 'ψ', latex: '\\psi', name: 'Psi' },
    { symbol: 'ω', latex: '\\omega', name: 'Omega' },
    { symbol: 'Γ', latex: '\\Gamma', name: 'Gamma (upper)' },
    { symbol: 'Δ', latex: '\\Delta', name: 'Delta (upper)' },
    { symbol: 'Θ', latex: '\\Theta', name: 'Theta (upper)' },
    { symbol: 'Λ', latex: '\\Lambda', name: 'Lambda (upper)' },
    { symbol: 'Π', latex: '\\Pi', name: 'Pi (upper)' },
    { symbol: 'Σ', latex: '\\Sigma', name: 'Sigma (upper)' },
    { symbol: 'Φ', latex: '\\Phi', name: 'Phi (upper)' },
    { symbol: 'Ψ', latex: '\\Psi', name: 'Psi (upper)' },
    { symbol: 'Ω', latex: '\\Omega', name: 'Omega (upper)' },
  ],
  Operators: [
    { symbol: '∇', latex: '\\nabla', name: 'Nabla' },
    { symbol: '∂', latex: '\\partial', name: 'Partial' },
    { symbol: '∆', latex: '\\Delta', name: 'Laplace' },
    { symbol: '∅', latex: '\\emptyset', name: 'Empty Set' },
    { symbol: '∈', latex: '\\in', name: 'Element of' },
    { symbol: '∉', latex: '\\notin', name: 'Not Element' },
    { symbol: '∋', latex: '\\ni', name: 'Contains' },
    { symbol: '⊂', latex: '\\subset', name: 'Subset' },
    { symbol: '⊃', latex: '\\supset', name: 'Superset' },
    { symbol: '⊆', latex: '\\subseteq', name: 'Subset Equal' },
    { symbol: '⊇', latex: '\\supseteq', name: 'Superset Equal' },
    { symbol: '∪', latex: '\\cup', name: 'Union' },
    { symbol: '∩', latex: '\\cap', name: 'Intersection' },
    { symbol: '⊕', latex: '\\oplus', name: 'Direct Sum' },
    { symbol: '⊗', latex: '\\otimes', name: 'Tensor Product' },
    { symbol: '⊥', latex: '\\perp', name: 'Perpendicular' },
    { symbol: '∥', latex: '\\parallel', name: 'Parallel' },
  ],
  Relationships: [
    { symbol: '<', latex: '<', name: 'Less Than' },
    { symbol: '>', latex: '>', name: 'Greater Than' },
    { symbol: '≤', latex: '\\leq', name: 'Less or Equal' },
    { symbol: '≥', latex: '\\geq', name: 'Greater or Equal' },
    { symbol: '≪', latex: '\\ll', name: 'Much Less' },
    { symbol: '≫', latex: '\\gg', name: 'Much Greater' },
    { symbol: '≠', latex: '\\neq', name: 'Not Equal' },
    { symbol: '≈', latex: '\\approx', name: 'Approximately' },
    { symbol: '≡', latex: '\\equiv', name: 'Equivalent' },
    { symbol: '∼', latex: '\\sim', name: 'Similar' },
    { symbol: '≅', latex: '\\cong', name: 'Congruent' },
    { symbol: '∝', latex: '\\propto', name: 'Proportional' },
    { symbol: '⊢', latex: '\\vdash', name: 'Proves' },
    { symbol: '⊨', latex: '\\models', name: 'Models' },
  ],
  Arrows: [
    { symbol: '→', latex: '\\rightarrow', name: 'Right Arrow' },
    { symbol: '←', latex: '\\leftarrow', name: 'Left Arrow' },
    { symbol: '↑', latex: '\\uparrow', name: 'Up Arrow' },
    { symbol: '↓', latex: '\\downarrow', name: 'Down Arrow' },
    { symbol: '↔', latex: '\\leftrightarrow', name: 'Both Ways' },
    { symbol: '⇒', latex: '\\Rightarrow', name: 'Implies' },
    { symbol: '⇐', latex: '\\Leftarrow', name: 'Implied By' },
    { symbol: '⇔', latex: '\\Leftrightarrow', name: 'If and Only If' },
    { symbol: '↦', latex: '\\mapsto', name: 'Maps To' },
    { symbol: '⇝', latex: '\\leadsto', name: 'Leads To' },
  ],
  Misc: [
    { symbol: '∞', latex: '\\infty', name: 'Infinity' },
    { symbol: '∀', latex: '\\forall', name: 'For All' },
    { symbol: '∃', latex: '\\exists', name: 'Exists' },
    { symbol: '∄', latex: '\\nexists', name: 'Not Exists' },
    { symbol: '¬', latex: '\\neg', name: 'Negation' },
    { symbol: '∧', latex: '\\land', name: 'And' },
    { symbol: '∨', latex: '\\lor', name: 'Or' },
    { symbol: '⊤', latex: '\\top', name: 'True' },
    { symbol: '⊥', latex: '\\bot', name: 'False' },
    { symbol: '°', latex: '\\degree', name: 'Degree' },
    { symbol: '∠', latex: '\\angle', name: 'Angle' },
    { symbol: '⊙', latex: '\\odot', name: 'Circle Dot' },
    { symbol: '□', latex: '\\square', name: 'Square' },
    { symbol: '△', latex: '\\triangle', name: 'Triangle' },
    { symbol: '◯', latex: '\\bigcirc', name: 'Circle' },
    { symbol: '…', latex: '\\ldots', name: 'Ellipsis' },
    { symbol: '⋯', latex: '\\cdots', name: 'Center Dots' },
    { symbol: '⋮', latex: '\\vdots', name: 'Vertical Dots' },
    { symbol: '⋱', latex: '\\ddots', name: 'Diagonal Dots' },
  ],
};


interface MathSymbolPickerProps {
  onInsert: (symbol: string, latex: string) => void;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}

const MathSymbolPicker: React.FC<MathSymbolPickerProps> = ({ onInsert, onClose, targetRef }) => {
  const [activeTab, setActiveTab] = useState<string>('Basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [customLatex, setCustomLatex] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [renderedPreview, setRenderedPreview] = useState('');
  const [renderError, setRenderError] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);




  if(!targetRef) {
    console.error("targetRef is required for MathSymbolPicker");
    
  }

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Render LaTeX preview
  useEffect(() => {
    if (!isCustomMode || !customLatex.trim()) {
      setRenderedPreview('');
      setRenderError('');
      return;
    }

    try {
      const html = katex.renderToString(customLatex, {
        throwOnError: false,
        displayMode: false,
        output: 'html',
      });
      setRenderedPreview(html);
      setRenderError('');
      
      // Auto-scroll to show full preview
      if (previewRef.current) {
        previewRef.current.scrollTop = previewRef.current.scrollHeight;
      }
    } catch (error) {
      setRenderError('Invalid LaTeX syntax');
      setRenderedPreview('');
    }
  }, [customLatex, isCustomMode]);

  const handleSymbolClick = (symbol: string, latex: string) => {
    onInsert(symbol, latex);
  };

  const handleInsertCustomLatex = () => {
    if (customLatex.trim() && !renderError) {
      // Insert both the rendered HTML and raw LaTeX
      onInsert(renderedPreview || customLatex, customLatex);
      setCustomLatex('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !renderError) {
      handleInsertCustomLatex();
    }
  };

  const toggleCustomMode = () => {
    setIsCustomMode(!isCustomMode);
    if (!isCustomMode) {
      setTimeout(() => customInputRef.current?.focus(), 0);
    }
  };

  // Filter symbols based on search
  const getFilteredSymbols = () => {
    if (!searchTerm) return MATH_SYMBOLS[activeTab as keyof typeof MATH_SYMBOLS] || [];
    
    const term = searchTerm.toLowerCase();
    const allSymbols = Object.values(MATH_SYMBOLS).flat();
    return allSymbols.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.symbol.includes(term) || 
      s.latex.toLowerCase().includes(term)
    );
  };

  const symbols = getFilteredSymbols();

  return (
    <div className="math-symbol-overlay">
      <div ref={modalRef} className="math-symbol-modal">
        {/* Header */}
        <div className="math-symbol-header">
          <h2 className="math-symbol-title">
            {isCustomMode ? 'Enter LaTeX Expression' : 'Insert Mathematical Symbol'}
          </h2>
          <button
            onClick={onClose}
            className="math-symbol-close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Custom LaTeX Editor */}
        {isCustomMode ? (
          <div className="math-symbol-custom">
            <div className="custom-latex-input-container">
              <input
                ref={customInputRef}
                type="text"
                placeholder="Enter LaTeX (e.g., x^2 + \sqrt{10})"
                value={customLatex}
                onChange={(e) => setCustomLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                className="custom-latex-input"
              />
              <button
                onClick={handleInsertCustomLatex}
                className="insert-custom-button"
                disabled={!customLatex.trim() || !!renderError}
              >
                Insert
              </button>
            </div>
            
            {/* Preview Area */}
            <div className="latex-preview-container">
              <div className="latex-preview-header">
                <span>Preview:</span>
                {renderError && <span className="latex-error">{renderError}</span>}
              </div>
              <div 
                ref={previewRef}
                className="latex-preview-content"
                dangerouslySetInnerHTML={{ __html: renderedPreview || '' }}
              />
              {!renderedPreview && !renderError && (
                <div className="latex-preview-placeholder">
                  Type LaTeX to see preview...
                </div>
              )}
            </div>
            
            <div className="custom-latex-examples">
              <p>Examples:</p>
              <ul>
                <li><code>x^2 + \sqrt&#123;10&#125;</code></li>
                <li><code>\frac&#123;1&#125;&#123;2&#125;</code></li>
                <li><code>{"\\sum_{n=1}^{\\infty}"}</code></li>
                <li><code>\int_a^b f(x)\,dx</code></li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="math-symbol-search">
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="math-symbol-search-input"
                autoFocus
              />
            </div>

            {/* Tabs */}
            {!searchTerm && (
              <div className="math-symbol-tabs">
                {Object.keys(MATH_SYMBOLS).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`math-symbol-tab ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Symbols Grid */}
            <div className="math-symbol-content">
              {symbols.length > 0 ? (
                <div className="math-symbol-grid">
                  {symbols.map((item, index) => (
                    <button
                      key={`${item.symbol}-${index}`}
                      onClick={() => handleSymbolClick(item.symbol, item.latex)}
                      className="math-symbol-button"
                      title={`${item.name} (LaTeX: ${item.latex})`}
                    >
                      <span className="math-symbol-char">{item.symbol}</span>
                      <div className="math-symbol-tooltip">
                        <div className="tooltip-name">{item.name}</div>
                        <div className="tooltip-latex">{item.latex}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="math-symbol-empty">
                  No symbols found matching "{searchTerm}"
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="math-symbol-footer">
          <button
            onClick={toggleCustomMode}
            className="toggle-custom-mode"
          >
            {isCustomMode ? 'Show Symbol Picker' : 'Enter LaTeX Directly'}
          </button>
          <p className="math-symbol-help">
            {isCustomMode
              ? 'Type LaTeX expressions. Use \\ for commands. Preview updates as you type.'
              : 'Click a symbol to insert it at the cursor position.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MathSymbolPicker;
