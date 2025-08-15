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

export interface EditingContext {
  nodeId: string;
  field: NodeArrayField;
}