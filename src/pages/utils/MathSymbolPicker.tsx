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
  | 'upperLimit';

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
];

// Simplified symbol set focused on essential math operations
const ESSENTIAL_SYMBOLS = [
  { symbol: '√', latex: '\\sqrt{}', name: 'Square Root' },
  { symbol: 'x²', latex: 'x^{2}', name: 'Superscript' },
  { symbol: 'x₁', latex: 'x_{1}', name: 'Subscript' },
  { symbol: '½', latex: '\\frac{1}{2}', name: 'Fraction' },
  { symbol: '∑', latex: '\\sum', name: 'Sum' },
  { symbol: '<', latex: '<', name: 'Less Than' },
  { symbol: '>', latex: '>', name: 'Greater Than' },
  { symbol: '≈', latex: '\\approx', name: 'Approximately' },
  { symbol: '∞', latex: '\\infty', name: 'Infinity' },
  { symbol: '±', latex: '\\pm', name: 'Plus/Minus' },
  { symbol: '=', latex: '=', name: 'Equals' },
  { symbol: '+', latex: '+', name: 'Plus' },
  { symbol: '−', latex: '-', name: 'Minus' },
];

// Quick symbols for the visual builder
const QUICK_SYMBOLS = [
  { symbol: '±', content: '±', name: 'Plus/Minus' },
  { symbol: '=', content: '=', name: 'Equals' },
  { symbol: '+', content: '+', name: 'Plus' },
  { symbol: '−', content: '−', name: 'Minus' },
  { symbol: '×', content: '×', name: 'Multiply' },
  { symbol: '÷', content: '÷', name: 'Divide' },
  { symbol: '≤', content: '≤', name: 'Less/Equal' },
  { symbol: '≥', content: '≥', name: 'Greater/Equal' },
  { symbol: '≠', content: '≠', name: 'Not Equal' },
  { symbol: '∞', content: '∞', name: 'Infinity' },
  { symbol: 'π', content: 'π', name: 'Pi' },
  { symbol: 'α', content: 'α', name: 'Alpha' },
  { symbol: 'β', content: 'β', name: 'Beta' },
  { symbol: 'θ', content: 'θ', name: 'Theta' },
  { symbol: 'Δ', content: 'Δ', name: 'Delta' },
  { symbol: '∈', content: '∈', name: 'Element of' },
];

interface ExpressionNode {
  id: string;
  type: 'text' | 'fraction' | 'sqrt' | 'power' | 'subscript' | 'sum';
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
}

interface MathSymbolPickerProps {
  onInsert: (symbol: string, latex: string) => void;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement>;
}

