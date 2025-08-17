import React from 'react';
import type { ExpressionNode, NodeArrayField } from './types/types';
import {
  nodeContainerStyle,
  removeButtonStyle,
  contextButtonStyle,
  textInputStyle,
  fractionPartStyle,
  fractionLineStyle,
  sqrtSymbolStyle,
  sqrtContentStyle,
  exponentStyle,
  baseStyle,
  subscriptStyle,
  sumSymbolStyle,
  sumLimitStyle,
  sumLowerLimitStyle,
  sumIntegrandStyle,
} from './styles';

interface NodeRendererProps {
  node: ExpressionNode;
  selectedNode: string | null;
  hoveredNodeId: string | null;
  editingContext: { nodeId: string; field: NodeArrayField } | null;
  onUpdateNodeContent: (nodeId: string, content: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onSetSelectedNode: (nodeId: string) => void;
  onSetHoveredNodeId: (nodeId: string | null) => void;
  onSetEditingContext: (nodeId: string, field: NodeArrayField) => void;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  node,
  selectedNode,
  hoveredNodeId,
  editingContext,
  onUpdateNodeContent,
  onRemoveNode,
  onSetSelectedNode,
  onSetHoveredNodeId,
  onSetEditingContext,
}) => {
  const isSelected = selectedNode === node.id;
  const isEditHere = editingContext?.nodeId === node.id;
  const showRemove = hoveredNodeId === node.id;

  const renderChildNodes = (nodes: ExpressionNode[]): React.ReactNode[] => {
    return nodes.map((childNode) => (
      <NodeRenderer
        key={childNode.id}
        node={childNode}
        selectedNode={selectedNode}
        hoveredNodeId={hoveredNodeId}
        editingContext={editingContext}
        onUpdateNodeContent={onUpdateNodeContent}
        onRemoveNode={onRemoveNode}
        onSetSelectedNode={onSetSelectedNode}
        onSetHoveredNodeId={onSetHoveredNodeId}
        onSetEditingContext={onSetEditingContext}
      />
    ));
  };

  switch (node.type) {
    case 'text':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <input
            type="text"
            value={node.content || ''}
            onChange={(e) => onUpdateNodeContent(node.id, e.target.value)}
            onFocus={() => onSetSelectedNode(node.id)}
            placeholder="text"
            style={textInputStyle(Math.max(60, (node.content || '').length * 10 + 20))}
          />
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    case 'fraction':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 8px' }}>
            <div style={{ ...fractionPartStyle, marginBottom: '4px' }}>
              {renderChildNodes(node.numerator || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'numerator')}
                title="Add to numerator"
              >
                +
              </button>
            </div>
            <div style={fractionLineStyle}></div>
            <div style={{ ...fractionPartStyle, marginTop: '4px' }}>
              {renderChildNodes(node.denominator || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'denominator')}
                title="Add to denominator"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove fraction"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    case 'sqrt':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
            <div style={sqrtSymbolStyle}>√</div>
            <div style={sqrtContentStyle}>
              {renderChildNodes(node.radicand || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'radicand')}
                title="Add to radicand"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove square root"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    case 'power':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 8px' }}>
            <div style={exponentStyle}>
              {renderChildNodes(node.exponent || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'exponent')}
                title="Add to exponent"
              >
                +
              </button>
            </div>
            <div style={baseStyle}>
              {renderChildNodes(node.base || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'base')}
                title="Add to base"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove power"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    case 'subscript':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '0 8px' }}>
            <div style={{ ...baseStyle, marginBottom: '4px' }}>
              {renderChildNodes(node.base || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'base')}
                title="Add to base"
              >
                +
              </button>
            </div>
            <div style={subscriptStyle}>
              {renderChildNodes(node.index || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'index')}
                title="Add to subscript"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove subscript"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    case 'sum':
      return (
        <div
          style={nodeContainerStyle(isSelected, isEditHere)}
          onMouseEnter={() => onSetHoveredNodeId(node.id)}
          onMouseLeave={() => onSetHoveredNodeId(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', margin: '0 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '12px' }}>
              <div style={{ ...sumLimitStyle, marginBottom: '4px' }}>
                {renderChildNodes(node.upperLimit || [])}
                <button
                  style={contextButtonStyle}
                  onClick={() => onSetEditingContext(node.id, 'upperLimit')}
                  title="Add upper limit"
                >
                  +
                </button>
              </div>
              <div style={sumSymbolStyle}>Σ</div>
              <div style={{ ...sumLowerLimitStyle, marginTop: '4px' }}>
                {renderChildNodes(node.lowerLimit || [])}
                <button
                  style={contextButtonStyle}
                  onClick={() => onSetEditingContext(node.id, 'lowerLimit')}
                  title="Add lower limit"
                >
                  +
                </button>
              </div>
            </div>
            <div style={sumIntegrandStyle}>
              {renderChildNodes(node.integrand || [])}
              <button
                style={contextButtonStyle}
                onClick={() => onSetEditingContext(node.id, 'integrand')}
                title="Add expression"
              >
                +
              </button>
            </div>
          </div>
          <button
            onClick={() => onRemoveNode(node.id)}
            title="Remove sum"
            style={removeButtonStyle(showRemove)}
          >
            ×
          </button>
        </div>
      );

    default:
      return null;
  }
};

export default NodeRenderer;