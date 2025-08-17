import type { ExpressionNode, NodeArrayField } from '../types/types';
import { CHILD_FIELDS } from '../types/types';

// Utility function to generate unique IDs
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

// Generic helpers to modify the expression tree
export const insertChildNode = (
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

export const updateContentById = (
  nodes: ExpressionNode[],
  nodeId: string,
  content: string
): ExpressionNode[] =>
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

export const removeNodeById = (nodes: ExpressionNode[], nodeId: string): ExpressionNode[] =>
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

// LaTeX generation
export const generateLatex = (nodes: ExpressionNode[]): string => {
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

// Node factory functions
export const createTextNode = (text: string = ''): ExpressionNode => ({
  id: generateId(),
  type: 'text',
  content: text,
});

export const createFractionNode = (): ExpressionNode => ({
  id: generateId(),
  type: 'fraction',
  numerator: [createTextNode()],
  denominator: [createTextNode()],
});

export const createSquareRootNode = (): ExpressionNode => ({
  id: generateId(),
  type: 'sqrt',
  index: [], // empty index => regular sqrt
  radicand: [createTextNode()],
});

export const createPowerNode = (): ExpressionNode => ({
  id: generateId(),
  type: 'power',
  base: [createTextNode()],
  exponent: [createTextNode()],
});

export const createSubscriptNode = (): ExpressionNode => ({
  id: generateId(),
  type: 'subscript',
  base: [createTextNode()],
  index: [createTextNode()],
});

export const createSumNode = (): ExpressionNode => ({
  id: generateId(),
  type: 'sum',
  integrand: [createTextNode('a_i')],
  lowerLimit: [createTextNode('i=0')],
  upperLimit: [createTextNode('n')],
});

// Preset equation creators
export const createQuadraticFormula = (): ExpressionNode[] => {
  const formula: ExpressionNode = createTextNode('x = ');
  
  const fraction: ExpressionNode = {
    id: generateId(),
    type: 'fraction',
    numerator: [
      createTextNode('-b ± '),
      {
        id: generateId(),
        type: 'sqrt',
        index: [],
        radicand: [
          {
            id: generateId(),
            type: 'power',
            base: [createTextNode('b')],
            exponent: [createTextNode('2')]
          },
          createTextNode(' - 4ac')
        ]
      }
    ],
    denominator: [createTextNode('2a')]
  };

  return [formula, fraction];
};