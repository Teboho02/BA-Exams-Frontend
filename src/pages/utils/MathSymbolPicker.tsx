import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ExpressionNode, NodeArrayField, MathSymbolPickerProps } from './types/types';
import { updateContentById, removeNodeById } from './utils/utils';
import VisualBuilder from './VisualBuilder';
import SymbolPicker from './SymbolPicker';
import CustomLatex from './CustomLatex';
import {
  modalOverlayStyle,
  modalContentStyle,
  headerStyle,
  headerTitleStyle,
  closeButtonStyle,
  tabContainerStyle,
  tabButtonStyle,
  footerStyle,
  footerTextStyle,
  footerButtonContainerStyle,
  cancelButtonStyle,
  insertButtonStyle,
} from './styles';

const MathSymbolPicker: React.FC<MathSymbolPickerProps> = ({ onInsert, onClose, targetRef }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customLatex, setCustomLatex] = useState('');
  const [mode, setMode] = useState<'symbols' | 'custom' | 'visual'>('visual');

  console.log(targetRef);
  
  const [expression, setExpression] = useState<ExpressionNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const [editingContext, setEditingContext] = useState<{
    nodeId: string;
    field: NodeArrayField;
  } | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

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

  const getModalTitle = () => {
    switch (mode) {
      case 'visual':
        return 'Visual Math Builder';
      case 'custom':
        return 'Custom LaTeX';
      case 'symbols':
        return 'Mathematical Symbols';
      default:
        return 'Math Symbol Picker';
    }
  };

  const getFooterText = () => {
    switch (mode) {
      case 'visual':
        return 'Build equations by clicking components. Click + buttons to add to specific parts.';
      case 'symbols':
        return 'Click symbols to insert them at cursor position.';
      case 'custom':
        return 'Type LaTeX expressions. Use \\ for commands like \\frac, \\sqrt, etc.';
      default:
        return '';
    }
  };

  const isInsertDisabled = () => {
    return (mode === 'custom' && !customLatex.trim()) || (mode === 'visual' && expression.length === 0);
  };

  return (
    <div style={modalOverlayStyle}>
      <div ref={modalRef} style={modalContentStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={headerTitleStyle}>
            {getModalTitle()}
          </h2>
          <button onClick={onClose} style={closeButtonStyle}>
            <X size={20} color="black" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={tabContainerStyle}>
          <button
            onClick={() => setMode('visual')}
            style={tabButtonStyle(mode === 'visual')}
          >
            Visual Builder
          </button>
          <button
            onClick={() => setMode('symbols')}
            style={tabButtonStyle(mode === 'symbols')}
          >
            Symbols
          </button>
          <button
            onClick={() => setMode('custom')}
            style={tabButtonStyle(mode === 'custom')}
          >
            Custom LaTeX
          </button>
        </div>

        {/* Content */}
        {mode === 'symbols' && (
          <SymbolPicker
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSymbolClick={handleSymbolClick}
          />
        )}

        {mode === 'visual' && (
          <VisualBuilder
            expression={expression}
            setExpression={setExpression}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            hoveredNodeId={hoveredNodeId}
            setHoveredNodeId={setHoveredNodeId}
            editingContext={editingContext}
            setEditingContext={setEditingContext}
            onUpdateNodeContent={updateNodeContent}
            onRemoveNode={removeNode}
          />
        )}

        {mode === 'custom' && (
          <CustomLatex
            customLatex={customLatex}
            setCustomLatex={setCustomLatex}
            onKeyDown={handleKeyDown}
            customInputRef={customInputRef}
          />
        )}

        {/* Footer */}
        <div style={footerStyle}>
          <p style={footerTextStyle}>
            {getFooterText()}
          </p>
          <div style={footerButtonContainerStyle}>
            <button onClick={onClose} style={cancelButtonStyle}>
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
              style={insertButtonStyle(isInsertDisabled())}
              disabled={isInsertDisabled()}
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