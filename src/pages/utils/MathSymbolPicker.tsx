
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

// Define a type for the fields that contain arrays of ExpressionNodes
type NodeArrayField =
  | 'numerator'
  | 'denominator'
  | 'base'
  | 'exponent'
  | 'index'
  | 'radicand'
  | 'integrand'
  | 'lowerLimit'
  | 'upperLimit'
  | 'variable';

const CHILD_FIELDS: NodeArrayField[] = [
  'numerator',
  'denominator',
  'base',
  'exponent',
  'index',
  'radicand',
  'integrand',
  'lowerLimit',
  'upperLimit',
  'variable',
];

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
    { symbol: '°', latex: '^\\circ', name: 'Degree' },
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
} as const;

interface ExpressionNode {
  id: string;
  type: 'text' | 'fraction' | 'sqrt' | 'power' | 'subscript' | 'integral' | 'sum';
  content?: string;
  numerator?: ExpressionNode[];
  denominator?: ExpressionNode[];
  base?: ExpressionNode[];
  exponent?: ExpressionNode[];
  index?: ExpressionNode[];
  radicand?: ExpressionNode[];
  integrand?: ExpressionNode[];
  lowerLimit?: ExpressionNode[];
  upperLimit?: ExpressionNode[];
  variable?: ExpressionNode[];
}

interface MathSymbolPickerProps {
  onInsert: (symbol: string, latex: string) => void;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}

