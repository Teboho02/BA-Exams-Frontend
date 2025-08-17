import React from 'react';
import type { ExpressionNode, NodeArrayField } from './types/types';
import { QUICK_SYMBOLS } from './constants/constants';
import NodeRenderer from './NodeRenderer';
import {
  sectionStyle,
  sectionTitleStyle,
  quickSymbolGridStyle,
  quickSymbolButtonStyle,
  componentGridStyle,
  componentButtonStyle,
  templateButtonStyle,
  clearButtonStyle,
  expressionBuilderStyle,
  expressionContainerStyle,
  emptyStateStyle,
  latexPreviewStyle,
  editingContextStyle,
  editingContextTextStyle,
  exitContextButtonStyle,
} from './styles';
import {
  createTextNode,
  createFractionNode,
  createSquareRootNode,
  createPowerNode,
  createSubscriptNode,
  createSumNode,
  createQuadraticFormula,
  generateLatex,
} from './utils/utils';

interface VisualBuilderProps {
  expression: ExpressionNode[];
  setExpression: React.Dispatch<React.SetStateAction<ExpressionNode[]>>;
  selectedNode: string | null;
  setSelectedNode: React.Dispatch<React.SetStateAction<string | null>>;
  hoveredNodeId: string | null;
  setHoveredNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  editingContext: { nodeId: string; field: NodeArrayField } | null;
  setEditingContext: React.Dispatch<React.SetStateAction<{ nodeId: string; field: NodeArrayField } | null>>;
  onUpdateNodeContent: (nodeId: string, content: string) => void;
  onRemoveNode: (nodeId: string) => void;
}

const VisualBuilder: React.FC<VisualBuilderProps> = ({
  expression,
  setExpression,
  selectedNode,
  setSelectedNode,
  hoveredNodeId,
  setHoveredNodeId,
  editingContext,
  setEditingContext,
  onUpdateNodeContent,
  onRemoveNode,
}) => {
  // Add node either to current edit context or at top-level
  const addNodeToExpression = (newNode: ExpressionNode) => {
    if (editingContext) {
      setExpression((prev) => insertChildNode(prev, editingContext.nodeId, editingContext.field, newNode));
    } else {
      setExpression((prev) => [...prev, newNode]);
    }
  };

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
      for (const f of CHILD_FIELDS) {
        if (node[f]) {
          updated[f] = insertChildNode(node[f] as ExpressionNode[], parentId, field, newNode);
        }
      }
      return updated;
    });
  };

  const handleAddTextNode = (text: string = '') => {
    addNodeToExpression(createTextNode(text));
  };

  const handleAddFraction = () => {
    addNodeToExpression(createFractionNode());
  };

  const handleAddSquareRoot = () => {
    addNodeToExpression(createSquareRootNode());
  };

  const handleAddPower = () => {
    addNodeToExpression(createPowerNode());
  };

  const handleAddSubscript = () => {
    addNodeToExpression(createSubscriptNode());
  };

  const handleAddSum = () => {
    addNodeToExpression(createSumNode());
  };

  const handleAddQuadraticFormula = () => {
    const formula = createQuadraticFormula();
    setExpression(formula);
  };

  const handleClear = () => {
    setExpression([]);
    setSelectedNode(null);
    setEditingContext(null);
  };

  const handleSetEditingContext = (nodeId: string, field: NodeArrayField) => {
    setEditingContext({ nodeId, field });
    setSelectedNode(nodeId);
  };

  return (
    <>
      {/* Visual Builder Toolbar */}
      <div style={sectionStyle}>
        {/* Quick Symbols Section */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={sectionTitleStyle}>Quick Symbols:</h3>
          <div style={quickSymbolGridStyle}>
            {QUICK_SYMBOLS.map((item : any, index : any) => (
              <button
                key={`${item.symbol}-${index}`}
                onClick={() => handleAddTextNode(item.content)}
                style={quickSymbolButtonStyle}
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
          <h3 style={sectionTitleStyle}>Basic Components:</h3>
          <div style={componentGridStyle}>
            <button
              onClick={() => handleAddTextNode()}
              style={componentButtonStyle}
              title="Add text"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '16px', fontFamily: 'serif', color: 'black', marginBottom: '4px' }}>abc</span>
              <span style={{ fontSize: '11px', color: 'black' }}>Text</span>
            </button>
            
            <button
              onClick={handleAddFraction}
              style={componentButtonStyle}
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
              onClick={handleAddSquareRoot}
              style={componentButtonStyle}
              title="Add square root"
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <span style={{ fontSize: '18px', color: 'black', marginBottom: '4px' }}>√</span>
              <span style={{ fontSize: '11px', color: 'black' }}>Square Root</span>
            </button>
            
            <button
              onClick={handleAddPower}
              style={componentButtonStyle}
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
              onClick={handleAddSubscript}
              style={componentButtonStyle}
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
              onClick={handleAddSum}
              style={componentButtonStyle}
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
          <h3 style={sectionTitleStyle}>Quick Templates:</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleAddQuadraticFormula}
              style={templateButtonStyle}
              title="Insert quadratic formula template"
            >
              Quadratic Formula
            </button>
            
            <button
              onClick={handleClear}
              style={clearButtonStyle}
              title="Clear all"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Editing Context Indicator */}
        {editingContext && (
          <div style={editingContextStyle}>
            <span style={editingContextTextStyle}>
              🎯 Adding to: {editingContext.field}
            </span>
            <button
              onClick={() => setEditingContext(null)}
              style={exitContextButtonStyle}
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
          <div style={expressionBuilderStyle}>
            <div style={expressionContainerStyle}>
              {expression.length > 0 ? (
                expression.map((node) => (
                  <NodeRenderer
                    key={node.id}
                    node={node}
                    selectedNode={selectedNode}
                    hoveredNodeId={hoveredNodeId}
                    editingContext={editingContext}
                    onUpdateNodeContent={onUpdateNodeContent}
                    onRemoveNode={onRemoveNode}
                    onSetSelectedNode={setSelectedNode}
                    onSetHoveredNodeId={setHoveredNodeId}
                    onSetEditingContext={handleSetEditingContext}
                  />
                ))
              ) : (
                <div style={emptyStateStyle}>
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
            <div style={latexPreviewStyle}>
              {generateLatex(expression)}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VisualBuilder;