const MathSymbolPicker: React.FC<MathSymbolPickerProps> = ({ onInsert, onClose, targetRef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customLatex, setCustomLatex] = useState('');
  const [mode, setMode] = useState<'symbols' | 'custom' | 'visual'>('visual');

  console.log(targetRef)
  const [expression, setExpression] = useState<ExpressionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [editingContext, setEditingContext] = useState<{
    nodeId: string;
    field: NodeArrayField;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

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

  // Preset equation creators
  const addQuadraticFormula = () => {
    const formula: ExpressionNode = {
      id: generateId(),
      type: 'text',
      content: 'x = '
    };
    
    const fraction: ExpressionNode = {
      id: generateId(),
      type: 'fraction',
      numerator: [
        { id: generateId(), type: 'text', content: '-b ± ' },
        {
          id: generateId(),
          type: 'sqrt',
          index: [],
          radicand: [
            {
              id: generateId(),
              type: 'power',
              base: [{ id: generateId(), type: 'text', content: 'b' }],
              exponent: [{ id: generateId(), type: 'text', content: '2' }]
            },
            { id: generateId(), type: 'text', content: ' - 4ac' }
          ]
        }
      ],
      denominator: [{ id: generateId(), type: 'text', content: '2a' }]
    };

    setExpression([formula, fraction]);
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
    if (!searchTerm) return ESSENTIAL_SYMBOLS;
    const term = searchTerm.toLowerCase();
    return ESSENTIAL_SYMBOLS.filter(
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
    margin: '4px',
    padding: '8px',
    border: isSelected ? '3px solid #3b82f6' : '2px solid #e5e5e5',
    borderRadius: '6px',
    background: isEditingContext ? '#e0f2fe' : 'white',
    boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
    minWidth: '60px',
    minHeight: '50px',
  });

  const removeButtonBaseStyle = (visible: boolean) => ({
    position: 'absolute' as const,
    top: '-10px',
    right: '-10px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    fontSize: '12px',
    lineHeight: '1',
    cursor: 'pointer',
    display: visible ? 'block' : 'none',
    fontWeight: 'bold',
  });

  const contextButtonStyle = {
    padding: '4px 8px',
    fontSize: '12px',
    margin: '2px',
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#1e40af',
    fontWeight: 'bold',
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
                minWidth: '60px',
                width: `${Math.max(60, (node.content || '').length * 10 + 20)}px`,
                fontSize: '16px',
                color: 'black',
                textAlign: 'center',
                padding: '4px',
              }}
            />
            <button
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                minWidth: '80px', 
                minHeight: '40px', 
                padding: '4px 8px', 
                justifyContent: 'center',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                {(node.numerator || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'numerator')}
                  title="Add to numerator"
                >
                  +
                </button>
              </div>
              <div style={{ width: '100%', minWidth: '80px', height: '3px', background: '#000', margin: '2px 0' }}></div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                minWidth: '80px', 
                minHeight: '40px', 
                padding: '4px 8px', 
                justifyContent: 'center',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                marginTop: '4px'
              }}>
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
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginRight: '4px', color: 'black', lineHeight: '1' }}>√</div>
              <div
                style={{
                  borderTop: '3px solid #000',
                  padding: '8px 12px 4px 12px',
                  minWidth: '60px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f8f9fa',
                  borderLeft: '1px solid #dee2e6',
                  borderRight: '1px solid #dee2e6',
                  borderBottom: '1px solid #dee2e6',
                  borderRadius: '0 0 4px 4px',
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
            <button
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '14px', 
                minHeight: '30px',
                minWidth: '60px',
                padding: '4px 8px',
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                {(node.exponent || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'exponent')}
                  title="Add to exponent"
                >
                  +
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '16px', 
                minHeight: '35px',
                minWidth: '60px',
                padding: '4px 8px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
                {(node.base || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'base')}
                  title="Add to base"
                >
                  +
                </button>
              </div>
            </div>
            <button
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '16px', 
                minHeight: '35px',
                minWidth: '60px',
                padding: '4px 8px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                marginBottom: '4px'
              }}>
                {(node.base || []).map((n) => renderNode(n))}
                <button
                  style={contextButtonStyle}
                  onClick={() => handleSetEditingContext(node.id, 'base')}
                  title="Add to base"
                >
                  +
                </button>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '14px', 
                minHeight: '30px',
                minWidth: '60px',
                padding: '4px 8px',
                background: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '4px'
              }}>
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
            <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '12px', 
                  marginBottom: '4px',
                  minWidth: '60px',
                  minHeight: '25px',
                  padding: '4px 8px',
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px'
                }}>
                  {(node.upperLimit || []).map((n) => renderNode(n))}
                  <button
                    style={contextButtonStyle}
                    onClick={() => handleSetEditingContext(node.id, 'upperLimit')}
                    title="Add upper limit"
                  >
                    +
                  </button>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'black', lineHeight: '1', margin: '4px 0' }}>Σ</div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  fontSize: '12px', 
                  marginTop: '4px',
                  minWidth: '60px',
                  minHeight: '25px',
                  padding: '4px 8px',
                  background: '#e3f2fd',
                  border: '1px solid #90caf9',
                  borderRadius: '4px'
                }}>
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
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                minWidth: '80px',
                minHeight: '40px',
                padding: '8px 12px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px'
              }}>
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
            <button
              onClick={() => removeNode(node.id)}
              title="Remove sum"
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
          maxWidth: '900px',
          width: '95%',
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

            {/* Symbols Grid */}
            <div style={{ padding: '16px' }}>
              {symbols.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {symbols.map((item, index) => (
                    <button
                      key={`${item.symbol}-${index}`}
                      onClick={() => handleSymbolClick(item.symbol, item.latex)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: 'black',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s',
                      }}
                      title={`${item.name} (LaTeX: ${item.latex})`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <span style={{ fontSize: '20px', marginBottom: '6px', color: 'black' }}>{item.symbol}</span>
                      <span style={{ fontSize: '11px', color: '#666', fontWeight: '500' }}>{item.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
                  No symbols found matching "{searchTerm}"
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'visual' && (
          <>
            {/* Visual Builder Toolbar */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e5e5', backgroundColor: '#f9f9f9' }}>
              {/* Quick Symbols Section */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'black' }}>
                  Quick Symbols:
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(60px, 1fr))',
                    gap: '6px',
                    maxHeight: '120px',
                    overflowY: 'auto',
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                  }}
                >
                  {QUICK_SYMBOLS.map((item, index) => (
                    <button
                      key={`${item.symbol}-${index}`}
                      onClick={() => addTextNode(item.content)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '6px 4px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '4px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        color: 'black',
                        fontSize: '12px',
                        minHeight: '45px',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}
                      title={`Insert ${item.name}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                        e.currentTarget.style.borderColor = '#3b82f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = '#e5e5e5';
                      }}
                    >
                      <span style={{ fontSize: '16px', color: 'black', marginBottom: '2px' }}>{item.symbol}</span>
                      <span style={{ fontSize: '9px', color: '#666', textAlign: 'center', lineHeight: '1.2' }}>
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'black' }}>
                  Basic Components:
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => addTextNode()}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add text"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '16px', fontFamily: 'serif', color: 'black', marginBottom: '4px' }}>abc</span>
                    <span style={{ fontSize: '11px', color: 'black' }}>Text</span>
                  </button>
                  
                  <button
                    onClick={addFraction}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add fraction"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <div style={{ fontSize: '14px', color: 'black', marginBottom: '4px' }}>
                      <div style={{ borderBottom: '1px solid black', paddingLeft: '6px', paddingRight: '6px', textAlign: 'center' }}>a</div>
                      <div style={{ paddingLeft: '6px', paddingRight: '6px', textAlign: 'center' }}>b</div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'black' }}>Fraction</span>
                  </button>
                  
                  <button
                    onClick={addSquareRoot}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add square root"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '18px', color: 'black', marginBottom: '4px' }}>√</span>
                    <span style={{ fontSize: '11px', color: 'black' }}>Square Root</span>
                  </button>
                  
                  <button
                    onClick={addPower}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add power/exponent"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '14px', color: 'black', marginBottom: '4px' }}>
                      x<sup>n</sup>
                    </span>
                    <span style={{ fontSize: '11px', color: 'black' }}>Power</span>
                  </button>
                  
                  <button
                    onClick={addSubscript}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add subscript"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '14px', color: 'black', marginBottom: '4px' }}>
                      x<sub>i</sub>
                    </span>
                    <span style={{ fontSize: '11px', color: 'black' }}>Subscript</span>
                  </button>
                  
                  <button
                    onClick={addSum}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      color: 'black',
                      transition: 'all 0.2s',
                    }}
                    title="Add sum"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  >
                    <span style={{ fontSize: '18px', color: 'black', marginBottom: '4px' }}>Σ</span>
                    <span style={{ fontSize: '11px', color: 'black' }}>Sum</span>
                  </button>
                </div>
              </div>

              {/* Preset Equations */}
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', color: 'black' }}>
                  Quick Templates:
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={addQuadraticFormula}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #10b981',
                      borderRadius: '6px',
                      backgroundColor: '#f0fdf4',
                      cursor: 'pointer',
                      color: '#065f46',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                    title="Insert quadratic formula template"
                  >
                    Quadratic Formula
                  </button>
                  
                  <button
                    onClick={handleClear}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #ef4444',
                      borderRadius: '6px',
                      backgroundColor: '#fef2f2',
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontSize: '12px',
                      fontWeight: '500',
                    }}
                    title="Clear all"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Editing Context Indicator */}
              {editingContext && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '6px',
                    border: '1px solid #93c5fd',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: '500' }}>
                    🎯 Adding to: {editingContext.field}
                  </span>
                  <button
                    onClick={() => setEditingContext(null)}
                    style={{
                      padding: '4px 8px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Exit Context
                  </button>
                </div>
              )}
            </div>

            {/* Expression Builder */}
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label
                  style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: 'black' }}
                >
                  Your Expression:
                </label>
                <div
                  style={{
                    minHeight: '200px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: '#f9f9f9',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
                    {expression.length > 0 ? (
                      expression.map((node) => renderNode(node))
                    ) : (
                      <div style={{ color: '#666', fontStyle: 'italic', textAlign: 'center', width: '100%', padding: '40px' }}>
                        Click buttons above to start building your equation...
                        <br />
                        <small style={{ color: '#999' }}>Try the quick symbols (like ±) or the "Quadratic Formula" template!</small>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LaTeX Preview */}
              {expression.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: 'black' }}
                  >
                    Generated LaTeX:
                  </label>
                  <div
                    style={{
                      backgroundColor: '#1f2937',
                      padding: '12px',
                      borderRadius: '6px',
                      fontFamily: 'Monaco, Consolas, monospace',
                      fontSize: '14px',
                      wordBreak: 'break-all',
                      color: '#f3f4f6',
                      border: '1px solid #374151',
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
                  fontFamily: 'Monaco, Consolas, monospace',
                  color: 'black',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: 'black' }}>Examples:</h4>
              <ul style={{ fontSize: '12px', color: '#333', margin: 0, paddingLeft: '20px' }}>
                <li>
                  <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
                    x^2 + \sqrt&#123;10&#125;
                  </code>
                </li>
                <li>
                  <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
                    \frac&#123;1&#125;&#123;2&#125;
                  </code>
                </li>
                <li>
                  <code style={{ color: 'black', backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>
                    \frac&#123;-b \pm \sqrt&#123;b^2 - 4ac&#125;&#125;&#123;2a&#125;
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
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
            {mode === 'visual' && 'Build equations by clicking components. Click + buttons to add to specific parts.'}
            {mode === 'symbols' && 'Click symbols to insert them at cursor position.'}
            {mode === 'custom' && 'Type LaTeX expressions. Use \\ for commands like \\frac, \\sqrt, etc.'}
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