const MathSymbolPicker: React.FC<MathSymbolPickerProps> = ({ onInsert, onClose, targetRef }) => {
  const [activeTab, setActiveTab] = useState<string>('Basic');
  const [searchTerm, setSearchTerm] = useState('');
  const [customLatex, setCustomLatex] = useState('');
  const [mode, setMode] = useState<'symbols' | 'custom' | 'visual'>('symbols');

  const [expression, setExpression] = useState<ExpressionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [editingContext, setEditingContext] = useState<{
    nodeId: string;
    field: NodeArrayField;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  if (!targetRef) {
    console.error('targetRef is required for MathSymbolPicker');
  }

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Generic helpers to modify the expression tree
  const insertChildNode = (
    nodes: ExpressionNode[],
    parentId: string,
    field: NodeArrayField,
    newNode: ExpressionNode
  ): ExpressionNode[] => {
    return nodes.map((node) => {
      if (node.id === parentId) {
        const existing = ((node as any)[field] as ExpressionNode[] | undefined) ?? [];
        return { ...node, [field]: [...existing, newNode] };
      }
      const updated: ExpressionNode = { ...node };
      for (const f of CHILD_FIELDS) {
        if (node[f]) {
          updated[f] = insertChildNode(node[f] as ExpressionNode[], parentId, field, newNode);
        }
      }
      return updated;
    });
  };

  const updateContentById = (nodes: ExpressionNode[], nodeId: string, content: string): ExpressionNode[] =>
    nodes.map((node) => {
      if (node.id === nodeId) {
        return { ...node, content };
      }
      const updated: ExpressionNode = { ...node };
      for (const f of CHILD_FIELDS) {
        if (node[f]) {
          updated[f] = updateContentById(node[f] as ExpressionNode[], nodeId, content);
        }
      }
      return updated;
    });

  const removeNodeById = (nodes: ExpressionNode[], nodeId: string): ExpressionNode[] =>
    nodes
      .filter((n) => n.id !== nodeId)
      .map((node) => {
        const updated: ExpressionNode = { ...node };
        for (const f of CHILD_FIELDS) {
          if (node[f]) {
            updated[f] = removeNodeById(node[f] as ExpressionNode[], nodeId);
          }
        }
        return updated;
      });

  // Add node either to current edit context or at top-level
  const addNodeToExpression = (newNode: ExpressionNode) => {
    if (editingContext) {
      setExpression((prev) => insertChildNode(prev, editingContext.nodeId, editingContext.field, newNode));
    } else {
      setExpression((prev) => [...prev, newNode]);
    }
  };

  // Visual builder node creators
  const addTextNode = (text: string = '') => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'text',
      content: text,
    };
    addNodeToExpression(newNode);
  };

  const addFraction = () => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'fraction',
      numerator: [{ id: generateId(), type: 'text', content: '' }],
      denominator: [{ id: generateId(), type: 'text', content: '' }],
    };
    addNodeToExpression(newNode);
  };

  const addSquareRoot = () => {
    // Supports optional index (nth root) via 'index' field
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'sqrt',
      index: [], // empty index => regular sqrt
      radicand: [{ id: generateId(), type: 'text', content: '' }],
    };
    addNodeToExpression(newNode);
  };

  const addPower = () => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'power',
      base: [{ id: generateId(), type: 'text', content: '' }],
      exponent: [{ id: generateId(), type: 'text', content: '' }],
    };
    addNodeToExpression(newNode);
  };

  const addSubscript = () => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'subscript',
      base: [{ id: generateId(), type: 'text', content: '' }],
      index: [{ id: generateId(), type: 'text', content: '' }],
    };
    addNodeToExpression(newNode);
  };

  const addIntegral = () => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'integral',
      integrand: [{ id: generateId(), type: 'text', content: 'f(x)' }],
      lowerLimit: [{ id: generateId(), type: 'text', content: 'a' }],
      upperLimit: [{ id: generateId(), type: 'text', content: 'b' }],
      variable: [{ id: generateId(), type: 'text', content: 'dx' }],
    };
    addNodeToExpression(newNode);
  };

  const addSum = () => {
    const newNode: ExpressionNode = {
      id: generateId(),
      type: 'sum',
      integrand: [{ id: generateId(), type: 'text', content: 'a_i' }],
      lowerLimit: [{ id: generateId(), type: 'text', content: 'i=0' }],
      upperLimit: [{ id: generateId(), type: 'text', content: 'n' }],
    };
    addNodeToExpression(newNode);
  };

  const updateNodeContent = (nodeId: string, content: string) => {
    setExpression((prev) => updateContentById(prev, nodeId, content));
  };

  const removeNode = (nodeId: string) => {
    setExpression((prev) => removeNodeById(prev, nodeId));
    setEditingContext(null);
  };

  const generateLatex = (nodes: ExpressionNode[]): string => {
    return nodes
      .map((node) => {
        switch (node.type) {
          case 'text':
            return node.content || '';
          case 'fraction': {
            const num = generateLatex(node.numerator || []);
            const den = generateLatex(node.denominator || []);
            return `\\frac{${num}}{${den}}`;
          }
          case 'sqrt': {
            const rad = generateLatex(node.radicand || []);
            const idx = generateLatex(node.index || []);
            return (node.index && node.index.length > 0) ? `\\sqrt[${idx}]{${rad}}` : `\\sqrt{${rad}}`;
          }
          case 'power': {
            const base = generateLatex(node.base || []);
            const exp = generateLatex(node.exponent || []);
            return `{${base}}^{${exp}}`;
          }
          case 'subscript': {
            const subBase = generateLatex(node.base || []);
            const subIndex = generateLatex(node.index || []);
            return `{${subBase}}_{${subIndex}}`;
          }
          case 'integral': {
            const integrand = generateLatex(node.integrand || []);
            const lower = generateLatex(node.lowerLimit || []);
            const upper = generateLatex(node.upperLimit || []);
            const variable = generateLatex(node.variable || []);
            return `\\int_{${lower}}^{${upper}} ${integrand} \\, ${variable}`;
          }
          case 'sum': {
            const sumIntegrand = generateLatex(node.integrand || []);
            const sumLower = generateLatex(node.lowerLimit || []);
            const sumUpper = generateLatex(node.upperLimit || []);
            return `\\sum_{${sumLower}}^{${sumUpper}} ${sumIntegrand}`;
          }
          default:
            return '';
        }
      })
      .join(' ');
  };

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

  const handleSymbolClick = (symbol: string, latex: string) => {
    onInsert(symbol, latex);
  };

  const handleInsertCustomLatex = () => {
    if (customLatex.trim()) {
      onInsert(customLatex, customLatex);
      setCustomLatex('');
    }
  };

  const handleInsertVisualExpression = () => {
    const latex = generateLatex(expression);
    if (latex.trim()) {
      onInsert(latex, latex);
      setExpression([]);
      setEditingContext(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'custom') {
        handleInsertCustomLatex();
      } else if (mode === 'visual') {
        handleInsertVisualExpression();
      }
    }
  };

  const handleClear = () => {
    setExpression([]);
    setSelectedNode(null);
    setEditingContext(null);
  };

  // Filter symbols based on search
  const getFilteredSymbols = () => {
    if (!searchTerm) return (MATH_SYMBOLS as any)[activeTab] || [];
    const term = searchTerm.toLowerCase();
    const allSymbols = Object.values(MATH_SYMBOLS).flat() as { symbol: string; latex: string; name: string }[];
    return allSymbols.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.symbol.toLowerCase().includes(term) ||
        s.latex.toLowerCase().includes(term)
    );
  };

  const symbols = getFilteredSymbols();

  const handleSetEditingContext = (nodeId: string, field: NodeArrayField) => {
    setEditingContext({ nodeId, field });
    setSelectedNode(nodeId);
  };

  const nodeContainerStyle = (isSelected: boolean, isEditingContext: boolean) => ({
    position: 'relative' as const,
    display: 'inline-flex',
    alignItems: 'center',
    margin: '2px',
    padding: '4px',
    border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e5e5',
    borderRadius: '4px',
    background: isEditingContext ? '#e0f2fe' : 'white',
    boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
  });

  const removeButtonBaseStyle = (visible: boolean) => ({
    position: 'absolute' as const,
    top: '-8px',
    right: '-8px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    fontSize: '10px',
    lineHeight: '1',
    cursor: 'pointer',
    display: visible ? 'block' : 'none',
  });

  const contextButtonStyle = {
    padding: '2px 4px',
    fontSize: '10px',
    margin: '2px',
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '4px',
    cursor: 'pointer',
  } as const;

  const renderNode = (node: ExpressionNode): React.ReactNode => {
    const isSelected = selectedNode === node.id;
    const isEditHere = editingContext?.nodeId === node.id;
    const showRemove = hoveredNodeId === node.id;

    switch (node.type) {
      case 'text':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <input
              type="text"
              value={node.content || ''}
              onChange={(e) => updateNodeContent(node.id, e.target.value)}
              onFocus={() => setSelectedNode(node.id)}
              placeholder="text"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                minWidth: '20px',
                width: 'auto',
                fontSize: '14px',
                color: 'black',
              }}
            />
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'fraction':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '20px', minHeight: '20px', padding: '2px 4px', color: 'black' }}>
                {(node.numerator || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'numerator')}
                  title="Add to numerator"
                >
                  +
                </button>
              </div>
              <div style={{ width: '100%', minWidth: '30px', height: '1px', background: '#000', margin: '1px 0' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', minWidth: '20px', minHeight: '20px', padding: '2px 4px', color: 'black' }}>
                {(node.denominator || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'denominator')}
                  title="Add to denominator"
                >
                  +
                </button>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove fraction"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'sqrt':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', margin: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '4px', color: 'black' }}>√</div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    padding: '2px 4px 0 4px',
                    minWidth: '20px',
                    minHeight: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'black',
                  }}
                >
                  {(node.radicand || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'radicand')}
                    title="Add to radicand"
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', color: '#111' }}>
                <span style={{ marginRight: '4px' }}>Index:</span>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(node.index || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'index')}
                    title="Add index (nth root)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove square root"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'power':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {(node.base || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'base')}
                  title="Add to base"
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '-5px' }}>
                <div style={{ fontSize: '10px', marginRight: '2px' }}>^</div>
                {(node.exponent || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'exponent')}
                  title="Add to exponent"
                >
                  +
                </button>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove power"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'subscript':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {(node.base || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'base')}
                  title="Add to base"
                >
                  +
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '-5px' }}>
                <div style={{ fontSize: '10px', marginRight: '2px' }}>_</div>
                {(node.index || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'index')}
                  title="Add to subscript"
                >
                  +
                </button>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove subscript"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'sum':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'black' }}>Σ</div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Upper:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(node.upperLimit || []).map((n) => renderNode(n))}
                    <button
                      style={contextButtonStyle}
                      onClick={() => handleSetEditingContext(node.id, 'upperLimit')}
                      title="Add upper limit"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lower:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(node.lowerLimit || []).map((n) => renderNode(n))}
                    <button
                      style={contextButtonStyle}
                      onClick={() => handleSetEditingContext(node.id, 'lowerLimit')}
                      title="Add lower limit"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <div style={{ marginRight: '5px' }}>Expression:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(node.integrand || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'integrand')}
                    title="Add expression"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove sum"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      case 'integral':
        return (
          <div
            key={node.id}
            style={nodeContainerStyle(isSelected, isEditHere)}
            onMouseEnter={() => setHoveredNodeId(node.id)}
            onMouseLeave={() => setHoveredNodeId(null)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'black' }}>∫</div>
              <div style={{ display: 'flex', flexDirection: 'column', fontSize: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Upper:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(node.upperLimit || []).map((n) => renderNode(n))}
                    <button
                      style={contextButtonStyle}
                      onClick={() => handleSetEditingContext(node.id, 'upperLimit')}
                      title="Add upper limit"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lower:</span>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {(node.lowerLimit || []).map((n) => renderNode(n))}
                    <button
                      style={contextButtonStyle}
                      onClick={() => handleSetEditingContext(node.id, 'lowerLimit')}
                      title="Add lower limit"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <div style={{ marginRight: '5px' }}>Integrand:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(node.integrand || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'integrand')}
                    title="Add integrand"
                  >
                    +
                  </button>
                </div>
                <div style={{ marginLeft: '8px', marginRight: '5px' }}>d:</div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {(node.variable || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'variable')}
                    title="Add variable (e.g., dx)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <button
              data-role="remove"
              onClick={() => removeNode(node.id)}
              title="Remove integral"
              style={removeButtonBaseStyle(showRemove)}
            >
              ×
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        style={{
          backgroundColor: 'white',
          color: 'black',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'black' }}>
            {mode === 'visual' ? 'Visual Math Builder' : mode === 'custom' ? 'Custom LaTeX' : 'Mathematical Symbols'}
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            <X size={20} color="black" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9' }}>
          <button
            onClick={() => setMode('symbols')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: mode === 'symbols' ? 'white' : 'transparent',
              borderBottom: mode === 'symbols' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              color: 'black',
            }}
          >
            Symbols
          </button>
          <button
            onClick={() => setMode('visual')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: mode === 'visual' ? 'white' : 'transparent',
              borderBottom: mode === 'visual' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              color: 'black',
            }}
          >
            Visual Builder
          </button>
          <button
            onClick={() => setMode('custom')}
            style={{
              padding: '12px 16px',
              border: 'none',
              backgroundColor: mode === 'custom' ? 'white' : 'transparent',
              borderBottom: mode === 'custom' ? '2px solid #3b82f6' : '2px solid transparent',
              cursor: 'pointer',
              color: 'black',
            }}
          >
            Custom LaTeX
          </button>
        </div>

        {/* Content */}
        {mode === 'symbols' && (
          <>
            {/* Search */}
            <div style={{ padding: '16px' }}>
              <input
                type="text"
                placeholder="Search symbols..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: 'black',
                }}
                autoFocus
              />
            </div>

            {/* Tabs */}
            {!searchTerm && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '0 16px 16px 16px' }}>
                {Object.keys(MATH_SYMBOLS).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      backgroundColor: activeTab === tab ? '#3b82f6' : 'white',
                      color: activeTab === tab ? 'white' : 'black',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}

            {/* Symbols Grid */}
            <div style={{ padding: '16px' }}>
              {symbols.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: '8px',
                  }}
                >
                  {symbols.map((item: any, index : any) => (
                    <button
                      key={`${item.symbol}-${index}`}
                      onClick={() => handleSymbolClick(item.symbol, item.latex)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        color: 'black',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                      title={`${item.name} (LaTeX: ${item.latex})`}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                    >
                      <span style={{ fontSize: '18px', marginBottom: '4px', color: 'black' }}>{item.symbol}</span>
                      <span style={{ fontSize: '10px', color: '#333' }}>{item.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#333', padding: '40px' }}>
                  No symbols found matching "{searchTerm}"
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'visual' && (
          <>
            {/* Visual Builder Toolbar */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9', color: 'black' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <button
                  onClick={() => addTextNode()}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add text"
                >
                  <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'black' }}>abc</span>
                  <span style={{ fontSize: '12px', color: 'black' }}>Text</span>
                </button>
                <button
                  onClick={addFraction}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add fraction"
                >
                  <div style={{ fontSize: '14px', color: 'black' }}>
                    <div style={{ borderBottom: '1px solid black', paddingLeft: '4px', paddingRight: '4px' }}>a</div>
                    <div style={{ paddingLeft: '4px', paddingRight: '4px' }}>b</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'black' }}>Fraction</span>
                </button>
                <button
                  onClick={addSquareRoot}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add square root / nth root"
                >
                  <span style={{ fontSize: '18px', color: 'black' }}>√</span>
                  <span style={{ fontSize: '12px', color: 'black' }}>√ / n√</span>
                </button>
                <button
                  onClick={addPower}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add power/exponent"
                >
                  <span style={{ fontSize: '14px', color: 'black' }}>
                    x<sup>n</sup>
                  </span>
                  <span style={{ fontSize: '12px', color: 'black' }}>Power</span>
                </button>
                <button
                  onClick={addSubscript}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add subscript"
                >
                  <span style={{ fontSize: '14px', color: 'black' }}>
                    x<sub>i</sub>
                  </span>
                  <span style={{ fontSize: '12px', color: 'black' }}>Subscript</span>
                </button>
                <button
                  onClick={addIntegral}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add integral"
                >
                  <span style={{ fontSize: '18px', color: 'black' }}>∫</span>
                  <span style={{ fontSize: '12px', color: 'black' }}>Integral</span>
                </button>
                <button
                  onClick={addSum}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                  title="Add sum"
                >
                  <span style={{ fontSize: '18px', color: 'black' }}>Σ</span>
                  <span style={{ fontSize: '12px', color: 'black' }}>Sum</span>
                </button>
                <button
                  onClick={handleClear}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    color: '#dc2626',
                  }}
                  title="Clear all"
                >
                  <span style={{ fontSize: '18px' }}>✕</span>
                  <span style={{ fontSize: '12px' }}>Clear</span>
                </button>
              </div>

              {/* Editing Context Indicator */}
              {editingContext && (
                <div
                  style={{
                    padding: '8px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '4px',
                    marginTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '14px', color: 'black' }}>Adding into: {editingContext.field}</span>
                  <button
                    onClick={() => setEditingContext(null)}
                    style={{
                      padding: '4px 8px',
                      background: '#93c5fd',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'black',
                    }}
                  >
                    Exit Context
                  </button>
                </div>
              )}
            </div>

            {/* Expression Builder */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'black' }}
                >
                  Expression:
                </label>
                <div
                  style={{
                    minHeight: '100px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', color: 'black' }}>
                    {expression.length > 0 ? (
                      expression.map((node) => renderNode(node))
                    ) : (
                      <div style={{ color: '#333' }}>Click buttons above to build your expression...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* LaTeX Preview */}
              {expression.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'black' }}
                  >
                    Generated LaTeX:
                  </label>
                  <div
                    style={{
                      backgroundColor: '#f5f5f5',
                      padding: '12px',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      wordBreak: 'break-all',
                      color: 'black',
                    }}
                  >
                    {generateLatex(expression)}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'custom' && (
          <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                ref={customInputRef}
                type="text"
                placeholder="Enter LaTeX (e.g., x^2 + \\sqrt{10})"
                value={customLatex}
                onChange={(e) => setCustomLatex(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  color: 'black',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'black' }}>Examples:</h4>
              <ul style={{ fontSize: '12px', color: '#333', margin: 0, paddingLeft: '20px' }}>
                <li>
                  <code style={{ color: 'black' }}>x^2 + \sqrt&#123;10&#125;</code>
                </li>
                <li>
                  <code style={{ color: 'black' }}>\frac&#123;1&#125;&#123;2&#125;</code>
                </li>
                <li>
                  <code style={{ color: 'black' }}>\int_a^b f(x)\,dx</code>
                </li>
                <li>
                  <code style={{ color: 'black' }}>
                    \frac&#123;\sqrt&#123;x^3&#125;&#125;&#123;\sum_&#123;i=0&#125;^&#123;n&#125; a_i&#125;
                  </code>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid #e5e5e5',
            backgroundColor: '#f9f9f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>
            {mode === 'symbols' && 'Click a symbol to insert it at the cursor position.'}
            {mode === 'visual' && 'Build expressions visually. Click + to add inside parts.'}
            {mode === 'custom' && 'Type LaTeX expressions. Use \\ for commands.'}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                backgroundColor: 'white',
                cursor: 'pointer',
                color: 'black',
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (mode === 'custom') {
                  handleInsertCustomLatex();
                } else if (mode === 'visual') {
                  handleInsertVisualExpression();
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor:
                  (mode === 'custom' && !customLatex.trim()) || (mode === 'visual' && expression.length === 0)
                    ? '#9ca3af'
                    : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor:
                  (mode === 'custom' && !customLatex.trim()) || (mode === 'visual' && expression.length === 0)
                    ? 'not-allowed'
                    : 'pointer',
              }}
              disabled={(mode === 'custom' && !customLatex.trim()) || (mode === 'visual' && expression.length === 0)}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathSymbolPicker;