// Define a type for the fields that contain arrays of ExpressionNodes
export type NodeArrayField =
  | 'numerator'
  | 'denominator'
  | 'base'
  | 'exponent'
  | 'index'
  | 'radicand'
  | 'integrand'
  | 'lowerLimit'
  | 'upperLimit';

export const CHILD_FIELDS: NodeArrayField[] = [
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

export interface ExpressionNode {
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

export interface MathSymbolPickerProps {
  onInsert: (symbol: string, latex: string) => void;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>;
}